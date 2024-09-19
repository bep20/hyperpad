import React from 'react';
import { Link } from 'react-router-dom';

export const faqItems = [
  {
    key: '1',
    label: 'What is the Solana Token Snapshot Tool?',
    children: (
      <>
        <p>
          The Solana Token Snapshot Tool is a utility that allows users to
          generate a snapshot of token holders for a specific SPL or SPL22
          token. The snapshot can include details such as the top X addresses
          holding the token and list of all addresses with a specific minimum
          token holdings.
        </p>
      </>
    ),
  },
  {
    key: '2',
    label: ' Can I use this tool for both SPL and SPL22 tokens?',
    children: (
      <>
        <p>
          Yes, the tool supports snapshots for both SPL and SPL22 tokens on the
          Solana blockchain.
        </p>
      </>
    ),
  },
  {
    key: '3',
    label:
      ' Is there a limit to the number of addresses I can include in the snapshot?',
    children: (
      <>
        <p>
          The tool supports custom input for the number of addresses, including
          common choices like 500, 1000, 2000, and 5000. There is no strict
          upper limit, but extremely large numbers may impact performance.
        </p>
      </>
    ),
  },
  {
    key: '4',
    label: 'How can I access the generated snapshot file?',
    children: (
      <>
        <p>
          After processing, the tool provides a download link for the generated
          CSV or Excel file. You can download and save the file to your local
          device.
        </p>
      </>
    ),
  },
  {
    key: '5',
    label: 'What is the fee for generating a snapshot?',
    children: (
      <>
        <p>
          There is a fee of 0.1 SOL for each snapshot generated using the tool.
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
