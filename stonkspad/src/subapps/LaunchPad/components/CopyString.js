import React from 'react';
import Tooltip from 'antd/es/tooltip';
import { CopyOutlined } from '@ant-design/icons';
import launchpadStyle from '../style/launchpad.module.less';

export const CopyString = ({ data = '', dataToCopy, ...props }) => {
  const [tooltipText, setTooltipText] = React.useState('Click to copy');

  const handleCopy = textToCopy => {
    navigator.clipboard.writeText(textToCopy);
    setTooltipText('Copied !!');
  };
  const handleTooltipVisibleChange = visible => {
    if (!visible) {
      setTooltipText('Copy to clipboard');
    }
  };
  return (
    <div
      onClick={() => handleCopy(dataToCopy || data)}
      className={launchpadStyle.simpleCopyText}
      {...props}>
      <Tooltip
        title={tooltipText}
        onOpenChange={handleTooltipVisibleChange}
        style={{ display: 'flex' }}>
        {data && <span className={launchpadStyle.copyData}>{data}</span>}
        <span className={launchpadStyle.copyIcon}>
          <CopyOutlined style={{ color: 'gray', marginLeft: '10px' }} />
        </span>
      </Tooltip>
    </div>
  );
};
