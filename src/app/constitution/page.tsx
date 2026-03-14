'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowRight, Shield, ShieldAlert, AlertOctagon, ShieldCheck } from 'lucide-react';

export default function Constitution() {
  const router = useRouter();
  const [constitution, setConstitution] = useState<any>(null);

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
      <header className="page-header animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ background: 'var(--glass-bg)', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid var(--accent-secondary)' }}>
            <FileText size={48} color="var(--accent-secondary)" />
          </div>
        </div>
        <h1 className="page-title">Moderation Constitution</h1>
        <p className="page-subtitle">{constitution.summary || "Generated adaptive guidelines."}</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animationDelay: '0.1s' }} className="animate-fade-in">
        
        {/* Specifically Allowed Behaviors */}
        {constitution.allowedBehaviors && constitution.allowedBehaviors.length > 0 && (
          <section className="glass-panel" style={{ padding: 32, borderLeft: '4px solid var(--success)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)' }}>
              <ShieldCheck />
              Specifically Allowed (Community Norms)
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Behaviors, topics, and linguistic styles that are explicitly acceptable and normal in this community.</p>
            <ul style={{ listStylePosition: 'inside', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {constitution.allowedBehaviors.map((b: string, i: number) => (
                <li key={i} style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 8 }}>{b}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Universal Hard Boundaries */}
        <section className="glass-panel" style={{ padding: 32, borderLeft: '4px solid var(--danger)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}>
            <AlertOctagon />
            Universal Hard Boundaries (Intrinsic Risk)
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>These override all local norms and act as non-negotiable safety guardrails.</p>
          <ul style={{ listStylePosition: 'inside', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {constitution.hardBoundaries?.map((b: string, i: number) => (
              <li key={i} style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 8 }}>{b}</li>
            ))}
          </ul>
        </section>

        {/* Community-Adaptive Boundaries */}
        <section className="glass-panel" style={{ padding: 32, borderLeft: '4px solid var(--accent-primary)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-primary)' }}>
            <Shield />
            Community-Adaptive Soft Boundaries (Reception Risk)
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Tailored to the linguistic and behavioral norms inferred from the community.</p>
          <ul style={{ listStylePosition: 'inside', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {constitution.softBoundaries?.map((b: string, i: number) => (
              <li key={i} style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 8 }}>{b}</li>
            ))}
          </ul>
        </section>

        {/* Review Cases */}
        <section className="glass-panel" style={{ padding: 32, borderLeft: '4px solid var(--warning)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--warning)' }}>
            <ShieldAlert />
            Escalation / Review Cases
          </h2>
          <ul style={{ listStylePosition: 'inside', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {constitution.reviewCases?.map((b: string, i: number) => (
              <li key={i} style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 8 }}>{b}</li>
            ))}
          </ul>
        </section>

      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, gap: 16 }}>
        <button className="secondary-button" onClick={() => router.push('/profile')}>
          Back to Profile
        </button>
        <button className="primary-button" onClick={() => router.push('/playground')}>
          Open Playground
          <ArrowRight size={20} />
        </button>
      </div>
    </main>
  );
}
