import AuthForm from '@/components/AuthForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign In — Horizon' };

const SignIn = () => <AuthForm type="sign-in" />;
export default SignIn;
