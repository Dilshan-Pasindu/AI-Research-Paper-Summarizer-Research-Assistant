'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { papersApi } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import {
  BrainCircuit, ArrowLeft, GitCompare, Loader2,
  FileText, CheckSquare2, Square, AlertCircle, Sparkles
} from 'lucide-react';

const CRITERIA = [
  { key: 'researchProblem', label: 'Research Problem', color: '#6366f1' },
  { key: 'methodology', label: 'Methodology', color: '#8b5cf6' },
  { key: 'dataset', label: 'Dataset Used', color: '#06b6d4' },
  { key: 'results', label: 'Key Results', color: '#10b981' },
  { key: 'strengths', label: 'Strengths', color: '#10b981' },
  { key: 'weaknesses', label: 'Weaknesses', color: '#f43f5e' },
];

export default function ComparePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids') || '';
  const initialIds = idsParam ? idsParam.split(',').filter(Boolean) : [];

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  const { data: library = [], isLoading: libraryLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: () => papersApi.getList(),
    enabled: !!user,
  });

  const { data: comparisonResult, isLoading: compareLoading, error } = useQuery({
    queryKey: ['comparison', initialIds.join(',')],
    queryFn: () => papersApi.compare(initialIds),
    enabled: !!user && initialIds.length >= 2,
    retry: false,
  });

  // The actual comparison rows — either from cached `comparisonData` JSON or direct array
  const rows: any[] = React.useMemo(() => {
    if (!comparisonResult) return [];
    if (Array.isArray(comparisonResult)) return comparisonResult;
    if (Array.isArray(comparisonResult.comparisonData)) return comparisonResult.comparisonData;
    return [];
  }, [comparisonResult]);

  const toggleSelect = (id: string) =>
    setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── HEADER ───────────────────────────── */}
      <header style={{
        height: 56, borderBottom: '1px solid var(--border)',
        background: 'rgba(3,7,18,0.95)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <button onClick={() => router.push('/dashboard')} className="btn-ghost" style={{ padding: '0 8px', height: 32 }}>
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div style={{ height: 20, width: 1, background: 'var(--border)' }} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Compare Research Papers</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Side-by-side AI-generated research matrix</p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>AuraPaper</span>
        </div>
      </header>

      <div style={{ flex: 1, padding: '32px 36px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>

        {/* ── SELECTION PHASE (no IDs yet) ─────── */}
        {initialIds.length < 2 ? (
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <GitCompare size={26} color="#6366f1" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.6px', marginBottom: 10 }}>Select Papers to Compare</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Choose at least 2 papers with AI summaries generated. The AI will produce a detailed comparison matrix.
              </p>
            </div>

            {libraryLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3].map((n) => <div key={n} className="skeleton" style={{ height: 62, borderRadius: 10 }} />)}
              </div>
            ) : library.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, border: '1px dashed var(--border)', borderRadius: 14 }}>
                <FileText size={28} color="var(--text-muted)" style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Your library is empty.</p>
                <button onClick={() => router.push('/dashboard')} className="btn-secondary">Go to Dashboard</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {library.map((paper: any) => {
                    const hasSummary = !!paper.summary;
                    const checked = selectedIds.includes(paper.id);
                    return (
                      <div
                        key={paper.id}
                        onClick={() => hasSummary && toggleSelect(paper.id)}
                        style={{
                          padding: '12px 14px', borderRadius: 10,
                          border: `1px solid ${checked ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                          background: checked ? 'rgba(99,102,241,0.06)' : 'var(--bg-secondary)',
                          display: 'flex', alignItems: 'center', gap: 12,
                          cursor: hasSummary ? 'pointer' : 'not-allowed',
                          opacity: hasSummary ? 1 : 0.45,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {checked
                          ? <CheckSquare2 size={18} color="#6366f1" style={{ flexShrink: 0 }} />
                          : <Square size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{paper.title}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{paper.authors?.join(', ') || 'Unknown Authors'}</p>
                        </div>
                        {hasSummary
                          ? <div className="badge badge-emerald" style={{ fontSize: 11, flexShrink: 0 }}><Sparkles size={10} /> Ready</div>
                          : <div className="badge badge-amber" style={{ fontSize: 11, flexShrink: 0 }}>No Summary</div>}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => router.push(`/compare?ids=${selectedIds.join(',')}`)}
                  disabled={selectedIds.length < 2}
                  className="btn-primary"
                  style={{ width: '100%', height: 46, fontSize: 15 }}
                >
                  <GitCompare size={16} />
                  Generate Comparison ({selectedIds.length} selected)
                </button>
                {selectedIds.length < 2 && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                    Select at least 2 papers to continue
                  </p>
                )}
              </>
            )}
          </div>

        ) : compareLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'spin 3s linear infinite' }}>
              <GitCompare size={28} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Building Comparison Matrix</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto', lineHeight: 1.65 }}>
              Gemini is analyzing each paper's methodology, results, strengths and weaknesses — this may take 15–30 seconds.
            </p>
          </div>

        ) : error ? (
          <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
            <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', marginBottom: 20 }}>
              <AlertCircle size={32} color="#f43f5e" style={{ marginBottom: 12 }} />
              <p style={{ fontWeight: 700, color: '#fda4af', marginBottom: 8 }}>Comparison failed</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Make sure all selected papers have AI summaries generated before comparing.
              </p>
            </div>
            <button onClick={() => router.push('/compare')} className="btn-secondary">← Reset Selection</button>
          </div>

        ) : rows.length > 0 ? (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>Comparison Results</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{rows.length} papers compared across {CRITERIA.length} criteria</p>
              </div>
              <button onClick={() => router.push('/compare')} className="btn-secondary" style={{ fontSize: 13 }}>
                ← New Comparison
              </button>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', width: 140, background: 'rgba(3,7,18,0.5)' }}>
                      Criteria
                    </th>
                    {rows.map((col: any) => (
                      <th key={col.id} style={{ padding: '14px 16px', textAlign: 'left', background: 'rgba(3,7,18,0.5)' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>{col.title}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CRITERIA.map((criterion, idx) => (
                    <tr key={criterion.key} style={{ borderBottom: idx < CRITERIA.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '16px', verticalAlign: 'top', background: 'rgba(3,7,18,0.25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 3, height: 16, borderRadius: 2, background: criterion.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{criterion.label}</span>
                        </div>
                      </td>
                      {rows.map((col: any) => (
                        <td key={col.id} style={{ padding: '16px', verticalAlign: 'top' }}>
                          <p style={{
                            fontSize: 13, lineHeight: 1.7,
                            color: criterion.key === 'strengths' ? '#6ee7b7' : criterion.key === 'weaknesses' ? '#fda4af' : 'var(--text-primary)',
                          }}>
                            {col[criterion.key] || '—'}
                          </p>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
