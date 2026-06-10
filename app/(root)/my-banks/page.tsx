import HeaderBox from '@/components/HeaderBox';
import BankCard from '@/components/BankCard';
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import EmptyState from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

const MyBanks = async () => {
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({ userId: loggedIn?.$id });

  return (
    <section className="flex">
      <div className="my-banks">
        <HeaderBox
          title="My Bank Accounts"
          subtext="Effortlessly manage your banking activities."
        />
        <div className="space-y-4">
          <h2 className="header-2">Your cards</h2>
          {accounts?.data?.length ? (
            <div className="flex flex-wrap gap-6">
              {accounts.data.map((a: Account) => (
                <BankCard
                  key={a.id}
                  account={a}
                  userName={`${loggedIn?.firstName} ${loggedIn?.lastName}`}
                  showBalance
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No bank accounts linked yet"
              subtext="Connect your first bank with Plaid to see your cards here."
              user={loggedIn}
              showConnectBank
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default MyBanks;
