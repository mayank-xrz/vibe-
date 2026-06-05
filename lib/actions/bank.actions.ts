'use server';

import { ID, Query } from 'node-appwrite';
import { createAdminClient } from '../server/appwrite';
import { plaidClient } from '../plaid';
import { createFundingSource } from './dwolla.actions';
import { parseStringify, encryptId, extractCustomerIdFromUrl } from '../utils';
import { CountryCode, ProcessorTokenCreateRequestProcessorEnum, Products } from 'plaid';
import { revalidatePath } from 'next/cache';

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
  APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
} = process.env;

export async function createLinkToken(user: User) {
  try {
    const tokenParams = {
      user: { client_user_id: user.$id },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ['auth'] as Products[],
      language: 'en',
      country_codes: ['US'] as CountryCode[],
    };
    const res = await plaidClient.linkTokenCreate(tokenParams);
    return parseStringify({ linkToken: res.data.link_token });
  } catch (err) {
    console.error('Create link token error:', err);
    return null;
  }
}

export async function createBankAccount(params: createBankAccountProps) {
  try {
    const { database } = await createAdminClient();
    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      params
    );
    return parseStringify(bankAccount);
  } catch (err) {
    console.error('Create bank account error:', err);
    return null;
  }
}

export async function exchangePublicToken({ publicToken, user }: exchangePublicTokenProps) {
  try {
    const res = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
    const { access_token: accessToken, item_id: itemId } = res.data;

    const accountsRes = await plaidClient.accountsGet({ access_token: accessToken });
    const accountData = accountsRes.data.accounts[0];

    const processorTokenRes = await plaidClient.processorTokenCreate({
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: ProcessorTokenCreateRequestProcessorEnum.Dwolla,
    });
    const processorToken = processorTokenRes.data.processor_token;

    const fundingSourceUrl = await createFundingSource({
      dwollaCustomerId: extractCustomerIdFromUrl(user.dwollaCustomerUrl),
      processorToken,
      bankName: accountData.name,
    });
    if (!fundingSourceUrl) throw new Error('No funding source URL');

    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      sharableId: encryptId(accountData.account_id),
    });

    revalidatePath('/');
    return parseStringify({ publicTokenExchange: 'complete' });
  } catch (err) {
    console.error('Exchange public token error:', err);
    return null;
  }
}

export async function getBanks({ userId }: getBanksProps) {
  try {
    const { database } = await createAdminClient();
    const banks = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );
    return parseStringify(banks.documents);
  } catch {
    return null;
  }
}

export async function getBank({ documentId }: getBankProps) {
  try {
    const { database } = await createAdminClient();
    const bank = await database.getDocument(DATABASE_ID!, BANK_COLLECTION_ID!, documentId);
    return parseStringify(bank);
  } catch {
    return null;
  }
}

export async function getBankByAccountId({ accountId }: getBankByAccountIdProps) {
  try {
    const { database } = await createAdminClient();
    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('accountId', [accountId])]
    );
    if (bank.total !== 1) return null;
    return parseStringify(bank.documents[0]);
  } catch {
    return null;
  }
}

export async function getAccounts({ userId }: { userId: string }) {
  try {
    const banks = await getBanks({ userId });
    if (!banks) return null;

    const accounts = await Promise.all(
      banks.map(async (bank: Bank) => {
        const accountRes = await plaidClient.accountsGet({ access_token: bank.accessToken });
        const accountData = accountRes.data.accounts[0];
        const institution = await getInstitution({ institutionId: accountRes.data.item.institution_id! });

        const account: Account = {
          id: accountData.account_id,
          availableBalance: accountData.balances.available ?? 0,
          currentBalance: accountData.balances.current ?? 0,
          institutionId: institution?.institution_id ?? '',
          name: accountData.name,
          officialName: accountData.official_name ?? '',
          mask: accountData.mask ?? '',
          type: accountData.type as string,
          subtype: accountData.subtype as string,
          appwriteItemId: bank.$id,
          shareableId: encryptId(accountData.account_id),
        };
        return account;
      })
    );

    const totalBanks = accounts.length;
    const totalCurrentBalance = accounts.reduce((total, account) => total + account.currentBalance, 0);
    return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
  } catch {
    return null;
  }
}

export async function getAccount({ appwriteItemId }: { appwriteItemId: string }) {
  try {
    const bank = await getBank({ documentId: appwriteItemId });
    const accountRes = await plaidClient.accountsGet({ access_token: bank.accessToken });
    const accountData = accountRes.data.accounts[0];

    const transferTransactions = await getTransactionsByBankId({ bankId: appwriteItemId });
    const transactions = await getTransactions({ accessToken: bank.accessToken });

    const account: Account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available ?? 0,
      currentBalance: accountData.balances.current ?? 0,
      institutionId: '',
      name: accountData.name,
      officialName: accountData.official_name ?? '',
      mask: accountData.mask ?? '',
      type: accountData.type as string,
      subtype: accountData.subtype as string,
      appwriteItemId: bank.$id,
      shareableId: encryptId(accountData.account_id),
    };

    const allTransactions = [
      ...(transactions ?? []),
      ...(transferTransactions?.documents ?? []).map((t: Transaction) => ({
        ...t,
        amount: t.type === 'debit' ? -Number(t.amount) : Number(t.amount),
      })),
    ].sort((a, b) => new Date(b.date ?? b.$createdAt).getTime() - new Date(a.date ?? a.$createdAt).getTime());

    return parseStringify({ data: account, transactions: allTransactions });
  } catch {
    return null;
  }
}

async function getInstitution({ institutionId }: { institutionId: string }) {
  try {
    const res = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ['US'] as CountryCode[],
    });
    return res.data.institution;
  } catch {
    return null;
  }
}

async function getTransactions({ accessToken }: { accessToken: string }) {
  let hasMore = true;
  let transactions: Transaction[] = [];

  try {
    while (hasMore) {
      const res = await plaidClient.transactionsSync({ access_token: accessToken });
      const data = res.data;
      transactions.push(
        ...data.added.map((t) => ({
          id: t.transaction_id,
          $id: t.transaction_id,
          name: t.name,
          paymentChannel: t.payment_channel,
          type: t.payment_channel,
          accountId: t.account_id,
          amount: t.amount,
          pending: t.pending,
          category: t.personal_finance_category?.primary ?? 'Other',
          date: t.date,
          image: t.logo_url ?? '',
          $createdAt: t.date,
          channel: t.payment_channel,
          senderBankId: '',
          receiverBankId: '',
          senderId: '',
          receiverId: '',
        }))
      );
      hasMore = data.has_more;
    }
    return transactions;
  } catch {
    return [];
  }
}

export async function getTransactionsByBankId({ bankId }: { bankId: string }) {
  try {
    const { database } = await createAdminClient();
    const senderTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal('senderBankId', bankId)]
    );
    const receiverTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal('receiverBankId', bankId)]
    );
    return parseStringify({
      total: senderTransactions.total + receiverTransactions.total,
      documents: [
        ...senderTransactions.documents,
        ...receiverTransactions.documents,
      ],
    });
  } catch {
    return null;
  }
}

export async function createTransaction(transaction: {
  name: string;
  amount: string;
  senderId: string;
  senderBankId: string;
  receiverId: string;
  receiverBankId: string;
  email: string;
}) {
  try {
    const { database } = await createAdminClient();
    const newTransaction = await database.createDocument(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      ID.unique(),
      {
        channel: 'online',
        category: 'Transfer',
        ...transaction,
      }
    );
    return parseStringify(newTransaction);
  } catch {
    return null;
  }
}
