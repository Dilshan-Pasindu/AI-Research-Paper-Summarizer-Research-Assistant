'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Loader2, Mail, Lock, User, AlertCircle, ArrowRight, Check } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFields = z.infer<typeof registerSchema>;

const perks = [
  'Upload unlimited PDF research papers',
  'AI summaries powered by Gemini 1.5',
  'RAG-based contextual chat with papers',
  'Multi-paper comparison tables',
];

export default function RegisterPage() {
  const { register: signup } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterFields) => {
    setError('');
    setSubmitting(true);
    try {
      await signup(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Left panel with perks */}
      <div style={{
        flex: 1, display: 'none', background: 'linear-gradient(135deg, rgba(13,17,23,0.9) 0%, rgba(22,27,34,0.95) 100%)',
        borderRight: '1px solid var(--border)', padding: '48px', flexDirection: 'column', justifyContent: 'center', gap: 40,
      }} className="lg-panel">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>DP Reseach Hub</span>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.8px', lineHeight: 1.3, marginBottom: 12 }}>
            Your AI research<br />companion
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 36 }}>
            Analyze research papers at scale. Stop reading — start understanding.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {perks.map((perk) => (
              <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} color="#10b981" />
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>DP Research Hub</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.8px', marginBottom: 8 }}>
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Free forever. No credit card required.
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
              borderRadius: 10, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', marginBottom: 20,
            }}>
              <AlertCircle size={16} color="#f43f5e" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#fda4af', lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                <input id="name" type="text" placeholder="Dr. Jane Smith" {...register('name')} className="input-field" style={{ paddingLeft: 38 }} />
              </div>
              {errors.name && <p style={{ fontSize: 12, color: '#f43f5e', marginTop: 5, fontWeight: 500 }}>{errors.name.message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                <input id="email" type="email" placeholder="name@university.edu" {...register('email')} className="input-field" style={{ paddingLeft: 38 }} />
              </div>
              {errors.email && <p style={{ fontSize: 12, color: '#f43f5e', marginTop: 5, fontWeight: 500 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                <input id="password" type="password" placeholder="Min. 6 characters" {...register('password')} className="input-field" style={{ paddingLeft: 38 }} />
              </div>
              {errors.password && <p style={{ fontSize: 12, color: '#f43f5e', marginTop: 5, fontWeight: 500 }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary" style={{ height: 44, width: '100%', fontSize: 15, marginTop: 8 }}>
              {submitting ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</>
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Already have an account?</span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          <Link href="/login" className="btn-secondary" style={{ width: '100%', height: 44, fontSize: 14 }}>
            Sign in instead
          </Link>

          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .lg-panel { display: flex !important; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
