import type { Metadata } from 'next';
import HeaderBox from '@/components/HeaderBox';

export const metadata: Metadata = { title: 'Payment Transfer — Horizon' };
import PaymentTransferForm from '@/components/PaymentTransferForm';
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import EmptyState from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

const PaymentTransfer = async () => {
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({ userId: loggedIn?.$id });

  const accountsData = accounts?.data ?? [];

  return (
    <section className="payment-transfer">
      <HeaderBox
        title="Payment Transfer"
        subtext="Please provide any specific details or notes related to the payment transfer."
      />
      <section className="size-full pt-5">
        {accountsData.length > 0 ? (
          <PaymentTransferForm accounts={accountsData} />
        ) : (
          <EmptyState
            title="No bank accounts to transfer from"
            subtext="Connect a bank account first — transfers need a linked funding source."
            user={loggedIn}
            showConnectBank
          />
        )}
      </section>
    </section>
  );
};

export default PaymentTransfer;
