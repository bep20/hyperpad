import React from 'react';
import launchpadStyle from '../style/launchpad.module.less';

export const TokenCreationInfo22 = () => (
  <div className={launchpadStyle.tokenCreationInfoContainer}>
    <section className={launchpadStyle.infoAbout}>
      <h2>Create your own Solana SPL token with ease!</h2>
      <p>
        Craft your unique Solana SPL Token effortlessly in just a few simple
        steps—no coding needed.
      </p>
    </section>
    <section className={launchpadStyle.infoHowTo}>
      <h2>Simple Token Minting Process:</h2>
      <div>
        <ol className='text-base'>
          <li>Link your Solana wallet containing SOL tokens (phantom or solflare wallet).</li>
          <li>Input your token name, symbol, decimals, and total supply.</li>
          <li>
            Upload your token logo image or provide an URL for the token logo.
          </li>
          <li>Write a unique description for your Token.</li>
          <li>Add socials for your token.</li>
          <li>Click on upload metadata.</li>
          <li>If you wish to add token extensions like Transfer Tax and Interest Bearing, then enable the extensions and fill the values.</li>
          <li>Enable the “Create Custom Contract” button to create a custom mint address for your token.</li>
          <li>Click on Create Token button and your SPL token is created.</li>
        </ol>
      </div>
    </section>
    <section className={launchpadStyle.infoHowTo}>
      <h2>Add Social Links:</h2>
      <div>
        <ol className='text-base'>
          <li>Add your social links of project for better visibility</li>
          <li>All your social links will be added to token metadata.</li>
          <li>
            For Additional links, such as medium. You can add those in token
            description.
          </li>
        </ol>
      </div>
    </section>
    <section className={launchpadStyle.infoHowTo}>
      <h2>Custom Mint Address:</h2>
      <div>
        <ol className='text-base'>
          <li>
            Add prefix and suffix characters that your want your address to
            starts/ends with.
          </li>
          <li>
            Adjust threads(parallel process to generate custom address, more the
            threads faster will be address generation). Ideally threads should
            be equal to number of core of your device for better performance
          </li>
          <li>
            Choose case sensitive or insensitive that your address should
            verify.
          </li>
          <li>
            You can regenerate address, Just change the prefix/suffix and click
            on generate.
          </li>
          <li>
            Time Required to generate custom address depends on number of
            characters along with number of threads
          </li>
        </ol>
      </div>
    </section>

    <section className={launchpadStyle.infoHowTo}>
      <h2>Revoke Authority:</h2>
      <div>
        <ol className='text-base'>
          <li>
            Enable Authority to revoke the corrosponding authority (Mint,
            Update, Freeze)
          </li>
          <li>
            You wont be able to change authority once revoke. (Be carefull while
            revoking them)
          </li>
        </ol>
      </div>
    </section>
  </div>
);
