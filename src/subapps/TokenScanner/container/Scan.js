import React from 'react';
import { BubbleList } from '../components/bubbleList';
import scannerStyle from '../style/scanner.module.less';
import { BubbleSearch } from '../components/BubbleSearch';

export const Scan = ({ setSearchModalOpen }) => (
  <div className={scannerStyle.scanContainer}>
    <div>
      <h1 className={scannerStyle.title}>
        <span className={scannerStyle.purpleText}>Scanner: </span>Bubble Graph
        for SPL/SPL22 tokens
      </h1>
      <div className={scannerStyle.headerLine} />
    </div>
    <BubbleSearch setSearchModalOpen={setSearchModalOpen} />
    <BubbleList />
  </div>
);
