'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useRouter } from 'next/navigation';
import { papersApi } from '../../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BrainCircuit, Search, UploadCloud, Trash2, FileText,
  ArrowRight, GitCompare, LogOut, Loader2, Sparkles,
  BookOpen, ChevronRight, X, AlertCircle, CheckSquare2,
  Square, Clock, MoreHorizontal, Users
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(h);
  }, [searchQuery]);

  const { data: papers = [], isLoading } = useQuery({
    queryKey: ['papers', debouncedQuery],
    queryFn: () => debouncedQuery.trim() ? papersApi.search(debouncedQuery) : papersApi.getList(),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => papersApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      setSelectedPapers((p) => p.filter((pid) => pid !== id));
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setUploadError('Only PDF files are supported.'); return; }
    if (file.size > 20 * 1024 * 1024) { setUploadError('Max file size is 20 MB.'); return; }

    setUploadError('');
    setUploadSuccess('');
    setUploading(true);
    try {
      const result = await papersApi.upload(file);
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      setUploadSuccess(`"${result.title}" uploaded and indexed successfully.`);
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to process PDF paper.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleSelect = (id: string) => setSelectedPapers((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} color="#6366f1" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading your library…</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── SIDEBAR ───────────────────────────── */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '20px 12px', position: 'sticky', top: 0, height: '100vh',
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 8px', marginBottom: 28 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>AuraPaper</span>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button className="nav-item active">
              <BookOpen size={16} />
              <span>Library</span>
            </button>
            <button className="nav-item" onClick={() => router.push('/compare')}>
              <GitCompare size={16} />
              <span>Compare Papers</span>
            </button>
          </nav>

          {/* Stats */}
          <div style={{ margin: '24px 8px 0', padding: '12px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Library Stats</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{papers.length}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Papers</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  {papers.filter((p: any) => p.summary).length}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Summaries</p>
              </div>
            </div>
          </div>
        </div>

        {/* User footer */}
        <div>
          <div className="divider" style={{ marginBottom: 12 }} />
          <div style={{ padding: '8px 8px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
              </div>
            </div>
            <button className="nav-item" onClick={logout} style={{ color: '#fda4af' }}>
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────── */}
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', maxWidth: '100%' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.8px', marginBottom: 4 }}>Research Library</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Upload, analyze, and compare your research papers.</p>
          </div>

          <label style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
            <div className="btn-primary" style={{ height: 40, fontSize: 13, pointerEvents: uploading ? 'none' : 'auto', opacity: uploading ? 0.7 : 1 }}>
              {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <UploadCloud size={14} />}
              {uploading ? 'Processing…' : 'Upload PDF Paper'}
            </div>
            <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>

        {/* Toast alerts */}
        {uploadError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', marginBottom: 16 }}>
            <AlertCircle size={15} color="#f43f5e" />
            <span style={{ fontSize: 13, color: '#fda4af', flex: 1 }}>{uploadError}</span>
            <button onClick={() => setUploadError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e' }}><X size={14} /></button>
          </div>
        )}
        {uploadSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 16 }}>
            <Sparkles size={15} color="#10b981" />
            <span style={{ fontSize: 13, color: '#6ee7b7', flex: 1 }}>{uploadSuccess}</span>
            <button onClick={() => setUploadSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}><X size={14} /></button>
          </div>
        )}

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '0 14px', height: 42, marginBottom: 24,
        }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by title or author name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'inherit' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={13} /></button>
          )}
        </div>

        {/* Paper grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="skeleton" style={{ height: 180, borderRadius: 12 }} />
            ))}
          </div>
        ) : papers.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            border: '1px dashed var(--border)', borderRadius: 16,
            background: 'rgba(13,17,23,0.4)',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileText size={24} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              {searchQuery ? 'No papers match your search' : 'Your library is empty'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.6 }}>
              {searchQuery ? 'Try a different search term.' : 'Upload your first PDF research paper to get started with AI summaries and contextual chat.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {papers.map((paper: any, idx: number) => {
              const isSelected = selectedPapers.includes(paper.id);
              return (
                <div
                  key={paper.id}
                  className="glass-card animate-fade-in-up"
                  style={{
                    borderRadius: 12, padding: 20,
                    border: `1px solid ${isSelected ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)',
                    transition: 'all 0.2s ease',
                    animationDelay: `${idx * 0.04}s`, opacity: 0,
                    display: 'flex', flexDirection: 'column', gap: 14,
                  }}
                >
                  {/* Card top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <button onClick={() => toggleSelect(paper.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 2, marginTop: 1 }}>
                      {isSelected
                        ? <CheckSquare2 size={18} color="#6366f1" />
                        : <Square size={18} color="var(--text-muted)" />}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {paper.summary && <div className="badge badge-emerald" style={{ marginBottom: 8, fontSize: 11 }}>AI Summary Ready</div>}
                      <h3
                        onClick={() => router.push(`/papers/${paper.id}`)}
                        style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.15s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                      >
                        {paper.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => { if (confirm('Delete this paper?')) deleteMutation.mutate(paper.id); }}
                      className="btn-danger"
                      style={{ height: 28, width: 28, padding: 0, borderRadius: 6, flexShrink: 0 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Authors */}
                  {paper.authors?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={12} color="var(--text-muted)" />
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {paper.authors.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Footer meta */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                        <FileText size={11} />{formatSize(paper.fileSize)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                        <Clock size={11} />{formatDate(paper.createdAt)}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/papers/${paper.id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#a5b4fc', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#818cf8')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#a5b4fc')}
                    >
                      Analyze <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── COMPARISON FLOAT BAR ──────────────── */}
      {selectedPapers.length >= 2 && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(99,102,241,0.3)',
          backdropFilter: 'blur(16px)', borderRadius: 14, padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 16, zIndex: 100,
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="badge badge-indigo">{selectedPapers.length}</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>papers selected</span>
          </div>
          <div className="divider" style={{ width: 1, height: 20 }} />
          <button
            onClick={() => router.push(`/compare?ids=${selectedPapers.join(',')}`)}
            className="btn-primary"
            style={{ height: 34, fontSize: 13 }}
          >
            <GitCompare size={14} /> Compare Papers
          </button>
          <button onClick={() => setSelectedPapers([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
