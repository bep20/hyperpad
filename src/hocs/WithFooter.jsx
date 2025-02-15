/* eslint-disable react/display-name */
import React from 'react';
import Footer from '../components/Footer';

const WithFooter = WrappedComponent => props => (
  <div className='flex flex-col justify-between overflow-auto w-full'>
    <WrappedComponent {...props} />
    <Footer />
  </div>
);
export default WithFooter;
