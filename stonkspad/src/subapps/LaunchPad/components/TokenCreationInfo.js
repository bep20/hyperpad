import React from "react";
import launchpadStyle from "../style/launchpad.module.less";

export const TokenCreationInfo = () => {
  return (
    <div className={launchpadStyle.tokenCreationInfoContainer}>
      <section className={launchpadStyle.infoAbout}>
        <h1>Create your own Solana SPL token with ease!</h1>
        <p>   
          Craft your unique Solana SPL Token effortlessly in just a few simple steps—no coding needed. 
        </p>
        
      </section>
      <section className={launchpadStyle.infoHowTo}>
        <h1>Simple Token Minting Process:</h1>
        <div>
          <ol>
            <li>Link your Solana wallet containing SOL tokens</li>
            <li>Input your token name, symbol, decimals, and total supply.</li>
            <li>Upload your token logo image or provide an URL for the token logo.</li>
            <li>Write a unique description for your Token.</li>
            <li>Add socials for your token.</li>
            <li>Click on upload metadata.</li>
            <li>
              Click on Create Token button and your SPL token is created.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
};
