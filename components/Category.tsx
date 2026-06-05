import { getCategoryStyles } from '@/lib/utils';
import { cn } from '@/lib/utils';

const Category = ({ category }: { category: CategoryCount }) => {
  const { name, count, totalCount } = category;
  const { borderColor, backgroundColor, textColor, chipBackgroundColor } = getCategoryStyles(name);
  const percentage = Math.round((count / totalCount) * 100);

  return (
    <div className={cn('gap-[18px] flex p-4 rounded-xl border', borderColor, chipBackgroundColor)}>
      <figure className={cn('flex-center h-10 w-10 min-w-10 rounded-full', backgroundColor)}>
        <span className="text-white text-sm font-bold">{name[0]}</span>
      </figure>
      <div className="flex w-full flex-1 flex-col gap-2">
        <div className="text-14 flex justify-between">
          <h2 className={cn('font-medium', textColor)}>{name}</h2>
          <h3 className="font-normal text-gray-600">{count} transactions</h3>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={cn('h-full rounded-full', backgroundColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Category;
