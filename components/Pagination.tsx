'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
}

const Pagination = ({ page, totalPages }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigation = (type: 'prev' | 'next') => {
    const pageNumber = type === 'prev' ? page - 1 : page + 1;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex justify-between gap-3">
      <button
        onClick={() => handleNavigation('prev')}
        disabled={page <= 1}
        className={cn(
          'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200',
          page <= 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
        )}
      >
        <Image src="/icons/arrow-left.svg" width={16} height={16} alt="arrow" />
        Prev
      </button>
      <p className="text-14 flex items-center px-2">
        {page} / {totalPages}
      </p>
      <button
        onClick={() => handleNavigation('next')}
        disabled={page >= totalPages}
        className={cn(
          'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200',
          page >= totalPages ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
        )}
      >
        Next
        <Image src="/icons/arrow-left.svg" width={16} height={16} alt="arrow" className="rotate-180" />
      </button>
    </div>
  );
};

export default Pagination;
