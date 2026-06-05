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
    dateOfBirth:
      type === 'sign-up'
        ? z
            .string()
            .regex(
              /^(\d{4}-\d{2}-\d{2}|\d{8}|\d{2}[\/-]\d{2}[\/-]\d{4})$/,
              'Use YYYY-MM-DD (e.g. 2000-12-28)'
            )
        : z.string().optional(),
    // Dwolla sandbox accepts the last 4 digits of an SSN.
    ssn:
      type === 'sign-up'
        ? z.string().regex(/^\d{4}$/, 'Enter the last 4 digits of your SSN')
        : z.string().optional(),
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

/**
 * Normalize a date-of-birth string into Dwolla's required `YYYY-MM-DD` format.
 * Accepts:
 *   - `YYYY-MM-DD` (already correct)
 *   - 8 digits as `DDMMYYYY` (e.g. `28122000` -> `2000-12-28`)
 *   - common separators `DD/MM/YYYY` or `DD-MM-YYYY`
 * Throws a descriptive error if the value can't be parsed or isn't a real date.
 */
export function formatDateOfBirth(raw: string): string {
  const value = (raw || '').trim();

  let year: string, month: string, day: string;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    [year, month, day] = value.split('-');
  } else {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 8) {
      throw new Error(
        `Invalid dateOfBirth "${raw}". Expected YYYY-MM-DD (or DDMMYYYY).`
      );
    }
    // Interpret 8 bare digits as DDMMYYYY (matches the form's example input).
    day = digits.slice(0, 2);
    month = digits.slice(2, 4);
    year = digits.slice(4, 8);
  }

  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const isReal =
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d;

  if (!isReal || m < 1 || m > 12 || d < 1 || d > 31) {
    throw new Error(
      `Invalid dateOfBirth "${raw}" — not a real calendar date (parsed as ${year}-${month}-${day}).`
    );
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Throw a single descriptive error naming every missing required env var.
 * Called at the start of the signUp flow so misconfiguration surfaces clearly
 * in the Netlify function logs instead of a vague downstream failure.
 */
export function assertRequiredEnv(names: string[]): void {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        `These must be set in the Netlify dashboard (Site settings → ` +
        `Environment variables), not just in local .env.local.`
    );
  }
}
