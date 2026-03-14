'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Globe, FileText, ArrowRight, Loader } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [concern, setConcern] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'url' && !url) return;
    if (mode === 'file' && !file) return;

    setLoading(true);
    
    try {
      const formData = new FormData();
      if (concern) formData.append('concern', concern);

      let response;

      if (mode === 'url') {
        setProgressMsg('Discovering community pages...');
        response = await fetch('http://localhost:8000/api/ingest/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, concern }),
        });
      } else {
        setProgressMsg('Extracting file content...');
        formData.append('file', file as File);
        response = await fetch('http://localhost:8000/api/ingest/file', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
      }

      setProgressMsg('Inferring linguistic norms...');
      const data = await response.json();
      
      // Store globally or pass via local storage for MVP
      localStorage.setItem('communisense_norms', JSON.stringify(data.norms));
      localStorage.setItem('communisense_constitution', JSON.stringify(data.constitution));

      setProgressMsg('Compiling constitution...');
      
      // Artificial delay for smooth UX transition
      setTimeout(() => {
        router.push('/profile');
      }, 800);
      
    } catch (err: any) {
      console.error(err);
      alert('Failed to ingest: ' + err.message);
      setProgressMsg('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="page-header animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ background: 'var(--glass-bg)', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid var(--accent-primary)' }}>
            <ShieldAlert size={48} color="var(--accent-primary)" />
          </div>
        </div>
        <h1 className="page-title">CommuniSense</h1>
        <p className="page-subtitle">
          The one-click community-adaptive moderation layer. Paste a URL or file to auto-generate a moderation constitution trained on local norms.
        </p>
      </header>

      <section className="glass-panel animate-fade-in" style={{ maxWidth: 700, margin: '0 auto', padding: 40, animationDelay: '0.1s' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          <button 
            type="button"
            className={mode === 'url' ? 'primary-button' : 'secondary-button'} 
            style={{ flex: 1 }}
            onClick={() => setMode('url')}
          >
            <Globe size={20} />
            URL Ingestion
          </button>
          <button 
            type="button"
            className={mode === 'file' ? 'primary-button' : 'secondary-button'} 
            style={{ flex: 1 }}
            onClick={() => setMode('file')}
          >
            <FileText size={20} />
            File Upload
          </button>
        </div>

        <form onSubmit={handleIngest} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {mode === 'url' ? (
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Community URL (e.g. forum, rules page)</label>
              <input 
                type="url" 
                className="glass-input" 
                placeholder="https://community.example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Upload Community Export (TXT, PDF, CSV, JSON)</label>
              <input 
                type="file" 
                className="glass-input" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".txt,.pdf,.csv,.json"
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>What are you most concerned about? (Optional)</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="e.g. Sarcasm vs hostility, toxic gatekeeping, etc."
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
            />
          </div>

          <button type="submit" className="primary-button" style={{ marginTop: 16, width: '100%', padding: '16px' }} disabled={loading}>
            {loading ? (
              <>
                <Loader className="spin" size={20} />
                {progressMsg || 'Processing...'}
              </>
            ) : (
              <>
                Generate Moderation Layer
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </section>
      
      {/* Basic spin keyframe inside component or global */}
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </main>
  );
}
