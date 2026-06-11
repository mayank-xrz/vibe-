import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '404 — Horizon' };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-25 px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-indigo-50">
        <span className="text-4xl font-bold text-indigo-600">4</span>
        <span className="text-4xl font-bold text-bank-gradient">0</span>
        <span className="text-4xl font-bold text-indigo-600">4</span>
      </div>
      <h1 className="text-30 font-bold text-black-1">Page not found</h1>
      <p className="max-w-sm text-16 text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-bank-gradient rounded-lg px-6 py-3 text-14 font-semibold text-white transition-opacity hover:opacity-90"
      >
        Back to Dashboard
      </Link>
    </main>
  );
}
