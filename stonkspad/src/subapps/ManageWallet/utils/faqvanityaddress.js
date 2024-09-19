import React from 'react';

export const faqItems = [
  {
    key: '1',
    label: 'What does this tool do?',
    children: (
      <>
        <p>
          This tool allows users to generate custom Solana wallet addresses with
          user-specified prefixes and suffixes. It provides the private keys and
          key phrases for these customized wallet addresses for free.
        </p>
      </>
    ),
  },
  {
    key: '2',
    label: 'Is the customization case-sensitive?',
    children: (
      <>
        <p>
          The tool has an option for case sensitivity. You can choose whether
          you want the customization to be case-sensitive or not by selecting
          the appropriate option.
        </p>
      </>
    ),
  },
  {
    key: '3',
    label: 'How do I adjust the performance of the tool?',
    children: (
      <>
        <p>
          You can adjust the number of threads used by the tool based on your
          device's performance
        </p>
      </>
    ),
  },
  {
    key: '4',
    label:
      'Is there a recommendation for the length of the customized prefix or suffix?',
    children: (
      <>
        <p>
          Yes, it is recommended to keep the customized prefix and suffix within
          4-5 characters to avoid lengthy processing times.
        </p>
      </>
    ),
  },
  {
    key: '5',
    label: 'How do I start generating a custom wallet address?',
    children: (
      <>
        <p>
          To start generating a custom wallet address, enter your desired prefix
          and/or suffix, adjust the number of threads if necessary, and click
          the "Generate" button.
        </p>
      </>
    ),
  },

  {
    key: '6',
    label: 'Can I pause the generation process?',
    children: (
      <>
        <p>
          Yes, you can pause the generation process by clicking the "Pause"
          button.
        </p>
      </>
    ),
  },
  {
    key: '7',
    label: 'What happens if the generation process is interrupted?',
    children: (
      <>
        <p>
          If the generation process is paused or interrupted, you can resume it
          by clicking the "Generate" button again.
        </p>
      </>
    ),
  },
  {
    key: '8',
    label: 'What are the fees required to use this tool?',
    children: (
      <>
        <p>
          This tool is free to use and provides the private keys and key phrases
          for the generated custom wallet addresses at no cost
        </p>
      </>
    ),
  },
];
