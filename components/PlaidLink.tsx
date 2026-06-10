'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PlaidLinkOptions, usePlaidLink } from 'react-plaid-link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createLinkToken, exchangePublicToken } from '@/lib/actions/bank.actions';

const PlaidLink = ({ user, variant }: { user: User; variant?: 'primary' | 'ghost' | 'default' }) => {
  const router = useRouter();
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const getLinkToken = async () => {
      const data = await createLinkToken(user);
      setToken(data?.linkToken ?? '');
    };
    getLinkToken();
  }, [user]);

  const onSuccess = useCallback(
    async (public_token: string) => {
      await exchangePublicToken({ publicToken: public_token, user });
      router.push('/');
    },
    [user, router]
  );

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  if (variant === 'primary') {
    return (
      <button
        onClick={() => open()}
        disabled={!ready}
        aria-label="Connect a bank account with Plaid"
        className="bg-bank-gradient rounded-lg border-none px-6 py-3 font-semibold text-white enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        Connect Bank
      </button>
    );
  }

  if (variant === 'ghost') {
    return (
      <button
        onClick={() => open()}
        className="plaidlink-ghost flex cursor-pointer items-center justify-center gap-3 rounded-lg px-3 py-7 hover:bg-white lg:justify-start"
      >
        <Image src="/icons/connect-bank.svg" alt="connect bank" width={24} height={24} />
        <p className="hidden text-[16px] font-semibold text-black-2 xl:block">Connect bank</p>
      </button>
    );
  }

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="plaidlink-default flex !justify-start cursor-pointer gap-3 rounded-lg !bg-transparent flex-row"
    >
      <Image src="/icons/connect-bank.svg" alt="connect bank" width={24} height={24} />
      <p className="text-[16px] font-semibold text-black-2 max-xl:hidden">Connect bank</p>
    </button>
  );
};

export default PlaidLink;
