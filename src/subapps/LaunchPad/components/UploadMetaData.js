import React, { useEffect, useMemo } from 'react';
import launchpadStyle from '../style/launchpad.module.less';
import { HyperButton } from '../../../components/buttons/HyperButton';
import { SUBMISSION_STATE_ENUM } from '../constants/data';

export const UploadMetaData = ({
  uploadMetadata,
  formSubmission,
  isDisabled,
}) => (
  <div style={{ marginTop: '2rem' }}>
    <HyperButton
      style={{ width: '100%' }}
      disabled={isDisabled}
      onClick={uploadMetadata}
      text={
        formSubmission[SUBMISSION_STATE_ENUM.METADATA_UPLOADING]
          ? 'Uploading Metadata'
          : 'Upload MetaData'
      }
    />
  </div>
);
