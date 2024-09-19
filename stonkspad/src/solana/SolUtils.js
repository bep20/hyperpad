import React from 'react';
import { sendAndConfirmRawTransaction } from '@solana/web3.js';
import { Parallel } from './parallel';
import { SOL_COMMITMENT, SOL_CONFIRM_OPTIONS } from '../constants/solana';

export class SolUtils {
  static async sendAndConfirmRawTransactionV1(
    connection,
    transaction,
    wallet,
    partialSigners = [],
    notifyApi,
    cluster,
  ) {
    const latestBlockhash = await connection.getLatestBlockhash(SOL_COMMITMENT);

    if (partialSigners) {
      partialSigners.forEach(s => transaction.partialSign(s));
    }

    let txId = '';
    const notifyId = Math.random() * 1000;

    try {
      if (wallet !== undefined) {
        transaction = await wallet.signTransaction(transaction);
      }

      txId = await connection.sendRawTransaction(
        transaction.serialize(),
        SOL_CONFIRM_OPTIONS,
      );

      notifyApi &&
        notifyApi.open({
          key: notifyId,
          placement: 'bottomRight',
          message: 'Transaction Processing',
          description: (
            <a
              target='_blank'
              href={`https://explorer.solana.com/tx/${txId}?cluster=${cluster}`}
              rel='noreferrer'>
              {txId}
            </a>
          ),
          duration: 30,
        });

      const res = await connection.confirmTransaction(
        {
          signature: txId,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        SOL_COMMITMENT,
      );

      if (res.value.err) {
        throw res.value.err;
      }

      notifyApi &&
        notifyApi.open({
          key: notifyId,
          placement: 'bottomRight',
          message: 'Transaction Confirmed',
          description: (
            <a
              target='_blank'
              href={`https://explorer.solana.com/tx/${txId}?cluster=${cluster}`}
              rel='noreferrer'>
              {txId}
            </a>
          ),
          duration: 5,
        });
    } catch (e) {
      console.log('Caught TX error', e);
      notifyApi &&
        notifyApi.open({
          key: notifyId,
          placement: 'bottomRight',
          message: 'Transaction Failed',
          description: (
            <a
              target='_blank'
              href={`https://explorer.solana.com/tx/${txId}?cluster=${cluster}`}
              rel='noreferrer'>
              {txId}
            </a>
          ),
          duration: 5,
        });
    }
    return txId;
  }

  static getConfirmTransaction(connection, tx, latestBlockhash) {
    return async (resolve, reject) => {
      try {
        const txId = await connection.sendRawTransaction(tx.serialize(), {
          skipPreflight: true,
        });
        
        const res = await connection.confirmTransaction(
          {
            signature: txId,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          SOL_COMMITMENT,
        );
        return resolve(res);
      } catch (err) {
        console.log('eeeee', err);
        reject(err);
      }
    };
  }

  static async sendAndConfirmAllRawTransaction(
    connection,
    transactions,
    wallet,
    partialSigners = [],
    notifyApi,
  ) {
    const latestBlockhash = await connection.getLatestBlockhash(SOL_COMMITMENT);

    if (partialSigners) {
      transactions.forEach(transaction => {
        partialSigners.forEach(s => transaction.partialSign(s));
      });
    }

    let txId = '';
    const notifyId = Math.random() * 1000;

    try {
      if (wallet !== undefined) {
        transactions = await wallet.signAllTransactions(transactions);
      }
      let txCbs = [];
      for (let tx of transactions) {
        txCbs.push(
          SolUtils.getConfirmTransaction(connection, tx, latestBlockhash),
        );
      }
      console.log('txCbs', txCbs);
      let sucessCount = 0;
      let failureCount = 0;

      notifyApi &&
        notifyApi.open({
          key: notifyId,
          placement: 'bottomRight',
          message: 'Transactions Processing',
          description: (
            <div>
              <p>Total Txn: {txCbs?.length}</p>
              <p>Success Count: {sucessCount}</p>
              <p>Failed Count: {failureCount}</p>
            </div>
          ),
          duration: 30,
        });

      const result = await Parallel.withLimit(txCbs, 5, (errr, succc) => {
        if (errr) {
          failureCount += 1;
        } else {
          sucessCount += 1;
        }
        notifyApi &&
          notifyApi.open({
            key: notifyId,
            placement: 'bottomRight',
            message: 'Transactions Processing',
            description: (
              <div>
                <p>Total Txn: {txCbs?.length}</p>
                <p>Success Count: {sucessCount}</p>
                <p>Failed Count: {failureCount}</p>
              </div>
            ),
            duration: 30,
          });
      });

      notifyApi &&
        notifyApi.open({
          key: notifyId,
          placement: 'bottomRight',
          message: 'Process Completed ',
          description: (
            <div>
              <p>Total Txn: {txCbs?.length}</p>
              <p>Success Count: {sucessCount}</p>
              <p>Failed Count: {failureCount}</p>
            </div>
          ),
          duration: 30,
        });
    } catch (e) {
      console.log('Caught TX error', e);
    }
    return txId;
  }

  static async getSignedTransaction(
    connection,
    transaction,
    wallet,
    feePayer,
    partialSigners = [],
  ) {
    const latestBlockhash = await connection.getLatestBlockhash(SOL_COMMITMENT);
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
    transaction.feePayer = feePayer;

    if (partialSigners) {
      partialSigners.forEach(s => transaction.partialSign(s));
    }

    try {
      if (wallet !== undefined) {
        transaction = await wallet.signTransaction(transaction);
      }
      return transaction;
    } catch (e) {
      console.log('Caught TX error', e);
      return null;
    }
  }

  static async sendAndConfirmRawTransactionV2(
    connection,
    tx,
    feePayer,
    wallet,
    partialSigners,
    notifyApi,
    cluster,
  ) {
    const latestBlockhash = await connection.getLatestBlockhash(SOL_COMMITMENT);
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
    tx.feePayer = feePayer;

    if (partialSigners) {
      partialSigners.forEach(s => tx.partialSign(s));
    }

    let txId = '';
    const notifyId = Math.random() * 1000;
    try {
      if (wallet !== undefined) {
        tx = await wallet.signTransaction(tx);
      }

      txId = await connection.sendRawTransaction(
        tx.serialize(),
        SOL_CONFIRM_OPTIONS,
      );
      notifyApi &&
        notifyApi.open({
          key: notifyId,
          placement: 'bottomRight',
          message: 'Transaction Processing',
          description: (
            <a
              target='_blank'
              href={`https://explorer.solana.com/tx/${txId}?cluster=${cluster}`}
              rel='noreferrer'>
              {txId}
            </a>
          ),
          duration: 30,
        });

      const res = await connection.confirmTransaction(
        {
          signature: txId,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        SOL_COMMITMENT,
      );

      if (res.value.err) {
        throw res.value.err;
      }
      notifyApi &&
        notifyApi.open({
          key: notifyId,
          placement: 'bottomRight',
          message: 'Transaction Confirmed',
          description: (
            <a
              target='_blank'
              href={`https://explorer.solana.com/tx/${txId}?cluster=${cluster}`}
              rel='noreferrer'>
              {txId}
            </a>
          ),
          duration: 5,
        });
    } catch (e) {
      console.log('Caught TX error', e);
      notifyApi &&
        notifyApi.open({
          key: notifyId,
          placement: 'bottomRight',
          message: 'Transaction Failed',
          description: (
            <a
              target='_blank'
              href={`https://explorer.solana.com/tx/${txId}?cluster=${cluster}`}
              rel='noreferrer'>
              {txId}
            </a>
          ),
          duration: 5,
        });
    }
    return txId;
  }
}
