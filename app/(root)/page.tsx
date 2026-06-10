import HeaderBox from '@/components/HeaderBox';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getAccounts, getAccount } from '@/lib/actions/bank.actions';
import EmptyState from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

const Home = async ({ searchParams }: { searchParams: { id?: string; page?: string } }) => {
  const currentPage = Number(searchParams?.page) || 1;
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({ userId: loggedIn?.$id });

  const accountsData = accounts?.data ?? [];
  const appwriteItemId = (searchParams?.id as string) || accountsData?.[0]?.appwriteItemId;

  const account = appwriteItemId ? await getAccount({ appwriteItemId }) : null;

  if (accountsData.length === 0) {
    return (
      <section className="home">
        <div className="home-content">
          <header className="home-header">
            <HeaderBox
              type="greeting"
              title="Welcome"
              user={loggedIn?.firstName || 'Guest'}
              subtext="Access and manage your account and transactions efficiently."
            />
          </header>
          <EmptyState
            title={accounts ? 'No bank accounts linked yet' : 'Could not load your accounts'}
            subtext={
              accounts
                ? 'Connect your first bank with Plaid to see balances, transactions and spending insights.'
                : 'There was a problem fetching your bank data. Please try again shortly.'
            }
            user={loggedIn}
            showConnectBank={!!accounts}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
            subtext="Access and manage your account and transactions efficiently."
          />
          <TotalBalanceBox
            accounts={accountsData}
            totalBanks={accounts?.totalBanks}
            totalCurrentBalance={accounts?.totalCurrentBalance}
          />
        </header>

        <RecentTransactions
          accounts={accountsData}
          transactions={account?.transactions}
          appwriteItemId={appwriteItemId}
          page={currentPage}
        />
      </div>

      <RightSidebar
        user={loggedIn}
        transactions={account?.transactions}
        banks={accountsData?.slice(0, 2)}
      />
    </section>
  );
};

export default Home;
