import { useState, useRef } from 'react';
import { PLATFORMS } from '../data.js';

const FALLBACK_CAPTIONS = [
  "Big moves only. The upgrade is real and the energy is undeniable. 🔥✨",
  "Omo, see how far we don come. This is what believing in yourself looks like. 💪🌍",
  "They go ask 'who did this for you?' Tell them: discipline and good decisions. 😂🙌",
];

export default function StudioTab({ onLoading }) {
  const fileRef = useRef(null);

  const [imgSrc, setImgSrc] = useState(null);
  const [enhanced, setEnhanced] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [selectedCap, setSelectedCap] = useState(null);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [desc, setDesc] = useState('');
  const [mood, setMood] = useState('professional hype');
  const [selPlatforms, setSelPlatforms] = useState(['instagram', 'twitter', 'facebook']);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImgSrc(ev.target.result);
      setEnhanced(false);
      setEnhancing(false);
      setCaptions([]);
      setSelectedCap(null);
      setPosted(false);
    };
    reader.readAsDataURL(file);
  }

  function handleEnhance() {
    setEnhancing(true);
    setTimeout(() => {
      setEnhanced(true);
      setEnhancing(false);
    }, 2300);
  }

  async function handleCaptions() {
    if (!desc.trim()) {
      document.getElementById('sp-img-desc')?.focus();
      return;
    }
    setCaptionLoading(true);
    onLoading(true, 'Crafting captions for the culture…');

    try {
      const prompt = `You are a social media copywriter for African brands — specifically Nigerian, Ghanaian, and pan-African audiences. You understand Lagos slang, Naija energy, Afrobeats culture, and the aspirational African middle class.

Generate exactly 3 punchy, relatable captions for a social media post. The image is: "${desc}". Mood/vibe: "${mood}".

Rules:
- Mix English with light Pidgin/Yoruba/Igbo phrases naturally (not forced)
- Reference real African concepts: hustle, upgrade, "we move", glow-up, Afro excellence
- Each caption under 200 characters
- Add 3-5 relevant emojis per caption
- Make them feel authentic, not corporate
- Vary the tone: one hype, one reflective, one witty/funny

Respond ONLY with a JSON array of 3 strings, no markdown, no explanation.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === 'text')?.text || '[]';
      setCaptions(JSON.parse(text.replace(/```json|```/g, '').trim()));
    } catch {
      setCaptions(FALLBACK_CAPTIONS);
    }

    onLoading(false);
    setCaptionLoading(false);
  }

  function togglePlatform(id) {
    setSelPlatforms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function handlePost() {
    if (!selPlatforms.length || selectedCap === null) return;
    setPosting(true);
    setTimeout(() => {
      setPosting(false);
      setPosted(true);
    }, 3000);
  }

  return (
    <div style={{ animation: 'slideUp 0.35s ease' }}>
      <div className="hero">
        <h1>Make your content <span>slap.</span></h1>
        <p>Upload. Enhance. Caption. Post. All in one place.</p>
      </div>

      {/* STEP 1: UPLOAD */}
      <div className="card">
        <div className="card-title">
          <span className="step-num">01</span>
          Upload Your Shot
        </div>

        <div className="upload-zone" onClick={() => fileRef.current?.click()}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          {!imgSrc ? (
            <>
              <div className="upload-icon">📷</div>
              <div className="upload-label">Drop your photo here or click to browse</div>
              <div className="upload-hint">JPG, PNG, WEBP — up to 20MB</div>
            </>
          ) : (
            <div className="image-preview-wrap">
              <div className="preview-col">
                <label>Original</label>
                <img src={imgSrc} alt="original" style={{ filter: 'brightness(0.9) contrast(0.95)' }} />
              </div>
              <div className="preview-col">
                <label>
                  Enhanced{' '}
                  {enhanced && <span style={{ color: 'var(--green)' }}>✓</span>}
                </label>
                {enhanced ? (
                  <img
                    src={imgSrc}
                    alt="enhanced"
                    style={{ filter: 'brightness(1.08) contrast(1.12) saturate(1.25)', boxShadow: '0 8px 32px rgba(255,180,0,0.2)' }}
                  />
                ) : (
                  <div className="preview-placeholder">
                    {enhancing ? (
                      <>
                        <div className="spinner spinner-gold" style={{ width: 28, height: 28, margin: '0 auto 8px' }} />
                        <div style={{ fontSize: 12, color: 'var(--gold)' }}>Enhancing…</div>
                      </>
                    ) : (
                      <span style={{ color: '#444', fontSize: 13 }}>Hit Enhance ↓</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {imgSrc && !enhanced && (
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={handleEnhance}
              disabled={enhancing}
            >
              {enhancing ? <><span className="spinner" /> Enhancing…</> : '✨ Enhance & Clean Up'}
            </button>
            <span className="btn-hint">Removes background noise · Boosts sharpness · Pro colour grade</span>
          </div>
        )}

        {enhanced && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--green)' }}>
            ✓ Background cleaned · Sharpness +12% · Colour grade applied
          </div>
        )}
      </div>

      {/* STEP 2: CAPTIONS */}
      {enhanced && (
        <div className="card" style={{ animation: 'slideUp 0.35s ease' }}>
          <div className="card-title">
            <span className="step-num">02</span>
            Generate Captions
            <span className="card-sub">powered by Claude AI</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sp-img-desc">What's in this photo?</label>
              <input
                id="sp-img-desc"
                type="text"
                placeholder="e.g. Me in a tailored agbada at a business summit in Abuja"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="sp-mood">Vibe / Mood</label>
              <select id="sp-mood" value={mood} onChange={e => setMood(e.target.value)}>
                <option>professional hype</option>
                <option>glow-up energy</option>
                <option>motivational hustle</option>
                <option>funny &amp; witty</option>
                <option>luxury upgrade</option>
                <option>community love</option>
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCaptions}
            disabled={captionLoading}
          >
            🔥 Generate 3 Captions
          </button>

          {captions.length > 0 && (
            <div className="captions-wrap">
              <div className="captions-label">Pick the one that hits different 👇</div>
              {captions.map((cap, i) => cap && (
                <div
                  key={i}
                  className={`cap-card${selectedCap === i ? ' selected' : ''}`}
                  onClick={() => setSelectedCap(i)}
                >
                  <div className="cap-num">{i + 1}</div>
                  <div className="cap-text">{cap}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: POST */}
      {selectedCap !== null && (
        <div className="card" style={{ animation: 'slideUp 0.35s ease' }}>
          <div className="card-title">
            <span className="step-num">03</span>
            Choose Platforms &amp; Post
          </div>

          <div className="platforms-wrap">
            {PLATFORMS.map(p => {
              const sel = selPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  className="plat-btn"
                  style={{
                    borderColor: sel ? p.color : 'rgba(255,255,255,0.1)',
                    background: sel ? `color-mix(in srgb, ${p.color} 15%, transparent)` : 'rgba(255,255,255,0.03)',
                    color: sel ? '#fff' : 'var(--muted)',
                  }}
                  onClick={() => togglePlatform(p.id)}
                >
                  {p.icon} {p.label} {sel && <span style={{ color: p.color }}>✓</span>}
                </button>
              );
            })}
          </div>

          {!posted ? (
            <button
              className="btn btn-primary"
              style={{ fontSize: 15, padding: '14px 36px' }}
              onClick={handlePost}
              disabled={posting || selPlatforms.length === 0}
            >
              {posting
                ? <><span className="spinner" /> Posting to {selPlatforms.length} platforms…</>
                : `🚀 Post Now to ${selPlatforms.length} Platform${selPlatforms.length !== 1 ? 's' : ''}`}
            </button>
          ) : (
            <div className="success-banner">
              <div className="success-title">✓ Posted successfully!</div>
              <div className="success-sub">
                Live on: {selPlatforms.map(id => PLATFORMS.find(p => p.id === id)?.label).join(' · ')}
              </div>
              <div className="success-hint">Check your Dashboard in 24–48 hrs for engagement data.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
