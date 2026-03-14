'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send, Activity, ShieldAlert, CheckCircle, BarChart3, AlertTriangle } from 'lucide-react';

export default function Playground() {
  const router = useRouter();
  const [constitution, setConstitution] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('communisense_constitution');
    if (data && data !== 'undefined') {
      try {
        setConstitution(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse constitution from localStorage:", e);
      }
    }
  }, []);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !constitution) return;

    localStorage.setItem('communisense_last_message', message);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, constitution }),
      });
      const data = await response.json();
      setResult(data);
      localStorage.setItem('communisense_last_result', JSON.stringify(data));
    } catch (err) {
      console.error(err);
      alert('Failed to evaluate message.');
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decision: string) => {
    switch(decision?.toLowerCase()) {
      case 'allow': return 'var(--success)';
      case 'warn': return 'var(--warning)';
      case 'review': return 'var(--warning)';
      case 'block': return 'var(--danger)';
      default: return 'var(--text-primary)';
    }
  };

  if (!constitution) {
    return (
      <main className="container page-header">
        <p>No constitution found. Please ingest a source first.</p>
        <button onClick={() => router.push('/')} className="primary-button" style={{ marginTop: 24 }}>Back to Ingestion</button>
      </main>
    )
  }

  return (
    <main className="container" style={{ paddingBottom: 60 }}>
      <header className="page-header animate-fade-in" style={{ paddingBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ background: 'var(--glass-bg)', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid var(--accent-primary)' }}>
            <MessageSquare size={48} color="var(--accent-primary)" />
          </div>
        </div>
        <h1 className="page-title">Testing Playground</h1>
        <p className="page-subtitle">Test messages against the generated constitution.</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
        <button className="secondary-button" onClick={() => router.push('/constitution')}>View Constitution</button>
        <button className="secondary-button" onClick={() => router.push('/compare')}>Open Compare Mode</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="animate-fade-in">
        
        {/* Input Pane */}
        <section className="glass-panel" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Enter Message to Test</h2>
          <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <textarea 
              className="glass-input" 
              rows={6} 
              placeholder="e.g. 'You guys are total idiots for thinking this is ok. Go **** yourselves.'"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <button type="submit" className="primary-button" disabled={loading || !message.trim()}>
              {loading ? 'Evaluating Axes...' : 'Evaluate Message'}
              {!loading && <Send size={18} />}
            </button>
          </form>
          
          <div style={{ marginTop: 24, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <p><strong>Pro Tip:</strong> Try testing edge cases like sarcasm, swearing without harassment, or passive-aggressiveness.</p>
          </div>
        </section>

        {/* Results Pane */}
        <section className="glass-panel" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity />
            Analysis Results
          </h2>

          {!result && !loading && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: "40px 0" }}>
              <ShieldAlert size={48} opacity={0.5} style={{ margin: '0 auto 16px' }} />
              <p>Type a message and click Evaluate to see the moderation decision.</p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', color: 'var(--accent-primary)', padding: "40px 0" }}>
              <BarChart3 size={48} className="spin" style={{ margin: '0 auto 16px' }} />
              <p>Gemini is reasoning over the constitution...</p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', padding: 16, borderRadius: 12, border: `1px solid ${getDecisionColor(result.decision)}` }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Final Decision</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: getDecisionColor(result.decision), textTransform: 'uppercase' }}>
                  {result.decision}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 12 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                    <AlertTriangle size={14} /> Intrinsic Risk
                  </span>
                  <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
                    <strong style={{ fontSize: '1.8rem', lineHeight: 1 }}>{result.intrinsicRiskScore}</strong>
                    <span style={{ color: 'var(--text-secondary)', paddingBottom: 4 }}>/ 100</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--bg-primary)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${result.intrinsicRiskScore}%`, height: '100%', background: result.intrinsicRiskScore > 70 ? 'var(--danger)' : result.intrinsicRiskScore > 40 ? 'var(--warning)' : 'var(--success)' }} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 12 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                    <ShieldAlert size={14} /> Community Reception Risk
                  </span>
                  <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
                    <strong style={{ fontSize: '1.8rem', lineHeight: 1 }}>{result.receptionRiskScore}</strong>
                    <span style={{ color: 'var(--text-secondary)', paddingBottom: 4 }}>/ 100</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--bg-primary)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${result.receptionRiskScore}%`, height: '100%', background: result.receptionRiskScore > 70 ? 'var(--danger)' : result.receptionRiskScore > 40 ? 'var(--warning)' : 'var(--success)' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 12 }}>
                <strong style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Reasoning</strong>
                <p style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{result.explanation}</p>
              </div>

            </div>
          )}
        </section>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: scale(0.9) opacity(0.8); } 50% { transform: scale(1.1) opacity(1); } 0% { transform: scale(0.9) opacity(0.8); } }
      `}} />
    </main>
  );
}
