import { useState } from "react";

/* ─── Translations ─── */
const T = {
  tr: {
    tabs: { viral: "Oluştur", trends: "Trendler", bio: "Bio" },
    styles: { observational: "Gözlem", sarcastic: "Sarkastik", relatable: "Ortak His", absurd: "Absürt", storytelling: "Hikaye", hot_take: "Cesur Fikir" },
    lengths: { short: { label: "Kısa", desc: "1–2 satır" }, medium: { label: "Orta", desc: "3–4 satır" }, long: { label: "Uzun", desc: "5–7 satır" } },
    voice: "Ses Tonu", length: "Uzunluk", topic: "Konu", topicOpt: "— isteğe bağlı",
    topicPh: "örn: kahve, pazartesi, yapay zeka...",
    gen: "Tweet Oluştur", genIng: "Oluşturuluyor...", genBio: "Bio Oluştur",
    copy: "Kopyala", copied: "Kopyalandı", regen: "Yeniden Oluştur", hist: "Geçmiş",
    apiReq: "API Anahtarı Gerekli", apiOk: "Bağlandı", apiErr: "Lütfen API anahtarınızı girin",
    apiNote: "console.anthropic.com adresinden alabilirsiniz",
    stratTitle: "Strateji Notu", stratText: "Trend konulara mizahi açıdan yaklaş. Herkes ciddi yorum yaparken espri yap — en hızlı viral yolu.",
    postWin: "En İyi Paylaşım Saatleri", defSelf: "Kendini tanımla",
    persPh: "örn: yazılımcı, girişimci, kedi tutkunu...",
    bioP: "Bio İlkeleri",
    bioTips: ["Maks 160 karakter — her kelime yerini hak etmeli", "İlk 5 kelimede nişini belli et", "Bir kişilik özelliğini cesurca belirt", "Emoji: en fazla 2–3, bilinçli yerleştir", "Doğal hissettiren bir takip daveti ekle"],
    now: "şimdi", sub: "viral içerik motoru", show: "göster", hide: "gizle",
    postTimes: [
      { time: "08–09", label: "Sabah trafiği", score: 85 },
      { time: "12–13", label: "Öğle molası", score: 90 },
      { time: "18–19", label: "Akşam molası", score: 95 },
      { time: "22–23", label: "Gece takılması", score: 80 },
    ],
  },
  en: {
    tabs: { viral: "Generate", trends: "Trends", bio: "Bio" },
    styles: { observational: "Observational", sarcastic: "Sarcastic", relatable: "Relatable", absurd: "Absurd", storytelling: "Story", hot_take: "Hot Take" },
    lengths: { short: { label: "Concise", desc: "1–2 lines" }, medium: { label: "Standard", desc: "3–4 lines" }, long: { label: "Extended", desc: "5–7 lines" } },
    voice: "Voice", length: "Length", topic: "Topic", topicOpt: "— optional",
    topicPh: "e.g: coffee, mondays, AI...",
    gen: "Generate Tweet", genIng: "Generating...", genBio: "Generate Bios",
    copy: "Copy", copied: "Copied", regen: "Regenerate", hist: "History",
    apiReq: "API Key Required", apiOk: "Connected", apiErr: "Please enter your API key",
    apiNote: "Get yours at console.anthropic.com",
    stratTitle: "Strategy Note", stratText: "Approach trends with humor. While everyone's serious, be the witty one — the fastest path to virality.",
    postWin: "Optimal Posting Windows", defSelf: "Define yourself",
    persPh: "e.g: developer, founder, cat enthusiast...",
    bioP: "Bio Principles",
    bioTips: ["Max 160 chars — every word earns its place", "Lead with your niche in the first 5 words", "One personality trait, stated boldly", "Emojis: 2–3 max, placed intentionally", "End with a soft CTA that feels natural"],
    now: "just now", sub: "viral content engine", show: "show", hide: "hide",
    postTimes: [
      { time: "08–09", label: "Morning commute", score: 85 },
      { time: "12–13", label: "Lunch break", score: 90 },
      { time: "18–19", label: "Evening wind-down", score: 95 },
      { time: "22–23", label: "Late night scroll", score: 80 },
    ],
  },
};

const STYLE_IDS = ["observational", "sarcastic", "relatable", "absurd", "storytelling", "hot_take"];
const STYLE_EMOJIS = { observational: "◎", sarcastic: "◆", relatable: "○", absurd: "◇", storytelling: "▷", hot_take: "△" };
const LENGTH_IDS = ["short", "medium", "long"];
const LANGUAGES = [{ id: "tr", label: "TR" }, { id: "en", label: "EN" }];

const TRENDS = {
  tr: [
    { tag: "#PazartesiSendromu", volume: "45.2K", category: "Yaşam", opportunity: 92 },
    { tag: "#TürkKahvesi", volume: "23.1K", category: "Kültür", opportunity: 68 },
    { tag: "#NetflixTürkiye", volume: "67.8K", category: "Eğlence", opportunity: 95 },
    { tag: "#İstanbul", volume: "120K", category: "Konum", opportunity: 85 },
    { tag: "#Teknoloji", volume: "34.5K", category: "Teknoloji", opportunity: 74 },
  ],
  en: [
    { tag: "#MondayMotivation", volume: "234K", category: "Lifestyle", opportunity: 88 },
    { tag: "#RelationshipGoals", volume: "89K", category: "Social", opportunity: 96 },
    { tag: "#TechTwitter", volume: "156K", category: "Tech", opportunity: 82 },
    { tag: "#Adulting", volume: "45K", category: "Humor", opportunity: 71 },
    { tag: "#FoodPorn", volume: "312K", category: "Food", opportunity: 97 },
  ],
};

/* ─── API Functions ─── */
async function generateTweetAI(style, lang, topic, length, apiKey) {
  const styleMap = { observational: "sharp daily life observations that catch details everyone misses", sarcastic: "witty, cutting-edge sarcasm that's clever not mean", relatable: "universal experiences everyone lives but nobody says out loud", absurd: "unexpected, surreal humor that surprises and delights", storytelling: "compelling mini-narratives with hooks and payoffs", hot_take: "bold, provocative opinions delivered with confidence" };
  const lengthMap = { short: "1-2 sentences, punchy (under 100 chars)", medium: "3-4 sentences, engaging (150-250 chars)", long: "5-7 sentences, story-like with line breaks (250-280 chars)" };
  const langName = lang === "tr" ? "Türkçe" : "English";
  const prompt = `You are an elite social media strategist. Style: ${styleMap[style]}. Length: ${lengthMap[length]}. Language: ${langName}. ${topic ? `Topic: ${topic}` : "Topic: choose something current"}. Rules: Output ONLY the tweet, no hashtags, max 2 emojis, natural voice, 280 char limit, no quotes or explanations.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) { const err = await response.json(); throw new Error(err.error?.message || "API error"); }
  const data = await response.json();
  return data.content[0].text.trim();
}

async function generateBioAI(lang, personality, apiKey) {
  const langName = lang === "tr" ? "Türkçe" : "English";
  const prompt = `You are a Twitter/X bio specialist. Language: ${langName}. ${personality ? `Personality: ${personality}` : "General creative profile"}. Write exactly 4 bios, each max 160 chars, numbered 1-4, witty and follow-worthy, use | separator, emojis sparingly, no extra text.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 400, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) { const err = await response.json(); throw new Error(err.error?.message || "API error"); }
  const data = await response.json();
  return data.content[0].text.trim().split("\n").map(l => l.replace(/^\d+[\.\)]\s*/, "").trim()).filter(l => l.length > 5).slice(0, 4);
}

/* ─── Design Tokens ─── */
const c = { bg: "#0B0B0F", sf: "rgba(255,255,255,0.03)", bd: "rgba(255,255,255,0.06)", ba: "rgba(200,170,130,0.4)", ac: "#C8AA82", ad: "rgba(200,170,130,0.15)", tx: "rgba(255,255,255,0.9)", tm: "rgba(255,255,255,0.4)", tf: "rgba(255,255,255,0.2)", er: "#D4645C", ok: "#7CAE7A" };
const f = { d: "'Playfair Display', Georgia, serif", b: "'DM Sans', -apple-system, sans-serif", m: "'JetBrains Mono', 'Fira Code', monospace" };

/* ─── Components ─── */
function GrainOverlay() {
  return (
    <>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.035, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse at 30% 0%, rgba(200,170,130,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 100%, rgba(200,170,130,0.03) 0%, transparent 50%)` }} />
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 20px rgba(200,170,130,0.1) } 50% { box-shadow: 0 0 40px rgba(200,170,130,0.2) } }
      `}</style>
    </>
  );
}

function ApiKeyInput({ apiKey, setApiKey, lang }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const t = T[lang];
  return (
    <div style={{ padding: "16px 18px", borderRadius: "14px", background: c.sf, border: `1px solid ${focused ? c.ba : c.bd}`, marginBottom: "24px", transition: "border-color 0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: apiKey ? c.ok : c.ac, transition: "background 0.3s" }} />
        <span style={{ color: c.tm, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2.5px", fontFamily: f.b }}>{apiKey ? t.apiOk : t.apiReq}</span>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input type={show ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="sk-ant-api03-..." style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: `1px solid ${c.bd}`, background: "rgba(0,0,0,0.2)", color: c.tx, fontSize: "12px", outline: "none", fontFamily: f.m, boxSizing: "border-box" }} />
        <button onClick={() => setShow(!show)} style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${c.bd}`, background: "transparent", color: c.tm, cursor: "pointer", fontSize: "11px", fontFamily: f.b }}>{show ? t.hide : t.show}</button>
      </div>
      <p style={{ color: c.tf, fontSize: "10px", marginTop: "6px", marginBottom: 0, fontFamily: f.b }}>{t.apiNote}</p>
    </div>
  );
}

function ViralTab({ apiKey, lang }) {
  const [style, setStyle] = useState("observational");
  const [length, setLength] = useState("medium");
  const [topic, setTopic] = useState("");
  const [tweet, setTweet] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const t = T[lang];

  const generate = async () => {
    if (!apiKey) { setError(t.apiErr); return; }
    setLoading(true); setCopied(false); setError("");
    try {
      const tw = await generateTweetAI(style, lang, topic, length, apiKey);
      setTweet(tw);
      setHistory(prev => [{ text: tw, style, time: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en", { hour: "2-digit", minute: "2-digit" }) }, ...prev].slice(0, 10));
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const copyTweet = () => { navigator.clipboard.writeText(tweet).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Styles */}
      <div>
        <p style={{ color: c.tm, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "12px", fontFamily: f.b }}>{t.voice}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
          {STYLE_IDS.map(id => (
            <button key={id} onClick={() => setStyle(id)} style={{ padding: "14px 8px", borderRadius: "10px", border: `1px solid ${style === id ? c.ba : c.bd}`, background: style === id ? c.ad : c.sf, color: style === id ? c.ac : c.tm, cursor: "pointer", textAlign: "center", transition: "all 0.25s", fontFamily: f.b }}>
              <div style={{ fontSize: "16px", marginBottom: "4px", fontFamily: f.d }}>{STYLE_EMOJIS[id]}</div>
              <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px" }}>{t.styles[id]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Lengths */}
      <div>
        <p style={{ color: c.tm, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "12px", fontFamily: f.b }}>{t.length}</p>
        <div style={{ display: "flex", gap: "6px" }}>
          {LENGTH_IDS.map(id => (
            <button key={id} onClick={() => setLength(id)} style={{ flex: 1, padding: "12px 8px", borderRadius: "10px", border: `1px solid ${length === id ? c.ba : c.bd}`, background: length === id ? c.ad : c.sf, color: length === id ? c.ac : c.tm, cursor: "pointer", textAlign: "center", transition: "all 0.25s", fontFamily: f.b }}>
              <div style={{ fontSize: "11px", fontWeight: 600 }}>{t.lengths[id].label}</div>
              <div style={{ fontSize: "9px", opacity: 0.5, marginTop: "3px" }}>{t.lengths[id].desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
      <div>
        <p style={{ color: c.tm, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "10px", fontFamily: f.b }}>{t.topic} <span style={{ fontWeight: 400, letterSpacing: "1px", opacity: 0.5 }}>{t.topicOpt}</span></p>
        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder={t.topicPh} style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", border: `1px solid ${c.bd}`, background: "rgba(0,0,0,0.2)", color: c.tx, fontSize: "13px", outline: "none", fontFamily: f.b, boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = c.ba} onBlur={e => e.target.style.borderColor = c.bd} />
      </div>

      {/* Generate */}
      <button onClick={generate} disabled={loading} style={{ padding: "16px", borderRadius: "12px", border: "none", background: loading ? c.ad : `linear-gradient(135deg, ${c.ac}, #A08A6A)`, color: loading ? c.ac : "#0B0B0F", fontSize: "13px", fontWeight: 700, cursor: loading ? "wait" : "pointer", transition: "all 0.3s", fontFamily: f.b, letterSpacing: "1px", textTransform: "uppercase", animation: loading ? "none" : "pulseGlow 3s ease-in-out infinite" }}>
        {loading ? t.genIng : t.gen}
      </button>

      {error && <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(212,100,92,0.08)", border: "1px solid rgba(212,100,92,0.2)" }}><p style={{ color: c.er, fontSize: "12px", margin: 0, fontFamily: f.b }}>{error}</p></div>}

      {/* Tweet Display */}
      {tweet && (
        <div style={{ padding: "22px", borderRadius: "14px", background: c.sf, border: `1px solid ${c.bd}`, animation: "fadeUp 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(135deg, ${c.ac}, #A08A6A)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "12px", color: "#0B0B0F", fontWeight: 700, fontFamily: f.d }}>tF</span>
            </div>
            <div>
              <div style={{ color: c.tx, fontWeight: 600, fontSize: "12px", fontFamily: f.b }}>@your_handle</div>
              <div style={{ color: c.tf, fontSize: "10px", fontFamily: f.m }}>{t.now}</div>
            </div>
          </div>
          <p style={{ color: c.tx, fontSize: "15px", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line", fontFamily: f.b }}>{tweet}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px", paddingTop: "14px", borderTop: `1px solid ${c.bd}` }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={copyTweet} style={{ padding: "7px 14px", borderRadius: "6px", border: `1px solid ${c.bd}`, background: copied ? "rgba(124,174,122,0.1)" : "transparent", color: copied ? c.ok : c.tm, cursor: "pointer", fontSize: "11px", fontFamily: f.b, fontWeight: 500, transition: "all 0.3s" }}>{copied ? t.copied : t.copy}</button>
              <button onClick={generate} disabled={loading} style={{ padding: "7px 14px", borderRadius: "6px", border: `1px solid ${c.bd}`, background: "transparent", color: c.tm, cursor: loading ? "wait" : "pointer", fontSize: "11px", fontFamily: f.b, fontWeight: 500 }}>{t.regen}</button>
            </div>
            <span style={{ fontSize: "10px", fontFamily: f.m, color: tweet.length > 280 ? c.er : c.tf }}>{tweet.length}/280</span>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p style={{ color: c.tf, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "10px", fontFamily: f.b }}>{t.hist}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {history.slice(0, 5).map((h, i) => (
              <div key={i} onClick={() => { setTweet(h.text); navigator.clipboard.writeText(h.text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} style={{ padding: "10px 14px", borderRadius: "8px", background: c.sf, border: `1px solid ${c.bd}`, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = c.ba} onMouseLeave={e => e.currentTarget.style.borderColor = c.bd}>
                <p style={{ color: c.tm, fontSize: "11px", margin: 0, lineHeight: 1.4, fontFamily: f.b, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.text}</p>
                <span style={{ color: c.tf, fontSize: "9px", fontFamily: f.m }}>{h.time} · {t.styles[h.style]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TrendsTab({ lang }) {
  const t = T[lang];
  const trends = TRENDS[lang];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ padding: "16px 18px", borderRadius: "12px", background: c.ad, border: `1px solid ${c.ba}` }}>
        <p style={{ color: c.ac, fontSize: "11px", fontWeight: 600, margin: "0 0 4px", fontFamily: f.b, letterSpacing: "0.5px" }}>{t.stratTitle}</p>
        <p style={{ color: c.tm, fontSize: "12px", margin: 0, lineHeight: 1.6, fontFamily: f.b }}>{t.stratText}</p>
      </div>

      {trends.map((tr, i) => (
        <div key={i} style={{ padding: "16px 18px", borderRadius: "12px", background: c.sf, border: `1px solid ${c.bd}`, display: "flex", alignItems: "center", justifyContent: "space-between", animation: `fadeUp 0.4s ease ${i * 0.06}s both`, transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = c.ba} onMouseLeave={e => e.currentTarget.style.borderColor = c.bd}>
          <div>
            <div style={{ color: c.tx, fontWeight: 600, fontSize: "14px", fontFamily: f.b, marginBottom: "2px" }}>{tr.tag}</div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ color: c.tf, fontSize: "10px", fontFamily: f.m }}>{tr.volume}</span>
              <span style={{ color: c.tf, fontSize: "10px" }}>·</span>
              <span style={{ color: c.tm, fontSize: "10px", fontFamily: f.b }}>{tr.category}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "40px", height: "3px", borderRadius: "2px", background: c.bd, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "2px", width: `${tr.opportunity}%`, background: tr.opportunity > 90 ? c.ok : tr.opportunity > 75 ? c.ac : c.tm, transition: "width 1s ease" }} />
            </div>
            <span style={{ color: tr.opportunity > 90 ? c.ok : tr.opportunity > 75 ? c.ac : c.tm, fontSize: "10px", fontFamily: f.m, fontWeight: 600, minWidth: "28px", textAlign: "right" }}>{tr.opportunity}%</span>
          </div>
        </div>
      ))}

      <div style={{ padding: "16px 18px", borderRadius: "12px", background: c.sf, border: `1px solid ${c.bd}` }}>
        <p style={{ color: c.tf, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "14px", fontFamily: f.b }}>{t.postWin}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {t.postTimes.map((slot, i) => (
            <div key={i} style={{ padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ color: c.tx, fontSize: "13px", fontWeight: 600, fontFamily: f.m }}>{slot.time}</div>
              <div style={{ color: c.tf, fontSize: "10px", fontFamily: f.b, marginBottom: "6px" }}>{slot.label}</div>
              <div style={{ height: "2px", borderRadius: "1px", background: c.bd }}>
                <div style={{ height: "100%", borderRadius: "1px", width: `${slot.score}%`, background: `linear-gradient(90deg, ${c.ac}, #A08A6A)`, transition: "width 1.5s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BioTab({ apiKey, lang }) {
  const [personality, setPersonality] = useState("");
  const [bios, setBios] = useState([]);
  const [copied, setCopied] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const t = T[lang];

  const generateBios = async () => {
    if (!apiKey) { setError(t.apiErr); return; }
    setLoading(true); setError("");
    try { setBios(await generateBioAI(lang, personality, apiKey)); } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const copyBio = (i, text) => { navigator.clipboard.writeText(text).then(() => { setCopied(i); setTimeout(() => setCopied(-1), 2000); }); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <p style={{ color: c.tm, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "10px", fontFamily: f.b }}>{t.defSelf}</p>
        <input type="text" value={personality} onChange={e => setPersonality(e.target.value)} placeholder={t.persPh} style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", border: `1px solid ${c.bd}`, background: "rgba(0,0,0,0.2)", color: c.tx, fontSize: "13px", outline: "none", fontFamily: f.b, boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = c.ba} onBlur={e => e.target.style.borderColor = c.bd} />
      </div>

      <button onClick={generateBios} disabled={loading} style={{ padding: "16px", borderRadius: "12px", border: "none", background: loading ? c.ad : `linear-gradient(135deg, ${c.ac}, #A08A6A)`, color: loading ? c.ac : "#0B0B0F", fontSize: "13px", fontWeight: 700, cursor: loading ? "wait" : "pointer", fontFamily: f.b, letterSpacing: "1px", textTransform: "uppercase", transition: "all 0.3s" }}>
        {loading ? t.genIng : t.genBio}
      </button>

      {error && <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(212,100,92,0.08)", border: "1px solid rgba(212,100,92,0.2)" }}><p style={{ color: c.er, fontSize: "12px", margin: 0, fontFamily: f.b }}>{error}</p></div>}

      {bios.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {bios.map((b, i) => (
            <div key={i} style={{ padding: "14px 16px", borderRadius: "10px", background: c.sf, border: `1px solid ${c.bd}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", animation: `fadeUp 0.4s ease ${i * 0.06}s both`, transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = c.ba} onMouseLeave={e => e.currentTarget.style.borderColor = c.bd}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", margin: 0, lineHeight: 1.5, fontFamily: f.b, flex: 1 }}>{b}</p>
              <button onClick={() => copyBio(i, b)} style={{ padding: "6px 12px", borderRadius: "6px", border: `1px solid ${c.bd}`, background: copied === i ? "rgba(124,174,122,0.1)" : "transparent", color: copied === i ? c.ok : c.tf, cursor: "pointer", fontSize: "10px", fontFamily: f.b, fontWeight: 500, whiteSpace: "nowrap", transition: "all 0.3s" }}>{copied === i ? t.copied : t.copy}</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "16px 18px", borderRadius: "12px", background: c.sf, border: `1px solid ${c.bd}` }}>
        <p style={{ color: c.tf, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "12px", fontFamily: f.b }}>{t.bioP}</p>
        {t.bioTips.map((tip, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
            <span style={{ color: c.ac, fontSize: "6px", marginTop: "6px", flexShrink: 0 }}>●</span>
            <span style={{ color: c.tm, fontSize: "12px", lineHeight: 1.6, fontFamily: f.b }}>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("viral");
  const [apiKey, setApiKey] = useState("");
  const [lang, setLang] = useState("tr");
  const t = T[lang];

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.tx, position: "relative", fontFamily: f.b }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <GrainOverlay />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "480px", margin: "0 auto", padding: "28px 20px 100px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
            <span style={{ fontSize: "36px", fontWeight: 800, color: c.ac, fontFamily: f.d, letterSpacing: "-1px" }}>tF</span>
            <span style={{ fontSize: "14px", fontWeight: 300, color: c.tm, fontFamily: f.b, letterSpacing: "3px", textTransform: "uppercase", marginLeft: "4px" }}>AI</span>
          </div>
          <div style={{ width: "40px", height: "1px", background: `linear-gradient(90deg, transparent, ${c.ac}, transparent)`, margin: "0 auto 8px" }} />
          <p style={{ color: c.tf, fontSize: "11px", margin: 0, fontFamily: f.m, letterSpacing: "2px" }}>{t.sub}</p>
        </div>

        {/* Language Toggle - Global */}
        <div style={{ display: "flex", gap: "4px", justifyContent: "center", marginBottom: "20px" }}>
          {LANGUAGES.map(l => (
            <button key={l.id} onClick={() => setLang(l.id)} style={{ padding: "6px 20px", borderRadius: "6px", border: `1px solid ${lang === l.id ? c.ba : c.bd}`, background: lang === l.id ? c.ad : "transparent", color: lang === l.id ? c.ac : c.tm, cursor: "pointer", fontSize: "11px", fontWeight: 600, letterSpacing: "1.5px", fontFamily: f.b, transition: "all 0.3s" }}>
              {l.label}
            </button>
          ))}
        </div>

        <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} lang={lang} />

        <div style={{ marginBottom: "20px" }}>
          {activeTab === "viral" && <ViralTab apiKey={apiKey} lang={lang} />}
          {activeTab === "trends" && <TrendsTab lang={lang} />}
          {activeTab === "bio" && <BioTab apiKey={apiKey} lang={lang} />}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(11,11,15,0.95)", backdropFilter: "blur(24px)", borderTop: `1px solid ${c.bd}`, padding: "6px 0 8px", zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "4px", maxWidth: "480px", margin: "0 auto", padding: "0 20px" }}>
          {[{ id: "viral", icon: "⚡" }, { id: "trends", icon: "◉" }, { id: "bio", icon: "◈" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: "10px 0", borderRadius: "8px", border: "none", background: activeTab === tab.id ? c.ad : "transparent", color: activeTab === tab.id ? c.ac : c.tf, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", transition: "all 0.25s" }}>
              <span style={{ fontSize: "14px", fontFamily: f.d }}>{tab.icon}</span>
              <span style={{ fontSize: "9px", fontWeight: 600, fontFamily: f.b, letterSpacing: "1.5px", textTransform: "uppercase" }}>{t.tabs[tab.id]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
