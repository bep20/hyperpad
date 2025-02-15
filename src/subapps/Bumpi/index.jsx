import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HelmetLayout from '../../components/HelmetLayout';
import Create from './container/Create';
import Manage from './container/Manage';
import Details from './container/Details';

const Bumpi = () => {
  return (
    <>
      <HelmetLayout
        title='Bumpi Bot: Pumpfun bump bot'
        description='Bumpi bot performs microtrading on pumpfun tokens to increase the token transaction. And ensures higher visibility of token on pumpfun homepage'
      />
      <Routes>
        <Route path='start' element={<Create />} />
        <Route path='manage' element={<Manage />} />
        <Route path='manage/:compaignId' element={<Details />} />
      </Routes>
    </>
  );
};

export default Bumpi;
