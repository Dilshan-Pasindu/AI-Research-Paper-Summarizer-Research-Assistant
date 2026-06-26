'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Loader2, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFields) => {
    setError('');
    setSubmitting(true);
    try {
      await login(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Left decorative panel — hidden on mobile */}
      <div style={{
        flex: 1, display: 'none', background: 'linear-gradient(135deg, rgba(13,17,23,0.9) 0%, rgba(22,27,34,0.95) 100%)',
        borderRight: '1px solid var(--border)', padding: '48px', flexDirection: 'column', justifyContent: 'space-between',
      }} className="lg-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>AuraPaper</span>
        </div>
        <div>
          <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 16 }}>
            "Accelerated my literature review<br />from weeks to hours."
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>— Research Lead, ML Lab</p>
        </div>
      </div>

      {/* Right: form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: 400 }}>

          {/* Brand mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>AuraPaper</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.8px', marginBottom: 8 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Sign in to continue to your research library
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
              borderRadius: 10, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
              marginBottom: 20,
            }}>
              <AlertCircle size={16} color="#f43f5e" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#fda4af', lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email field */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="email"
                  type="email"
                  placeholder="name@university.edu"
                  {...register('email')}
                  className="input-field"
                  style={{ paddingLeft: 38 }}
                />
              </div>
              {errors.email && <p style={{ fontSize: 12, color: '#f43f5e', marginTop: 5, fontWeight: 500 }}>{errors.email.message}</p>}
            </div>

            {/* Password field */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className="input-field"
                  style={{ paddingLeft: 38 }}
                />
              </div>
              {errors.password && <p style={{ fontSize: 12, color: '#f43f5e', marginTop: 5, fontWeight: 500 }}>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ height: 44, width: '100%', fontSize: 15, marginTop: 8 }}
            >
              {submitting ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>New to AuraPaper?</span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          <Link href="/register" className="btn-secondary" style={{ width: '100%', height: 44, fontSize: 14 }}>
            Create free account
          </Link>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
