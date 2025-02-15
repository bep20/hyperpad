import { PublicKey } from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import {
  METADATA_2022_PROGRAM_ID,
  DEVNET_METADATA_2022_PROGRAM_ID,
  METADATA_V1_PROGRAM_ID,
} from './metadata';

export class TokenDetailsClient {
  constructor(connection) {
    this.connection = connection;
  }

  isDevnet() {
    return this.connection.rpcEndpoint.indexOf('devnet') > -1;
  }

  metadataProgram(programId) {
    if (programId.toBase58() === TOKEN_PROGRAM_ID.toBase58()) {
      return METADATA_V1_PROGRAM_ID;
    }
    if (programId.toBase58() === TOKEN_2022_PROGRAM_ID.toBase58()) {
      if (this.isDevnet()) return DEVNET_METADATA_2022_PROGRAM_ID;
      return METADATA_2022_PROGRAM_ID;
    }
  }

  async getTokensFullDetails(addressList) {
    try {
      const userTokens = addressList.map(item => ({ mint: item }));

      // get mint info for both spl and spl22
      const mintInfo = userTokens.map(item =>
        this.connection.getParsedAccountInfo(new PublicKey(item.mint), {
          commitment: 'confirmed',
        }),
      );
      const mintInfoRes = await Promise.all(mintInfo);

      for (let i = 0; i < userTokens.length; i++) {
        const {
          decimals,
          freezeAuthority,
          isInitialized,
          mintAuthority,
          supply,
          extensions,
        } = mintInfoRes[i]?.value?.data?.parsed?.info || {};

        userTokens[i].decimals = decimals;
        userTokens[i].freezeAuthority = freezeAuthority;
        userTokens[i].isInitialized = isInitialized;
        userTokens[i].mintAuthority = mintAuthority;
        userTokens[i].supply = supply;
        userTokens[i].program = mintInfoRes[i]?.value?.data?.program;
        userTokens[i].programId = mintInfoRes[i]?.value?.owner?.toBase58();
        userTokens[i].extensions = extensions;
      }

      // getMetadata for both spl and spl22
      const metadataInfo = userTokens.map(item => {
        const programId =
          item.program === 'spl-token'
            ? TOKEN_PROGRAM_ID
            : TOKEN_2022_PROGRAM_ID;

        const metadataId = this.metadataProgram(programId);
        return this.getTokenMetadata(
          new PublicKey(item.mint),
          metadataId,
          item.extensions,
        );
      });

      const metadataInfoRes = await Promise.all(metadataInfo);

      for (let i = 0; i < userTokens.length; i++) {
        if (metadataInfoRes[i]) {
          const { name, symbol, ...rest } = metadataInfoRes[i].data;
          userTokens[i].metadata = {
            data: {
              name: name.replace(/\u0000/g, ''),
              symbol: symbol.replace(/\u0000/g, ''),
              ...rest,
            },
            updateAuthority: new PublicKey(
              metadataInfoRes[i].updateAuthority,
            ).toBase58(),
          };
          console.log(
            'Metadata for token',
            userTokens[i].mint,
            ':',
            userTokens[i].metadata.data,
          );
        } else {
          userTokens[i].metadata = {};
        }
      }

      return userTokens;
    } catch (err) {
      return [];
    }
  }

  async getUserTokensMintAddress(address) {
    // get user tokens bot spl and spl22
    let userTokens = await this.getUserTokenIndex(address);
    userTokens = userTokens.map(
      item => item?.account?.data?.parsed?.info?.mint,
    );
    return userTokens;
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

  // need to update it, when metadata pointer extension point to some other account.
  // current implementation only supports only mint address
  async getTokenMetadata(
    mint,
    metadataProgram = this.metadataProgram(),
    extensions,
  ) {
    try {
      // metadata extension
      const metadataExt = extensions?.filter(
        t => t.extension === 'tokenMetadata',
      )?.[0];

      // metadata pointer extension
      const metadataPnt = extensions?.filter(
        t => t.extension === 'metadataPointer',
      )?.[0];

      if (metadataExt) {
        return {
          data: metadataExt.state,
          updateAuthority: metadataExt.state.updateAuthority,
        };
      }
      if (metadataPnt) {
        const mRes = await this.getTokenMetadataRaw(
          new PublicKey(metadataPnt?.metadataAddress),
        );
        return mRes;
      }
      const res = await Metadata.fromAccountAddress(
        this.connection,
        this.getMetadataPDA(mint, metadataProgram),
        'confirmed',
      );
      return res;
    } catch (err) {
      return null;
    }
  }

  async getTokenBalance(mint, owner, program = TOKEN_2022_PROGRAM_ID) {
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

  async accountExists(account) {
    const acc = await this.connection
      .getAccountInfo(account, 'confirmed')
      .catch(e => {});
    return !!acc;
  }
}
