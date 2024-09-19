import React, { useState, useEffect } from 'react';
import {
  PlusOutlined,
  PictureOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import Upload from 'antd/es/upload';
import Input from 'antd/es/input';
import Tooltip from 'antd/es/tooltip';
import launchpadStyle from '../style/launchpad.module.less';
import message from 'antd/es/message';

export const CustomFileUpload = ({
  uploadedURL,
  setTokenInfo,
  setImageFile,
  imageFile,
  isFormSubmission,
  doesFieldDisabled,
}) => {
  const [imageURL, setImageURL] = useState('');

  const beforeUpload = file => {
    const maxSizeInBytes = 100 * 1024;
    if (file.size > maxSizeInBytes) {
      message.error('File size exceeds 100KB.');
      return false;
    }

    setTokenInfo(prev => ({
      ...prev,
      imageURL: null,
    }));
    setImageFile(file);
    // setImageURL(window.URL.createObjectURL(file));
    return false;
  };

  useEffect(() => {
    uploadedURL?.length ? setImageURL(uploadedURL) : null;
  }, [uploadedURL]);

  useEffect(() => {
    if (imageFile) {
      setImageURL(window.URL.createObjectURL(imageFile));
    } else {
      setImageURL(null);
    }
  }, [imageFile]);

  const handleChangeURL = event => {
    setTokenInfo(prev => ({
      ...prev,
      imageURL: event.target.value,
    }));
  };
  return (
    <>
      <p className={launchpadStyle.fieldLabel}>
        Enter logo image URL &nbsp;
        <Tooltip title='Provide a URL for your token logo image. If you are uploading keep the size below 100KB'>
          <InfoCircleOutlined />
        </Tooltip>
      </p>
      <div className={launchpadStyle.uploadContainer}>
        <div className={launchpadStyle.uploadBoxWrap}>
          <Input
            onChange={handleChangeURL}
            size='large'
            placeholder='URL'
            value={uploadedURL}
            className={launchpadStyle.fieldInput}
            disabled={doesFieldDisabled}
          />
          <p className={launchpadStyle.uploadImageOR}> OR </p>
          <Upload
            beforeUpload={beforeUpload}
            maxCount={1}
            action={null}
            method={null}
            fileList={[]}
            disabled={isFormSubmission || doesFieldDisabled}>
            <div className={launchpadStyle.imagePreview}>
              {imageURL?.length ? (
                <img src={imageURL} />
              ) : (
                <PictureOutlined
                  style={{ fontSize: '4rem', color: '#9800ed' }}
                  fill='#f95997'
                />
              )}
            </div>
            <p>{imageURL?.length ? 'Re upload' : 'Click to upload'}</p>
          </Upload>
        </div>
        <div className={launchpadStyle.uploadInfo}>
          <div className={launchpadStyle.infoWrap}>
            <p className={launchpadStyle.note}> Note:- </p>
            <p className={launchpadStyle.mainText}>
              Supported image formats: PNG/GIF/JPG/WEBP/JPEG and SVG
            </p>
            <p>Recommended size: 1000×1000 pixels</p>
            <p>Max Image size should be less than 100KB</p>
            <p className={launchpadStyle.faded}>
              If it meets the above requirements, it can be better displayed on
              various platforms and applications.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
