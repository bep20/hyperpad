import React from 'react';
import { Link } from 'react-router-dom';
import {
  MULTI_SENDER_FEE_SOL,
  MULTI_SENDER_FEE_TOKEN,
} from '../../../envs/vars';

export const faqItems = [
  {
    key: '1',
    label: 'What is the Solana Multisender tool?',
    children: (
      <>
        <p>
          Solana Multisender is a dApp that allows users, without coding
          experience, to send Tokens or solana to a list of wallets, with custom
          quantities. You can fill the list manually or upload a CSV.
        </p>
        <p>
          All this process is faster and cheaper than any other option as it is
          automatically done.
        </p>
      </>
    ),
  },
  {
    key: '2',
    label:
      'How much time does it take to distribute token/SOL to a list of wallets?',
    children: (
      <>
        <p>
          The time of your distribution depends on the number of wallets. It
          usually takes just a few minutes
        </p>
      </>
    ),
  },
  {
    key: '3',
    label: 'How much does the multisender costs?',
    children: (
      <>
        <p>
          We have a standard fee of {MULTI_SENDER_FEE_TOKEN} SOL per address for
          token transfer and
          {MULTI_SENDER_FEE_SOL} SOL per address for SOL transfers.
        </p>
      </>
    ),
  },
  {
    key: '4',
    label: 'Tool is throwing Token is not spl/spl2022 standard error?',
    children: (
      <>
        <p>
          For spl standard token, you have to select spl token on the first
          step, and for spl2022 select spl22 token standard on first step, Also
          make sure you have selected correct netowork type (Mainnnet or
          Devnet).
        </p>
        <p>Try Refreshing the page</p>
        <p>
          If Issue still persists, Try to switch between mainnet to devnet then
          again devnet to mainnet, and then try to load token
        </p>
        <p>
          Still not resolved? Reach out to team hypersol on{' '}
          <Link target='_blank' to='https://t.me/hypersol'>
            Telegram
          </Link>{' '}
          or{' '}
          <Link target='_blank' to='https://x.com/hypersolX'>
            Twitter
          </Link>
        </p>
      </>
    ),
  },
  {
    key: '5',
    label: 'How to check status of my multisend transaction?',
    children: (
      <>
        <p>
          Check out Manage tab under Multisender section (Multisender &gt;
          Manage), There will be all of your multisender transaction details,
          Along with transaction details for each wallet if you click on view
          details on card
        </p>
      </>
    ),
  },
  {
    key: '6',
    label: 'Whom to react out in case of any issue or support?',
    children: (
      <>
        <p>
          Reach out to team hypersol at{' '}
          <Link target='_blank' to='https://t.me/hypersol'>
            Telegram
          </Link>{' '}
          or{' '}
          <Link target='_blank' to='https://x.com/hypersolX'>
            Twitter
          </Link>
        </p>
      </>
    ),
  },
];
