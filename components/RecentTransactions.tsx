import Link from 'next/link';
import TransactionsTable from './TransactionsTable';
import Pagination from './Pagination';

interface RecentTransactionsProps {
  accounts: Account[];
  transactions?: Transaction[];
  appwriteItemId: string;
  page?: number;
}

const RecentTransactions = ({
  accounts,
  transactions = [],
  appwriteItemId,
  page = 1,
}: RecentTransactionsProps) => {
  const rowsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const indexOfLast = page * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentTransactions = transactions.slice(indexOfFirst, indexOfLast);

  return (
    <section className="recent-transactions">
      <header className="flex items-center justify-between">
        <h2 className="recent-transactions-label">Recent transactions</h2>
        <Link href={`/transaction-history/?id=${appwriteItemId}`} className="view-all-btn">
          View all
        </Link>
      </header>

      <div className="w-full">
        {/* Simple tab implementation without shadcn */}
        <div className="flex overflow-x-auto gap-2 mb-4 border-b border-gray-200">
          {accounts.map((account) => (
            <Link
              key={account.id}
              href={`/?id=${account.appwriteItemId}`}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                account.appwriteItemId === appwriteItemId
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {account.name}
            </Link>
          ))}
        </div>

        <TransactionsTable transactions={currentTransactions} />
        {totalPages > 1 && (
          <div className="my-4 w-full">
            <Pagination totalPages={totalPages} page={page} />
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentTransactions;
