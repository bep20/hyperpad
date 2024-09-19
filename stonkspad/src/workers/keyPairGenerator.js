import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
import { HDKey } from 'micro-ed25519-hdkey';

self.addEventListener('message', e => {
  if (!e) return;
  const data = e?.data || {};
  const { numberOfWallets = 0 } = data;

  const path = "m/44'/501'/0'/0'";
  for (let i = 0; i < numberOfWallets; i++) {
    const mnemonic = bip39.generateMnemonic();

    const seed = bip39.mnemonicToSeedSync(mnemonic, '');
    const hd = HDKey.fromMasterSeed(seed.toString('hex'));
    const keypair = Keypair.fromSeed(hd.derive(path).privateKey);

    self.postMessage({
      wallet: {
        address: keypair.publicKey.toBase58(),
        mnemonic,
        privateKeyArray: '['.concat(keypair.secretKey.toString(), ']'),
        privateKeyBase58: bs58.encode(Buffer.from(keypair.secretKey)),
      },
    });
  }
});
