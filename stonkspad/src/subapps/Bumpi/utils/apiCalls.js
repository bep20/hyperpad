import axios from 'axios';
import { BARE_METAL_BACKEND_URL } from '../../../envs/urls';

export const getBondingCurveStatus = ({ mintAddress }) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'GET',
      url: `${BARE_METAL_BACKEND_URL}/api/v1/mtb/bonding-curve-status`,
      params: {
        mintAddress,
      },
    })
      .then(result => {
        resolve(result?.data?.data?.[0]);
      })
      .catch(err => {
        console.log('error is', err);
        reject('Unable to find bonding curve status');
      });
  });
};
