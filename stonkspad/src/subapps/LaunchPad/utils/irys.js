import { NETWORKS } from "../../../context/AppStore";
import { IRYS_MAINNET, IRYS_DEVNET } from "../../../constants/urls";
import { WebIrys } from "@irys/sdk";
import message from "antd/es/message";

export const getIrysNetwork = (solanaNetwork) => {
  switch (solanaNetwork) {
    case NETWORKS.MAINNET:
      return IRYS_MAINNET;
    case NETWORKS.TESTNET:
      return IRYS_DEVNET;
    case NETWORKS.DEVNET:
      return IRYS_DEVNET;
    default:
      return IRYS_MAINNET;
  }
};

export const getWebIrys = async (rpcURL, irysNodeURL, provider) => {
  // Create a wallet object
  const wallet = { rpcUrl: rpcURL, name: "solana", provider: provider };
  // Use the wallet object
  const webIrys = new WebIrys({ url: irysNodeURL, token: "solana", wallet });
  await webIrys.ready();

  return webIrys;
};

export const uploadFile = async (
  rpcURL,
  irysNodeURL,
  provider,
  fileToUpload
) => {
  const webIrys = await getWebIrys(rpcURL, irysNodeURL, provider, fileToUpload);
  // Your file
  const tags = [{ name: "Content-Type", value: fileToUpload.type }];

  try {
    const receipt = await webIrys.uploadFile(fileToUpload, { tags });
    console.log(`File uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
    return receipt;
  } catch (e) {
    console.log("Error uploading file ", e);
  }
};
export const getUploadedFileURL = (receipt) => {
  return `https://gateway.irys.xyz/${receipt.id}`;
};

export const uploadJSON = async (rpcURL, irysNodeURL, provider, jsonData) => {
  const webIrys = await getWebIrys(rpcURL, irysNodeURL, provider);

  const stringifyJSON = JSON.stringify(jsonData);
  console.log("stringifyJSON", stringifyJSON);
  const tags = [{ name: "Content-Type", value: "application/json" }];

  try {
    const receipt = await webIrys.upload(stringifyJSON, { tags });
    console.log(`File uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
    return receipt;
  } catch (e) {
    console.log("Error uploading file ", e);
  }
};
