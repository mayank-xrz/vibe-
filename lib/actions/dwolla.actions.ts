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
  } catch (err: any) {
    // Dwolla returns a structured validation body (err.body._embedded.errors)
    // describing exactly which field/format was rejected (e.g. dateOfBirth).
    // Log the full detail so it lands in the Netlify function logs, then
    // re-throw so the signUp flow can roll back and surface the real cause.
    console.error('Creating Dwolla customer failed:', {
      message: err?.message,
      status: err?.status,
      body: err?.body ? JSON.stringify(err.body) : undefined,
      validationErrors: err?.body?._embedded?.errors,
    });
    throw err;
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

// Compensating action for bank linking: removes a funding source created
// earlier in a flow whose later step failed.
export async function removeFundingSource(fundingSourceUrl: string) {
  try {
    const client = getDwollaClient();
    await client.post(fundingSourceUrl, { removed: true });
    return true;
  } catch (err) {
    console.error('Removing funding source failed:', err);
    return false;
  }
}

// Compensating action for atomic signup: Dwolla customers cannot be hard
// deleted, but they can be deactivated/suspended. We POST a status update to
// roll back a customer created earlier in a signup flow that later failed.
export async function deactivateDwollaCustomer(dwollaCustomerUrl: string) {
  try {
    const client = getDwollaClient();
    await client.post(dwollaCustomerUrl, { status: 'deactivated' });
    return true;
  } catch (err) {
    console.error('Deactivating Dwolla customer failed:', err);
    return false;
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
