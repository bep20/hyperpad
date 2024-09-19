import React, { useState, useEffect } from "react";
import {
  UploadOutlined,
  PlusOutlined,
  PictureOutlined,
  PictureTwoTone,
} from "@ant-design/icons";
import Button from "antd/es/button";
import Upload from "antd/es/upload";
import Input from "antd/es/input";
import launchpadStyle from "../style/launchpad.module.less";

const uploadButton = (
  <div>
    <PlusOutlined />
    <div style={{ marginTop: 8 }}>Upload</div>
  </div>
);

export const CustomFileUpload = ({
  uploadedURL,
  setTokenInfo,
  uploadAndGenerateURL,
  isMetaDataUploaded,
}) => {
  const [fileList, setFile] = useState([]);
  const [imageURL, setImageURL] = useState("");

  const beforeUpload = (file) => {
    setTokenInfo((prev) => {
      return {
        ...prev,
        imageURL: null,
      };
    });
    console.log("blllb", file);
    setFile([file]);
    setImageURL(window.URL.createObjectURL(file));
    return false;
  };

  useEffect(() => {
    uploadedURL?.length ? setImageURL(uploadedURL) : setImageURL("");
  }, [uploadedURL]);

  const handleChangeURL = (event) => {
    setTokenInfo((prev) => {
      return {
        ...prev,
        imageURL: event.target.value,
      };
    });
  };

  const handleFileRemove = () => {
    setFileData([]);
    setFile([]);
  };

  return (
    <>
      <p className={launchpadStyle.fieldLabel}>
        Enter Image URL or Upload Image
      </p>
      <Input
        onChange={handleChangeURL}
        size="large"
        placeholder="URL"
        disabled={isMetaDataUploaded}
        value={uploadedURL}
        className={launchpadStyle.fieldInput}
      />
      <p className={launchpadStyle.uploadImageOR}> OR </p>
      <div className={launchpadStyle.uploadContainer}>
        <div className={launchpadStyle.imagePreview}>
          {imageURL?.length ? (
            <img src={imageURL} />
          ) : (
            <PictureOutlined
              style={{ fontSize: "4rem", color: "#f95997" }}
              fill="#f95997"
            />
          )}
        </div>
        <Upload
          beforeUpload={beforeUpload}
          maxCount={1}
          action={null}
          method={null}
          fileList={[]}
          disabled={isMetaDataUploaded}
        >
          <p>{imageURL?.length ? "Re upload" : "Upload image"}</p>
        </Upload>
      </div>
      {fileList?.length && !uploadedURL ? (
        <Button
          size="large"
          onClick={() => uploadAndGenerateURL(fileList[0])}
          className={`${launchpadStyle.generateURL} ${launchpadStyle.defaultButton}`}
          target="_blank"
        >
          Upload & generate URL
        </Button>
      ) : null}
    </>
  );
};
