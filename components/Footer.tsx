'use client';

import { logoutAccount } from '@/lib/actions/user.actions';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

const Footer = ({ user, type = 'desktop' }: { user: User; type?: 'mobile' | 'desktop' }) => {
  const router = useRouter();

  const handleLogOut = async () => {
    await logoutAccount();
    router.push('/sign-in');
  };

  return (
    <footer className="footer">
      <div className={type === 'mobile' ? 'footer_name-mobile' : 'footer_name'}>
        <p className="text-xl font-bold text-gray-700">
          {user?.firstName?.[0] ?? 'U'}
        </p>
      </div>
      <div className={type === 'mobile' ? 'footer_email-mobile' : 'footer_email'}>
        <h1 className="text-14 truncate text-gray-700 font-semibold">
          {user?.firstName ?? 'User'}
        </h1>
        <p className="text-14 truncate font-normal text-gray-600">{user?.email}</p>
      </div>
      <button
        type="button"
        className="footer_image flex-center"
        onClick={handleLogOut}
        aria-label="Log out"
      >
        <LogOut className="h-5 w-5 text-gray-600" />
      </button>
    </footer>
  );
};

export default Footer;
