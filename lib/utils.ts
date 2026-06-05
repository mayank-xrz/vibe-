import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';
import { transactionCategoryStyles } from '@/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAmount(amount: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export const parseStringify = (value: unknown) =>
  JSON.parse(JSON.stringify(value));

export const removeSpecialCharacters = (value: string) =>
  value.replace(/[^\w\s]/gi, '');

export function getCategoryStyles(category: string) {
  const styles =
    transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] ||
    transactionCategoryStyles.default;
  return styles;
}

export function countTransactionCategories(
  transactions: Array<{ category: string }>
): Array<{ name: string; count: number; totalCount: number }> {
  const categoryCounts: Record<string, number> = {};
  let totalCount = 0;

  transactions.forEach((t) => {
    const cat = t.category || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    totalCount++;
  });

  return Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
    totalCount,
  }));
}

// Both sign-in and sign-up share the same schema shape; sign-up fields are
// required when type==='sign-up' and optional otherwise, keeping the inferred
// type consistent across both modes so callers don't need union narrowing.
export function authFormSchema(type: string) {
  return z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
    lastName: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
    address1: type === 'sign-up' ? z.string().max(50) : z.string().optional(),
    city: type === 'sign-up' ? z.string().max(100) : z.string().optional(),
    state: type === 'sign-up' ? z.string().min(2).max(2) : z.string().optional(),
    postalCode: type === 'sign-up' ? z.string().min(3).max(6) : z.string().optional(),
    dateOfBirth: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
    ssn: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
  });
}

export function encryptId(id: string): string {
  return Buffer.from(id).toString('base64');
}

export function decryptId(id: string): string {
  return Buffer.from(id, 'base64').toString('ascii');
}

export function extractCustomerIdFromUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}
