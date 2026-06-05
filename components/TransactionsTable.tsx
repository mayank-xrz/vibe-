import React from 'react';
import { formatAmount, removeSpecialCharacters, getCategoryStyles, cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

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
      <Table>
        <TableHeader className="bg-[#f9fafb]">
          <TableRow>
            <TableHead className="px-4">Transaction</TableHead>
            <TableHead className="px-4">Amount</TableHead>
            <TableHead className="px-4 max-md:hidden">Status</TableHead>
            <TableHead className="px-4 max-md:hidden">Date</TableHead>
            <TableHead className="px-4 max-xl:hidden">Channel</TableHead>
            <TableHead className="px-4 max-xl:hidden">Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t: Transaction) => {
            const amount = t.amount;
            const isDebit = t.type === 'debit' || amount < 0;
            return (
              <TableRow
                key={t.id ?? t.$id}
                className={cn(
                  'border-b border-gray-100 text-[14px]',
                  isDebit ? 'bg-[#FFFBFA]' : 'bg-[#F6FEF9]'
                )}
              >
                <TableCell className="max-w-[250px] px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-14 truncate font-semibold text-[#344054]">
                      {removeSpecialCharacters(t.name)}
                    </h1>
                  </div>
                </TableCell>
                <TableCell
                  className={cn('px-4 py-3 font-semibold', isDebit ? 'text-[#f04438]' : 'text-[#039855]')}
                >
                  {isDebit ? `-${formatAmount(Math.abs(amount))}` : formatAmount(Math.abs(amount))}
                </TableCell>
                <TableCell className="px-4 py-3 max-md:hidden">
                  <CategoryBadge category={t.pending ? 'Processing' : 'Success'} />
                </TableCell>
                <TableCell className="px-4 py-3 max-md:hidden min-w-32">
                  {t.date ? new Date(t.date).toLocaleDateString() : new Date(t.$createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-4 py-3 capitalize min-w-24 max-xl:hidden">
                  {t.paymentChannel}
                </TableCell>
                <TableCell className="px-4 py-3 max-xl:hidden">
                  <CategoryBadge category={t.category} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsTable;
