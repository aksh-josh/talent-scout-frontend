import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import {
  Search, ChevronDown, ChevronUp, Clock, MapPin, Wifi,
  CheckCircle, AlertCircle, XCircle, Loader2,
  BarChart2, ArrowRight, Upload, FileText, X, Download,
  TrendingUp, Users, Target, MessageSquare, Sun, Moon,
  Zap, Star, Award, Eye
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "";

// ── Theme System ───────────────────────────────────────────────────────────
const themes = {
  dark: {
    bg: "#0a0f1e",
    bgCard: "#111827",
    bgInput: "#0d1424",
    bgHover: "#1a2235",
    border: "#1f2d45",
    borderAccent: "#2563eb",
    text: "#f1f5f9",
    textMuted: "#64748b",
    textSub: "#94a3b8",
    accent: "#3b82f6",
    accentGreen: "#22c55e",
    accentAmber: "#f59e0b",
    accentRed: "#ef4444",
    navBg: "rgba(10,15,30,0.95)",
    shadow: "0 4px 24px rgba(0,0,0,0.4)",
    scoreTrack: "#1e2a3a",
    tagBg: "#1e3a5f",
    tagText: "#60a5fa",
    successBg: "#0d2b1a",
    successBorder: "#16a34a",
    successText: "#4ade80",
  },
  light: {
    bg: "#f8fafc",
    bgCard: "#ffffff",
    bgInput: "#f1f5f9",
    bgHover: "#e2e8f0",
    border: "#e2e8f0",
    borderAccent: "#2563eb",
    text: "#0f172a",
    textMuted: "#64748b",
    textSub: "#475569",
    accent: "#2563eb",
    accentGreen: "#16a34a",
    accentAmber: "#d97706",
    accentRed: "#dc2626",
    navBg: "rgba(248,250,252,0.95)",
    shadow: "0 4px 24px rgba(0,0,0,0.08)",
    scoreTrack: "#e2e8f0",
    tagBg: "#dbeafe",
    tagText: "#1d4ed8",
    successBg: "#f0fdf4",
    successBorder: "#86efac",
    successText: "#16a34a",
  }
};

// ── Score Ring ─────────────────────────────────────────────────────────────
function ScoreRing({ value, color, size = 56, label, t }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(value ?? 0, 100)) / 100;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <div style={{ position:"relative", width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.scoreTrack} strokeWidth={5}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 1s ease"}}/>
        </svg>
        <div style={{
          position:"absolute", inset:0, display:"flex", alignItems:"center",
          justifyContent:"center", color, fontWeight:700, fontSize:size>50?13:10
        }}>
          {value != null ? Math.round(value) : "—"}
        </div>
      </div>
      {label && <span style={{fontSize:9,color:t.textMuted,letterSpacing:1,textTransform:"uppercase"}}>{label}</span>}
    </div>
  );
}

// ── Recommendation Badge ───────────────────────────────────────────────────
function Badge({ label, t }) {
  const configs = {
    "strong yes": { bg:t.successBg, border:t.successBorder, text:t.successText, icon:<Award size={11}/> },
    yes: { bg:t.tagBg, border:t.borderAccent, text:t.tagText, icon:<CheckCircle size={11}/> },
    maybe: { bg:"#fefce8", border:"#fde047", text:"#ca8a04", icon:<AlertCircle size={11}/> },
    no: { bg:"#fef2f2", border:"#fca5a5", text:"#dc2626", icon:<XCircle size={11}/> },
  };
  if (t === themes.dark) {
    configs.maybe = { bg:"#1c1a0d", border:"#ca8a04", text:"#fbbf24", icon:<AlertCircle size={11}/> };
    configs.no = { bg:"#2b0d0d", border:"#dc2626", text:"#f87171", icon:<XCircle size={11}/> };
  }
  const s = configs[label?.toLowerCase()] || configs.maybe;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      background:s.bg, border:`1px solid ${s.border}`, color:s.text,
      borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:700
    }}>
      {s.icon}{label?.toUpperCase()}
    </span>
  );
}

// ── Skill Pill ─────────────────────────────────────────────────────────────
function SkillPill({ skill, highlighted, t }) {
  return (
    <span style={{
      display:"inline-block",
      background: highlighted ? t.successBg : t.bgInput,
      border:`1px solid ${highlighted ? t.successBorder : t.border}`,
      color: highlighted ? t.successText : t.textMuted,
      borderRadius:6, padding:"2px 8px", fontSize:11, marginRight:4, marginBottom:4,
      fontWeight: highlighted ? 600 : 400
    }}>
      {highlighted && "✓ "}{skill}
    </span>
  );
}

// ── Conversation Panel ─────────────────────────────────────────────────────
function ConversationPanel({ turns, t }) {
  if (!turns?.length) return null;
  const labels = { opening:"Opening", alignment:"Role Fit" };
  return (
    <div style={{marginTop:12}}>
      <p style={{color:t.textMuted,fontSize:10,letterSpacing:1,textTransform:"uppercase",marginBottom:10,fontWeight:600}}>
        Simulated Outreach Conversation
      </p>
      {turns.map((turn, i) => (
        <div key={i} style={{marginBottom:14}}>
          <div style={{fontSize:9,color:t.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:5,fontWeight:600}}>
            {labels[turn.turn] || turn.turn}
          </div>
          <div style={{
            background: t === themes.dark ? "#0d1f3a" : "#eff6ff",
            border:`1px solid ${t === themes.dark ? "#1e3a5f" : "#bfdbfe"}`,
            borderRadius:"12px 12px 12px 2px", padding:"10px 14px", marginBottom:5
          }}>
            <p style={{fontSize:10,color:t.accent,marginBottom:3,fontWeight:700}}>RECRUITER</p>
            <p style={{fontSize:12,color:t.textSub,lineHeight:1.6}}>{turn.recruiter}</p>
          </div>
          <div style={{
            background: t === themes.dark ? "#0d2b1a" : "#f0fdf4",
            border:`1px solid ${t === themes.dark ? "#16a34a" : "#bbf7d0"}`,
            borderRadius:"12px 12px 2px 12px", padding:"10px 14px", marginLeft:20
          }}>
            <p style={{fontSize:10,color:t.accentGreen,marginBottom:3,fontWeight:700}}>CANDIDATE</p>
            <p style={{fontSize:12,color:t.textSub,lineHeight:1.6}}>{turn.candidate}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Candidate Card ─────────────────────────────────────────────────────────
function CandidateCard({ c, rank, requiredSkills, t }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const required = new Set((requiredSkills||[]).map(s=>s.toLowerCase()));
  const hasOutreach = c.conversation?.length > 0;
  const isTop = rank === 1;

  return (
    <div style={{
      background: t.bgCard,
      border: `1px solid ${isTop ? t.accent : t.border}`,
      borderRadius:14, overflow:"hidden", marginBottom:10,
      boxShadow: isTop ? `0 0 0 1px ${t.accent}22, ${t.shadow}` : t.shadow,
      transition:"all 0.2s"
    }}>
      {isTop && (
        <div style={{
          background:`linear-gradient(90deg, ${t.accent}22, transparent)`,
          padding:"6px 18px", borderBottom:`1px solid ${t.border}`,
          display:"flex", alignItems:"center", gap:6
        }}>
          <Star size={11} color={t.accentAmber} fill={t.accentAmber}/>
          <span style={{fontSize:10,color:t.accentAmber,fontWeight:700,letterSpacing:1}}>TOP MATCH</span>
        </div>
      )}

      <div style={{padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}
        onClick={()=>setOpen(o=>!o)}>
        <div style={{
          width:32,height:32,borderRadius:"50%",flexShrink:0,
          background: rank<=3 ? t.accent+"22" : t.bgInput,
          border:`1.5px solid ${rank<=3 ? t.accent : t.border}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          color:rank<=3?t.accent:t.textMuted, fontWeight:700, fontSize:12
        }}>{rank}</div>

        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
            <span style={{color:t.text,fontWeight:700,fontSize:14}}>{c.name}</span>
            {c.recommendation && <Badge label={c.recommendation} t={t}/>}
          </div>
          <div style={{color:t.textMuted,fontSize:11}}>
            {c.title} · {c.experience_years}y · {c.location}
            {c.open_to_remote && (
              <span style={{color:t.accent,marginLeft:8,fontSize:10,fontWeight:600}}>· Remote OK</span>
            )}
          </div>
        </div>

        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <ScoreRing value={c.match_score} color={t.accent} size={50} label="Match" t={t}/>
          {c.interest_score != null && <ScoreRing value={c.interest_score} color={t.accentGreen} size={50} label="Interest" t={t}/>}
          {c.combined_score != null && <ScoreRing value={c.combined_score} color={t.accentAmber} size={50} label="Combined" t={t}/>}
        </div>

        {open
          ? <ChevronUp size={14} color={t.textMuted}/>
          : <ChevronDown size={14} color={t.textMuted}/>
        }
      </div>

      {open && (
        <div style={{borderTop:`1px solid ${t.border}`,padding:"14px 18px"}}>
          <div style={{display:"flex",gap:4,marginBottom:14,flexWrap:"wrap"}}>
            {["overview","skills",...(hasOutreach?["conversation","analysis"]:[])].map(tabName=>(
              <button key={tabName} onClick={()=>setTab(tabName)} style={{
                padding:"5px 14px", borderRadius:8, border:`1px solid ${tab===tabName?t.accent:t.border}`,
                cursor:"pointer", fontSize:11, fontWeight:600, textTransform:"capitalize",
                background: tab===tabName ? t.accent+"18" : "transparent",
                color: tab===tabName ? t.accent : t.textMuted,
                transition:"all 0.15s"
              }}>{tabName}</button>
            ))}
          </div>

          {tab==="overview" && (
            <div>
              <p style={{color:t.textSub,fontSize:12,lineHeight:1.7,marginBottom:12}}>{c.summary}</p>
              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:12}}>
                {[
                  {icon:<Clock size={11}/>, text:c.availability},
                  {icon:<MapPin size={11}/>, text:c.location},
                  ...(c.open_to_remote?[{icon:<Wifi size={11}/>, text:"Open to remote", color:t.accent}]:[])
                ].map((item,i)=>(
                  <span key={i} style={{display:"flex",alignItems:"center",gap:5,color:item.color||t.textMuted,fontSize:11}}>
                    {item.icon}{item.text}
                  </span>
                ))}
              </div>
              {c.match_reasons?.length > 0 && (
                <div style={{background:t.bgInput,borderRadius:10,padding:12,border:`1px solid ${t.border}`}}>
                  <p style={{fontSize:10,color:t.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>
                    Why matched
                  </p>
                  {c.match_reasons.map((r,i)=>(
                    <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:5}}>
                      <ArrowRight size={10} color={t.accent} style={{marginTop:3,flexShrink:0}}/>
                      <span style={{color:t.textSub,fontSize:12}}>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab==="skills" && (
            <div>
              <p style={{fontSize:10,color:t.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Skills</p>
              <div>{c.skills?.map((s,i)=><SkillPill key={i} skill={s} highlighted={required.has(s.toLowerCase())} t={t}/>)}</div>
              {c.skill_overlap?.length > 0 && (
                <p style={{fontSize:11,color:t.accentGreen,marginTop:8,fontWeight:600}}>
                  ✓ {c.skill_overlap.length} of {requiredSkills?.length||0} required skills matched
                </p>
              )}
            </div>
          )}

          {tab==="conversation" && <ConversationPanel turns={c.conversation} t={t}/>}

          {tab==="analysis" && c.interest_analysis && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <div style={{background:t.successBg,border:`1px solid ${t.successBorder}`,borderRadius:10,padding:12}}>
                  <p style={{fontSize:10,color:t.accentGreen,marginBottom:8,fontWeight:700,letterSpacing:1}}>✓ POSITIVE SIGNALS</p>
                  {c.interest_analysis.positive_signals?.map((s,i)=>(
                    <p key={i} style={{color:t.successText,fontSize:11,marginBottom:4,lineHeight:1.4}}>· {s}</p>
                  ))}
                </div>
                <div style={{
                  background: t===themes.dark?"#1c1a0d":"#fffbeb",
                  border:`1px solid ${t===themes.dark?"#ca8a04":"#fde047"}`,
                  borderRadius:10,padding:12
                }}>
                  <p style={{fontSize:10,color:t.accentAmber,marginBottom:8,fontWeight:700,letterSpacing:1}}>⚠ CONCERNS</p>
                  {c.interest_analysis.concerns?.length > 0
                    ? c.interest_analysis.concerns.map((s,i)=>(
                        <p key={i} style={{color:t.accentAmber,fontSize:11,marginBottom:4,lineHeight:1.4}}>· {s}</p>
                      ))
                    : <p style={{color:t.textMuted,fontSize:11}}>No concerns raised</p>
                  }
                </div>
              </div>
              {c.interest_analysis.interest_reasoning && (
                <div style={{background:t.bgInput,borderRadius:10,padding:12,border:`1px solid ${t.border}`}}>
                  <p style={{fontSize:10,color:t.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>
                    AI Reasoning
                  </p>
                  <p style={{color:t.textSub,fontSize:12,lineHeight:1.6}}>{c.interest_analysis.interest_reasoning}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Export CSV ─────────────────────────────────────────────────────────────
function exportCSV(shortlist, jdTitle) {
  const rows = [
    ["Rank","Name","Title","Location","Experience","Match Score","Interest Score","Combined Score","Recommendation","Availability","Skills"],
    ...shortlist.map((c,i)=>[
      i+1, c.name, c.title, c.location, `${c.experience_years}y`,
      c.match_score, c.interest_score??"-", c.combined_score??c.match_score,
      c.recommendation??"-", c.availability,
      `"${c.skills?.join("; ")||""}"`
    ])
  ];
  const csv = rows.map(r=>r.join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `shortlist-${(jdTitle||"results").replace(/\s+/g,"-").toLowerCase()}.csv`;
  a.click();
}

// ── Pipeline Step Indicator ────────────────────────────────────────────────
const STEPS = [
  {icon:<Eye size={12}/>,         label:"Parsing Job Description"},
  {icon:<BarChart2 size={12}/>,   label:"Semantic candidate matching"},
  {icon:<MessageSquare size={12}/>,label:"Simulating conversations"},
  {icon:<TrendingUp size={12}/>,  label:"Scoring & ranking"},
];

function PipelineLoader({ step, t }) {
  return (
    <div style={{padding:"48px 0",textAlign:"center"}}>
      <div style={{
        width:56,height:56,borderRadius:16,
        background:`linear-gradient(135deg,${t.accent},${t.accentGreen})`,
        display:"flex",alignItems:"center",justifyContent:"center",
        margin:"0 auto 28px",
        boxShadow:`0 8px 24px ${t.accent}44`,
        animation:"pulse 2s ease-in-out infinite"
      }}>
        <Zap size={24} color="#fff"/>
      </div>
      <p style={{color:t.text,fontWeight:700,fontSize:15,marginBottom:24}}>
        Scouting candidates...
      </p>
      <div style={{maxWidth:300,margin:"0 auto"}}>
        {STEPS.map((s,i)=>(
          <div key={i} style={{
            display:"flex",alignItems:"center",gap:12,marginBottom:12,
            opacity:i<=step?1:0.25,transition:"opacity 0.4s"
          }}>
            <div style={{
              width:24,height:24,borderRadius:8,flexShrink:0,
              background:i<step?t.accentGreen+"22":i===step?t.accent+"22":t.bgInput,
              border:`1px solid ${i<step?t.accentGreen:i===step?t.accent:t.border}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:i<step?t.accentGreen:i===step?t.accent:t.textMuted
            }}>
              {i<step?<CheckCircle size={12}/>:s.icon}
            </div>
            <span style={{color:i===step?t.text:t.textMuted,fontSize:12,textAlign:"left",fontWeight:i===step?600:400}}>
              {s.label}
            </span>
            {i===step && (
              <Loader2 size={12} color={t.accent} style={{marginLeft:"auto",animation:"spin 1s linear infinite",flexShrink:0}}/>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sample JDs ─────────────────────────────────────────────────────────────
const SAMPLE_JDS = [
`Senior AI Engineer – Agentic Systems

We are looking for a Senior AI Engineer to build next-generation AI-powered automation features.

Responsibilities:
- Design and implement multi-agent AI systems using LangChain, LlamaIndex
- Build RAG pipelines and integrate vector databases (Pinecone, ChromaDB)
- Develop LLM-based workflows for enterprise use cases
- Write clean Python code with FastAPI

Requirements:
- 4+ years software engineering experience
- 2+ years hands-on with LLMs, RAG, or agent frameworks
- Strong Python skills; FastAPI preferred
- Experience with OpenAI API, Claude API, or HuggingFace
- Familiarity with vector databases

Nice to have: CrewAI, AutoGen, LangGraph, NLP background`,

`Frontend Lead – Consumer Product

Lead our frontend team building a world-class B2C product.

Responsibilities:
- Lead a team of 3 frontend engineers
- Define component library and design system
- Drive frontend architecture decisions
- Partner with design for high-quality UI

Requirements:
- 5+ years frontend engineering
- Deep React and TypeScript expertise
- Next.js, Tailwind CSS, performance optimization
- Experience leading engineers

Nice to have: Storybook, Figma, design systems`,

`Site Reliability Engineer

Join our platform team maintaining 99.99% uptime.

Responsibilities:
- Own incident response and postmortems
- Monitoring with Prometheus and Grafana
- Manage Kubernetes clusters on AWS
- Infrastructure as code with Terraform

Requirements:
- 3+ years DevOps or SRE experience
- Kubernetes and Docker expertise
- AWS (EKS, RDS, S3), Python scripting`
];

let sampleIdx = 0;

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? themes.dark : themes.light;

  const [jd, setJd] = useState("");
  const [topK, setTopK] = useState(10);
  const [outreachN, setOutreachN] = useState(3);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    document.body.style.background = t.bg;
    document.body.style.transition = "background 0.3s";
  }, [t.bg]);

  // ── File parsing ─────────────────────────────────────────────────────────
  const extractTextFromFile = useCallback(async (file) => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt") || name.endsWith(".md")) return await file.text();

    if (name.endsWith(".pdf")) {
      return new Promise((resolve, reject) => {
        const loadPdf = async () => {
          try {
            const pdfjsLib = window.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              text += content.items.map(item => item.str).join(" ") + "\n";
            }
            resolve(text.trim());
          } catch(e) { reject(new Error("Could not read PDF. Try pasting the text.")); }
        };
        if (window.pdfjsLib) { loadPdf(); return; }
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        s.onload = loadPdf;
        s.onerror = () => reject(new Error("PDF reader failed to load."));
        document.head.appendChild(s);
      });
    }

    if (name.endsWith(".docx") || name.endsWith(".doc")) {
      return new Promise((resolve, reject) => {
        const loadDocx = async () => {
          try {
            const result = await window.mammoth.extractRawText({arrayBuffer: await file.arrayBuffer()});
            resolve(result.value.trim());
          } catch(e) { reject(new Error("Could not read .docx. Try pasting the text.")); }
        };
        if (window.mammoth) { loadDocx(); return; }
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
        s.onload = loadDocx;
        s.onerror = () => reject(new Error("DOCX reader failed to load."));
        document.head.appendChild(s);
      });
    }
    throw new Error("Unsupported format. Use .txt, .pdf, or .docx");
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await extractTextFromFile(file);
      setJd(text);
      setError(null);
    } catch(e) {
      setError(e.message);
      setFileName(null);
    }
  }, [extractTextFromFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  // ── Analyze ──────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!jd.trim() || jd.length < 50) {
      setError("Please enter a job description (minimum 50 characters).");
      return;
    }
    setError(null); setResult(null); setLoading(true); setLoadStep(0);
    const t1 = setTimeout(()=>setLoadStep(1), 2500);
    const t2 = setTimeout(()=>setLoadStep(2), 6000);
    const t3 = setTimeout(()=>setLoadStep(3), 10000);
    try {
      const { data } = await axios.post(`${API_BASE}/analyze`, {
        jd_text: jd, top_k: topK, outreach_top_n: outreachN
      });
      setResult(data);
    } catch(e) {
      setError(e.response?.data?.detail || "Request failed. The backend may be starting up — try again in 30 seconds.");
    } finally {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      setLoading(false); setLoadStep(0);
    }
  }

  const avgMatch = result?.shortlist?.length
    ? Math.round(result.shortlist.reduce((a,c)=>a+(c.match_score||0),0)/result.shortlist.length)
    : null;
  const strongYes = result?.shortlist?.filter(c=>c.recommendation==="strong yes").length ?? 0;

  return (
    <div style={{minHeight:"100vh",background:t.bg,color:t.text,
      fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",transition:"all 0.3s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.8;transform:scale(0.97)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        textarea:focus,select:focus,input:focus{outline:none}
        button{transition:all 0.15s}
        button:hover{filter:brightness(1.08)}
        button:active{transform:scale(0.97)}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${t.border};border-radius:4px}
      `}</style>

      {/* Nav */}
      <nav style={{
        borderBottom:`1px solid ${t.border}`,padding:"14px 32px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background:t.navBg,backdropFilter:"blur(16px)",
        position:"sticky",top:0,zIndex:100,boxShadow:t.shadow
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            width:34,height:34,borderRadius:10,
            background:`linear-gradient(135deg,${t.accent},${t.accentGreen})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 4px 12px ${t.accent}44`
          }}>
            <Zap size={18} color="#fff"/>
          </div>
          <div>
            <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:18,letterSpacing:-0.5}}>
              TalentScout
            </span>
            <span style={{color:t.accent,fontWeight:700,fontSize:18}}> AI</span>
          </div>
        </div>

        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {result && (
            <button onClick={()=>exportCSV(result.shortlist,result.jd_parsed?.title)} style={{
              background:t.bgInput,border:`1px solid ${t.border}`,color:t.textMuted,
              borderRadius:8,padding:"6px 14px",fontSize:11,cursor:"pointer",
              display:"flex",alignItems:"center",gap:6,fontWeight:500
            }}>
              <Download size={12}/>Export CSV
            </button>
          )}
          <button onClick={()=>setIsDark(!isDark)} style={{
            background:t.bgInput,border:`1px solid ${t.border}`,
            borderRadius:8,padding:"6px 10px",cursor:"pointer",
            display:"flex",alignItems:"center",gap:6,color:t.textMuted,fontSize:11,fontWeight:500
          }}>
            {isDark ? <Sun size={14}/> : <Moon size={14}/>}
            {isDark ? "Light" : "Dark"}
          </button>
          <span style={{
            background:t.tagBg,border:`1px solid ${t.accent}44`,
            color:t.tagText,borderRadius:20,padding:"4px 14px",fontSize:10,fontWeight:700,letterSpacing:0.5
          }}>
            CATALYST · DECCAN AI
          </span>
        </div>
      </nav>

      <main style={{maxWidth:900,margin:"0 auto",padding:"36px 20px"}}>

        {/* Hero Section */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:8,
            background:t.tagBg,border:`1px solid ${t.accent}44`,
            borderRadius:20,padding:"5px 16px",marginBottom:18,
          }}>
            <div style={{
              width:7,height:7,borderRadius:"50%",background:t.accentGreen,
              animation:"pulse 2s infinite",boxShadow:`0 0 8px ${t.accentGreen}`
            }}/>
            <span style={{fontSize:11,color:t.tagText,fontWeight:600,letterSpacing:0.5}}>
              AI Agent · Live · 4 Models in Fallback Chain
            </span>
          </div>
          <h1 style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:40,fontWeight:700,lineHeight:1.15,
            letterSpacing:-1,marginBottom:12,color:t.text
          }}>
            AI-Powered Talent<br/>
            <span style={{
              background:`linear-gradient(135deg,${t.accent},${t.accentGreen})`,
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"
            }}>Scouting & Engagement</span>
          </h1>
          <p style={{color:t.textMuted,fontSize:14,maxWidth:520,margin:"0 auto",lineHeight:1.7}}>
            Paste or upload a Job Description — our AI agent discovers candidates,
            simulates recruiter conversations, and delivers a scored shortlist instantly.
          </p>
        </div>

        {/* Stats (when result available) */}
        {result && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24,animation:"fadeIn 0.4s ease"}}>
            {[
              {icon:<Users size={16}/>,label:"Scanned",value:result.total_candidates_scanned,color:t.accent},
              {icon:<Target size={16}/>,label:"Shortlisted",value:result.shortlist.length,color:t.accentGreen},
              {icon:<TrendingUp size={16}/>,label:"Avg Match",value:`${avgMatch}%`,color:t.accentAmber},
              {icon:<Award size={16}/>,label:"Strong Yes",value:strongYes,color:t.accentGreen},
            ].map((stat,i)=>(
              <div key={i} style={{
                background:t.bgCard,border:`1px solid ${t.border}`,
                borderRadius:12,padding:"16px",
                display:"flex",alignItems:"center",gap:12,boxShadow:t.shadow
              }}>
                <div style={{
                  width:36,height:36,borderRadius:10,
                  background:stat.color+"18",border:`1px solid ${stat.color}33`,
                  display:"flex",alignItems:"center",justifyContent:"center",color:stat.color
                }}>{stat.icon}</div>
                <div>
                  <div style={{color:stat.color,fontWeight:700,fontSize:20,lineHeight:1}}>{stat.value}</div>
                  <div style={{color:t.textMuted,fontSize:10,fontWeight:500,letterSpacing:0.5,textTransform:"uppercase",marginTop:2}}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Panel */}
        <div style={{
          background:t.bgCard,border:`1px solid ${t.border}`,
          borderRadius:16,padding:24,marginBottom:16,boxShadow:t.shadow
        }}>
          {/* Drop Zone */}
          <div
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={handleDrop}
            onClick={()=>fileRef.current.click()}
            style={{
              border:`2px dashed ${dragOver?t.accent:t.border}`,
              borderRadius:12,padding:"16px 20px",
              display:"flex",alignItems:"center",gap:12,
              cursor:"pointer",marginBottom:16,
              background:dragOver?t.accent+"08":"transparent",
              transition:"all 0.2s"
            }}>
            <input ref={fileRef} type="file" accept=".txt,.pdf,.md,.docx,.doc"
              style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
            <div style={{
              width:36,height:36,borderRadius:10,
              background:t.accent+"18",border:`1px solid ${t.accent}44`,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0
            }}>
              <Upload size={16} color={t.accent}/>
            </div>
            {fileName ? (
              <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
                <FileText size={14} color={t.accent}/>
                <span style={{color:t.accent,fontSize:13,fontWeight:500}}>{fileName}</span>
                <span style={{color:t.accentGreen,fontSize:11,marginLeft:4}}>· Loaded ✓</span>
                <button onClick={e=>{e.stopPropagation();setFileName(null);setJd("");}} style={{
                  background:"transparent",border:"none",cursor:"pointer",
                  color:t.textMuted,marginLeft:"auto",padding:4
                }}><X size={14}/></button>
              </div>
            ) : (
              <div>
                <p style={{color:t.textSub,fontSize:13,fontWeight:500}}>
                  Drop your JD file here, or <span style={{color:t.accent}}>click to browse</span>
                </p>
                <p style={{color:t.textMuted,fontSize:11,marginTop:2}}>
                  Supports .txt, .pdf, .docx — or paste text below
                </p>
              </div>
            )}
          </div>

          {/* Text Input */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <label style={{fontSize:11,color:t.textMuted,letterSpacing:0.5,textTransform:"uppercase",fontWeight:600}}>
              Job Description
            </label>
            <button
              onClick={()=>{setJd(SAMPLE_JDS[sampleIdx%SAMPLE_JDS.length]);sampleIdx++;setFileName(null)}}
              style={{
                background:t.tagBg,border:`1px solid ${t.accent}33`,color:t.tagText,
                borderRadius:6,padding:"3px 12px",fontSize:11,cursor:"pointer",fontWeight:500
              }}>
              Sample: {["AI Engineer","Frontend Lead","SRE"][sampleIdx%3]}
            </button>
          </div>
          <textarea
            value={jd} onChange={e=>setJd(e.target.value)}
            placeholder="Paste your job description here... Include role title, responsibilities, required skills, and experience requirements for best results."
            style={{
              width:"100%",minHeight:180,background:t.bgInput,
              border:`1px solid ${t.border}`,borderRadius:10,padding:14,
              color:t.text,fontSize:13,lineHeight:1.7,resize:"vertical",
              fontFamily:"inherit",transition:"border-color 0.2s"
            }}
            onFocus={e=>e.target.style.borderColor=t.accent}
            onBlur={e=>e.target.style.borderColor=t.border}
          />

          {/* Controls */}
          <div style={{display:"flex",gap:14,marginTop:16,flexWrap:"wrap",alignItems:"flex-end"}}>
            {[
              {label:"Candidates to retrieve",val:topK,set:setTopK,opts:[5,10,15,20]},
              {label:"Run outreach on top",val:outreachN,set:setOutreachN,opts:[1,2,3,5]},
            ].map((ctrl,i)=>(
              <div key={i}>
                <label style={{fontSize:10,color:t.textMuted,display:"block",marginBottom:5,fontWeight:500,letterSpacing:0.5,textTransform:"uppercase"}}>
                  {ctrl.label}
                </label>
                <select value={ctrl.val} onChange={e=>ctrl.set(Number(e.target.value))} style={{
                  background:t.bgInput,border:`1px solid ${t.border}`,color:t.text,
                  borderRadius:8,padding:"7px 12px",fontSize:13,fontFamily:"inherit",cursor:"pointer"
                }}>
                  {ctrl.opts.map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            ))}
            <button onClick={handleAnalyze} disabled={loading} style={{
              marginLeft:"auto",
              background:loading?t.bgInput:`linear-gradient(135deg,${t.accent},#1d4ed8)`,
              color:loading?t.textMuted:"#fff",
              border:`1px solid ${loading?t.border:t.accent}`,
              borderRadius:10,padding:"10px 28px",
              fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",
              display:"flex",alignItems:"center",gap:8,
              boxShadow:loading?"none":`0 4px 16px ${t.accent}44`
            }}>
              {loading
                ? <><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>Scouting...</>
                : <><Search size={14}/>Scout Candidates</>
              }
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background:t===themes.dark?"#2b0d0d":"#fef2f2",
            border:`1px solid ${t.accentRed}`,borderRadius:10,
            padding:"12px 16px",color:t.accentRed,fontSize:12,marginBottom:16,
            display:"flex",alignItems:"flex-start",gap:10,animation:"fadeIn 0.3s"
          }}>
            <XCircle size={15} style={{flexShrink:0,marginTop:1}}/>
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:16,boxShadow:t.shadow}}>
            <PipelineLoader step={loadStep} t={t}/>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{animation:"fadeIn 0.4s ease"}}>
            {/* JD Summary Card */}
            <div style={{
              background:t.bgCard,border:`1px solid ${t.border}`,
              borderRadius:14,padding:20,marginBottom:16,boxShadow:t.shadow
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                <div>
                  <p style={{fontSize:10,color:t.textMuted,letterSpacing:0.5,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>
                    Parsed Job Description
                  </p>
                  <p style={{color:t.text,fontWeight:700,fontSize:18,marginBottom:4}}>{result.jd_parsed.title}</p>
                  <p style={{color:t.textMuted,fontSize:12}}>
                    {result.jd_parsed.seniority} · {result.jd_parsed.role_type} · {result.jd_parsed.experience_years_min}–{result.jd_parsed.experience_years_max} years exp
                  </p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:12,color:t.textMuted}}>
                    <span style={{color:t.accent,fontWeight:700}}>{result.total_candidates_scanned}</span> scanned ·{" "}
                    <span style={{color:t.accentGreen,fontWeight:700}}>{result.outreach_conducted}</span> outreach run
                    {result.cached && <span style={{color:t.accentAmber,marginLeft:8,fontSize:10,fontWeight:600}}>⚡ CACHED</span>}
                  </p>
                </div>
              </div>
              <div style={{marginTop:12}}>
                {result.jd_parsed.required_skills?.map((s,i)=><SkillPill key={i} skill={s} highlighted t={t}/>)}
                {result.jd_parsed.nice_to_have_skills?.map((s,i)=><SkillPill key={i} skill={s} t={t}/>)}
              </div>
            </div>

            {/* Score Legend */}
            <div style={{display:"flex",gap:20,marginBottom:14,flexWrap:"wrap",padding:"0 2px"}}>
              {[
                {color:t.accent,label:"Match Score — semantic search + skill overlap + experience"},
                {color:t.accentGreen,label:"Interest Score — from simulated conversation analysis"},
                {color:t.accentAmber,label:"Combined Score — 55% match + 45% interest"},
              ].map((l,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:t.textMuted}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:l.color,flexShrink:0}}/>
                  {l.label}
                </div>
              ))}
            </div>

            {/* Candidate Cards */}
            {result.shortlist.map((c,i)=>(
              <CandidateCard
                key={c.id} c={c} rank={i+1}
                requiredSkills={result.jd_parsed.required_skills} t={t}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}