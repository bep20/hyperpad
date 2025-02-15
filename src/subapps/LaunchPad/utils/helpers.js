import BigNumber from 'bignumber.js';
import axios from 'axios';
import { baseURL } from '../../../utils/api';

// Function to calculate adjusted total supply
export function calculateTotalSupply(totalSupply, decimals) {
  const divisor = new BigNumber(10).exponentiatedBy(decimals);

  // Perform the division using BigNumber
  const adjustedTotalSupply = new BigNumber(totalSupply).dividedBy(divisor);

  return adjustedTotalSupply.toString();
}

export const uploadMetadata = async (tokenInfo, socialMediaInfo) => {
  return new Promise((resolve, reject) => {
    try {
      const jsonData = {
        name: tokenInfo.name,
        image: tokenInfo.imageURL,
        symbol: tokenInfo.ticker,
        description: tokenInfo.description,
        creator: {
          name: 'HyperPad',
          site: 'https://app.hypersol.xyz',
        },
        extensions: {
          website: socialMediaInfo?.website,
          twitter: socialMediaInfo?.twitter,
          telegram: socialMediaInfo?.telegram,
          discord: socialMediaInfo?.discord,
        },
      };
      axios({
        method: 'POST',
        url: `${baseURL}/upload/json`,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        data: {
          jsonData: jsonData,
        },
      })
        .then(result => {
          const fileUrl = result?.data?.url;
          if (!fileUrl) {
            throw new Error('Unable to upload file');
          }
          resolve(fileUrl);
        })
        .catch(err => {
          console.log('error', err);
          reject(err);
        });
    } catch (err) {
      console.log('error is', err);
      reject(err);
    }
  });
};

export const uploadAndGenerateURL = async file => {
  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      axios({
        method: 'POST',
        url: `${baseURL}/upload/image`,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'multipart/form-data',
        },
        data: formData,
      })
        .then(ress => {
          const fileUrl = ress?.data?.url;
          if (!fileUrl) {
            throw new Error('Unable to upload file');
          }
          resolve(fileUrl);
        })
        .catch(err => {
          reject(err || 'File upload failed, Please contact team');
        });
    } catch (err) {
      reject(err);
    }
  });
};
