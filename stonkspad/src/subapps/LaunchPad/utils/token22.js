import {
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  AccountState,
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createBurnCheckedInstruction,
  createEnableRequiredMemoTransfersInstruction,
  createHarvestWithheldTokensToMintInstruction,
  createInitializeDefaultAccountStateInstruction,
  createInitializeImmutableOwnerInstruction,
  createInitializeInstruction,
  createInitializeInterestBearingMintInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintCloseAuthorityInstruction,
  createInitializeMintInstruction,
  createInitializeNonTransferableMintInstruction,
  createInitializePermanentDelegateInstruction,
  createInitializeTransferFeeConfigInstruction,
  createMintToCheckedInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  createThawAccountInstruction,
  createTransferCheckedInstruction,
  createWithdrawWithheldTokensFromAccountsInstruction,
  createWithdrawWithheldTokensFromMintInstruction,
  ExtensionType,
  getAssociatedTokenAddressSync,
  getMintLen,
  getTransferFeeAmount,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TYPE_SIZE,
  unpackAccount,
} from '@solana/spl-token';
import { createUpdateFieldInstruction, pack } from '@solana/spl-token-metadata';

import {
  createCreateMetadataAccountV3Instruction,
  createUpdateMetadataAccountV2Instruction,
  Metadata,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  METADATA_2022_PROGRAM_ID,
  DEVNET_METADATA_2022_PROGRAM_ID,
} from './metadata';
// const { createSetTransferFeeInstruction } = require("./instruction_ext");
import { CreateMintV1 } from './token';
import {
  CUSTOM_MINT_FEE,
  MINT_FEE,
  TOKENS_UPDATE_FEE,
  TOKEN_MANAGER_FEE_COLLECTOR,
} from '../../../envs/vars';

export class CreateMint extends CreateMintV1 {
  constructor(...props) {
    super(...props);
    this.extensions = [];
    this.extensionConfig = {};
  }

  addExtension(ext, config = {}) {
    this.extensions.push(ext);
    this.extensionConfig[ext] = config;
  }
}

class CreateMetadata {
  constructor() {
    this.name = '';
    this.symbol = '';
    this.uri = '';
    this.sellerFeeBasisPoints = 0;
    this.mutable = false;
  }
}

export class Token2022Client {
  constructor(connection) {
    this.connection = connection;
  }

  isDevnet() {
    return this.connection.rpcEndpoint.indexOf('devnet') > -1;
  }

  metadataProgram() {
    if (this.isDevnet()) return DEVNET_METADATA_2022_PROGRAM_ID;
    return METADATA_2022_PROGRAM_ID;
  }

  async getTokenIndex() {
    return this.connection.getParsedProgramAccounts(TOKEN_2022_PROGRAM_ID);
  }

  async getUserTokenIndex(address) {
    const v1 = this.connection.getParsedTokenAccountsByOwner(address, {
      programId: TOKEN_PROGRAM_ID,
    });
    const v2 = this.connection.getParsedTokenAccountsByOwner(address, {
      programId: TOKEN_2022_PROGRAM_ID,
    });

    const resp = await Promise.all([v1, v2]);
    if (!resp) return [];

    return resp[0].value.concat(...resp[1].value);
  }

  async getToken(mint) {
    return this.connection.getParsedAccountInfo(mint, {
      commitment: 'confirmed',
    });
  }

  async getUserTokenAccount(mint, owner, program = TOKEN_2022_PROGRAM_ID) {
    return this.connection.getParsedAccountInfo(
      this.getAssociatedTokenPDA(mint, owner, program),
      { commitment: 'confirmed' },
    );
  }

  async getTokenMetadataRaw(metadataAddress) {
    return Metadata.fromAccountAddress(
      this.connection,
      metadataAddress,
      'confirmed',
    );
  }

  async getTokenMetadata(mint, metadataProgram = this.metadataProgram()) {
    return Metadata.fromAccountAddress(
      this.connection,
      this.getMetadataPDA(mint, metadataProgram),
      'confirmed',
    );
  }

  async getTokenBalance(mint, owner, program = TOKEN_2022_PROGRAM_ID) {
    return this.connection.getParsedAccountInfo(
      this.getAssociatedTokenPDA(mint, owner, program),
      { commitment: 'confirmed' },
    );
  }

  async getTokenFileMetadata(metadata) {
    if (!metadata || !metadata.data.uri.replace(/\0.*$/g, '')) return;

    return (await fetch(metadata.data.uri)).json();
  }

  getAssociatedTokenPDA(
    mint,
    owner,
    program = TOKEN_2022_PROGRAM_ID,
    allowOwnerOffCurve = false,
  ) {
    return getAssociatedTokenAddressSync(
      mint,
      owner,
      allowOwnerOffCurve,
      program,
    );
  }

  getMetadataPDA(mint, metadataProgram = this.metadataProgram()) {
    const [metaPDA] = PublicKey.findProgramAddressSync(
      ['metadata', metadataProgram.toBuffer(), mint.toBuffer()],
      metadataProgram,
    );
    return metaPDA;
  }

  async getUpdateMetadataTransaction(
    owner,
    metadata,
    authority,
    data,
    metadataProgram = this.metadataProgram(),
  ) {
    const transaction = new Transaction();

    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 100000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 2 * 1000000 }),
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: new PublicKey(TOKEN_MANAGER_FEE_COLLECTOR),
        lamports: TOKENS_UPDATE_FEE * LAMPORTS_PER_SOL,
      }),
      createUpdateMetadataAccountV2Instruction(
        {
          metadata,
          updateAuthority: authority,
        },
        {
          updateMetadataAccountArgsV2: data,
        },
        metadataProgram,
      ),
    );

    const bhash = await this.connection.getLatestBlockhash('confirmed');
    transaction.feePayer = authority;
    transaction.recentBlockhash = bhash.blockhash;

    return transaction;
  }

  async getUpdateMetadataExtensionTransaction(
    metadata,
    authority,
    name,
    symbol,
    uri,
    program = TOKEN_2022_PROGRAM_ID,
  ) {
    const transaction = new Transaction();

    transaction.add(
      createUpdateFieldInstruction({
        programId: program,
        metadata,
        updateAuthority: authority,
        field: 'name',
        value: name,
      }),
      createUpdateFieldInstruction({
        programId: program,
        metadata,
        updateAuthority: authority,
        field: 'symbol',
        value: symbol,
      }),
      createUpdateFieldInstruction({
        programId: program,
        metadata,
        updateAuthority: authority,
        field: 'uri',
        value: uri,
      }),
    );
    const bhash = await this.connection.getLatestBlockhash('confirmed');
    transaction.feePayer = authority;
    transaction.recentBlockhash = bhash.blockhash;

    return transaction;
  }

  async getBurnTransaction(
    mint,
    srcOwner,
    amount,
    decimals,
    program = TOKEN_2022_PROGRAM_ID,
  ) {
    const srcAta = this.getAssociatedTokenPDA(mint, srcOwner, program);
    const transaction = new Transaction();
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: srcOwner,
        toPubkey: new PublicKey(TOKEN_MANAGER_FEE_COLLECTOR),
        lamports: TOKENS_UPDATE_FEE * LAMPORTS_PER_SOL,
      }),
      createBurnCheckedInstruction(
        srcAta,
        mint,
        srcOwner,
        amount,
        decimals,
        [],
        program,
      ),
    );

    const bhash = await this.connection.getLatestBlockhash('confirmed');
    transaction.feePayer = srcOwner;
    transaction.recentBlockhash = bhash.blockhash;

    return transaction;
  }

  async getSendTransferTransaction(
    mint,
    srcOwner,
    dstOwner,
    amount,
    decimals,
    program = TOKEN_2022_PROGRAM_ID,
    allowOwnerOffCurve = false,
  ) {
    const srcAta = this.getAssociatedTokenPDA(
      mint,
      srcOwner,
      program,
      allowOwnerOffCurve,
    );
    const dstAta = this.getAssociatedTokenPDA(
      mint,
      dstOwner,
      program,
      allowOwnerOffCurve,
    );

    const transaction = new Transaction();

    const dstIfo = await this.connection.getAccountInfo(dstAta, 'confirmed');
    if (!dstIfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          srcOwner,
          dstAta,
          dstOwner,
          mint,
          program,
        ),
      );
    }

    transaction.add(
      createTransferCheckedInstruction(
        srcAta, // Src Ata
        mint, // Mint
        dstAta,
        srcOwner,
        amount, // TODO check decimals??
        decimals,
        [],
        program,
      ),
    );

    const bhash = await this.connection.getLatestBlockhash('confirmed');
    transaction.feePayer = srcOwner;
    transaction.recentBlockhash = bhash.blockhash;

    return transaction;
  }

  async getClaimWitheldTokensTransaction(mint, payer, authority) {
    const allAccounts = await this.connection.getProgramAccounts(
      TOKEN_2022_PROGRAM_ID,
      {
        commitment: 'confirmed',
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: mint.toString(),
            },
          },
        ],
      },
    );
    const srcAccounts = [];
    const dstAcc = this.getAssociatedTokenPDA(
      mint,
      payer,
      TOKEN_2022_PROGRAM_ID,
    );
    for (const accountInfo of allAccounts) {
      try {
        const account = unpackAccount(
          accountInfo.pubkey,
          accountInfo.account,
          TOKEN_2022_PROGRAM_ID,
        );
        const transferFeeAmount = getTransferFeeAmount(account);
        if (
          transferFeeAmount !== null &&
          transferFeeAmount.withheldAmount > 0
        ) {
          srcAccounts.push(accountInfo.pubkey);
        }
      } catch (e) {
        console.error('Err', accountInfo, e);
      }
    }

    const transactions = [];
    const bhash = await this.connection.getLatestBlockhash('confirmed');

    if (!(await this.accountExists(dstAcc))) {
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer,
          dstAcc,
          payer,
          mint,
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      transaction.add(
        createWithdrawWithheldTokensFromMintInstruction(
          mint,
          dstAcc,
          payer,
          [],
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      transaction.feePayer = payer;
      transaction.recentBlockhash = bhash.blockhash;
      transactions.push(transaction);
    } else {
      transactions.push(
        new Transaction().add(
          createWithdrawWithheldTokensFromMintInstruction(
            mint,
            dstAcc,
            payer,
            [],
            TOKEN_2022_PROGRAM_ID,
          ),
        ),
      );
    }

    for (let i = 0; i < srcAccounts.length; i += 30) {
      const transaction = new Transaction().add(
        createWithdrawWithheldTokensFromAccountsInstruction(
          mint,
          dstAcc,
          authority,
          [],
          srcAccounts.slice(i, 30),
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      transaction.feePayer = payer;
      transaction.recentBlockhash = bhash.blockhash;
      transactions.push(transaction);
    }

    return transactions;
  }

  //   still needs to understand
  async getClaimWithheldTokensToMintTransaction(mint, payer, srcAccounts) {
    const transactions = [];
    for (let i = 0; i < srcAccounts.length; i += 30) {
      const transaction = new Transaction().add(
        createHarvestWithheldTokensToMintInstruction(
          mint,
          srcAccounts.slice(i, 30),
        ),
      );

      const bhash = await this.connection.getLatestBlockhash('confirmed');
      transaction.feePayer = payer;
      transaction.recentBlockhash = bhash.blockhash;
      transactions.push(transaction);
    }

    return transactions;
  }

  async getCreateMetadataTransaction(
    owner,
    tokenMint,
    config,
    metadataProgram = this.metadataProgram(),
  ) {
    const txn = new Transaction();

    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        metadataProgram.toBuffer(),
        tokenMint.toBuffer(),
      ],
      metadataProgram,
    );

    const ON_CHAIN_METADATA = {
      name: config.name,
      symbol: config.symbol,
      uri: config.uri,
      sellerFeeBasisPoints: config.sellerFeeBasisPoints || 0,
      uses: null,
      creators: null,
      collection: null,
    };

    txn.add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: tokenMint,
          mintAuthority: owner,
          payer: owner,
          updateAuthority: owner,
        },
        {
          createMetadataAccountArgsV3: {
            data: ON_CHAIN_METADATA,
            isMutable: config.mutable,
            collectionDetails: null,
          },
        },
        metadataProgram,
      ),
    );

    const bhash = await this.connection.getLatestBlockhash('confirmed');
    txn.feePayer = owner;
    txn.recentBlockhash = bhash.blockhash;
    return txn;
  }

  async getCreateMintTransaction(
    owner,
    tokenMint,
    config,
    customAddress = false,
    revokeConfig,
  ) {
    const metadataConfig = {
      mint: tokenMint,
      updateAuthority: owner,
      name: config.name,
      symbol: config.symbol,
      uri: config.metadataUri,
      additionalMetadata: [],
    };
    const mintSpace = getMintLen(config.extensions);
    const metadataSpace = pack(metadataConfig).length + TYPE_SIZE + LENGTH_SIZE;

    const overallSpace = mintSpace + metadataSpace;
    const mintLamports =
      await this.connection.getMinimumBalanceForRentExemption(overallSpace);

    const ata = getAssociatedTokenAddressSync(
      tokenMint,
      owner,
      false,
      TOKEN_2022_PROGRAM_ID,
    );

    // for metaplex metadata
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        this.metadataProgram().toBuffer(),
        tokenMint.toBuffer(),
      ],
      this.metadataProgram(),
    );

    const ON_CHAIN_METADATA = {
      name: config.name,
      symbol: config.symbol,
      uri: config.metadataUri,
      sellerFeeBasisPoints: 0,
      uses: null,
      creators: null,
      collection: null,
    };

    const txn = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 100000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 2 * 1000000 }),
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: new PublicKey(TOKEN_MANAGER_FEE_COLLECTOR),
        lamports: customAddress
          ? CUSTOM_MINT_FEE * LAMPORTS_PER_SOL
          : MINT_FEE * LAMPORTS_PER_SOL,
      }),
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: tokenMint,
        space: mintSpace,
        lamports: mintLamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
    );

    let isDefaultFrozen = false;
    config.extensions.forEach(ext => {
      const cfg = config.extensionConfig[ext];

      switch (ext) {
        case ExtensionType.MetadataPointer:
          txn.add(
            createInitializeMetadataPointerInstruction(
              tokenMint,
              owner,
              tokenMint,
              TOKEN_2022_PROGRAM_ID,
            ),
          );
          break;
        case ExtensionType.TransferFeeConfig:
          ON_CHAIN_METADATA.sellerFeeBasisPoints = cfg.feeBasisPoints;
          txn.add(
            createInitializeTransferFeeConfigInstruction(
              tokenMint,
              cfg.configAuthority,
              cfg.withdrawAuthority,
              cfg.feeBasisPoints,
              cfg.maxFee,
              TOKEN_2022_PROGRAM_ID,
            ),
          );
          break;
        case ExtensionType.InterestBearingConfig:
          txn.add(
            createInitializeInterestBearingMintInstruction(
              tokenMint,
              owner,
              cfg.rate,
              TOKEN_2022_PROGRAM_ID,
            ),
          );
          break;
        case ExtensionType.PermanentDelegate:
          txn.add(
            createInitializePermanentDelegateInstruction(
              tokenMint,
              new PublicKey(cfg.address),
              TOKEN_2022_PROGRAM_ID,
            ),
          );
          break;
        case ExtensionType.NonTransferable:
          txn.add(
            createInitializeNonTransferableMintInstruction(
              tokenMint,
              TOKEN_2022_PROGRAM_ID,
            ),
          );
          break;
        case ExtensionType.ImmutableOwner:
          txn.add(
            createInitializeImmutableOwnerInstruction(
              tokenMint,
              TOKEN_2022_PROGRAM_ID,
            ),
          );
          break;
        case ExtensionType.MemoTransfer:
          txn.add(
            createEnableRequiredMemoTransfersInstruction(
              tokenMint,
              owner,
              [],
              TOKEN_2022_PROGRAM_ID,
            ),
          );
          if (config.mintTotalSupply)
            txn.add(
              new TransactionInstruction({
                keys: [{ pubkey: owner, isSigner: true, isWritable: true }],
                data: Buffer.from('Mint To Memo', 'utf-8'),
                programId: new PublicKey(
                  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
                ),
              }),
            );
          break;
        case ExtensionType.DefaultAccountState:
          isDefaultFrozen = cfg.state === AccountState.Frozen;
          txn.add(
            createInitializeDefaultAccountStateInstruction(
              tokenMint,
              cfg.state,
              TOKEN_2022_PROGRAM_ID,
            ),
          );
          break;
        case ExtensionType.MintCloseAuthority:
          txn.add(
            createInitializeMintCloseAuthorityInstruction(
              tokenMint,
              config.mintAuthority,
              TOKEN_2022_PROGRAM_ID,
            ),
          );
          break;
        default:
          console.error('Unsupported extension', ext);
          break;
      }
    });

    txn.add(
      createInitializeMintInstruction(
        tokenMint,
        config.decimals,
        config.mintAuthority,
        config.freezeAuthority,
        TOKEN_2022_PROGRAM_ID,
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: tokenMint,
        updateAuthority: owner,
        mint: tokenMint,
        mintAuthority: owner,
        name: ON_CHAIN_METADATA.name,
        symbol: ON_CHAIN_METADATA.symbol,
        uri: ON_CHAIN_METADATA.uri,
      }),
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: tokenMint,
          mintAuthority: config.mintAuthority,
          payer: owner,
          updateAuthority: owner,
        },
        {
          createMetadataAccountArgsV3: {
            data: ON_CHAIN_METADATA,
            isMutable: !revokeConfig?.revokeUpdate,
            collectionDetails: null,
          },
        },
        this.metadataProgram(),
      ),
    );

    if (config.mintTotalSupply) {
      txn.add(
        createAssociatedTokenAccountInstruction(
          owner,
          ata,
          owner,
          tokenMint,
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      if (isDefaultFrozen)
        txn.add(
          createThawAccountInstruction(
            ata,
            tokenMint,
            owner,
            [],
            TOKEN_2022_PROGRAM_ID,
          ),
        );

      txn.add(
        createMintToCheckedInstruction(
          tokenMint,
          ata,
          owner,
          config.totalSupply,
          config.decimals,
          [],
          TOKEN_2022_PROGRAM_ID,
        ),
      );
    }

    if (revokeConfig?.revokeMint) {
      // revoke  mint
      txn.add(
        createSetAuthorityInstruction(
          tokenMint,
          owner,
          AuthorityType.MintTokens,
          null,
          [],
          TOKEN_2022_PROGRAM_ID,
        ),
      );
    }
    if (revokeConfig?.revokeFreeze) {
      // revoke freeze
      txn.add(
        createSetAuthorityInstruction(
          tokenMint,
          owner,
          AuthorityType.FreezeAccount,
          null,
          [],
          TOKEN_2022_PROGRAM_ID,
        ),
      );
    }

    const bhash = await this.connection.getLatestBlockhash('confirmed');
    txn.feePayer = owner;
    txn.recentBlockhash = bhash.blockhash;
    return txn;
  }

  async getMintToTransaction(
    owner,
    tokenMint,
    amount,
    program = TOKEN_2022_PROGRAM_ID,
  ) {
    const txn = new Transaction();
    const ata = getAssociatedTokenAddressSync(tokenMint, owner, false, program);

    txn.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 100000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 2 * 1000000 }),
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: new PublicKey(TOKEN_MANAGER_FEE_COLLECTOR),
        lamports: TOKENS_UPDATE_FEE * LAMPORTS_PER_SOL,
      }),
    );

    const dstIfo = await this.connection.getAccountInfo(ata, 'confirmed');
    if (!dstIfo) {
      txn.add(
        createAssociatedTokenAccountInstruction(
          owner,
          ata,
          owner,
          tokenMint,
          program,
        ),
      );
    }

    txn.add(
      createMintToInstruction(tokenMint, ata, owner, amount, [], program),
    );

    const bhash = await this.connection.getLatestBlockhash('confirmed');
    txn.feePayer = owner;
    txn.recentBlockhash = bhash.blockhash;
    return txn;
  }

  async getChangeAuthorityTransaction(
    owner,
    mint,
    authority,
    targetAuthority = null,
    programID = TOKEN_2022_PROGRAM_ID,
  ) {
    const txn = new Transaction();
    txn.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 10000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 2 * 1000000 }),
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: new PublicKey(TOKEN_MANAGER_FEE_COLLECTOR),
        lamports: TOKENS_UPDATE_FEE * LAMPORTS_PER_SOL,
      }),
    );
    txn.add(
      createSetAuthorityInstruction(
        mint,
        owner,
        authority,
        targetAuthority,
        [],
        programID,
      ),
    );

    const bhash = await this.connection.getLatestBlockhash('confirmed');
    txn.feePayer = owner;
    txn.recentBlockhash = bhash.blockhash;
    return txn;
  }

  async accountExists(account) {
    const acc = await this.connection
      .getAccountInfo(account, 'confirmed')
      .catch(e => {});
    return !!acc;
  }
}
