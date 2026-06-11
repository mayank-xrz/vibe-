'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/actions/user.actions';
import { authFormSchema } from '@/lib/utils';
import CustomInput from './CustomInput';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthForm = ({ type }: { type: string }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const formSchema = authFormSchema(type);
  type FormValues = z.infer<ReturnType<typeof authFormSchema>>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError('');
    try {
      if (type === 'sign-up') {
        const userData: SignUpParams = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          address1: data.address1 || '',
          city: data.city || '',
          state: data.state || '',
          postalCode: data.postalCode || '',
          dateOfBirth: data.dateOfBirth || '',
          ssn: data.ssn || '',
          email: data.email,
          password: data.password,
        };
        const newUser = await signUp(userData);
        if (newUser && !newUser.error) {
          toast({ variant: 'success', title: 'Account created', description: 'Welcome to Horizon!' });
          router.push('/');
        } else {
          const raw = (newUser?.error ?? '') as string;
          const reason = raw.toLowerCase().includes('user_already_exists') || raw.toLowerCase().includes('already registered')
            ? 'That email is already registered. Try signing in instead.'
            : raw.toLowerCase().includes('dwolla') || raw.toLowerCase().includes('customer')
            ? 'Could not create your payment profile. Check your name, address, and date of birth (YYYY-MM-DD).'
            : raw.toLowerCase().includes('document') || raw.toLowerCase().includes('attribute')
            ? 'Account setup incomplete — contact support if this persists.'
            : raw || 'Sign up failed. Please try again.';
          setError(reason);
          toast({ variant: 'destructive', title: 'Sign up failed', description: reason });
        }
      } else {
        const response = await signIn({ email: data.email, password: data.password });
        if (response && !response.error) {
          toast({ variant: 'success', title: 'Welcome back!', description: 'Signed in successfully.' });
          router.push('/');
        } else {
          const raw = (response?.error ?? '') as string;
          const reason = raw.toLowerCase().includes('invalid') || raw.toLowerCase().includes('credentials') || raw.toLowerCase().includes('incorrect')
            ? 'Incorrect email or password. Please try again.'
            : raw.toLowerCase().includes('not configured') || raw.toLowerCase().includes('missing')
            ? 'Service is temporarily unavailable. Please try again later.'
            : raw || 'Sign in failed. Please try again.';
          setError(reason);
          toast({ variant: 'destructive', title: 'Sign in failed', description: reason });
        }
      }
    } catch (err) {
      // Server Actions log the real cause server-side (Netlify function logs).
      // Surface whatever reached the client too, to aid local debugging.
      console.error('Auth submit error:', err);
      setError('An error occurred. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icons/logo.svg" width={32} height={32} alt="Horizon logo" />
          <span className="font-ibm-plex-serif text-22 font-bold text-black-1 tracking-tight">Horizon</span>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-22 font-bold text-gray-900 tracking-tight">
            {type === 'sign-in' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-14 text-gray-500">
            {type === 'sign-in'
              ? 'Sign in to your Horizon account'
              : 'Start banking smarter today'}
          </p>
        </div>
      </header>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {type === 'sign-up' && (
          <>
            <div className="flex gap-4">
              <CustomInput
                control={form.control}
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
              />
              <CustomInput
                control={form.control}
                name="lastName"
                label="Last Name"
                placeholder="Enter your last name"
              />
            </div>
            <CustomInput
              control={form.control}
              name="address1"
              label="Address"
              placeholder="Enter your specific address"
            />
            <CustomInput
              control={form.control}
              name="city"
              label="City"
              placeholder="Enter your city"
            />
            <div className="flex gap-4">
              <CustomInput
                control={form.control}
                name="state"
                label="State"
                placeholder="Example: NY"
              />
              <CustomInput
                control={form.control}
                name="postalCode"
                label="Postal Code"
                placeholder="Example: 11101"
              />
            </div>
            <div className="flex gap-4">
              <CustomInput
                control={form.control}
                name="dateOfBirth"
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
              />
              <CustomInput
                control={form.control}
                name="ssn"
                label="SSN"
                placeholder="Example: 1234"
              />
            </div>
          </>
        )}
        <CustomInput
          control={form.control}
          name="email"
          label="Email"
          placeholder="Enter your email"
        />
        <CustomInput
          control={form.control}
          name="password"
          label="Password"
          placeholder="Enter your password"
        />
        {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-bank-gradient w-full rounded-lg py-2.5 px-4 text-15 font-semibold text-white h-auto transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {type === 'sign-in' ? 'Signing in…' : 'Creating account…'}
              </span>
            ) : type === 'sign-in' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </Button>
        </div>
        <footer className="flex justify-center gap-1.5 text-14">
          <span className="text-gray-500">
            {type === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="form-link">
            {type === 'sign-in' ? 'Sign up free' : 'Sign in'}
          </Link>
        </footer>
      </form>
      </Form>
    </section>
  );
};

export default AuthForm;
