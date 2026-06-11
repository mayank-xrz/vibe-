'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import Footer from './Footer';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const MobileNav = ({ user }: { user: User }) => {
  const pathname = usePathname();

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger aria-label="Open navigation menu">
          <Image
            src="/icons/hamburger.svg"
            width={30}
            height={30}
            alt=""
            aria-hidden
            className="cursor-pointer"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-white">
          <div className="flex h-full flex-col justify-between overflow-y-auto">
            <nav className="flex flex-col gap-4">
              <SheetClose asChild>
                <Link href="/" className="mb-12 flex cursor-pointer items-center gap-2">
                  <Image src="/icons/logo.svg" width={34} height={34} alt="logo" />
                  <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Horizon</h1>
                </Link>
              </SheetClose>
              {sidebarLinks.map((item) => {
                const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
                return (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.route}
                      className={cn('mobilenav-sheet_close w-full', {
                        'bg-bank-gradient rounded-lg': isActive,
                      })}
                    >
                      <Image
                        src={item.imgURL}
                        alt={item.label}
                        width={20}
                        height={20}
                        className={cn({ 'brightness-[3] invert-0': isActive })}
                      />
                      <p
                        className={cn('text-16 font-semibold text-black-2', {
                          'text-white': isActive,
                        })}
                      >
                        {item.label}
                      </p>
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
            <Footer user={user} type="mobile" />
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
