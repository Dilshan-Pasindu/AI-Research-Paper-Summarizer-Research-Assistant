'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { papersApi, summaryApi, citationsApi, chatApi } from '../../../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BrainCircuit, ArrowLeft, Send, Sparkles, Loader2,
  BookOpen, MessageSquare, Clipboard, FileText,
  Users, ExternalLink, Bot, User as UserIcon, Zap
} from 'lucide-react';

export default function PaperDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const paperId = params.id as string;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'summary' | 'citations' | 'pdf'>('summary');
  const [question, setQuestion] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  const { data: paper, isLoading: paperLoading } = useQuery({
    queryKey: ['paper', paperId],
    queryFn: () => papersApi.getDetails(paperId),
    enabled: !!paperId && !!user,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['summary', paperId],
    queryFn: () => summaryApi.get(paperId),
    enabled: !!paperId && !!user,
    retry: false,
  });

  const { data: citations = [], isLoading: citationsLoading } = useQuery({
    queryKey: ['citations', paperId],
    queryFn: () => citationsApi.getList(paperId),
    enabled: !!paperId && !!user && activeTab === 'citations',
  });

  const { data: chatHistory = [] } = useQuery({
    queryKey: ['chat', paperId],
    queryFn: () => chatApi.getHistory(paperId),
    enabled: !!paperId && !!user,
  });

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const generateSummaryMutation = useMutation({
    mutationFn: () => summaryApi.generate(paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary', paperId] });
      queryClient.invalidateQueries({ queryKey: ['paper', paperId] });
    },
  });

  const askMutation = useMutation({
    mutationFn: (q: string) => chatApi.askQuestion(paperId, q),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', paperId] });
      setQuestion('');
    },
  });

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || askMutation.isPending) return;
    askMutation.mutate(question);
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'citations', label: 'Citations', icon: Clipboard },
    { id: 'pdf', label: 'PDF Viewer', icon: FileText },
  ] as const;

  const summaryFields = [
    { key: 'executiveSummary', label: 'Executive Summary', full: true },
    { key: 'problemStatement', label: 'Research Problem', full: false },
    { key: 'methodology', label: 'Methodology', full: false },
    { key: 'datasetUsed', label: 'Dataset Used', full: false },
    { key: 'results', label: 'Key Results', full: false },
    { key: 'limitations', label: 'Limitations', full: false },
    { key: 'futureWork', label: 'Future Work', full: false },
    { key: 'conclusion', label: 'Conclusion', full: true },
  ];

  if (loading || paperLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!paper) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: '#fda4af', fontWeight: 600 }}>Paper not found or unauthorized.</p>
      <button onClick={() => router.push('/dashboard')} className="btn-secondary">← Back to Dashboard</button>
    </div>
  );

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const pdfUrl = paper.fileUrl ? `${backendUrl}${paper.fileUrl}` : '';

  return (
    <div style={{ height: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── HEADER ──────────────────────────────── */}
      <header style={{
        height: 56, borderBottom: '1px solid var(--border)',
        background: 'rgba(3,7,18,0.95)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', flexShrink: 0,
      }}>
        <button onClick={() => router.push('/dashboard')} className="btn-ghost" style={{ padding: '0 8px', height: 32 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ height: 20, width: 1, background: 'var(--border)' }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {paper.title}
          </h1>
          {paper.authors?.length > 0 && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {paper.authors.join(', ')}
            </p>
          )}
        </div>

        {paper.doi && (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="badge badge-indigo"
            style={{ textDecoration: 'none', gap: 4 }}
          >
            DOI <ExternalLink size={10} />
          </a>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>DP Research Hub</span>
        </div>
      </header>

      {/* ── SPLIT WORKSPACE ─────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT: Tabs + Content */}
        <div style={{ flex: 1, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Tab bar */}
          <div style={{ borderBottom: '1px solid var(--border)', padding: '8px 12px', display: 'flex', gap: 4, background: 'var(--bg-secondary)', flexShrink: 0 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

            {/* ── SUMMARY TAB ── */}
            {activeTab === 'summary' && (
              <div className="animate-fade-in">
                {!summary && !summaryLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 16,
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                      border: '1px solid rgba(99,102,241,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                    }}>
                      <Sparkles size={28} color="#6366f1" />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Generate AI Summary</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.65 }}>
                      Let Gemini extract structured sections — methodology, results, limitations and more.
                    </p>
                    <button
                      onClick={() => generateSummaryMutation.mutate()}
                      disabled={generateSummaryMutation.isPending}
                      className="btn-primary"
                      style={{ height: 44, fontSize: 14, padding: '0 28px' }}
                    >
                      {generateSummaryMutation.isPending ? (
                        <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                      ) : (
                        <><Zap size={15} /> Generate Summary</>
                      )}
                    </button>
                  </div>
                ) : summaryLoading || generateSummaryMutation.isPending ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[120, 80, 200, 160].map((h, i) => (
                      <div key={i}>
                        <div className="skeleton" style={{ height: 14, width: '20%', borderRadius: 4, marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: h, borderRadius: 8 }} />
                      </div>
                    ))}
                  </div>
                ) : summary ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Executive summary spans full width */}
                    <div style={{ padding: 20, borderRadius: 12, background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))', border: '1px solid rgba(99,102,241,0.15)' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Executive Summary</p>
                      <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.75 }}>{summary.executiveSummary}</p>
                    </div>

                    {/* 2-col grid for remaining fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {[
                        { key: 'problemStatement', label: 'Research Problem' },
                        { key: 'datasetUsed', label: 'Dataset Used' },
                        { key: 'methodology', label: 'Methodology' },
                        { key: 'results', label: 'Key Results' },
                        { key: 'limitations', label: 'Limitations' },
                        { key: 'futureWork', label: 'Future Work' },
                      ].map((field) => (
                        <div key={field.key} style={{ padding: 16, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{field.label}</p>
                          <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.65 }}>{(summary as any)[field.key]}</p>
                        </div>
                      ))}
                    </div>

                    {/* Conclusion full width */}
                    <div style={{ padding: 16, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Conclusion</p>
                      <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7 }}>{summary.conclusion}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ── CITATIONS TAB ── */}
            {activeTab === 'citations' && (
              <div className="animate-fade-in">
                {citationsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3, 4].map((n) => <div key={n} className="skeleton" style={{ height: 80, borderRadius: 10 }} />)}
                  </div>
                ) : citations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <Clipboard size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No citations extracted</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Citations are extracted during initial PDF processing.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {citations.map((cite: any, i: number) => (
                      <div key={cite.id} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: cite.context ? 10 : 0 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', padding: '1px 8px', borderRadius: 100 }}>#{i + 1}</span>
                              {cite.year && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cite.year}</span>}
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{cite.text}</p>
                            {cite.authors?.length > 0 && (
                              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                                {cite.authors.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        {cite.context && (
                          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(3,7,18,0.5)', border: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                            "{cite.context}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PDF VIEWER TAB ── */}
            {activeTab === 'pdf' && (
              <div className="animate-fade-in" style={{ height: '100%', minHeight: 500, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ alignSelf: 'flex-start', textDecoration: 'none' }}
                >
                  Open PDF in new tab
                </a>
                <embed
                  src={pdfUrl}
                  type="application/pdf"
                  style={{ width: '100%', height: 'calc(100vh - 220px)', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
                  title="PDF Viewer"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Chat panel */}
        <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
          {/* Chat header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={14} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Paper Research Assistant</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>RAG-powered — asks Gemini about this paper only</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatHistory.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <MessageSquare size={20} color="#6366f1" />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Start the conversation</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 240 }}>
                  Ask things like: "Explain the methodology", "What dataset was used?", "Summarize key findings"
                </p>
                {/* Quick prompts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 20 }}>
                  {['Explain the main methodology', 'What are the key results?', 'What are the limitations?'].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setQuestion(prompt)}
                      style={{
                        padding: '8px 12px', borderRadius: 8, background: 'rgba(33,38,45,0.6)',
                        border: '1px solid var(--border)', color: 'var(--text-secondary)',
                        fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.map((msg: any) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
                      <Bot size={12} color="#fff" />
                    </div>
                  )}
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    {msg.message}
                  </div>
                  {msg.role === 'user' && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
                      <UserIcon size={12} color="#a5b4fc" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Typing indicator */}
            {askMutation.isPending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={12} color="#fff" />
                </div>
                <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Loader2 size={14} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Researching paper context…</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleAsk} style={{ padding: '12px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              type="text"
              placeholder="Ask about this paper…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={askMutation.isPending}
              className="input-field"
              style={{ flex: 1, height: 40 }}
            />
            <button
              type="submit"
              disabled={!question.trim() || askMutation.isPending}
              className="btn-primary"
              style={{ height: 40, width: 40, padding: 0, borderRadius: 8, flexShrink: 0 }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
