import React from 'react';

export const faqItems = [
  {
    key: '1',
    label: 'What is the Batch Wallet Generator Tool?',
    children: (
      <>
        <p>
          The Batch Wallet Generator Tool is an application that allows users to
          generate multiple Solana wallets at once. Users can specify the number
          of wallets they wish to create, and the tool will generate them
          accordingly.
        </p>
      </>
    ),
  },
  {
    key: '2',
    label: 'How do I generate multiple wallets using the tool?',
    children: (
      <>
        <p>
          To generate multiple wallets, simply enter the number of wallets you
          wish to create in the input field and click the "Generate" button. The
          tool will then create the specified number of wallets for you.
        </p>
      </>
    ),
  },
  {
    key: '3',
    label: 'In which formats can I download the generated wallets?',
    children: (
      <>
        <p>
          The generated wallets can be downloaded in CSV, JSON, or Excel format,
          making it easy to store and manage your wallet data.
        </p>
      </>
    ),
  },
  {
    key: '4',
    label: 'Is the wallet generation process secure?',
    children: (
      <>
        <p>
          Yes, the wallet generation process is secure. The wallets are
          generated in the front end only, and the app does not save any data,
          ensuring that your information remains private and secure.
        </p>
      </>
    ),
  },
  {
    key: '5',
    label: 'Can I access the wallet data after closing the app?',
    children: (
      <>
        <p>
          No, the app does not save any data. Once you close the app, the
          generated wallets cannot be retrieved unless you have downloaded and
          saved the wallet data in CSV, JSON, or Excel format.
        </p>
      </>
    ),
  },

  {
    key: '6',
    label: 'What kind of information is included in the downloaded files?',
    children: (
      <>
        <p>
          The downloaded files contain essential information about the wallets,
          such as the wallet address and private key. Ensure you store this
          information securely as it is crucial for accessing your wallets.
        </p>
      </>
    ),
  },
  {
    key: '7',
    label: 'Can I regenerate the same wallets if I lose the downloaded file?',
    children: (
      <>
        <p>
          No, the wallets are generated randomly and cannot be regenerated. If
          you lose the downloaded file, the wallets cannot be retrieved, so it's
          important to save the file securely.
        </p>
      </>
    ),
  },
  {
    key: '8',
    label:
      'Is there any cost associated with using the Batch Wallet Generator Tool?',
    children: (
      <>
        <p>
          The tool is free to use. There are no costs associated with generating
          and downloading wallets.
        </p>
      </>
    ),
  },
];
