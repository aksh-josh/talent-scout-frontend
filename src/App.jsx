import React, { useState } from "react";
import axios from "axios";
import {
  Search, MessageSquare, ChevronDown, ChevronUp,
  Clock, MapPin, Wifi, TrendingUp, CheckCircle, AlertCircle,
} from "lucide-react";

// ── Config ────────────────────────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || "";

// ── Helpers ───────────────────────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function ScoreRing({ value, color, size = 56, label }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = clamp(value ?? 0, 0, 100) / 100;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e2a3a" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span style={{ color, fontWeight: 700, fontSize: 13, marginTop: -42, marginBottom: 28 }}>
        {value != null ? Math.round(value) : "—"}
      </span>
      {label && <span style={{ fontSize: 10, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>}
    </div>
  );
}

function Badge({ label }) {
  const map = {
    "strong yes": { bg: "#0d2b1a", border: "#16a34a", text: "#4ade80", icon: <CheckCircle size={12} /> },
    yes: { bg: "#0d1f2b", border: "#0ea5e9", text: "#38bdf8", icon: <CheckCircle size={12} /> },
    maybe: { bg: "#1c1a0d", border: "#ca8a04", text: "#fbbf24", icon: <AlertCircle size={12} /> },
    no: { bg: "#2b0d0d", border: "#dc2626", text: "#f87171", icon: <XCircle size={12} /> },
  };
  const s = map[label?.toLowerCase()] || map["maybe"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600
    }}>
      {s.icon} {label?.toUpperCase()}
    </span>
  );
}

function SkillPill({ skill, highlighted }) {
  return (
    <span style={{
      display: "inline-block",
      background: highlighted ? "#0d2b1a" : "#111827",
      border: `1px solid ${highlighted ? "#16a34a" : "#1f2937"}`,
      color: highlighted ? "#4ade80" : "#9ca3af",
      borderRadius: 6, padding: "2px 8px", fontSize: 11, marginRight: 4, marginBottom: 4
    }}>
      {highlighted && "✓ "}{skill}
    </span>
  );
}

function ConversationPanel({ turns }) {
  if (!turns || turns.length === 0) return null;
  const labels = { opening: "Opening", alignment: "Role Fit", motivation: "Motivation", logistics: "Logistics" };
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ color: "#6b7280", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Simulated Outreach Conversation
      </p>
      {turns.map((t, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            — {labels[t.turn] || t.turn}
          </div>
          <div style={{
            background: "#0f172a", border: "1px solid #1e2a3a", borderRadius: 10,
            padding: "10px 14px", marginBottom: 6
          }}>
            <p style={{ fontSize: 11, color: "#60a5fa", marginBottom: 2, fontWeight: 600 }}>RECRUITER</p>
            <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>{t.recruiter}</p>
          </div>
          <div style={{
            background: "#0a1628", border: "1px solid #1e3a2a", borderRadius: 10,
            padding: "10px 14px", marginLeft: 20
          }}>
            <p style={{ fontSize: 11, color: "#4ade80", marginBottom: 2, fontWeight: 600 }}>CANDIDATE</p>
            <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>{t.candidate}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CandidateCard({ c, rank, requiredSkills }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("overview");

  const hasOutreach = c.conversation && c.conversation.length > 0;
  const required = new Set((requiredSkills || []).map(s => s.toLowerCase()));

  return (
    <div style={{
      background: "#0b1221", border: "1px solid #1e2a3a", borderRadius: 14,
      overflow: "hidden", marginBottom: 12,
      transition: "border-color 0.2s"
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#334155"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a3a"}
    >
      {/* Header row */}
      <div
        style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Rank */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: rank <= 3 ? "#0d2b1a" : "#111827",
          border: `1px solid ${rank <= 3 ? "#16a34a" : "#1f2937"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: rank <= 3 ? "#4ade80" : "#6b7280", fontWeight: 700, fontSize: 13, flexShrink: 0
        }}>
          {rank}
        </div>

        {/* Name / title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 15 }}>{c.name}</span>
            {c.recommendation && <Badge label={c.recommendation} />}
          </div>
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{c.title} · {c.experience_years}y · {c.location}</div>
        </div>

        {/* Scores */}
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <ScoreRing value={c.match_score} color="#60a5fa" size={50} label="Match" />
          {c.interest_score != null && (
            <ScoreRing value={c.interest_score} color="#4ade80" size={50} label="Interest" />
          )}
          {c.combined_score != null && (
            <ScoreRing value={c.combined_score} color="#f59e0b" size={50} label="Combined" />
          )}
        </div>

        {open ? <ChevronUp size={16} color="#4b5563" /> : <ChevronDown size={16} color="#4b5563" />}
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: "1px solid #1e2a3a", padding: "16px 20px" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {["overview", "skills", ...(hasOutreach ? ["conversation", "analysis"] : [])].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "capitalize",
                background: tab === t ? "#1e3a5f" : "transparent",
                color: tab === t ? "#60a5fa" : "#4b5563"
              }}>{t}</button>
            ))}
          </div>

          {tab === "overview" && (
            <div>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{c.summary}</p>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12 }}>
                  <Clock size={13} /> {c.availability}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12 }}>
                  <MapPin size={13} /> {c.location}
                </div>
                {c.open_to_remote && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12 }}>
                    <Wifi size={13} /> Open to remote
                  </div>
                )}
              </div>
              {c.match_reasons?.length > 0 && (
                <div style={{ marginTop: 12, background: "#0f172a", borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 11, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Why matched</p>
                  {c.match_reasons.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                      <ArrowRight size={12} color="#60a5fa" style={{ marginTop: 2 }} />
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "skills" && (
            <div>
              <p style={{ fontSize: 11, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Skills</p>
              <div>
                {c.skills?.map((s, i) => (
                  <SkillPill key={i} skill={s} highlighted={required.has(s.toLowerCase())} />
                ))}
              </div>
              {c.skill_overlap?.length > 0 && (
                <p style={{ fontSize: 12, color: "#4ade80", marginTop: 8 }}>
                  ✓ {c.skill_overlap.length} required skill{c.skill_overlap.length > 1 ? "s" : ""} matched
                </p>
              )}
            </div>
          )}

          {tab === "conversation" && <ConversationPanel turns={c.conversation} />}

          {tab === "analysis" && c.interest_analysis && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ background: "#0d2b1a", border: "1px solid #16a34a", borderRadius: 10, padding: 12 }}>
                  <p style={{ fontSize: 11, color: "#4ade80", marginBottom: 6, letterSpacing: 1 }}>POSITIVE SIGNALS</p>
                  {c.interest_analysis.positive_signals?.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                      <CheckCircle size={11} color="#4ade80" style={{ marginTop: 2 }} />
                      <span style={{ color: "#86efac", fontSize: 12 }}>{s}</span>
                    </div>
                  ))}
                </div>
                {c.interest_analysis.concerns?.length > 0 && (
                  <div style={{ background: "#2b0d0d", border: "1px solid #dc2626", borderRadius: 10, padding: 12 }}>
                    <p style={{ fontSize: 11, color: "#f87171", marginBottom: 6, letterSpacing: 1 }}>CONCERNS</p>
                    {c.interest_analysis.concerns.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                        <AlertCircle size={11} color="#f87171" style={{ marginTop: 2 }} />
                        <span style={{ color: "#fca5a5", fontSize: 12 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {c.interest_analysis.interest_reasoning && (
                <div style={{ background: "#0f172a", borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 11, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>AI Reasoning</p>
                  <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{c.interest_analysis.interest_reasoning}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const STEPS = [
  { icon: <Search size={14} />, label: "Parsing Job Description" },
  { icon: <BarChart2 size={14} />, label: "Matching candidates via semantic search" },
  { icon: <MessageSquare size={14} />, label: "Simulating outreach conversations" },
  { icon: <TrendingUp size={14} />, label: "Scoring interest & building shortlist" },
];

function LoadingState({ step }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <Loader2 size={32} color="#60a5fa" style={{ animation: "spin 1s linear infinite", marginBottom: 24 }} />
      <div>
        {STEPS.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10, justifyContent: "center",
            marginBottom: 12, opacity: i <= step ? 1 : 0.25,
            transition: "opacity 0.4s"
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: i < step ? "#0d2b1a" : i === step ? "#1e3a5f" : "#111",
              border: `1px solid ${i < step ? "#16a34a" : i === step ? "#60a5fa" : "#1f2937"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: i < step ? "#4ade80" : i === step ? "#60a5fa" : "#374151"
            }}>
              {i < step ? <CheckCircle size={12} /> : s.icon}
            </div>
            <span style={{ color: i === step ? "#f1f5f9" : "#4b5563", fontSize: 13 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SAMPLE_JDS = [
`Senior AI Engineer – Agentic Systems

We are looking for a Senior AI Engineer to join our product team and build the next generation of AI-powered automation features.

Responsibilities:
- Design and implement multi-agent AI systems using LangChain, LlamaIndex, or similar frameworks
- Build RAG pipelines and integrate vector databases (Pinecone, ChromaDB)
- Develop and fine-tune LLM-based workflows for enterprise use cases
- Collaborate with product and backend teams to ship production-grade AI features
- Write clean, well-tested Python code with FastAPI

Requirements:
- 4+ years of software engineering experience
- 2+ years hands-on with LLMs, RAG, or agent frameworks
- Strong Python skills; FastAPI or Django preferred
- Experience with OpenAI API, Claude API, or HuggingFace
- Familiarity with vector databases and embedding models

Nice to have:
- Experience with CrewAI, AutoGen, or LangGraph
- Background in NLP or ML Engineering
- Prior startup experience`,

`Frontend Lead – Consumer Product

We're building a world-class consumer product and need a Frontend Lead to own our web experience.

What you'll do:
- Lead a team of 3 frontend engineers
- Define our component library and design system standards
- Drive frontend architecture decisions (bundling, performance, SSR)
- Partner with product and design to ship high-quality UI
- Set up and maintain frontend testing infrastructure

Requirements:
- 5+ years of frontend engineering
- Deep React and TypeScript expertise
- Experience with Next.js or similar SSR frameworks
- Strong Tailwind CSS and performance optimization skills
- Led or mentored other engineers

Nice to have:
- Design system experience with Storybook
- Figma proficiency`,

`Site Reliability Engineer

Join our platform team and help us maintain 99.99% uptime for a product serving 5M users.

Responsibilities:
- Own incident response and postmortem processes
- Design and implement monitoring with Prometheus and Grafana
- Manage Kubernetes clusters across AWS regions
- Write infrastructure as code with Terraform

Requirements:
- 3+ years DevOps or SRE experience
- Kubernetes and Docker expertise
- AWS experience (EKS, RDS, S3)
- Terraform or Pulumi for infrastructure as code
- Python scripting skills`
];

let sampleJdIndex = 0;

export default function App() {
  const [jd, setJd] = useState("");
  const [topK, setTopK] = useState(10);
  const [outreachN, setOutreachN] = useState(5);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    if (!jd.trim() || jd.length < 50) {
      setError("Please enter a job description (min 50 characters).");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    setLoadStep(0);

    // Simulate progress steps
    const timer1 = setTimeout(() => setLoadStep(1), 2000);
    const timer2 = setTimeout(() => setLoadStep(2), 5000);
    const timer3 = setTimeout(() => setLoadStep(3), 8000);

    try {
      const { data } = await axios.post(`${API_BASE}/analyze`, {
        jd_text: jd,
        top_k: topK,
        outreach_top_n: outreachN,
      });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.detail || "Something went wrong. Is the backend running?");
    } finally {
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);
      setLoading(false);
      setLoadStep(0);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060d18",
      color: "#f1f5f9",
      fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060d18; }
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus { outline: none; }
        button:hover { opacity: 0.9; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0b1221; }
        ::-webkit-scrollbar-thumb { background: #1e2a3a; border-radius: 3px; }
      `}</style>

      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid #1e2a3a", padding: "14px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(6,13,24,0.9)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={18} color="#60a5fa" />
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: -0.5 }}>
            TalentScout <span style={{ color: "#60a5fa" }}>AI</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="https://github.com" target="_blank" rel="noreferrer"
            style={{ color: "#4b5563", display: "flex", alignItems: "center", gap: 6, fontSize: 12, textDecoration: "none" }}>
            ⌥ GitHub
          </a>
          <span style={{
            background: "#0d1f2b", border: "1px solid #0ea5e9",
            color: "#38bdf8", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 600
          }}>
            Catalyst · Deccan AI
          </span>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 42,
            lineHeight: 1.1, letterSpacing: -1, marginBottom: 12
          }}>
            AI-Powered<br />
            <span style={{ color: "#60a5fa" }}>Talent Scouting</span> Agent
          </h1>
          <p style={{ color: "#64748b", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
            Paste a Job Description → discover matching candidates → simulate outreach → get a scored shortlist. Instantly.
          </p>
        </div>

        {/* Input panel */}
        <div style={{
          background: "#0b1221", border: "1px solid #1e2a3a", borderRadius: 16, padding: 24, marginBottom: 24
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase" }}>
              Job Description
            </label>
            <button onClick={() => { setJd(SAMPLE_JDS[sampleJdIndex % SAMPLE_JDS.length]); sampleJdIndex++; }} style={{
              background: "transparent", border: "1px solid #1e2a3a", color: "#4b5563",
              borderRadius: 8, padding: "3px 12px", fontSize: 11, cursor: "pointer"
            }}>
              Load sample JD ({["AI Eng", "Frontend", "SRE"][sampleJdIndex % 3]})
            </button>
          </div>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste your full job description here..."
            style={{
              width: "100%", minHeight: 200, background: "#060d18",
              border: "1px solid #1e2a3a", borderRadius: 10, padding: 14,
              color: "#94a3b8", fontSize: 13, lineHeight: 1.6, resize: "vertical",
              fontFamily: "inherit"
            }}
          />

          {/* Options row */}
          <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: 11, color: "#4b5563", display: "block", marginBottom: 4 }}>
                Candidates to retrieve
              </label>
              <select value={topK} onChange={e => setTopK(Number(e.target.value))} style={{
                background: "#060d18", border: "1px solid #1e2a3a", color: "#94a3b8",
                borderRadius: 8, padding: "6px 12px", fontSize: 13, fontFamily: "inherit"
              }}>
                {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#4b5563", display: "block", marginBottom: 4 }}>
                Run outreach on top-N
              </label>
              <select value={outreachN} onChange={e => setOutreachN(Number(e.target.value))} style={{
                background: "#060d18", border: "1px solid #1e2a3a", color: "#94a3b8",
                borderRadius: 8, padding: "6px 12px", fontSize: 13, fontFamily: "inherit"
              }}>
                {[3, 5, 8, 10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                marginLeft: "auto", background: "#1d4ed8", color: "#fff",
                border: "none", borderRadius: 10, padding: "10px 28px",
                fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
              {loading ? "Scouting..." : "Scout Candidates"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: "#2b0d0d", border: "1px solid #dc2626", borderRadius: 10,
            padding: "12px 16px", color: "#f87171", fontSize: 13, marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {loading && <LoadingState step={loadStep} />}

        {/* Results */}
        {result && !loading && (
          <div>
            {/* JD Summary */}
            <div style={{
              background: "#0b1221", border: "1px solid #1e2a3a", borderRadius: 12,
              padding: 18, marginBottom: 24
            }}>
              <p style={{ fontSize: 11, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                Parsed Job Description
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: 4 }}>{result.jd_parsed.title}</p>
                  <p style={{ color: "#64748b", fontSize: 12 }}>
                    {result.jd_parsed.seniority} · {result.jd_parsed.role_type} ·{" "}
                    {result.jd_parsed.experience_years_min}–{result.jd_parsed.experience_years_max}y exp
                  </p>
                </div>
                <div style={{ fontSize: 12, color: "#4b5563" }}>
                  <span style={{ color: "#60a5fa" }}>{result.total_candidates_scanned}</span> candidates scanned ·{" "}
                  <span style={{ color: "#4ade80" }}>{result.outreach_conducted}</span> outreach simulated
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                {result.jd_parsed.required_skills?.map((s, i) => (
                  <SkillPill key={i} skill={s} highlighted />
                ))}
                {result.jd_parsed.nice_to_have_skills?.map((s, i) => (
                  <SkillPill key={i} skill={s} />
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                { color: "#60a5fa", label: "Match Score — semantic + skill overlap" },
                { color: "#4ade80", label: "Interest Score — from conversation" },
                { color: "#f59e0b", label: "Combined Score — 55% match + 45% interest" },
              ].map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#4b5563" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Shortlist */}
            <div>
              {result.shortlist.map((c, i) => (
                <CandidateCard
                  key={c.id}
                  c={c}
                  rank={i + 1}
                  requiredSkills={result.jd_parsed.required_skills}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}