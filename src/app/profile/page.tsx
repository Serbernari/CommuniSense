'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const [norms, setNorms] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('communisense_norms');
    if (data && data !== 'undefined') {
      try {
        setNorms(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse norms from localStorage:", e);
      }
    }
  }, []);

  if (!norms) {
    return (
      <main className="container page-header">
        <p>No community profile found. Please ingest a source first.</p>
        <button onClick={() => router.push('/')} className="primary-button" style={{ marginTop: 24 }}>Back to Ingestion</button>
      </main>
    )
  }

  return (
    <main className="container" style={{ paddingBottom: 60 }}>
      <header className="page-header animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid var(--success)' }}>
            <ShieldCheck size={48} color="var(--success)" />
          </div>
        </div>
        <h1 className="page-title">Community Profile Generated</h1>
        <p className="page-subtitle">We have successfully inferred the linguistic and behavioral norms for this community.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, animationDelay: '0.1s' }} className="animate-fade-in">
        {/* Left Column: Top Level Stats */}
        <section className="glass-panel" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText color="var(--accent-primary)" />
            Core Attributes
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 12 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>Community Type</span>
              <strong style={{ fontSize: '1.2rem' }}>{norms.communityType || 'Unknown'}</strong>
            </div>
            
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 12 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>General Tone</span>
              <strong style={{ fontSize: '1.2rem' }}>{norms.tone || 'Neutral'}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 12 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>Profanity Tolerance</span>
                <strong style={{ fontSize: '1.1rem', color: norms.profanityTolerance === 'low' ? 'var(--danger)' : 'var(--success)' }}>
                  {String(norms.profanityTolerance).toUpperCase()}
                </strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 12 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>Sarcasm Level</span>
                <strong style={{ fontSize: '1.1rem', color: norms.sarcasmLevel === 'low' ? 'var(--warning)' : 'var(--accent-primary)' }}>
                  {String(norms.sarcasmLevel).toUpperCase()}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Deep Dive */}
        <section className="glass-panel" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle color="var(--warning)" />
            Inferred Behavioral Norms
          </h2>
          
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Sensitive Zones</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {norms.likelySensitiveZones?.map((zone: string, i: number) => (
                <span key={i} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '6px 12px', borderRadius: 20, fontSize: '0.9rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  {zone}
                </span>
              )) || <span>None detected</span>}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Key Inferred Rules</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {norms.inferredNorms?.map((norm: any, i: number) => (
                <div key={i} style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 12, borderLeft: '4px solid var(--accent-primary)' }}>
                  <p style={{ fontWeight: 500, marginBottom: 8 }}>"{norm.rule}"</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>Evidence: {norm.evidence.substring(0, 40)}...</span>
                    <span>Confidence: {norm.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, gap: 16 }}>
        <button className="secondary-button" onClick={() => router.push('/')}>
          Start Over
        </button>
        <button className="primary-button" onClick={() => router.push('/constitution')}>
          <CheckCircle2 size={20} />
          Review Constitution
        </button>
      </div>
    </main>
  );
}
