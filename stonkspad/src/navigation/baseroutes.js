import React from 'react';
import { Route } from 'react-router-dom';
import {
  SUB_ROUTES as LAUNCHPAD_ROUTES,
  BASE_ROUTE as LAUNCHPAD_BASE_ROUTE,
} from '../subapps/LaunchPad/routes';
import { LaunchPad } from '../subapps/LaunchPad';

export const getAllRoutes = () => {
  const allRoutes = [];

  allRoutes.push(<Route path='launchpad' element={<LaunchPad />} />);
  return allRoutes;
};
