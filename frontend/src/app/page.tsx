'use client';

import Link from 'next/link';
import { BookOpen, MessageSquare, GitCompare, ArrowRight, BrainCircuit, Sparkles, Shield, Zap, FileText, Users } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
    title: 'Intelligent PDF Parsing',
    desc: 'PyMuPDF extracts titles, authors, DOI, and metadata. Chunked with LangChain for high-precision retrieval.',
  },
  {
    icon: MessageSquare,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    title: 'RAG-Powered Chat',
    desc: 'Ask questions about any paper. Gemini retrieves ChromaDB chunks and returns precise, context-grounded answers.',
  },
  {
    icon: Sparkles,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    title: 'Structured Summaries',
    desc: 'Auto-generate sections for methodology, results, datasets, limitations, and future work in seconds.',
  },
  {
    icon: GitCompare,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    title: 'Multi-Paper Comparison',
    desc: 'Select up to 10 papers and build a side-by-side comparison grid highlighting key research metrics.',
  },
  {
    icon: FileText,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    title: 'Citation Extraction',
    desc: 'Automatically parse and catalogue all references with author metadata and publication years.',
  },
  {
    icon: Shield,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.08)',
    title: 'Enterprise Security',
    desc: 'JWT access tokens, bcrypt passwords, Helmet headers, rate limiting, and role-based access control.',
  },
];

const stats = [
  { label: 'Supported Formats', value: 'PDF' },
  { label: 'Max File Size', value: '20 MB' },
  { label: 'RAG Context Window', value: '35 K+' },
  { label: 'LLM Provider', value: 'Gemini' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)',
        }} />
      </div>

      {/* ── NAVBAR ─────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(3,7,18,0.85)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BrainCircuit size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              AuraPaper
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" className="btn-ghost">Sign In</Link>
            <Link href="/register" className="btn-primary" style={{ height: 36, fontSize: 13 }}>
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ───────────────────────────────── */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
          <div className="animate-fade-in-up">
            <div className="badge badge-indigo" style={{ marginBottom: 24, display: 'inline-flex' }}>
              <Zap size={11} />
              Powered by Google Gemini 1.5 Flash &nbsp;·&nbsp; LangChain RAG
            </div>
          </div>

          <h1 className="animate-fade-in-up delay-100 gradient-text" style={{
            fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24,
          }}>
            Research papers,<br />understood instantly.
          </h1>

          <p className="animate-fade-in-up delay-200" style={{
            fontSize: 18, color: 'var(--text-secondary)', maxWidth: 580,
            margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            Upload PDFs, extract structured insights, ask deep questions, and compare academic work side-by-side — all powered by AI.
          </p>

          <div className="animate-fade-in-up delay-300" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ height: 48, fontSize: 15, padding: '0 28px' }}>
              Start Analyzing Papers
              <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-secondary" style={{ height: 48, fontSize: 15, padding: '0 28px' }}>
              View Demo Library
            </Link>
          </div>

          {/* Stats row */}
          <div className="animate-fade-in-up delay-400" style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', marginTop: 64 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURE GRID ───────────────────────── */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 96px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 12 }}>
              Everything a researcher needs
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
              From upload to insights in under 60 seconds.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass-card glass-card-hover animate-fade-in-up"
                style={{ borderRadius: 14, padding: 24, animationDelay: `${i * 0.07}s`, opacity: 0 }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                  border: `1px solid ${f.color}22`,
                }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ─────────────────────────── */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 96px' }}>
          <div style={{
            borderRadius: 20, padding: '56px 40px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 60%)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 12 }}>
                Ready to accelerate your research?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32 }}>
                Join researchers who use AuraPaper to review literature faster.
              </p>
              <Link href="/register" className="btn-primary" style={{ height: 48, fontSize: 15, padding: '0 32px' }}>
                Create Free Account
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} AuraPaper · Built with Next.js 15, NestJS, FastAPI &amp; Google Gemini
        </p>
      </footer>
    </div>
  );
}
