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
          toast({
            variant: 'success',
            title: 'Account created',
            description: 'Welcome to Horizon!',
          });
          router.push('/');
        } else {
          const reason = newUser?.error || 'Please try again.';
          setError(`Sign up failed: ${reason}`);
          toast({
            variant: 'destructive',
            title: 'Sign up failed',
            description: reason,
          });
        }
      } else {
        const response = await signIn({ email: data.email, password: data.password });
        if (response) {
          toast({
            variant: 'success',
            title: 'Signed in',
            description: 'Welcome back!',
          });
          router.push('/');
        } else {
          setError('Invalid email or password.');
          toast({
            variant: 'destructive',
            title: 'Sign in failed',
            description: 'Invalid email or password.',
          });
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
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="cursor-pointer flex items-center gap-1">
          <Image src="/icons/logo.svg" width={34} height={34} alt="Horizon logo" />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Horizon</h1>
        </Link>
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
            <p className="text-16 font-normal text-gray-600">
              {type === 'sign-in'
                ? 'Please enter your details'
                : 'Please enter your details'}
            </p>
          </h1>
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="text-16 bg-bank-gradient font-semibold text-white w-full py-3 px-4 h-auto"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" /> Loading...
              </>
            ) : type === 'sign-in' ? (
              'Sign In'
            ) : (
              'Sign Up'
            )}
          </Button>
        </div>
        <footer className="flex justify-center gap-1">
          <p className="text-14 font-normal text-gray-600">
            {type === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <Link
            href={type === 'sign-in' ? '/sign-up' : '/sign-in'}
            className="form-link"
          >
            {type === 'sign-in' ? 'Sign up' : 'Sign in'}
          </Link>
        </footer>
      </form>
      </Form>
    </section>
  );
};

export default AuthForm;
