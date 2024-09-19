import React from "react";
import {
  SUB_ROUTES as LAUNCHPAD_ROUTES,
  BASE_ROUTE as LAUNCHPAD_BASE_ROUTE,
} from "../subapps/LaunchPad/routes";
import { Route } from "react-router-dom";
import { LaunchPad } from "../subapps/LaunchPad";

export const getAllRoutes = () => {
  const allRoutes = [];

  allRoutes.push(<Route path="launchpad" element={<LaunchPad />} />);
  console.log("allroutes", allRoutes);
  return allRoutes;
};
