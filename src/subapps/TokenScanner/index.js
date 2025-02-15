import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Graph from './container/Graph';
import './style/index.css';
import { Scan } from './container/Scan';
import SearchModal from './components/SearchModal';
import HelmetLayout from '../../components/HelmetLayout';

export const TokenScanner = () => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <>
      <HelmetLayout
        title='Token Scanner: Analyze Token Transfers with bubble graph'
        description='Explore token transactions and analyze transfer patterns with our Token Scanner tool. Generate bubble graphs to visualize token movement and identify linked holder clusters for deeper insights. Enhance your token analysis capabilities today.'
        keywords='Token scanner, token transfer analysis, bubble graph generator, holder cluster identification, token movement visualization, Solana blockchain tools, token analysis utilities'
      />

      <div>Coming soon...</div>

      {/* <Routes>
        <Route
          path='/:mint_address'
          element={<Graph setSearchModalOpen={setSearchModalOpen} />}
        />
        <Route
          path='/'
          element={<Scan setSearchModalOpen={setSearchModalOpen} />}
        />
      </Routes>

      <SearchModal
        modalOpen={searchModalOpen}
        setModalOpen={setSearchModalOpen}
      /> */}
    </>
  );
};

// export const TokenScanner = () => <div>Coming soon...</div>;
