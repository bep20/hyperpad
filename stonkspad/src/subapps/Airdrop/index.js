// SubApp1/App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";

import { CreateAirDrop } from "./components/CreateAirdrop";
import { AirDropList } from "./components/AirDropList";

export const AirDrop = (props) => {
  console.log("this is launchpaaa", props);
  return (
    <Routes>
      <Route path="createairdrop" element={<CreateAirDrop />} />
      <Route path="airdroplist" element={<AirDropList />} />
    </Routes>
  );
};
