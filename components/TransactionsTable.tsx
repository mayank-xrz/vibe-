import React from 'react';
import { formatAmount, removeSpecialCharacters, getCategoryStyles, cn } from '@/lib/utils';

const CategoryBadge = ({ category }: { category: string }) => {
  const { borderColor, backgroundColor, textColor, chipBackgroundColor } = getCategoryStyles(category);
  return (
    <div className={cn('category-badge', borderColor, chipBackgroundColor)}>
      <div className={cn('size-2 rounded-full', backgroundColor)} />
      <p className={cn('text-[12px] font-medium', textColor)}>{category}</p>
    </div>
  );
};

const TransactionsTable = ({ transactions }: { transactions: Transaction[] }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-[#f9fafb] text-[12px] text-gray-500">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Transaction</th>
            <th className="px-4 py-3 text-left font-medium">Amount</th>
            <th className="px-4 py-3 text-left font-medium max-md:hidden">Status</th>
            <th className="px-4 py-3 text-left font-medium max-md:hidden">Date</th>
            <th className="px-4 py-3 text-left font-medium max-xl:hidden">Channel</th>
            <th className="px-4 py-3 text-left font-medium max-xl:hidden">Category</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t: Transaction) => {
            const amount = t.amount;
            const isDebit = t.type === 'debit' || amount < 0;
            const isCredit = !isDebit;
            return (
              <tr
                key={t.id ?? t.$id}
                className={cn(
                  'border-b border-gray-100 text-[14px]',
                  isDebit ? 'bg-[#FFFBFA]' : 'bg-[#F6FEF9]'
                )}
              >
                <td className="max-w-[250px] px-4 py-3 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-14 truncate font-semibold text-[#344054]">
                      {removeSpecialCharacters(t.name)}
                    </h1>
                  </div>
                </td>
                <td className={cn('px-4 py-3 font-semibold', isDebit ? 'text-[#f04438]' : 'text-[#039855]')}>
                  {isDebit ? `-${formatAmount(Math.abs(amount))}` : formatAmount(Math.abs(amount))}
                </td>
                <td className="px-4 py-3 max-md:hidden">
                  <CategoryBadge category={t.pending ? 'Processing' : 'Success'} />
                </td>
                <td className="px-4 py-3 max-md:hidden min-w-32">
                  {t.date ? new Date(t.date).toLocaleDateString() : new Date(t.$createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 capitalize min-w-24 max-xl:hidden">{t.paymentChannel}</td>
                <td className="px-4 py-3 max-xl:hidden">
                  <CategoryBadge category={t.category} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
