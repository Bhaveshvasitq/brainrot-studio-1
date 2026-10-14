'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Feature = 'chat' | 'image' | 'voice' | 'video';

export default function MediaStudioPage() {
  const [feature, setFeature] = useState<Feature>('chat');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Paid generation is disabled until approval, age verification and budget controls are configured.');
  const [reportText, setReportText] = useState('');
  const [reportStatus, setReportStatus] = useState('');

  async function submitReport() {
    setReportStatus('');
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Sign in to submit a report.');
      const response = await fetch('/api/media-report', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ contentType: feature, description: reportText, contentReference: result?.taskId || result?.requestId || null }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Report submission failed.');
      setReportStatus(payload.message || 'Report submitted.');
      setReportText('');
    } catch (e) { setReportStatus(e instanceof Error ? e.message : 'Report submission failed.'); }
  }

  async function submit() {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Sign in is required. Paid generation is not available to signed-out users.');
      const endpoint = feature === 'chat' ? '/api/spicyapi/chat'
        : feature === 'image' ? '/api/spicyapi/image'
        : feature === 'voice' ? '/api/spicyapi/voice'
        : '/api/spicyapi/video';
      const body = feature === 'chat' ? { messages: [{ role: 'user', content: prompt }] }
        : feature === 'voice' ? { text: prompt }
        : { prompt, durationSeconds: 3 };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Generation request failed.');
      setResult(payload);
      if (feature === 'video' && payload.taskId) {
        setStatus('Video queued. Waiting for the provider task to finish…');
        for (let attempt = 0; attempt < 40; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          const poll = await fetch('/api/spicyapi/video/task?taskId=' + encodeURIComponent(payload.taskId), {
            headers: { Authorization: 'Bearer ' + token },
          });
          const task = await poll.json();
          if (!poll.ok) throw new Error(task.error || 'Could not check video status.');
          if (task.status === 'succeeded') { setResult(task); setStatus('Video ready.'); return; }
          if (task.status === 'failed') throw new Error(task.error || 'Video generation failed.');
        }
        setStatus('Video is still processing. Return later to check the task status.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top,#39244e 0%,#191422 48%,#100e17 100%)', color: '#fff', padding: '28px clamp(16px,4vw,48px)', fontFamily: 'Inter,ui-sans-serif,system-ui,sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <a href="/" style={{ color: '#efb9ff', textDecoration: 'none' }}>← Back to Soul</a>
        <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', margin: '24px 0 8px' }}>Soul Media Studio</h1>
        <p style={{ color: '#c5bacd', lineHeight: 1.7 }}>Chat, create fictional adult characters and generate media when your account is eligible and the paid pilot is explicitly activated.</p>
        <section style={{ margin: '22px 0', padding: 16, borderRadius: 16, border: '1px solid #e8a3f544', background: '#e879f911', lineHeight: 1.7 }}>
          <strong>Launch status: paid generation is off.</strong>
          <div style={{ color: '#c5bacd', fontSize: 13 }}>{status}</div>
          <div style={{ color: '#c5bacd', fontSize: 12, marginTop: 8 }}>AI-generated content only. Only fictional consenting adults are allowed for adult media. Real-person sexual imagery, youth-coded content, non-consensual content and sexual violence are prohibited. Verified adult access is required.</div>
        </section>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(['chat','image','voice','video'] as Feature[]).map(item => (
            <button key={item} onClick={() => { setFeature(item); setResult(null); setError(''); }} style={{ border: '1px solid ' + (feature === item ? '#efb5fb' : '#ffffff25'), borderRadius: 999, padding: '10px 18px', background: feature === item ? '#efb5fb' : '#ffffff0c', color: feature === item ? '#24142c' : '#fff', fontWeight: 800, textTransform: 'capitalize', cursor: 'pointer' }}>{item}</button>
          ))}
        </div>
        <section style={{ padding: 20, border: '1px solid #ffffff20', borderRadius: 20, background: '#ffffff08' }}>
          <label htmlFor="prompt" style={{ display: 'block', marginBottom: 10, fontWeight: 800 }}>{feature === 'voice' ? 'Text to speak' : feature === 'chat' ? 'Message your companion' : feature === 'image' ? 'Image prompt' : 'Video prompt'}</label>
          <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={feature === 'video' ? 3000 : 4000} placeholder={feature === 'chat' ? 'Write a message…' : feature === 'voice' ? 'Write the words for your character to speak…' : feature === 'image' ? 'Describe a fictional adult character and scene…' : 'Describe a short scene with fictional adult characters…'} style={{ width: '100%', minHeight: 130, resize: 'vertical', padding: 14, borderRadius: 12, border: '1px solid #ffffff25', background: '#100e17', color: '#fff', font: 'inherit', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <span style={{ color: '#a99cb2', fontSize: 12 }}>No paid API request is sent while the server-side gate is off.</span>
            <button disabled={busy || !prompt.trim()} onClick={submit} style={{ border: 0, borderRadius: 12, padding: '12px 20px', background: busy ? '#78677e' : '#efb5fb', color: '#24142c', fontWeight: 900, cursor: busy ? 'wait' : 'pointer' }}>{busy ? 'Working…' : 'Generate'}</button>
          </div>
        </section>
        {error && <p role="alert" style={{ padding: 14, borderRadius: 12, background: '#6f1d2a55', border: '1px solid #ff9aa866' }}>{error}</p>}
        {result && <section style={{ marginTop: 18, padding: 20, borderRadius: 18, border: '1px solid #ffffff20', background: '#ffffff08' }}>
          <h2 style={{ marginTop: 0 }}>Result</h2>
          {result.reply && <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{result.reply}</p>}
          {Array.isArray(result.images) && result.images.map((image: any, index: number) => image.url ? <img key={image.url || index} src={image.url} alt="AI-generated fictional character" style={{ width: '100%', maxWidth: 600, borderRadius: 12, marginTop: 10 }} /> : null)}
          {result.audio?.url && <audio controls src={result.audio.url} style={{ width: '100%' }} />}
          {(result.output?.url || result.output?.video_url) && <video controls src={result.output.url || result.output.video_url} style={{ width: '100%', maxWidth: 700, borderRadius: 12 }} />}
          {result.taskId && <p style={{ color: '#c5bacd', fontSize: 13 }}>Video task: {result.taskId} · {result.status || 'processing'}</p>}
          {Number.isFinite(result.costUsd) && <p style={{ color: '#a99cb2', fontSize: 12 }}>Provider-reported cost: ${Number(result.costUsd).toFixed(4)} USD</p>}
        </section>}
        <section style={{ marginTop: 22, padding: 18, borderRadius: 16, border: '1px solid #ffffff20', background: '#ffffff06' }}>
          <h2 style={{ marginTop: 0, fontSize: 17 }}>Report unsafe content</h2>
          <textarea value={reportText} onChange={e => setReportText(e.target.value)} minLength={10} maxLength={2000} placeholder="Describe the content or concern (10–2,000 characters)…" style={{ width: '100%', minHeight: 80, padding: 12, borderRadius: 10, border: '1px solid #ffffff25', background: '#100e17', color: '#fff', font: 'inherit', boxSizing: 'border-box' }} />
          <button onClick={submitReport} disabled={reportText.trim().length < 10} style={{ marginTop: 10, border: '1px solid #ffffff25', borderRadius: 10, padding: '10px 14px', background: '#ffffff0c', color: '#fff', cursor: 'pointer' }}>Submit report</button>
          {reportStatus && <p role="status" style={{ color: '#c5bacd', fontSize: 13 }}>{reportStatus}</p>}
        </section>
      </div>
    </main>
  );
}
