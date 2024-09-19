import { v4 as uuidv4 } from 'uuid';

export const parseUploadedData = uploadedData => {
  const parseddata = [];

  for (let i = 0; i < uploadedData.length; i++) {
    if (uploadedData[i][0] && uploadedData[i][1]) {
      parseddata.push({
        target: uploadedData[i][0],
        key: uuidv4(),
        amount: uploadedData[i][1],
      });
    } else if (uploadedData[i][0] == '' && uploadedData[i][1] == '') {
    } else {
      return null;
    }
  }
  return parseddata;
};
