'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { formatAmount } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BankDropdownProps {
  accounts: Account[];
  // Loosely typed so any react-hook-form setValue can be passed regardless of
  // the consuming form's field shape.
  setValue?: (name: any, value: any) => void;
  otherStyles?: string;
}

export const BankDropdown = ({ accounts = [], setValue, otherStyles }: BankDropdownProps) => {
  const [selected, setSelected] = useState(accounts[0]);

  const handleBankChange = (id: string) => {
    const account = accounts.find((acc) => acc.appwriteItemId === id)!;
    setSelected(account);
    if (setValue) {
      setValue('senderBank', id);
    }
  };

  return (
    <Select
      defaultValue={selected?.appwriteItemId}
      onValueChange={(value) => handleBankChange(value)}
    >
      <SelectTrigger className={`flex w-full gap-3 md:w-[300px] ${otherStyles}`}>
        <Image src="/icons/credit-card.svg" width={20} height={20} alt="account" />
        <p className="line-clamp-1 w-full text-left">{selected?.name}</p>
      </SelectTrigger>
      <SelectContent className="w-full bg-white" align="end">
        <SelectGroup>
          <p className="px-3 py-2 text-sm font-medium text-gray-600">Select a bank to display</p>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.appwriteItemId}>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-900">{account.name}</p>
                <p className="text-sm font-medium text-blue-600">
                  {formatAmount(account.currentBalance)}
                </p>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default BankDropdown;
