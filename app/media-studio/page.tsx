'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Feature = 'chat' | 'image' | 'voice' | 'video';

const tools: { id: Feature; title: string; subtitle: string; icon: string }[] = [
  { id: 'chat', title: 'AI companion', subtitle: 'Chat & roleplay', icon: '✦' },
  { id: 'image', title: 'Anime image', subtitle: 'Create a character', icon: '▧' },
  { id: 'voice', title: 'Character voice', subtitle: 'Turn text into audio', icon: '♫' },
  { id: 'video', title: 'Short video', subtitle: 'Animate a scene', icon: '▶' },
];

export default function MediaStudioPage() {
  const [feature, setFeature] = useState<Feature>('image');
  const [sceneMode, setSceneMode] = useState('Romantic');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Use the existing Soul Studio image generator. Paid generation remains subject to its existing provider and spending controls.');
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
        : { prompt: feature === 'image' ? sceneMode + ' mood, ' + prompt : prompt, durationSeconds: 3 };
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

  const activeTool = tools.find(item => item.id === feature)!;
  const placeholder = feature === 'chat' ? 'Write a message to start your conversation…'
    : feature === 'voice' ? 'Type the words you want your character to say…'
    : feature === 'image' ? 'A tasteful, sensual cinematic portrait of a clearly adult fictional character, elegant styling, expressive eyes, soft moonlight, detailed art direction…'
    : 'A romantic cinematic scene with clearly adult fictional characters, mutual affection, elegant styling, gentle camera movement, moonlit atmosphere…';

  return (
    <main style={{ minHeight: '100vh', background: '#0b0912', color: '#f8f5ff', padding: '0 0 56px', fontFamily: 'Inter,ui-sans-serif,system-ui,-apple-system,sans-serif' }}>
      <style>{`
        .studio-shell{max-width:1180px;margin:0 auto;padding:24px clamp(16px,4vw,38px) 60px}
        .studio-nav{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:6px 0 28px}
        .studio-brand{display:flex;align-items:center;gap:11px;color:#fff;text-decoration:none;font-weight:900;letter-spacing:.04em}
        .studio-mark{display:grid;place-items:center;width:40px;height:40px;border-radius:14px;background:linear-gradient(135deg,#a78bfa,#f0abfc);color:#20112d;font-size:22px;box-shadow:0 8px 30px #a78bfa30}
        .studio-nav-link{color:#c7bdd7;text-decoration:none;font-size:13px;padding:10px 13px;border:1px solid #ffffff16;border-radius:12px}
        .studio-hero{position:relative;overflow:hidden;border:1px solid #ffffff17;border-radius:28px;padding:clamp(23px,5vw,48px);background:radial-gradient(ellipse at 86% 15%,#563778 0,transparent 38%),linear-gradient(125deg,#21162e,#17111f 62%,#22172d)}
        .studio-hero:after{content:'✦';position:absolute;right:8%;top:15%;font-size:clamp(80px,15vw,180px);color:#f0abfc;opacity:.12;transform:rotate(15deg);pointer-events:none}
        .studio-kicker{display:inline-flex;align-items:center;gap:8px;border:1px solid #d8b4fe45;background:#d8b4fe0e;border-radius:999px;padding:7px 11px;color:#e9d5ff;font-size:11px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}
        .studio-hero h1{font-size:clamp(34px,6vw,58px);line-height:1.04;letter-spacing:-.055em;margin:20px 0 13px;max-width:680px}
        .studio-hero h1 span{background:linear-gradient(90deg,#c4b5fd,#f0abfc);-webkit-background-clip:text;background-clip:text;color:transparent}
        .studio-hero p{max-width:600px;color:#c5b8d2;line-height:1.75;font-size:14px;margin:0}
        .studio-status{display:flex;align-items:flex-start;gap:12px;margin-top:24px;border:1px solid #fbbf2440;border-radius:15px;background:#fbbf240d;padding:14px 16px;max-width:720px}
        .studio-status-dot{flex:none;width:9px;height:9px;border-radius:50%;background:#fbbf24;margin-top:5px;box-shadow:0 0 0 4px #fbbf241b}
        .studio-status strong{display:block;font-size:13px;color:#fde68a;margin-bottom:3px}
        .studio-status span{display:block;color:#c7b9ce;font-size:12px;line-height:1.6}
        .studio-section-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:34px 0 15px}
        .studio-section-head h2{margin:0;font-size:19px;letter-spacing:-.02em}
        .studio-section-head p{margin:5px 0 0;color:#92869f;font-size:12px}
        .studio-tool-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .studio-tool{display:flex;flex-direction:column;align-items:flex-start;text-align:left;min-height:135px;padding:17px;border:1px solid #ffffff16;border-radius:18px;background:#ffffff06;color:#f7f2ff;transition:border-color .15s,transform .15s,background .15s}
        .studio-tool:hover{transform:translateY(-2px);border-color:#c4b5fd70}
        .studio-tool.active{border-color:#c4b5fd;background:linear-gradient(145deg,#a78bfa22,#f0abfc0b);box-shadow:inset 0 0 0 1px #a78bfa15}
        .studio-tool-icon{display:grid;place-items:center;width:39px;height:39px;border-radius:12px;background:#a78bfa1a;color:#d8b4fe;font-size:21px;margin-bottom:14px}
        .studio-tool.active .studio-tool-icon{background:linear-gradient(135deg,#c4b5fd,#f0abfc);color:#251432}
        .studio-tool b{font-size:13px}
        .studio-tool small{font-size:11px;color:#9c90a8;margin-top:5px}
        .studio-workspace{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);gap:15px}
        .studio-panel{border:1px solid #ffffff16;border-radius:20px;background:#ffffff06;padding:clamp(16px,3vw,23px);min-width:0}
        .studio-panel-title{display:flex;align-items:center;gap:11px;margin-bottom:18px}
        .studio-panel-title-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:#a78bfa1a;color:#d8b4fe}
        .studio-panel-title h3{font-size:14px;margin:0}
        .studio-panel-title p{font-size:11px;color:#92869f;margin:4px 0 0}
        .studio-label{display:block;color:#ddd3e8;font-size:12px;font-weight:750;margin-bottom:10px}
        .studio-prompt{width:100%;min-height:180px;resize:vertical;box-sizing:border-box;border:1px solid #ffffff1c;border-radius:14px;padding:15px;background:#0c0913;color:#fff;font:inherit;font-size:13px;line-height:1.65;outline:none}
        .studio-prompt:focus,.studio-report:focus{border-color:#c4b5fd;box-shadow:0 0 0 3px #a78bfa18}
        .studio-prompt::placeholder,.studio-report::placeholder{color:#766b82}
        .studio-hint{display:flex;justify-content:space-between;gap:10px;color:#83778f;font-size:10px;margin:8px 1px 15px;line-height:1.5}
        .studio-generate{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:13px;padding:14px 16px;background:linear-gradient(100deg,#c4b5fd,#f0abfc);color:#251432;font-weight:900;font-size:13px;box-shadow:0 10px 30px #c084fc1c}
        .studio-generate:disabled{opacity:.48;cursor:not-allowed}
        .studio-preview{min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;background:radial-gradient(circle at 50% 38%,#6b438a4d,transparent 48%),#100c18;border:1px dashed #ffffff20;border-radius:15px;padding:24px}
        .studio-preview-symbol{display:grid;place-items:center;width:75px;height:75px;border-radius:24px;background:linear-gradient(145deg,#c4b5fd,#f0abfc);color:#251432;font-size:34px;box-shadow:0 20px 50px #a78bfa25;margin-bottom:20px}
        .studio-preview h4{font-size:15px;margin:0 0 8px}
        .studio-preview p{font-size:12px;line-height:1.7;color:#92869f;max-width:290px;margin:0}
        .studio-result{width:100%;max-width:100%;border-radius:13px;margin-top:12px}
        .studio-error{padding:12px;border:1px solid #fb718544;border-radius:12px;background:#fb71850c;color:#fecdd3;font-size:12px;line-height:1.6;margin-top:14px}
        .studio-safety{margin-top:15px;color:#92869f;font-size:11px;line-height:1.7}
        .studio-report{width:100%;box-sizing:border-box;min-height:85px;resize:vertical;border:1px solid #ffffff1c;border-radius:12px;padding:12px;background:#0c0913;color:#fff;font:inherit;font-size:12px;outline:none}
        .studio-report-btn{margin-top:10px;border:1px solid #ffffff20;border-radius:11px;padding:10px 13px;background:#ffffff09;color:#ded4eb;font-size:12px;font-weight:750}
        .studio-report-btn:disabled{opacity:.4}
        .studio-footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:25px;padding-top:17px;border-top:1px solid #ffffff12;color:#756b80;font-size:10px;line-height:1.7}
        @media(max-width:760px){.studio-tool-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.studio-workspace{grid-template-columns:1fr}.studio-hero{border-radius:22px}.studio-preview{min-height:240px}.studio-nav{padding-bottom:20px}}
        @media(max-width:390px){.studio-tool{padding:13px;min-height:125px}.studio-hero h1{font-size:34px}.studio-hint{flex-direction:column}}
      `}</style>
      <div className="studio-shell">
        <nav className="studio-nav">
          <a href="/" className="studio-brand"><span className="studio-mark">✦</span><span>SOUL <span style={{ color: '#bda7d4', fontWeight: 600 }}>STUDIO</span></span></a>
          <a href="/pricing" className="studio-nav-link">View plans ↗</a>
        </nav>

        <header className="studio-hero">
          <span className="studio-kicker">✧ Your creative universe</span>
          <h1>Imagine it.<br /><span>Bring it to Soul.</span></h1>
          <p>An adults-only creative space for fictional adult characters, romantic roleplay, sensual glamour portraits, character voices and cinematic scenes. All characters must be clearly 18+ and consenting.</p>
          <div className="studio-status">
            <i className="studio-status-dot" />
            <div><strong>18+ creative mode · Preview only</strong><span>{status} Only fictional adults aged 18 or older. Non-consensual imagery, sexual depictions of real people, minors and youth-coded characters are prohibited. Graphic sexual generation is not enabled.</span></div>
          </div>
        </header>

        <div className="studio-section-head">
          <div><h2>Choose your studio</h2><p>What would you like to create today?</p></div>
        </div>
        <div className="studio-tool-grid">
          {tools.map(item => <button key={item.id} type="button" className={'studio-tool' + (feature === item.id ? ' active' : '')} onClick={() => { setFeature(item.id); setResult(null); setError(''); }}>
            <span className="studio-tool-icon">{item.icon}</span><b>{item.title}</b><small>{item.subtitle}</small>
          </button>)}
        </div>

        <div className="studio-section-head">
          <div><h2>Create something new</h2><p>Choose a mood, describe your fictional adult characters, and preview the result. Provider requests remain disabled until Wiro setup, adult-access verification and spending controls are ready.</p></div>
        </div>
        <div className="studio-workspace">
          <section className="studio-panel">
            <div className="studio-panel-title"><span className="studio-panel-title-icon">{activeTool.icon}</span><div><h3>{activeTool.title}</h3><p>{activeTool.subtitle}</p></div></div>
            <label className="studio-label" htmlFor="studio-prompt">{feature === 'voice' ? 'Your script' : feature === 'chat' ? 'Your message' : 'Describe your scene'}</label>
            <textarea id="studio-prompt" className="studio-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={feature === 'video' ? 3000 : 4000} placeholder={placeholder} />
            {(feature === 'image' || feature === 'video' || feature === 'chat') && <div style={{ marginTop: 14 }}><label className="studio-label" htmlFor="scene-mode">Creative mood</label><select id="scene-mode" value={sceneMode} onChange={e => setSceneMode(e.target.value)} style={{ width: '100%', border: '1px solid #ffffff1c', borderRadius: 12, padding: '12px 13px', background: '#0c0913', color: '#f8f5ff', font: 'inherit', fontSize: 12 }}><option>Romantic</option><option>Glamour</option><option>Fantasy</option><option>Flirty</option><option>Cozy</option><option>Cinematic</option><option>Anime</option></select><p className="studio-safety" style={{ marginTop: 7 }}>Mood selection is a prompt aid only; it does not bypass model or provider safety rules.</p></div>}
            <div className="studio-hint"><span>{feature === 'image' ? 'Tip: mention art style, lighting and mood.' : feature === 'video' ? 'Tip: describe the scene and camera movement.' : feature === 'voice' ? 'Tip: use punctuation to shape delivery.' : 'Tip: tell your companion the tone you prefer.'}</span><span>{prompt.length}/{feature === 'video' ? 3000 : 4000}</span></div>
            <button className="studio-generate" onClick={submit} disabled={busy || feature !== 'image' || !prompt.trim()} title="Image generation requires verified adult access and the existing provider's spending controls."><span>✦</span>{busy ? 'Generating…' : feature === 'image' ? 'Generate adult character image' : 'Generation paused for this tool'}</button>
            {error && <div role="alert" className="studio-error">{error}</div>}
            <p className="studio-safety">Adults only (18+). Use fictional adult characters and consensual, non-graphic romantic or sensual concepts. No minors or youth-coded characters, sexual depictions of identifiable real people, non-consensual intimate imagery, sexual violence or bestiality. AI outputs may be imperfect. Image generation follows the existing provider's access and cost controls.</p>
          </section>

          <section className="studio-panel">
            <div className="studio-panel-title"><span className="studio-panel-title-icon">◈</span><div><h3>Preview canvas</h3><p>Your output will appear here</p></div></div>
            <div className="studio-preview">
              {!result && <><div className="studio-preview-symbol">{activeTool.icon}</div><h4>Your next idea starts here</h4><p>This is a design preview for {sceneMode.toLowerCase()} adult-fiction concepts. Image generation uses the existing Soul Studio image provider and its server-side safety and spending controls.</p></>}
              {result && <div style={{ width: '100%' }}>
                {result.imageUrl && <img className="studio-result" src={result.imageUrl} alt="Generated fictional adult character" />}
                {result.reply && <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#f3eafa', textAlign: 'left' }}>{result.reply}</p>}
                {Array.isArray(result.images) && result.images.map((image: any, index: number) => image.url ? <img className="studio-result" key={image.url || index} src={image.url} alt="AI-generated fictional character" /> : null)}
                {result.audio?.url && <audio controls src={result.audio.url} style={{ width: '100%', marginTop: 12 }} />}
                {(result.output?.url || result.output?.video_url) && <video controls src={result.output.url || result.output.video_url} className="studio-result" />}
                {result.taskId && <p style={{ marginTop: 12 }}>Video task: {result.taskId} · {result.status || 'processing'}</p>}
                {Number.isFinite(result.costUsd) && <p style={{ marginTop: 10 }}>Provider-reported cost: ${Number(result.costUsd).toFixed(4)} USD</p>}
              </div>}
            </div>
          </section>
        </div>

        <section className="studio-panel" style={{ marginTop: 15 }}>
          <div className="studio-panel-title"><span className="studio-panel-title-icon">⚑</span><div><h3>Safety & feedback</h3><p>Help keep the community safer</p></div></div>
          <p className="studio-safety" style={{ marginTop: 0, marginBottom: 14 }}>See content that violates the rules? Sign in and submit a report. Reports are stored for review; please do not include passwords or sensitive personal information.</p>
          <textarea className="studio-report" value={reportText} onChange={e => setReportText(e.target.value)} minLength={10} maxLength={2000} placeholder="Describe the content or concern (10–2,000 characters)…" />
          <button className="studio-report-btn" onClick={submitReport} disabled={reportText.trim().length < 10}>Submit content report ↗</button>
          {reportStatus && <p role="status" className="studio-safety">{reportStatus}</p>}
        </section>
        <footer className="studio-footer"><span>SOUL STUDIO · AI-assisted creativity</span><span>Generation off · No automatic top-ups · Budget controls required</span></footer>
      </div>
    </main>
  );
}
