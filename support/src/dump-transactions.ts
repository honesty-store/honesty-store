#!/usr/bin/env node

import cruftDDB from 'cruft-ddb';
import { stringify } from 'csv';

import { getAllItems } from '../../item/src/client';
import { createServiceKey } from '../../service/src/key';
import { InternalAccount, Transaction } from '../../transaction/src/client/index';
import { User } from '../../user/src/client/index';

type TransactionRecord = InternalAccount | Transaction;

const cruftAccount = cruftDDB<TransactionRecord>({ tableName: 'honesty-store-transaction' });
const cruftUser = cruftDDB<User>({ tableName: 'honesty-store-user' });

const usage = () => {
  const script = process.argv[1];
  const [, filename = script] = script.match(/\/([^/]+)$/);

  console.error(`Usage: ${filename}`);
  console.error(`  Dumps a csv of all transaction metadata`);
  process.exit(2);
};

const main = async (args) => {
  if (args.length !== 0) {
    usage();
  }

  const registeredUsers = (await cruftUser.__findAll({}))
    .filter(user => user.emailAddress != null);

  const allAccountsAndTransactions = await cruftAccount.__findAll({});

  const allTransactions = allAccountsAndTransactions
    // tslint:disable-next-line:triple-equals
    .filter(account => (account as InternalAccount).balance == undefined) as Transaction[];

  const allAccounts = allAccountsAndTransactions
    // tslint:disable-next-line:triple-equals
    .filter(account => (account as InternalAccount).balance != undefined) as InternalAccount[];

  const getLinkedTransactions = (transactionHead) => {
    if (!transactionHead) {
      return [];
    }

    const head = allTransactions.find(({ id }) => id === transactionHead);
    if (!head) {
      throw new Error(`Couldn't find transaction '${transactionHead}'`);
    }

    return [
      head,
      ...getLinkedTransactions(head.next)
    ];
  };

  const items = await getAllItems(createServiceKey({ service: 'dump-transactions' }));

  const userTransactions = allAccounts
    .map(account => {
      const user = registeredUsers.find(({ accountId }) => accountId === account.id);
      if (user == null) {
        return [];
      }
      const { id: userId, ...userDetails } = user;
      // tslint:disable-next-line:no-unused-variable
      const { id: accountId, transactionHead, cachedTransactions, ...accountDetails } = account;

      const transactions = getLinkedTransactions(transactionHead);

      return transactions.map((transaction) => {
        // tslint:disable-next-line:no-unused-variable
        const { id: transactionId, data, next, ...transactionDetails } = transaction;
        const itemDetails = data.itemId ? items.find(({ id }) => id === data.itemId) : {};
        return {
          userId,
          ...userDetails,
          accountId,
          ...accountDetails,
          transactionId,
          ...transactionDetails,
          ...data,
          ...itemDetails
        };
      }
      );
    })
    .reduce((a, b) => a.concat(b))
    .map((item) => {
      const excelDate = (timestamp) => (Number(timestamp) + 2209161600000) / (24 * 60 * 60 * 1000);
      item.timestamp = excelDate(item.timestamp);
      item.created = excelDate(item.timestamp);
      return item;
    });

  // tslint:disable-next-line:no-console
  stringify(userTransactions, { header: true })
    .pipe(process.stdout);
};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
