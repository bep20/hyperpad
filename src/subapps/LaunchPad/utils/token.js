import {
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToCheckedInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddressSync,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  PublicKey,
  ComputeBudgetProgram,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
// import { getSimulationComputeUnits } from '@solana-developers/helpers';

// import BigNumber from 'bignumber.js';
import {
  CUSTOM_MINT_FEE,
  MINT_FEE,
  TOKEN_MANAGER_FEE_COLLECTOR,
} from '../../../envs/vars';
// import { PRIORITY_FEE, PRIORITY_FEE_ENUM } from '../../../constants';
// import storage from '../../../utils/storage';

export class CreateMintV1 {
  constructor(
    name,
    symbol,
    metadataUri,
    totalSupply,
    mintAuthority,
    freezeAuthority = null,
    decimals = 6,
    mintTotalSupply = true,
  ) {
    this.name = name;
    this.symbol = symbol;
    this.metadataUri = metadataUri;
    this.totalSupply = totalSupply;
    this.decimals = decimals;
    this.mintTotalSupply = mintTotalSupply;
    this.mintAuthority = mintAuthority;
    this.freezeAuthority = freezeAuthority;
    this.sellerFeeBasisPoints = 0;
    this.creators = null;
  }

  setSellerFeeBasisPoints(bp) {
    this.sellerFeeBasisPoints = bp;
  }

  setCreators(creators) {
    this.creators = creators;
  }
}

export class TokenV1Client {
  constructor(connection) {
    this.connection = connection;
    this.instructions = [];
  }

  async getCreateMintInstructions(
    owner,
    tokenMint,
    config,
    revokeConfig,
    customAddress = false,
  ) {
    const instructions = [];
    const mintLamports =
      await this.connection.getMinimumBalanceForRentExemption(MINT_SIZE);
    const ata = getAssociatedTokenAddressSync(
      tokenMint,
      owner,
      false,
      TOKEN_PROGRAM_ID,
    );
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), PROGRAM_ID.toBuffer(), tokenMint.toBuffer()],
      PROGRAM_ID,
    );
    const ON_CHAIN_METADATA = {
      name: config.name,
      symbol: config.symbol,
      uri: config.metadataUri,
      sellerFeeBasisPoints: config.sellerFeeBasisPoints,
      uses: null,
      creators: config.creators,
      collection: null,
    };

    instructions.push(
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
        space: MINT_SIZE,
        lamports: mintLamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        tokenMint,
        config.decimals,
        config.mintAuthority,
        config.freezeAuthority,
        TOKEN_PROGRAM_ID,
      ),
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
            isMutable: revokeConfig?.revokeUpdate ? false : true,
            collectionDetails: null,
          },
        },
        PROGRAM_ID,
      ),
      createAssociatedTokenAccountInstruction(
        owner,
        ata,
        owner,
        tokenMint,
        TOKEN_PROGRAM_ID,
      ),
    );
    if (config.mintTotalSupply) {
      instructions.push(
        createMintToCheckedInstruction(
          tokenMint,
          ata,
          owner,
          config.totalSupply,
          config.decimals,
          [],
          TOKEN_PROGRAM_ID,
        ),
      );
    }

    if (revokeConfig?.revokeMint) {
      // revoke  mint
      instructions.push(
        createSetAuthorityInstruction(
          tokenMint,
          owner,
          AuthorityType.MintTokens,
          null,
          [],
          TOKEN_PROGRAM_ID,
        ),
      );
    }
    if (revokeConfig?.revokeFreeze) {
      // revoke freeze
      instructions.push(
        createSetAuthorityInstruction(
          tokenMint,
          owner,
          AuthorityType.FreezeAccount,
          null,
          [],
          TOKEN_PROGRAM_ID,
        ),
      );
    }
    return instructions;
  }

  async getCreateMintTransaction(
    owner,
    tokenMint,
    config,
    customAddress = false,
    revokeConfig = {},
  ) {
    const simulationInstruction = await this.getCreateMintInstructions(
      owner,
      tokenMint,
      config,
      revokeConfig,
      customAddress,
    );

    // const units = await getSimulationComputeUnits(
    //   this.connection,
    //   simulationInstruction,
    //   owner,
    // );

    // const feeType = storage.get('feeType') || PRIORITY_FEE_ENUM.DEFAULT;
    // const fee = new BigNumber(PRIORITY_FEE[feeType])
    //   .multipliedBy(new BigNumber(LAMPORTS_PER_SOL))
    //   .multipliedBy(new BigNumber(1000000));

    // const feePerUnit = Number(
    //   new BigNumber(fee).dividedBy(new BigNumber(units)).toFixed(0),
    // );

    const txn = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 100000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 2 * 1000000 }),
      ...simulationInstruction,
    );
    const bhash = await this.connection.getLatestBlockhash('confirmed');
    txn.feePayer = owner;
    txn.recentBlockhash = bhash.blockhash;
    return txn;
  }

  async getFreezeTransition(instructions,owner) {
    const transaction = new Transaction().add(...instructions);
    const bhash = await this.connection.getLatestBlockhash('confirmed');
    transaction.feePayer = owner;
    transaction.recentBlockhash = bhash.blockhash;
    return transaction;
  }

  static getMetadataPDA(mint, metadataProgram = PROGRAM_ID) {
    const [metaPDA] = PublicKey.findProgramAddressSync(
      ['metadata', metadataProgram.toBuffer(), mint.toBuffer()],
      metadataProgram,
    );
    return metaPDA;
  }
}
