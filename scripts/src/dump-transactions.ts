#!/usr/bin/env node

import cruftDDB from 'cruft-ddb';
import { stringify } from 'csv';

import { getAllItems, getItemAliases } from '@honesty-store/item';
import { createServiceKey } from '@honesty-store/service/lib/key';
import { Store } from '@honesty-store/store';
import { InternalAccount, Transaction } from '@honesty-store/transaction';
import { User, WithRefreshToken } from '@honesty-store/user';

type TransactionRecord = InternalAccount | Transaction;
type UserRecord = User & WithRefreshToken;

const cruftAccount = cruftDDB<TransactionRecord>({ tableName: 'honesty-store-transaction' });
const cruftUser = cruftDDB<UserRecord>({ tableName: 'honesty-store-user' });
const cruftStore = cruftDDB<Store>({ tableName: 'honesty-store-store' });

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

  const stores = await cruftStore.__findAll({});
  const ensureIsStoreCode = codeOrId => stores
    .find(({ code, id }) => id === codeOrId || code === codeOrId)
    .code;

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

  const key = createServiceKey({ service: 'dump-transactions' });
  const items = await getAllItems(key);
  const itemAliases = await getItemAliases(key);

  const canonicaliseItemId = id => {
    const canonId = itemAliases[id];
    if (canonId != null) {
      return canonicaliseItemId(canonId);
    }
    return id;
  };

  const lookupItemDetails = itemId => {
    if (itemId == null) {
      return {};
    }

    const canonicalItemId = canonicaliseItemId(itemId);
    return items.find(({ id }) => id === canonicalItemId);
  };

  const userTransactions = allAccounts
    .map(account => {
      const user = registeredUsers.find(({ accountId }) => accountId === account.id);
      if (user == null) {
        return [];
      }
      // tslint:disable-next-line:no-unused-variable
      const { id: userId, refreshToken: ignoredRefreshToken, ...userDetails } = user;
      // tslint:disable-next-line:no-unused-variable
      const { id: accountId, transactionHead, cachedTransactions, ...accountDetails } = account;

      const transactions = getLinkedTransactions(transactionHead);

      return transactions.map((transaction) => {
        // tslint:disable-next-line:no-unused-variable
        const { id: transactionId, data, next, ...transactionDetails } = transaction;
        const itemDetails = lookupItemDetails(data.itemId);
        return {
          userId,
          ...userDetails,
          accountId,
          ...accountDetails,
          transactionId,
          ...transactionDetails,
          ...data,
          storeCode: data.storeId && ensureIsStoreCode(data.storeId),
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
