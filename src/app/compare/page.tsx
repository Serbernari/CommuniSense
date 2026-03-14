'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, GitCompare, Activity, AlertTriangle, ShieldAlert, BarChart3, Send } from 'lucide-react';

export default function Compare() {
  const router = useRouter();
  
  const [message, setMessage] = useState('Are you guys actually brain dead or just pretending?');
  const [loading, setLoading] = useState(false);
  const [resultsA, setResultsA] = useState<any>(null); // Side A Result (Ingested)
  const [baselineCache, setBaselineCache] = useState<Record<string, any>>({}); // Side B Results (Mapped by baseline ID)
  const [cachedMessage, setCachedMessage] = useState<string>(''); // To invalidate cache if message changes

  // Dynamic Ingested Constitution for Side A
  const [ingestedConstitution, setIngestedConstitution] = useState<any>(null);
  const [ingestedName, setIngestedName] = useState("Your Ingested Community");

  useEffect(() => {
    const constData = localStorage.getItem('communisense_constitution');
    const normsData = localStorage.getItem('communisense_norms');
    const lastMessage = localStorage.getItem('communisense_last_message');
    const lastResultData = localStorage.getItem('communisense_last_result');

    if (lastMessage) {
      setMessage(lastMessage);
      setCachedMessage(lastMessage);
      
      if (lastResultData) {
        try {
          setResultsA(JSON.parse(lastResultData));
        } catch(e) {}
      }
    }

    if (constData && constData !== 'undefined') {
      try {
        setIngestedConstitution(JSON.parse(constData));
        if (normsData && normsData !== 'undefined') {
          const norms = JSON.parse(normsData);
          setIngestedName(norms.communityType ? `Your Community (${norms.communityType})` : "Your Ingested Community");
        }
      } catch (e) {
        console.error("Failed to parse from localStorage:", e);
      }
    }
  }, []);

  // Baseline Constitutions for Side B
  const baselines = [
    {
      id: 'corporate',
      name: "Corporate Default (Baseline)",
      constitution: {
        summary: "Standard HR-approved corporate communication guidelines.",
        allowedBehaviors: ["Professional collaboration", "Constructive feedback", "Polite inquiries"],
        hardBoundaries: ["Harassment", "Threats", "Discrimination", "NSFW Content"],
        softBoundaries: ["No profanity", "Maintain professional tone", "Avoid controversial political/religious topics"],
        reviewCases: ["Passive-aggressiveness", "Unprofessional sarcasm"]
      }
    },
    {
      id: 'support',
      name: "Support Group (r/emotionalSupport)",
      constitution: {
        summary: "A strict, highly supportive environment. Zero tolerance for insults or hostility, even as jokes.",
        allowedBehaviors: ["Validation", "Empathy", "Sharing personal struggles", "Offering gentle advice if asked"],
        hardBoundaries: ["Threats", "Self-harm encouragement", "Doxxing"],
        softBoundaries: ["No insults", "No swearing aimed at users", "Preserve a warm tone"],
        reviewCases: ["Sarcasm", "Passive-aggressiveness", "Unsolicited harsh advice"]
      }
    },
    {
      id: 'gaming',
      name: "Gaming/Meme Group (r/TrashTalkGaming)",
      constitution: {
        summary: "A high-banter, competitive environment. Swearing and trash talk is culturally normal and expected.",
        allowedBehaviors: ["Trash talk", "Memes", "Competitive banter", "Profanity"],
        hardBoundaries: ["Real-life threats", "Doxxing", "Actual targeted bias/slurs"],
        softBoundaries: ["Trash talk is fine", "Profanity is fine", "Sarcasm is the default tone"],
        reviewCases: ["Stalking users across threads", "Spamming"]
      }
    }
  ];

  const [selectedBaselineId, setSelectedBaselineId] = useState(baselines[0].id);
  const selectedBaseline = baselines.find(b => b.id === selectedBaselineId) || baselines[0];

  // Helper to background-fetch remaining baselines
  const prefetchOtherBaselines = async (msg: string) => {
    const remainingBaselines = baselines.filter(b => b.id !== selectedBaselineId && !baselineCache[b.id]);
    
    for (const b of remainingBaselines) {
      try {
        const res = await fetch('http://localhost:8000/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, constitution: b.constitution }),
        });
        const data = await res.json();
        setBaselineCache(prev => ({ ...prev, [b.id]: data }));
      } catch (err) {
        console.error(`Background pre-fetch failed for ${b.id}:`, err);
      }
    }
  };

  const handleCompare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || !ingestedConstitution) return;
    
    const isNewMessage = message !== cachedMessage;
    
    // Check if we already have both results cached for this message
    if (!isNewMessage && resultsA && baselineCache[selectedBaselineId]) {
      return; 
    }

    setLoading(true);
    const newBaselineCache = isNewMessage ? {} : { ...baselineCache };
    const newResultsA = isNewMessage ? null : resultsA;

    if (isNewMessage) {
      setBaselineCache({});
      setResultsA(null);
      setCachedMessage(message);
    }

    try {
      const tasks = [];
      
      // Task 1: Eval Side A (if not cached or if message changed)
      let fetchA = async () => {
        if (!newResultsA) {
          const res = await fetch('http://localhost:8000/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, constitution: ingestedConstitution }),
          });
          return await res.json();
        }
        return newResultsA;
      };

      // Task 2: Eval Side B (if not cached or if message changed)
      let fetchB = async () => {
        if (!newBaselineCache[selectedBaselineId]) {
          const res = await fetch('http://localhost:8000/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, constitution: selectedBaseline.constitution }),
          });
          return await res.json();
        }
        return newBaselineCache[selectedBaselineId];
      };

      const [dataA, dataB] = await Promise.all([fetchA(), fetchB()]);

      setResultsA(dataA);
      setBaselineCache(prev => ({ ...prev, [selectedBaselineId]: dataB }));
      
      // After showing the main results, pre-fetch others in background
      prefetchOtherBaselines(message);

    } catch (err) {
      console.error(err);
      alert('Failed to evaluate compare mode.');
    } finally {
      setLoading(false);
    }
  };

  // Immediate update when Side B dropdown changes or if Side A was just loaded from cache
  useEffect(() => {
    if (resultsA && !baselineCache[selectedBaselineId] && message === cachedMessage) {
      handleCompare();
    }
  }, [selectedBaselineId, resultsA]);

  const getDecisionColor = (decision: string) => {
    switch(decision?.toLowerCase()) {
      case 'allow': return 'var(--success)';
      case 'warn': return 'var(--warning)';
      case 'review': return 'var(--warning)';
      case 'block': return 'var(--danger)';
      default: return 'var(--text-primary)';
    }
  };

  const ResultCard = ({ result, communityName }: { result: any, communityName: string }) => {
    return (
      <div style={{ background: 'var(--bg-tertiary)', padding: 24, borderRadius: 16, border: `1px solid ${getDecisionColor(result.decision)}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: getDecisionColor(result.decision) }} />
        
        <h3 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-secondary)' }}>{communityName}</h3>
        
        <div style={{ display: 'flex', alignItems: 'end', gap: 8, marginBottom: 24 }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: getDecisionColor(result.decision), textTransform: 'uppercase', lineHeight: 1 }}>
            {result.decision}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
           <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
             <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Intrinsic Risk</span>
             <strong style={{ fontSize: '1.2rem', color: result.intrinsicRiskScore > 70 ? 'var(--danger)' : 'white' }}>{result.intrinsicRiskScore}/100</strong>
           </div>
           <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
             <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: 4 }}>Reception Risk</span>
             <strong style={{ fontSize: '1.2rem', color: result.receptionRiskScore > 70 ? 'var(--danger)' : 'white' }}>{result.receptionRiskScore}/100</strong>
           </div>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>CommuniSense Reasoning</span>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{result.explanation}</p>
        </div>
      </div>
    );
  };

  return (
    <main className="container" style={{ paddingBottom: 60 }}>
      <header className="page-header animate-fade-in" style={{ paddingBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ background: 'var(--glass-bg)', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid var(--accent-secondary)' }}>
            <GitCompare size={48} color="var(--accent-secondary)" />
          </div>
        </div>
        <h1 className="page-title">Contextual Safety Compare</h1>
        <p className="page-subtitle">Watch CommuniSense adapt its moderation decision for the exact same message across two distinct communities.</p>
      </header>

      <div className="glass-panel animate-fade-in" style={{ padding: 32, marginBottom: 32, animationDelay: '0.1s' }}>
        
        {!ingestedConstitution ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <AlertTriangle size={32} color="var(--warning)" style={{ margin: '0 auto 16px' }} />
            <p style={{ marginBottom: 16 }}>You haven't ingested a community yet.</p>
            <button onClick={() => router.push('/')} className="primary-button">Go Ingest a Source</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>Side A: Target Subject</label>
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  {ingestedName}
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>Side B: Contrast Baseline</label>
                <select 
                  className="glass-input" 
                  style={{ width: '100%', cursor: 'pointer', appearance: 'none', background: 'var(--bg-tertiary)' }}
                  value={selectedBaselineId}
                  onChange={(e) => setSelectedBaselineId(e.target.value)}
                >
                  {baselines.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleCompare} style={{ display: 'flex', gap: 16 }}>
              <input 
                type="text" 
                className="glass-input" 
                style={{ flex: 1, fontSize: '1.1rem' }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a borderline message..."
                required
              />
              <button type="submit" className="primary-button" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                {loading ? 'Comparing...' : 'Run Side-by-Side'}
                {!loading && <Send size={18} />}
              </button>
            </form>
          </>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--accent-primary)' }}>
           <BarChart3 size={48} className="spin" style={{ margin: '0 auto 16px' }} />
           <p>Gemini evaluating dual contexts...</p>
        </div>
      )}

      {(resultsA && baselineCache[selectedBaselineId]) && !loading && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 16, background: 'var(--glass-bg)', borderRadius: 24, border: '1px solid var(--border-subtle)' }}>
           <ResultCard result={resultsA} communityName={ingestedName} />
           <ResultCard result={baselineCache[selectedBaselineId]} communityName={selectedBaseline.name} />
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: scale(0.9) opacity(0.8); } 50% { transform: scale(1.1) opacity(1); } 0% { transform: scale(0.9) opacity(0.8); } }
      `}} />
    </main>
  );
}
