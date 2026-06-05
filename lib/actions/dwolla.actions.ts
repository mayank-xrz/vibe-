'use server';

import { Client } from 'dwolla-v2';

function getDwollaClient() {
  const key = process.env.DWOLLA_KEY;
  const secret = process.env.DWOLLA_SECRET;
  const environment = process.env.DWOLLA_ENV === 'production' ? 'production' : 'sandbox';

  if (!key || !secret) {
    throw new Error('Dwolla credentials not configured');
  }

  return new Client({ environment, key, secret });
}

export async function createDwollaCustomer(newCustomer: NewDwollaCustomerParams) {
  try {
    const client = getDwollaClient();
    const res = await client.post('customers', newCustomer);
    return res.headers.get('location');
  } catch (err) {
    console.error('Creating Dwolla customer failed:', err);
    return null;
  }
}

export async function createFundingSource(params: AddFundingSourceParams) {
  try {
    const client = getDwollaClient();
    const { dwollaCustomerId, processorToken, bankName } = params;
    const res = await client.post(
      `customers/${dwollaCustomerId}/funding-sources`,
      { plaidToken: processorToken, name: bankName }
    );
    return res.headers.get('location');
  } catch (err) {
    console.error('Creating funding source failed:', err);
    return null;
  }
}

export async function createTransfer(params: TransferParams) {
  try {
    const client = getDwollaClient();
    const { sourceFundingSourceUrl, destinationFundingSourceUrl, amount } = params;
    const res = await client.post('transfers', {
      _links: {
        source: { href: sourceFundingSourceUrl },
        destination: { href: destinationFundingSourceUrl },
      },
      amount: { currency: 'USD', value: amount },
    });
    return res.headers.get('location');
  } catch (err) {
    console.error('Creating transfer failed:', err);
    return null;
  }
}
