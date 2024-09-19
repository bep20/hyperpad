import React from "react";
import Input from "antd/es/input";
import Checkbox from "antd/es/checkbox";
import launchpadStyle from "../style/launchpad.module.less";

export const SocialMedia = ({
  socialMediaInfo,
  setSocialMediaInfo,
  isSocialMediaEnabled,
  setIsSocialMediaEnabled,
  isMetaDataUploaded,
}) => {
  return (
    <div className={launchpadStyle.socialMediaContainer}>
      <div className={launchpadStyle.enableCheckbox}>
        <Checkbox
          onChange={() => setIsSocialMediaEnabled((prev) => !prev)}
          checked={isSocialMediaEnabled}
          disabled={isMetaDataUploaded}
        >
          Want to Add Social Media links?
        </Checkbox>
      </div>
      {isSocialMediaEnabled && (
        <div className={launchpadStyle.mediaLinksContainer}>
          <div className={launchpadStyle.mediaLinkItem}>
            <p>Twitter</p>
            <Input
              value={socialMediaInfo.twitter}
              disabled={isMetaDataUploaded}
              className={launchpadStyle.fieldInput}
              onChange={(event) =>
                setSocialMediaInfo((prev) => {
                  return {
                    ...prev,
                    twitter: event.target.value,
                  };
                })
              }
            />
          </div>
          <div className={launchpadStyle.mediaLinkItem}>
            <p>Telegram</p>
            <Input
              value={socialMediaInfo.telegram}
              className={launchpadStyle.fieldInput}
              disabled={isMetaDataUploaded}
              onChange={(event) =>
                setSocialMediaInfo((prev) => {
                  return {
                    ...prev,
                    telegram: event.target.value,
                  };
                })
              }
            />
          </div>
          <div className={launchpadStyle.mediaLinkItem}>
            <p>Website</p>
            <Input
              value={socialMediaInfo.website}
              className={launchpadStyle.fieldInput}
              disabled={isMetaDataUploaded}
              onChange={(event) =>
                setSocialMediaInfo((prev) => {
                  return {
                    ...prev,
                    website: event.target.value,
                  };
                })
              }
            />
          </div>
          <div className={launchpadStyle.mediaLinkItem}>
            <p>Medium</p>
            <Input
              value={socialMediaInfo.medium}
              className={launchpadStyle.fieldInput}
              disabled={isMetaDataUploaded}
              onChange={(event) =>
                setSocialMediaInfo((prev) => {
                  return {
                    ...prev,
                    medium: event.target.value,
                  };
                })
              }
            />
          </div>
          <div className={launchpadStyle.mediaLinkItem}>
            <p>Discord</p>
            <Input
              value={socialMediaInfo.discord}
              className={launchpadStyle.fieldInput}
              disabled={isMetaDataUploaded}
              onChange={(event) =>
                setSocialMediaInfo((prev) => {
                  return {
                    ...prev,
                    discord: event.target.value,
                  };
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
