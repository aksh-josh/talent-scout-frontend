import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  Search, ChevronDown, ChevronUp, Clock, MapPin, Wifi,
  CheckCircle, AlertCircle, XCircle, Loader2, Zap,
  BarChart2, ArrowRight, Upload, FileText, X, Download,
  TrendingUp, Users, Target, MessageSquare
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "";

// ── Score Ring ─────────────────────────────────────────────────────────────
function ScoreRing({ value, color, size = 56, label }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(value ?? 0, 100)) / 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e2a3a" strokeWidth={6}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 0.8s ease"}}/>
        </svg>
        <div style={{
          position:"absolute", inset:0, display:"flex", alignItems:"center",
          justifyContent:"center", color, fontWeight:700, fontSize: size > 50 ? 14 : 11
        }}>
          {value != null ? Math.round(value) : "—"}
        </div>
      </div>
      {label && <span style={{fontSize:9,color:"#6b7280",letterSpacing:1,textTransform:"uppercase"}}>{label}</span>}
    </div>
  );
}

// ── Recommendation Badge ───────────────────────────────────────────────────
function Badge({ label }) {
  const map = {
    "strong yes": { bg:"#0d2b1a", border:"#16a34a", text:"#4ade80", icon:<CheckCircle size={11}/> },
    yes: { bg:"#0d1f2b", border:"#0ea5e9", text:"#38bdf8", icon:<CheckCircle size={11}/> },
    maybe: { bg:"#1c1a0d", border:"#ca8a04", text:"#fbbf24", icon:<AlertCircle size={11}/> },
    no: { bg:"#2b0d0d", border:"#dc2626", text:"#f87171", icon:<XCircle size={11}/> },
  };
  const s = map[label?.toLowerCase()] || map.maybe;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      background:s.bg, border:`1px solid ${s.border}`, color:s.text,
      borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:700
    }}>
      {s.icon} {label?.toUpperCase()}
    </span>
  );
}

// ── Skill Pill ─────────────────────────────────────────────────────────────
function SkillPill({ skill, highlighted }) {
  return (
    <span style={{
      display:"inline-block",
      background: highlighted ? "#0d2b1a" : "#0f172a",
      border:`1px solid ${highlighted ? "#16a34a" : "#1e2a3a"}`,
      color: highlighted ? "#4ade80" : "#64748b",
      borderRadius:6, padding:"2px 8px", fontSize:11, marginRight:4, marginBottom:4
    }}>
      {highlighted && "✓ "}{skill}
    </span>
  );
}

// ── Conversation Panel ─────────────────────────────────────────────────────
function ConversationPanel({ turns }) {
  if (!turns?.length) return null;
  const labels = { opening:"Opening", alignment:"Role Fit", motivation:"Motivation", logistics:"Logistics" };
  return (
    <div style={{marginTop:12}}>
      <p style={{color:"#4b5563",fontSize:10,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>
        Simulated Outreach Conversation
      </p>
      {turns.map((t,i) => (
        <div key={i} style={{marginBottom:12}}>
          <div style={{fontSize:9,color:"#374151",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>
            — {labels[t.turn]||t.turn}
          </div>
          <div style={{background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:8,padding:"8px 12px",marginBottom:4}}>
            <p style={{fontSize:10,color:"#60a5fa",marginBottom:2,fontWeight:700}}>RECRUITER</p>
            <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{t.recruiter}</p>
          </div>
          <div style={{background:"#0a1628",border:"1px solid #1e3a2a",borderRadius:8,padding:"8px 12px",marginLeft:16}}>
            <p style={{fontSize:10,color:"#4ade80",marginBottom:2,fontWeight:700}}>CANDIDATE</p>
            <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{t.candidate}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Candidate Card ─────────────────────────────────────────────────────────
function CandidateCard({ c, rank, requiredSkills }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const required = new Set((requiredSkills||[]).map(s=>s.toLowerCase()));
  const hasOutreach = c.conversation?.length > 0;

  return (
    <div style={{
      background:"#0b1221", border:`1px solid ${rank<=3?"#1e3a5f":"#1e2a3a"}`,
      borderRadius:12, overflow:"hidden", marginBottom:8,
      transition:"all 0.2s", boxShadow: rank===1?"0 0 20px rgba(96,165,250,0.1)":""
    }}>
      <div style={{padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}
        onClick={()=>setOpen(o=>!o)}>
        <div style={{
          width:30,height:30,borderRadius:"50%",flexShrink:0,
          background: rank<=3?"#0d2b1a":"#111827",
          border:`1px solid ${rank===1?"#16a34a":rank<=3?"#0ea5e9":"#1f2937"}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          color:rank===1?"#4ade80":rank<=3?"#38bdf8":"#6b7280",
          fontWeight:700,fontSize:12
        }}>{rank}</div>

        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{color:"#f1f5f9",fontWeight:600,fontSize:14}}>{c.name}</span>
            {c.recommendation && <Badge label={c.recommendation}/>}
          </div>
          <div style={{color:"#475569",fontSize:11,marginTop:2}}>
            {c.title} · {c.experience_years}y · {c.location}
            {c.open_to_remote && <span style={{color:"#0ea5e9",marginLeft:8}}>· Remote OK</span>}
          </div>
        </div>

        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <ScoreRing value={c.match_score} color="#60a5fa" size={48} label="Match"/>
          {c.interest_score!=null && <ScoreRing value={c.interest_score} color="#4ade80" size={48} label="Interest"/>}
          {c.combined_score!=null && <ScoreRing value={c.combined_score} color="#f59e0b" size={48} label="Combined"/>}
        </div>

        {open ? <ChevronUp size={14} color="#4b5563"/> : <ChevronDown size={14} color="#4b5563"/>}
      </div>

      {open && (
        <div style={{borderTop:"1px solid #1e2a3a",padding:"14px 18px"}}>
          <div style={{display:"flex",gap:4,marginBottom:14,flexWrap:"wrap"}}>
            {["overview","skills",...(hasOutreach?["conversation","analysis"]:[])].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:"4px 12px",borderRadius:6,border:"none",cursor:"pointer",
                fontSize:11,fontWeight:600,textTransform:"capitalize",
                background:tab===t?"#1e3a5f":"transparent",
                color:tab===t?"#60a5fa":"#4b5563"
              }}>{t}</button>
            ))}
          </div>

          {tab==="overview" && (
            <div>
              <p style={{color:"#64748b",fontSize:12,lineHeight:1.6,marginBottom:10}}>{c.summary}</p>
              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:10}}>
                <span style={{display:"flex",alignItems:"center",gap:5,color:"#475569",fontSize:11}}>
                  <Clock size={11}/>{c.availability}
                </span>
                <span style={{display:"flex",alignItems:"center",gap:5,color:"#475569",fontSize:11}}>
                  <MapPin size={11}/>{c.location}
                </span>
                {c.open_to_remote && (
                  <span style={{display:"flex",alignItems:"center",gap:5,color:"#0ea5e9",fontSize:11}}>
                    <Wifi size={11}/>Open to remote
                  </span>
                )}
              </div>
              {c.match_reasons?.length>0 && (
                <div style={{background:"#060d18",borderRadius:8,padding:10,border:"1px solid #1e2a3a"}}>
                  <p style={{fontSize:10,color:"#374151",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Why matched</p>
                  {c.match_reasons.map((r,i)=>(
                    <div key={i} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:3}}>
                      <ArrowRight size={10} color="#60a5fa" style={{marginTop:2}}/>
                      <span style={{color:"#64748b",fontSize:11}}>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab==="skills" && (
            <div>
              <p style={{fontSize:10,color:"#374151",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Skills</p>
              {c.skills?.map((s,i)=><SkillPill key={i} skill={s} highlighted={required.has(s.toLowerCase())}/>)}
              {c.skill_overlap?.length>0 && (
                <p style={{fontSize:11,color:"#4ade80",marginTop:6}}>
                  ✓ {c.skill_overlap.length} required skill{c.skill_overlap.length>1?"s":""} matched
                </p>
              )}
            </div>
          )}

          {tab==="conversation" && <ConversationPanel turns={c.conversation}/>}

          {tab==="analysis" && c.interest_analysis && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <div style={{background:"#0d2b1a",border:"1px solid #16a34a",borderRadius:8,padding:10}}>
                  <p style={{fontSize:10,color:"#4ade80",marginBottom:6,letterSpacing:1}}>POSITIVE SIGNALS</p>
                  {c.interest_analysis.positive_signals?.map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:5,marginBottom:3}}>
                      <CheckCircle size={10} color="#4ade80" style={{marginTop:2}}/>
                      <span style={{color:"#86efac",fontSize:11}}>{s}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:"#1c1a0d",border:"1px solid #ca8a04",borderRadius:8,padding:10}}>
                  <p style={{fontSize:10,color:"#fbbf24",marginBottom:6,letterSpacing:1}}>CONCERNS</p>
                  {c.interest_analysis.concerns?.length>0
                    ? c.interest_analysis.concerns.map((s,i)=>(
                        <div key={i} style={{display:"flex",gap:5,marginBottom:3}}>
                          <AlertCircle size={10} color="#fbbf24" style={{marginTop:2}}/>
                          <span style={{color:"#fde68a",fontSize:11}}>{s}</span>
                        </div>
                      ))
                    : <span style={{color:"#4b5563",fontSize:11}}>No concerns raised</span>
                  }
                </div>
              </div>
              {c.interest_analysis.interest_reasoning && (
                <div style={{background:"#060d18",borderRadius:8,padding:10,border:"1px solid #1e2a3a"}}>
                  <p style={{fontSize:10,color:"#374151",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>AI Reasoning</p>
                  <p style={{color:"#64748b",fontSize:12,lineHeight:1.5}}>{c.interest_analysis.interest_reasoning}</p>
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
      c.recommendation??"-", c.availability, c.skills?.join("; ")
    ])
  ];
  const csv = rows.map(r=>r.join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `shortlist-${jdTitle?.replace(/\s+/g,"-").toLowerCase()??"results"}.csv`;
  a.click();
}

// ── Loading Steps ──────────────────────────────────────────────────────────
const STEPS = [
  { icon:<Search size={12}/>, label:"Parsing Job Description with AI" },
  { icon:<BarChart2 size={12}/>, label:"Semantic candidate matching" },
  { icon:<MessageSquare size={12}/>, label:"Simulating outreach conversations" },
  { icon:<TrendingUp size={12}/>, label:"Scoring interest & ranking" },
];

function LoadingState({ step }) {
  return (
    <div style={{textAlign:"center",padding:"50px 0"}}>
      <div style={{
        width:48,height:48,borderRadius:"50%",
        background:"linear-gradient(135deg,#1e3a5f,#0d2b1a)",
        border:"2px solid #60a5fa",
        display:"flex",alignItems:"center",justifyContent:"center",
        margin:"0 auto 24px",
        animation:"spin 2s linear infinite"
      }}>
        <Zap size={20} color="#60a5fa"/>
      </div>
      <div style={{maxWidth:280,margin:"0 auto"}}>
        {STEPS.map((s,i)=>(
          <div key={i} style={{
            display:"flex",alignItems:"center",gap:10,marginBottom:10,
            opacity:i<=step?1:0.2,transition:"opacity 0.4s"
          }}>
            <div style={{
              width:22,height:22,borderRadius:"50%",flexShrink:0,
              background:i<step?"#0d2b1a":i===step?"#1e3a5f":"#0f172a",
              border:`1px solid ${i<step?"#16a34a":i===step?"#60a5fa":"#1e2a3a"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:i<step?"#4ade80":i===step?"#60a5fa":"#374151"
            }}>
              {i<step?<CheckCircle size={11}/>:s.icon}
            </div>
            <span style={{color:i===step?"#f1f5f9":"#4b5563",fontSize:12,textAlign:"left"}}>{s.label}</span>
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
- Familiarity with vector databases and embedding models

Nice to have: CrewAI, AutoGen, LangGraph, NLP background`,

`Frontend Lead – Consumer Product

Lead our frontend team building a world-class consumer product.

Responsibilities:
- Lead a team of 3 frontend engineers
- Define component library and design system standards
- Drive frontend architecture decisions (performance, SSR)
- Partner with design to ship high-quality UI

Requirements:
- 5+ years frontend engineering
- Deep React and TypeScript expertise
- Next.js or similar SSR frameworks
- Strong Tailwind CSS and performance optimization
- Experience leading or mentoring engineers

Nice to have: Storybook, Figma proficiency`,

`Site Reliability Engineer

Join our platform team maintaining 99.99% uptime for 5M users.

Responsibilities:
- Own incident response and postmortem processes
- Monitoring with Prometheus and Grafana
- Manage Kubernetes clusters across AWS regions
- Infrastructure as code with Terraform

Requirements:
- 3+ years DevOps or SRE experience
- Kubernetes and Docker expertise
- AWS (EKS, RDS, S3)
- Terraform or Pulumi
- Python scripting skills`
];

let sampleIdx = 0;

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
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

  // ── File parsing ──────────────────────────────────────────────────────────
  const extractTextFromFile = useCallback(async (file) => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt") || name.endsWith(".md")) {
      return await file.text();
    }
    if (name.endsWith(".pdf")) {
      // Use PDF.js from CDN (loaded lazily)
      const url = URL.createObjectURL(file);
      const pdfjsLib = window.pdfjsLib;
      if (!pdfjsLib) {
        // Fallback: tell user to paste text
        throw new Error("PDF parsing not available. Please paste the JD text directly.");
      }
      const pdf = await pdfjsLib.getDocument(url).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
      return text;
    }
    if (name.endsWith(".docx")) {
      throw new Error("For .docx files, please copy-paste the JD text into the box.");
    }
    throw new Error("Unsupported file type. Please use .txt, .pdf, or paste text directly.");
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await extractTextFromFile(file);
      setJd(text);
      setError(null);
    } catch (e) {
      setError(e.message);
      setFileName(null);
    }
  }, [extractTextFromFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── Analyze ───────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!jd.trim() || jd.length < 50) {
      setError("Please enter a job description (min 50 characters).");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    setLoadStep(0);
    const t1 = setTimeout(()=>setLoadStep(1), 2000);
    const t2 = setTimeout(()=>setLoadStep(2), 5000);
    const t3 = setTimeout(()=>setLoadStep(3), 9000);
    try {
      const { data } = await axios.post(`${API_BASE}/analyze`, {
        jd_text: jd, top_k: topK, outreach_top_n: outreachN
      });
      setResult(data);
    } catch(e) {
      setError(e.response?.data?.detail || "Request failed. Check if backend is running.");
    } finally {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      setLoading(false); setLoadStep(0);
    }
  }

  // ── Stats bar ─────────────────────────────────────────────────────────────
  const avgMatch = result?.shortlist?.length
    ? Math.round(result.shortlist.reduce((a,c)=>a+(c.match_score||0),0)/result.shortlist.length)
    : null;
  const strongYes = result?.shortlist?.filter(c=>c.recommendation==="strong yes").length??0;

  return (
    <div style={{minHeight:"100vh",background:"#060d18",color:"#f1f5f9",
      fontFamily:"'DM Mono','Fira Code','Courier New',monospace"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#060d18}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        textarea:focus,select:focus{outline:none}
        button:active{transform:scale(0.98)}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0b1221}
        ::-webkit-scrollbar-thumb{background:#1e2a3a;border-radius:2px}
      `}</style>

      {/* Nav */}
      <nav style={{
        borderBottom:"1px solid #1e2a3a",padding:"12px 28px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background:"rgba(6,13,24,0.95)",backdropFilter:"blur(12px)",
        position:"sticky",top:0,zIndex:100
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            width:30,height:30,borderRadius:8,
            background:"linear-gradient(135deg,#1d4ed8,#16a34a)",
            display:"flex",alignItems:"center",justifyContent:"center"
          }}>
            <Zap size={16} color="#fff"/>
          </div>
          <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,letterSpacing:-0.5}}>
            TalentScout <span style={{color:"#60a5fa"}}>AI</span>
          </span>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          {result && (
            <button onClick={()=>exportCSV(result.shortlist,result.jd_parsed?.title)} style={{
              background:"transparent",border:"1px solid #1e2a3a",color:"#4b5563",
              borderRadius:8,padding:"4px 12px",fontSize:11,cursor:"pointer",
              display:"flex",alignItems:"center",gap:6
            }}>
              <Download size={12}/> Export CSV
            </button>
          )}
          <span style={{
            background:"#0d1f2b",border:"1px solid #0ea5e9",
            color:"#38bdf8",borderRadius:20,padding:"3px 12px",fontSize:10,fontWeight:700
          }}>
            Catalyst · Deccan AI
          </span>
        </div>
      </nav>

      <main style={{maxWidth:860,margin:"0 auto",padding:"32px 16px"}}>
        {/* Hero */}
        <div style={{marginBottom:28,textAlign:"center"}}>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:8,
            background:"#0d1f2b",border:"1px solid #1e3a5f",
            borderRadius:20,padding:"4px 16px",marginBottom:16,fontSize:11,color:"#60a5fa"
          }}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#60a5fa",
              animation:"pulse 2s infinite"}}/>
            AI Agent · Live
          </div>
          <h1 style={{
            fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:36,
            lineHeight:1.1,letterSpacing:-1,marginBottom:10
          }}>
            AI-Powered Talent Scouting
          </h1>
          <p style={{color:"#475569",fontSize:13,maxWidth:480,margin:"0 auto"}}>
            Paste or upload a Job Description → AI discovers, engages & scores candidates instantly
          </p>
        </div>

        {/* Stats if result */}
        {result && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
            {[
              {icon:<Users size={14}/>,label:"Scanned",value:result.total_candidates_scanned,color:"#60a5fa"},
              {icon:<Target size={14}/>,label:"Shortlisted",value:result.shortlist.length,color:"#4ade80"},
              {icon:<TrendingUp size={14}/>,label:"Avg Match",value:`${avgMatch}%`,color:"#f59e0b"},
              {icon:<CheckCircle size={14}/>,label:"Strong Yes",value:strongYes,color:"#4ade80"},
            ].map((s,i)=>(
              <div key={i} style={{
                background:"#0b1221",border:"1px solid #1e2a3a",borderRadius:10,
                padding:"12px 14px",display:"flex",alignItems:"center",gap:10
              }}>
                <div style={{color:s.color}}>{s.icon}</div>
                <div>
                  <div style={{color:s.color,fontWeight:700,fontSize:18}}>{s.value}</div>
                  <div style={{color:"#374151",fontSize:10,textTransform:"uppercase",letterSpacing:1}}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Panel */}
        <div style={{
          background:"#0b1221",border:"1px solid #1e2a3a",borderRadius:14,
          padding:20,marginBottom:16
        }}>
          {/* File Upload Zone */}
          <div
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={handleDrop}
            onClick={()=>fileRef.current.click()}
            style={{
              border:`2px dashed ${dragOver?"#60a5fa":"#1e2a3a"}`,
              borderRadius:10,padding:"14px 20px",
              display:"flex",alignItems:"center",gap:12,
              cursor:"pointer",marginBottom:12,
              background:dragOver?"#0d1f2b":"transparent",
              transition:"all 0.2s"
            }}>
            <input ref={fileRef} type="file" accept=".txt,.pdf,.md"
              style={{display:"none"}}
              onChange={e=>handleFile(e.target.files[0])}/>
            <Upload size={16} color="#4b5563"/>
            {fileName ? (
              <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
                <FileText size={13} color="#60a5fa"/>
                <span style={{color:"#60a5fa",fontSize:12}}>{fileName}</span>
                <button onClick={e=>{e.stopPropagation();setFileName(null);setJd("");}} style={{
                  background:"transparent",border:"none",cursor:"pointer",color:"#4b5563",marginLeft:"auto"
                }}><X size={13}/></button>
              </div>
            ) : (
              <div>
                <span style={{color:"#4b5563",fontSize:12}}>
                  Drop a <strong style={{color:"#64748b"}}>.txt or .pdf</strong> JD file, or click to browse
                </span>
              </div>
            )}
          </div>

          {/* Text area */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <label style={{fontSize:10,color:"#374151",letterSpacing:1,textTransform:"uppercase"}}>
              Job Description
            </label>
            <button onClick={()=>{setJd(SAMPLE_JDS[sampleIdx%SAMPLE_JDS.length]);sampleIdx++;setFileName(null)}} style={{
              background:"transparent",border:"1px solid #1e2a3a",color:"#4b5563",
              borderRadius:6,padding:"2px 10px",fontSize:10,cursor:"pointer"
            }}>
              Load sample ({["AI Eng","Frontend","SRE"][sampleIdx%3]})
            </button>
          </div>
          <textarea value={jd} onChange={e=>setJd(e.target.value)}
            placeholder="Paste your full job description here, or upload a file above..."
            style={{
              width:"100%",minHeight:180,background:"#060d18",
              border:"1px solid #1e2a3a",borderRadius:8,padding:12,
              color:"#64748b",fontSize:12,lineHeight:1.6,resize:"vertical",
              fontFamily:"inherit"
            }}/>

          {/* Options */}
          <div style={{display:"flex",gap:16,marginTop:14,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div>
              <label style={{fontSize:10,color:"#374151",display:"block",marginBottom:4}}>Candidates</label>
              <select value={topK} onChange={e=>setTopK(Number(e.target.value))} style={{
                background:"#060d18",border:"1px solid #1e2a3a",color:"#64748b",
                borderRadius:6,padding:"5px 10px",fontSize:12,fontFamily:"inherit"
              }}>
                {[5,10,15,20].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:10,color:"#374151",display:"block",marginBottom:4}}>Outreach top-N</label>
              <select value={outreachN} onChange={e=>setOutreachN(Number(e.target.value))} style={{
                background:"#060d18",border:"1px solid #1e2a3a",color:"#64748b",
                borderRadius:6,padding:"5px 10px",fontSize:12,fontFamily:"inherit"
              }}>
                {[1,2,3,5].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button onClick={handleAnalyze} disabled={loading} style={{
              marginLeft:"auto",
              background:loading?"#1e2a3a":"linear-gradient(135deg,#1d4ed8,#1e40af)",
              color:"#fff",border:"none",borderRadius:8,padding:"9px 24px",
              fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",
              display:"flex",alignItems:"center",gap:8,
              boxShadow:loading?"none":"0 4px 12px rgba(29,78,216,0.4)"
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
            background:"#2b0d0d",border:"1px solid #dc2626",borderRadius:8,
            padding:"10px 14px",color:"#f87171",fontSize:12,marginBottom:16,
            display:"flex",alignItems:"center",gap:8
          }}>
            <XCircle size={14}/>{error}
          </div>
        )}

        {loading && <LoadingState step={loadStep}/>}

        {/* Results */}
        {result && !loading && (
          <div>
            {/* JD Summary */}
            <div style={{
              background:"#0b1221",border:"1px solid #1e2a3a",borderRadius:12,
              padding:16,marginBottom:16
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                <div>
                  <p style={{fontSize:10,color:"#374151",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Parsed JD</p>
                  <p style={{color:"#f1f5f9",fontWeight:700,fontSize:16,marginBottom:2}}>{result.jd_parsed.title}</p>
                  <p style={{color:"#475569",fontSize:11}}>
                    {result.jd_parsed.seniority} · {result.jd_parsed.role_type} · {result.jd_parsed.experience_years_min}–{result.jd_parsed.experience_years_max}y exp
                  </p>
                </div>
                <div style={{textAlign:"right",fontSize:11,color:"#374151"}}>
                  <span style={{color:"#60a5fa"}}>{result.total_candidates_scanned}</span> scanned ·{" "}
                  <span style={{color:"#4ade80"}}>{result.outreach_conducted}</span> outreach
                  {result.cached && <span style={{color:"#fbbf24",marginLeft:8}}>· cached</span>}
                </div>
              </div>
              <div style={{marginTop:10}}>
                {result.jd_parsed.required_skills?.map((s,i)=><SkillPill key={i} skill={s} highlighted/>)}
                {result.jd_parsed.nice_to_have_skills?.map((s,i)=><SkillPill key={i} skill={s}/>)}
              </div>
            </div>

            {/* Legend */}
            <div style={{display:"flex",gap:16,marginBottom:12,flexWrap:"wrap"}}>
              {[
                {color:"#60a5fa",label:"Match — semantic + skill overlap"},
                {color:"#4ade80",label:"Interest — from conversation"},
                {color:"#f59e0b",label:"Combined — 55% match + 45% interest"},
              ].map((l,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#374151"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:l.color}}/>
                  {l.label}
                </div>
              ))}
            </div>

            {/* Cards */}
            {result.shortlist.map((c,i)=>(
              <CandidateCard key={c.id} c={c} rank={i+1} requiredSkills={result.jd_parsed.required_skills}/>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}