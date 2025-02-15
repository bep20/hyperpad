import { v4 as uuidv4 } from 'uuid';

export const parseUploadedData = uploadedData => {
  const parseddata = [];

  for (let i = 0; i < uploadedData.length; i++) {
    if (uploadedData[i][0]) {
      parseddata.push({
        target: uploadedData[i][0],
        status: null,
        selected: false,
        key: uuidv4(),
      });
    } else if (uploadedData[i][0] == '') {
    } else {
      return null;
    }
  }
  return parseddata;
};
