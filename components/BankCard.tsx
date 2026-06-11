'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { Check, Copy as CopyIcon } from 'lucide-react';
import { formatAmount } from '@/lib/utils';

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy account ID'}
      title={copied ? 'Copied!' : 'Copy account ID'}
      className="flex cursor-pointer items-center gap-1 rounded p-1 transition-colors hover:bg-gray-100"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success-600" aria-hidden />
      ) : (
        <CopyIcon className="h-3.5 w-3.5 text-gray-500" aria-hidden />
      )}
    </button>
  );
};

const BankCard = ({
  account,
  userName,
  showBalance = true,
}: {
  account: Account;
  userName: string;
  showBalance?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Link href={`/?id=${account.appwriteItemId}`} className="bank-card">
        {/* Decorative noise overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'url(/icons/lines.png)', backgroundSize: 'cover' }}
        />

        {/* Top row */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-11 font-medium text-white/70 uppercase tracking-widest">
              {account.type ?? 'Checking'}
            </p>
            <p className="font-ibm-plex-serif text-lg font-black text-white">
              {showBalance ? formatAmount(account.currentBalance) : '••••••'}
            </p>
          </div>
          <Image src="/icons/Paypass.svg" width={24} height={28} alt="" aria-hidden />
        </div>

        {/* Bottom row */}
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-10 font-medium text-white/60 uppercase tracking-wider">Cardholder</p>
              <p className="text-13 font-semibold text-white truncate max-w-[160px]">{userName}</p>
            </div>
            <Image src="/icons/mastercard.svg" width={40} height={28} alt="Mastercard" />
          </div>
          <p className="font-mono text-13 font-medium tracking-[0.15em] text-white/80">
            •••• •••• •••• {account.mask ?? '0000'}
          </p>
        </div>
      </Link>

      {showBalance && (
        <div className="bank-card_copy-btn">
          <span className="text-12 text-gray-500 font-medium">Account ID</span>
          <span className="text-12 font-mono text-gray-700 truncate max-w-[140px]">
            {account.shareableId?.slice(0, 16)}…
          </span>
          <CopyButton value={account.shareableId} />
        </div>
      )}
    </div>
  );
};

export default BankCard;
