'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, FieldError } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, loading } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (value.length > 80) {
      setFieldErrors(prev => ({ ...prev, name: 'Name cannot exceed 80 characters' }));
    } else {
      setFieldErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value.length > 128) {
      setFieldErrors(prev => ({ ...prev, password: 'Password cannot exceed 128 characters' }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value.length > 128) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Password cannot exceed 128 characters' }));
    } else {
      setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend validations
    if (!name.trim()) {
      setError('Name is required');
      showToast('Name is required', 'error');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      showToast('Name must be at least 2 characters', 'error');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      showToast('Email is required', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      showToast('Password is required', 'error');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    if (password.length > 128) {
      setError('Password is too long');
      showToast('Password is too long', 'error');
      return;
    }

    // Password complexity validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpperCase) {
      setError('Password must contain at least 1 uppercase letter');
      showToast('Password must contain at least 1 uppercase letter', 'error');
      return;
    }

    if (!hasLowerCase) {
      setError('Password must contain at least 1 lowercase letter');
      showToast('Password must contain at least 1 lowercase letter', 'error');
      return;
    }

    if (!hasNumber) {
      setError('Password must contain at least 1 number');
      showToast('Password must contain at least 1 number', 'error');
      return;
    }

    if (!hasSpecialChar) {
      setError('Password must contain at least 1 special character');
      showToast('Password must contain at least 1 special character', 'error');
      return;
    }

    if (!confirmPassword.trim()) {
      setError('Please confirm your password');
      showToast('Please confirm your password', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      showToast('Passwords do not match', 'error');
      return;
    }

    setFormLoading(true);

    try {
      const user = await register(name, email, password);
      router.push('/dashboard');
      // Show toast after navigation
      setTimeout(() => {
        showToast(`Welcome to Qrivo, ${user.name}!`, 'success');
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 page-enter dark:bg-slate-950">
      <div className="absolute top-4 left-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-50">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>
      {loading || user ? (
        <div className="w-full max-w-md flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400" />
        </div>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create your Qrivo account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  required
                  maxLength={80}
                  placeholder="John Doe"
                />
                {fieldErrors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  maxLength={128}
                  placeholder="••••••••"
                />
                {fieldErrors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  maxLength={128}
                  placeholder="••••••••"
                />
                {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.confirmPassword}</p>}
              </div>
              {error && <FieldError>{error}</FieldError>}
              <Button type="submit" className="w-full" size="md" disabled={formLoading}>
                {formLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
