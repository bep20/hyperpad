import {
  MasterEditionV2,
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  ExtensionType,
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  createInitializeAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMint2Instruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptAccount,
  getMintLen,
} from '@solana/spl-token';
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { PublicKey, SystemProgram } from '@solana/web3.js';

export const createSPL22Instructions = async (
  wallet,
  connection,
  mint,
  decimals,
  supply,
  metadataAddress,
) => {
  const { publicKey } = wallet;
  const instructions = [];
  const tokenATA = await getAssociatedTokenAddress(
    mint,
    publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
  );

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
  );

  instructions.push(
    createInitializeMetadataPointerInstruction(
      mint,
      publicKey,
      metadataAddress,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  instructions.push(
    createInitializeMintInstruction(
      mint,
      8,
      publicKey,
      publicKey,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  instructions.push(
    createAssociatedTokenAccountInstruction(
      publicKey,
      tokenATA,
      publicKey,
      mint,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  instructions.push(
    createMintToInstruction(
      mint,
      tokenATA,
      publicKey,
      supply * 10 ** decimals,
      [],
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  return instructions;
};

export const createMetadataInstructions = async (
  wallet,
  connection,
  mint,
  name,
  ticker,
  metadataURI,
  metadataAddress,
) => {
  const instructions = [];

  const { publicKey } = wallet;

  const mplProgramId = new PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  );
  const [metadata] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), mplProgramId.toBytes(), mint.toBytes()],
    mplProgramId,
  );

  // instructions.push(
  //   createCreateMetadataAccountV3Instruction(
  //     {
  //       metadata: metadata,
  //       mint: mint,
  //       mintAuthority: publicKey,
  //       payer: publicKey,
  //       updateAuthority: publicKey,
  //     },
  //     {
  //       createMetadataAccountArgsV3: {
  //         data: {
  //           name: name,
  //           symbol: ticker,
  //           uri: metadataURI,
  //           sellerFeeBasisPoints: 0,
  //           collection: null,
  //           creators: null,
  //           uses: null,
  //         },
  //         isMutable: true,
  //         collectionDetails: null,
  //       },
  //     }
  //   )
  // );

  // instructions.push(
  //   createInitializeMetadataPointerInstruction(
  //     mint,
  //     publicKey,
  //     metadata,
  //     TOKEN_2022_PROGRAM_ID
  //   )
  // );

  const tokenMetadata = {
    updateAuthority: publicKey,
    mint,
    name,
    symbol: ticker,
    uri: metadataURI,
    additionalMetadata: [],
  };

  const lamports = await connection.getMinimumBalanceForRentExemption(
    pack(tokenMetadata).length,
  );

  instructions.push(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: metadataAddress,
      lamports,
    }),
  );

  instructions.push(
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: metadataAddress,
      updateAuthority: publicKey,
      mint,
      mintAuthority: publicKey,
      name,
      symbol: ticker,
      uri: metadataURI,
    }),
  );

  return instructions;
};

export const createMetadataMetaPlexInstructions = async (
  wallet,
  connection,
  mint,
  name,
  ticker,
  metadataURI,
  metadataAddress,
) => {
  const instructions = [];

  const { publicKey } = wallet;

  const mplProgramId = new PublicKey(
    'M1tgEZCz7fHqRAR3G5RLxU6c6ceQiZyFK7tzzy4Rof4',
  );
  const [metadata] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), mplProgramId.toBytes(), mint.toBytes()],
    mplProgramId,
  );

  instructions.push(
    createCreateMetadataAccountV3Instruction(
      {
        metadata,
        mint,
        mintAuthority: publicKey,
        payer: publicKey,
        updateAuthority: publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name,
            symbol: ticker,
            uri: metadataURI,
            sellerFeeBasisPoints: 0,
            collection: null,
            creators: null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      },
      mplProgramId,
    ),
  );

  return instructions;
};
