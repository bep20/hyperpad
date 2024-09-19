import React from 'react';
import bumpiStyle from '../style/bumpi.module.less';

export const BumpiInfo = () => (
  <div className={bumpiStyle.infoContainer}>
    <section className={bumpiStyle.section}>
      <h2>Bumpi Bot</h2>
      <p>
        The Bumpi Bot is designed for micro-trading on PumpFun tokens, making multiple small transactions to keep the token at the top of the PumpFun homepage.
      </p>
      <p>Here's how to get started with the Bumpi Bot::-</p>
      <ul>
        <li><b>Load the Token:</b> Begin by loading the token using its mint address.</li>
        <li><b>Set Total Transactions:</b> Decide on the total number of transactions you want the bot to perform.</li>
        <li>
         <b>Adjust the Rate:</b> Set the rate, which is the number of transactions per mint the bot will execute on the token. Each transaction consists of one buy and one sell, and the high volume of small transactions helps maintain the token’s visibility at the top of the homepage.
        </li>
        <li>
         <b>Choose Transaction Amount:</b> Select the amount of SOL (Solana) the bot will use for each buy and sell transaction. Keeping this amount low is recommended to minimize price impact.
        </li>
      </ul>
      <br />
      <p>
        For more information or if you have any questions, please contact the Hypersol team on Telegram or Twitter.
      </p>
    </section>
  </div>
);
