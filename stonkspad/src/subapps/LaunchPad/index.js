// SubApp1/App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { CreateLaunchpad } from "./container/CreateLaunchpad";
import { CreateFairLaunch } from "./container/CreateFairLaunch";
import { CreateToken } from "./container/CreateToken";
import { LaunchPadList } from "./container/LaunchPadList";
import { MyTokens } from "./container/MyTokens";
import { TokenDetails } from "./container/TokenDetails";

export const LaunchPad = (props) => {
  console.log("this is launchpaaa", props);
  return (
    <Routes>
      <Route path="createlaunchpad" element={<CreateLaunchpad />} />
      <Route path="createfairlaunch" element={<CreateFairLaunch />} />
      <Route path="createtoken" element={<CreateToken />} />
      <Route path="mytokens/:id" element={<TokenDetails />} />
      <Route path="mytokens" element={<MyTokens />} />
      <Route path="launchpadlist" element={<LaunchPadList />} />
    </Routes>
  );
};
