/* eslint-disable react/no-unescaped-entities */
import React from 'react';

export const faqItems = {
  mint: [
    {
      key: '1',
      label: 'What does it mean to mint tokens?',
      children: (
        <p>
          Minting tokens involves creating new units of an SPL or SPL22 token
          and adding them to the total supply. This process is controlled by the
          Mint Authority.
        </p>
      ),
    },
    {
      key: '2',
      label: 'Who can mint tokens for SPL and SPL22 tokens?',
      children: (
        <p>
          Only the account designated as the Mint Authority can mint new tokens.
          This account is specified during the token's creation.
        </p>
      ),
    },
    {
      key: '3',
      label: 'How can I mint new tokens for an SPL or SPL22 token?',
      children: (
        <p>
          Load the token on the above mint token section by entering the token
          address. It will give an option to mint additional tokens if you have
          mint authority. Just enter the amount of tokens that you want to mint
          and confirm the transaction on your wallet.
        </p>
      ),
    },
    {
      key: '4',
      label: 'Can I mint tokens if I am not the Mint Authority?',
      children: (
        <p>
          No, only the designated Mint Authority can mint new tokens. If you
          need to mint tokens, you must first be assigned as the Mint Authority.
        </p>
      ),
    },
    {
      key: '5',
      label: 'What happens if the Mint Authority is set to null?',
      children: (
        <p>
          If the Mint Authority is set to null, no new tokens can be minted,
          effectively capping the token's supply at its current level.
        </p>
      ),
    },
    {
      key: '6',
      label: 'Can the Mint Authority be transferred?',
      children: (
        <p>
          Yes, the Mint Authority can be transferred to another account if the
          current Mint Authority holder initiates the transfer.
        </p>
      ),
    },
  ],
  'mint-authority': [
    {
      key: '1',
      label: 'What is Mint Authority in Solana?',
      children: (
        <p>
          Mint Authority is the designated account or entity that has the power
          to mint (create) new tokens for a specific SPL or SPL22 token on the
          Solana blockchain.
        </p>
      ),
    },
    {
      key: '2',
      label: 'Can Mint Authority be changed or removed?',
      children: (
        <p>
          Yes, the current Mint Authority can be transferred to a new address or
          permanently revoked using our “Mint Authority” tool, if allowed by
          token configuration.
        </p>
      ),
    },
    {
      key: '3',
      label: 'What happens if Mint Authority is revoked?',
      children: (
        <p>
          Removal stops new token creation, fixing the token’s supply
          permanently.
        </p>
      ),
    },
  ],
  'freeze-authority': [
    {
      key: '1',
      label: 'What is freeze authority for SPL/SPL22 tokens on Solana?',
      children: (
        <p>
          Freeze authority grants the ability to lock (freeze) a specific SPL or
          SPL22 token in any wallet, preventing its transfer or use until
          unfrozen.
        </p>
      ),
    },
    {
      key: '2',
      label: 'Who initially holds freeze authority for these tokens?',
      children: (
        <p>
          By default, freeze authority is held by the wallet that created or
          issued the tokens.
        </p>
      ),
    },
    {
      key: '3',
      label: 'When should freeze authority be revoked?',
      children: (
        <p>
          Revoking freeze authority might be necessary if tokens are no longer
          intended to be restricted or if control needs to be centralized or
          redistributed.
        </p>
      ),
    },
    {
      key: '4',
      label: 'Why would you use Freeze Authority?',
      children: (
        <p>
          Yes, the Freeze Authority can be reassigned or permanently removed by
          the current freeze authority holder if the token was configured to
          allow this.
        </p>
      ),
    },
  ],
  'tax-authority': [
    {
      key: '1',
      label: 'What is Tax Authority in the context of SPL22 tokens?',
      children: (
        <p>
          Tax Authority is a feature that allows a designated account or entity
          to impose and manage taxes or fees on transactions involving SPL22
          tokens.
        </p>
      ),
    },
    {
      key: '2',
      label: 'How is Tax Authority assigned for SPL22 tokens?',
      children: (
        <p>
          Tax Authority is assigned during the creation of the SPL22 token. The
          token's creator specifies an account to hold the tax authority.
        </p>
      ),
    },
    {
      key: '3',
      label: 'How can one update the tax authority?',
      children: (
        <p>
          User can use our tool to update tax authority either to a different
          address or revoke the tax authority.
        </p>
      ),
    },
    {
      key: '4',
      label: 'What happens when the tax authority is revoked?',
      children: (
        <p>
          If the tax Authority is revoked, then taxes or fees become fixed for
          that particular SPL22 token.
        </p>
      ),
    },
  ],
  'tax-withdraw-authority': [
    {
      key: '1',
      label: 'What is Tax Withdraw Authority in the context of SPL22 tokens?',
      children: (
        <p>
          Tax Withdraw Authority is the designated account or entity that has
          the power to withdraw and manage the taxes or fees collected from
          transactions involving SPL22 tokens.
        </p>
      ),
    },
    {
      key: '2',
      label: 'How is the Tax Withdraw Authority assigned for SPL22 tokens?',
      children: (
        <p>
          Tax Withdraw Authority is assigned during the creation of the SPL22
          token. The token's creator specifies an account to hold the tax
          withdrawal authority.
        </p>
      ),
    },
    {
      key: '3',
      label:
        'Can the Tax Withdraw Authority be transferred to another account?',
      children: (
        <p>
          Yes, the Tax Withdraw Authority can be transferred to another account.
          Only current tax Withdraw authority can transfer or revoke this.
        </p>
      ),
    },
    {
      key: '4',
      label:
        'What happens if the Tax Withdraw Authority is removed or set to null?',
      children: (
        <p>
          If the Tax Withdraw Authority is removed or set to null, no
          withdrawals of the collected taxes can be made. Taxes will still be
          applied on transactions but no one will be able to use the collected
          tokens.
        </p>
      ),
    },
    {
      key: '5',
      label:
        'Can multiple accounts hold Tax Withdraw Authority for a single token?',
      children: (
        <p>
          No, typically only one account holds the tax withdrawal authority for
          a token at any given time. However, this authority can be transferred
          to another account.
        </p>
      ),
    },
  ],
  'update-metadata': [
    {
      key: '1',
      label: 'What is metadata in the context of SPL and SPL22 tokens?',
      children: (
        <p>
          Metadata refers to additional information associated with SPL and
          SPL22 tokens, such as their name, symbol, logo, and description.
        </p>
      ),
    },
    {
      key: '2',
      label: 'Why would you need to update metadata for SPL or SPL22 tokens?',
      children: (
        <p>
          Updating metadata may be necessary to correct errors, improve token
          details, adapt to rebranding efforts, or provide updated information
          relevant to users and platforms interacting with the token.
        </p>
      ),
    },
    {
      key: '3',
      label: 'Who can update the metadata of an SPL or SPL22 token?',
      children: (
        <p>
          Typically, only the account designated as the Metadata Authority has
          the ability to update the metadata of an SPL or SPL22 token.
        </p>
      ),
    },
    {
      key: '4',
      label: 'How can I update the metadata for an SPL or SPL22 token?',
      children: (
        <p>
          To update metadata, enter the token's mint address in the designated
          section, input the desired information for update, and confirm the
          transaction to apply the changes.
        </p>
      ),
    },
  ],
};
