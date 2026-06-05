'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { Check, Copy as CopyIcon } from 'lucide-react';
import { formatAmount } from '@/lib/utils';

interface BankCardProps {
  account: Account;
  userName: string;
  showBalance?: boolean;
}

const Copy = ({ title }: { title: string }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(title);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex cursor-pointer gap-1.5 items-center ml-2"
      title="Copy"
    >
      {hasCopied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <CopyIcon className="h-4 w-4 text-gray-600" />
      )}
    </button>
  );
};

const BankCard = ({ account, userName, showBalance = true }: BankCardProps) => {
  return (
    <div className="flex flex-col">
      <Link
        href={`/?id=${account.appwriteItemId}`}
        className="bank-card"
        style={{
          background: 'linear-gradient(90deg, #0179FE 0%, #4893FF 100%)',
          borderRadius: '16px',
          height: '190px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
          overflow: 'hidden',
          color: 'white',
          minWidth: '280px',
        }}
      >
        {/* Lines overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url(/icons/lines.png)', backgroundSize: 'cover' }} />

        <div className="bank-card_content" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <h1 className="text-16 font-semibold text-white">{userName}</h1>
            <p className="font-ibm-plex-serif font-black text-white text-xl">
              {showBalance ? formatAmount(account.currentBalance) : '••••'}
            </p>
          </div>
          <article className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-12 font-semibold text-white">{userName}</h1>
              <h2 className="text-12 font-semibold text-white">●● / ●●</h2>
            </div>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● {account?.mask ?? '0000'}
            </p>
          </article>
        </div>

        <div className="bank-card_icon" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Image src="/icons/Paypass.svg" width={20} height={24} alt="pay" />
          <Image src="/icons/mastercard.svg" width={45} height={32} alt="mastercard" className="ml-5" />
        </div>
      </Link>

      {showBalance && (
        <div className="bank-card_copy-btn">
          <p className="text-14">Share</p>
          <Copy title={account.shareableId} />
        </div>
      )}
    </div>
  );
};

export default BankCard;
