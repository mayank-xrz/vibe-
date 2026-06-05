'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import Footer from './Footer';
import { useState } from 'react';

const MobileNav = ({ user }: { user: User }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <section className="w-full max-w-[264px]">
      <div
        className="flex cursor-pointer gap-2 items-center"
        onClick={() => setOpen(true)}
      >
        <Image src="/icons/hamburger.svg" width={30} height={30} alt="menu" className="cursor-pointer" />
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex h-full w-[264px] flex-col justify-between overflow-y-auto bg-white px-6 py-8">
            <nav className="flex flex-col gap-4">
              <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2" onClick={() => setOpen(false)}>
                <Image src="/icons/logo.svg" width={34} height={34} alt="logo" />
                <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Horizon</h1>
              </Link>
              {sidebarLinks.map((item) => {
                const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
                return (
                  <Link
                    href={item.route}
                    key={item.label}
                    className={cn('mobilenav-sheet_close w-full', { 'bg-bank-gradient rounded-lg': isActive })}
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src={item.imgURL}
                      alt={item.label}
                      width={20}
                      height={20}
                      className={cn({ 'brightness-[3] invert-0': isActive })}
                    />
                    <p className={cn('text-16 font-semibold text-black-2', { 'text-white': isActive })}>
                      {item.label}
                    </p>
                  </Link>
                );
              })}
            </nav>
            <Footer user={user} type="mobile" />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}
    </section>
  );
};

export default MobileNav;
