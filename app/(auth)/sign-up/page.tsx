import AuthForm from '@/components/AuthForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Create Account — Horizon' };

const SignUp = () => <AuthForm type="sign-up" />;
export default SignUp;
