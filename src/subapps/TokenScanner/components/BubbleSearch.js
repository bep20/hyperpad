import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import scannerStyle from '../style/scanner.module.less';

export const BubbleSearch = ({ setSearchModalOpen }) => {
  return (
    <div className={scannerStyle.searchContainer}>
      <div className={scannerStyle.searchBar}>
        <div
          className={scannerStyle.searchInput}
          onClick={() => {
            setSearchModalOpen(true);
          }}>
          <p>Search tokens by address</p>
          <p>
            <SearchOutlined />
          </p>
        </div>
      </div>
    </div>
  );
};
