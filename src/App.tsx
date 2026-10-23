import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Bell,
  BrainCircuit, BriefcaseBusiness, CheckCircle2, ChevronDown, ChevronRight,
  CircleHelp, Clock3, Download, FileCheck2, FileText, Filter, Gauge, GitBranch,
  LayoutDashboard, Link2, ListChecks, LockKeyhole, Menu, Search, Settings2,
  ShieldAlert, ShieldCheck, Sparkles, Target, Timer, Workflow, X, Zap
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

type State = "Restored" | "Contained" | "Remediation in progress" | "Verified permanent fix" | "Risk accepted";
type Priority = "P1" | "P2" | "P3";
type CaseItem = {
  id: string; priority: Priority; service: string; summary: string; date: string;
  method: string; problem: string; recurrence: number; owner: string; daysOpen: number;
  state: State; rootCause: "Unconfirmed" | "Proposed" | "Validated" | "Disputed";
  evidence: "Complete" | "Partial" | "Missing"; workaround: boolean; exception: string[];
  change: string; changeRequired: boolean; verification: string; risk: string;
};
const seed: CaseItem[] = [
  {id:"INC-DEMO-1042",priority:"P1",service:"Payments Gateway",summary:"Payment authorization latency spike",date:"2026-10-18",method:"Application pool restart",problem:"PRB-DEMO-021",recurrence:3,owner:"N. Raman",daysOpen:18,state:"Remediation in progress",rootCause:"Proposed",evidence:"Partial",workaround:true,exception:["Recurring incident","Long-lived workaround","RCA not validated"],change:"CHG-DEMO-087",changeRequired:true,verification:"Not started",risk:"Elevated — repeated customer impact"},
  {id:"INC-DEMO-1041",priority:"P2",service:"Customer Portal",summary:"Intermittent session timeout",date:"2026-10-17",method:"Service recycle",problem:"PRB-DEMO-022",recurrence:2,owner:"A. Joseph",daysOpen:12,state:"Contained",rootCause:"Unconfirmed",evidence:"Missing",workaround:true,exception:["Missing RCA evidence","Verification missing"],change:"—",changeRequired:true,verification:"Not started",risk:"Moderate — workaround remains"},
  {id:"INC-DEMO-1039",priority:"P2",service:"Identity Services",summary:"Token refresh failures after deployment",date:"2026-10-15",method:"Rollback to prior release",problem:"PRB-DEMO-023",recurrence:1,owner:"S. Iyer",daysOpen:8,state:"Remediation in progress",rootCause:"Validated",evidence:"Complete",workaround:false,exception:["Overdue milestone"],change:"CHG-DEMO-085",changeRequired:true,verification:"Pending release",risk:"Moderate — fix awaiting deployment"},
  {id:"INC-DEMO-1037",priority:"P1",service:"Data Warehouse",summary:"Nightly load stopped on malformed record",date:"2026-10-12",method:"Skipped failed batch and reran",problem:"PRB-DEMO-024",recurrence:2,owner:"M. Shah",daysOpen:21,state:"Risk accepted",rootCause:"Validated",evidence:"Complete",workaround:true,exception:["Risk review due"],change:"—",changeRequired:false,verification:"Not applicable",risk:"Accepted until 2026-11-15"},
  {id:"INC-DEMO-1035",priority:"P3",service:"Reporting Service",summary:"Scheduled report delivery delayed",date:"2026-10-10",method:"Queue cleared",problem:"PRB-DEMO-025",recurrence:1,owner:"K. Patel",daysOpen:5,state:"Verified permanent fix",rootCause:"Validated",evidence:"Complete",workaround:false,exception:[],change:"CHG-DEMO-081",changeRequired:true,verification:"7-day observation passed",risk:"Low — fix verified"},
  {id:"INC-DEMO-1032",priority:"P2",service:"Payments Gateway",summary:"Duplicate retry events under load",date:"2026-10-08",method:"Feature flag disabled",problem:"PRB-DEMO-021",recurrence:4,owner:"N. Raman",daysOpen:18,state:"Remediation in progress",rootCause:"Proposed",evidence:"Partial",workaround:true,exception:["Recurring incident","Long-lived workaround","RCA not validated"],change:"CHG-DEMO-087",changeRequired:true,verification:"Not started",risk:"Elevated — repeated customer impact"},
  {id:"INC-DEMO-1028",priority:"P2",service:"Customer Portal",summary:"Session store saturation",date:"2026-10-04",method:"Capacity increase",problem:"PRB-DEMO-022",recurrence:3,owner:"A. Joseph",daysOpen:12,state:"Contained",rootCause:"Disputed",evidence:"Partial",workaround:true,exception:["Recurring incident","Conflicting RCA"],change:"CHG-DEMO-079",changeRequired:true,verification:"Not started",risk:"Moderate — evidence conflicts"},
  {id:"INC-DEMO-1024",priority:"P1",service:"Order Processing",summary:"Order queue backlog exceeded threshold",date:"2026-09-30",method:"Worker restart and queue drain",problem:"PRB-DEMO-026",recurrence:2,owner:"Unassigned",daysOpen:26,state:"Restored",rootCause:"Unconfirmed",evidence:"Missing",workaround:true,exception:["Missing owner","Missing RCA evidence","Long-lived workaround"],change:"—",changeRequired:true,verification:"Not started",risk:"High — no accountable owner"},
  {id:"INC-DEMO-1021",priority:"P3",service:"Identity Services",summary:"Expired certificate warning",date:"2026-09-28",method:"Certificate renewed",problem:"PRB-DEMO-027",recurrence:1,owner:"D. Kumar",daysOpen:2,state:"Verified permanent fix",rootCause:"Validated",evidence:"Complete",workaround:false,exception:[],change:"CHG-DEMO-076",changeRequired:true,verification:"Monitoring passed",risk:"Low — fix verified"},
  {id:"INC-DEMO-1018",priority:"P2",service:"API Platform",summary:"Elevated 429 responses",date:"2026-09-24",method:"Rate limit adjusted",problem:"PRB-DEMO-028",recurrence:2,owner:"P. Das",daysOpen:15,state:"Remediation in progress",rootCause:"Proposed",evidence:"Partial",workaround:true,exception:["Recurring incident","Missing verification"],change:"CHG-DEMO-074",changeRequired:true,verification:"Pending",risk:"Moderate — tuning needs validation"},
  {id:"INC-DEMO-1014",priority:"P2",service:"Data Warehouse",summary:"Late arrival of upstream feed",date:"2026-09-19",method:"Manual rerun after feed arrival",problem:"PRB-DEMO-024",recurrence:3,owner:"M. Shah",daysOpen:21,state:"Risk accepted",rootCause:"Validated",evidence:"Complete",workaround:true,exception:["Risk review due"],change:"—",changeRequired:false,verification:"Not applicable",risk:"Accepted until 2026-11-15"},
  {id:"INC-DEMO-1009",priority:"P3",service:"Customer Portal",summary:"Minor UI error after browser update",date:"2026-09-12",method:"Cache cleared",problem:"—",recurrence:1,owner:"L. Wong",daysOpen:1,state:"Restored",rootCause:"Unconfirmed",evidence:"Partial",workaround:false,exception:[],change:"—",changeRequired:false,verification:"Not required by demo policy",risk:"Low — monitor for recurrence"}
];
const trend = [
  {week:"Sep 1",incidents:19,verified:7},{week:"Sep 8",incidents:23,verified:9},{week:"Sep 15",incidents:16,verified:8},
  {week:"Sep 22",incidents:21,verified:11},{week:"Sep 29",incidents:15,verified:10},{week:"Oct 6",incidents:18,verified:12},
  {week:"Oct 13",incidents:13,verified:11}
];
const statusData = [
  {name:"In progress",value:4,color:"#3986a8"},{name:"Contained",value:2,color:"#d6a344"},
  {name:"Verified",value:2,color:"#2b927a"},{name:"Risk accepted",value:2,color:"#8a78bd"},{name:"Restored",value:2,color:"#9aa8b6"}
];
const nav = [
  {label:"Overview",icon:LayoutDashboard},{label:"Incident-to-Fix Cases",icon:GitBranch},
  {label:"AI Evidence Review",icon:BrainCircuit},{label:"Remediation Exceptions",icon:ShieldAlert},
  {label:"Assurance Reports",icon:FileText},{label:"Pilot Scorecard",icon:Target},
  {label:"Consulting Services",icon:BriefcaseBusiness}
];

type Analysis = {
  confirmed:string[]; proposed:string[]; unknown:string[]; available:string[]; missing:string[];
  assessment:string; action:string; criteria:string[]; blocker:string;
};
function analyse(c:CaseItem):Analysis {
  const verified = c.state==="Verified permanent fix";
  const confirmed = [
    `Service restored by: ${c.method}`,
    `${c.recurrence} linked occurrence${c.recurrence===1?"":"s"} recorded`,
    `Lifecycle state recorded as "${c.state}"`,
    c.problem==="—"?"No problem record is linked":`Linked problem record: ${c.problem}`,
    c.owner==="Unassigned"?"No accountable owner is recorded":`Accountable owner: ${c.owner}`,
    ...(c.change!=="—"?[`Change reference recorded: ${c.change}`]:[])
  ];
  const available = [
    "Incident and restoration record (synthetic)",
    ...(c.rootCause==="Validated"?["Root cause marked Validated in the demo record"]:[]),
    ...(c.evidence==="Complete"?["Validation evidence referenced in the demo record"]:[]),
    ...(c.evidence==="Partial"?["Partial investigation material"]:[]),
    ...(c.change!=="—"?[`Change record ${c.change}`]:[])
  ];
  const missing = [
    ...(c.rootCause!=="Validated"?[`Validated root cause (current status: ${c.rootCause})`]:[]),
    ...(c.evidence!=="Complete"?[c.evidence==="Missing"?"Any supporting evidence for the cause or the fix":"Evidence linking the cause to the corrective action"]:[]),
    ...(c.change==="—"&&c.changeRequired?["Change / release record, or a documented reason none is needed"]:[]),
    ...(!verified&&c.state!=="Risk accepted"?["Verification result against agreed criteria"]:[]),
    ...(c.owner==="Unassigned"?["Accountable owner"]:[]),
    ...(c.workaround&&c.state!=="Risk accepted"?["Plan and date to retire the workaround"]:[])
  ];
  const proposed:string[] = [];
  if(c.rootCause==="Proposed") proposed.push("A cause has been suggested but not validated. Treat it as a hypothesis.");
  if(c.rootCause==="Disputed") proposed.push("Sources conflict on the cause. Reconcile them before relying on either explanation.");
  if(c.rootCause==="Unconfirmed") proposed.push("No cause has been established. The recorded restoration may only be a workaround.");
  if(c.state==="Risk accepted") proposed.push("Risk acceptance means the issue is tolerated. It does not mean the defect was removed.");
  if(c.recurrence>=2&&!verified) proposed.push("Repeat occurrences suggest the underlying cause may still be present.");
  if(verified) proposed.push("The demo record references validation evidence, so the fix appears sound. A reviewer should still inspect it.");
  const unknown = [
    ...(!verified?["Whether the issue will stop recurring"]:[]),
    ...(c.rootCause!=="Validated"?["Whether the corrective action addresses the real cause"]:[]),
    ...(c.evidence!=="Complete"?["Which source records support the stated cause"]:[]),
    ...(c.state==="Risk accepted"?["Whether the risk acceptance is still appropriate at its review date"]:[])
  ];
  let assessment: string;
  if (verified) {
    assessment = "Proposed assessment: evidence in the demo record appears consistent with a verified fix. A human reviewer must confirm it.";
  } else if (c.state === "Risk accepted") {
    assessment = "Proposed assessment: the issue is tolerated, not fixed. Keep it visible and review it on schedule.";
  } else {
    assessment = `Proposed assessment: service is back, but permanent remediation is not demonstrated (${c.rootCause.toLowerCase()} cause, ${c.evidence.toLowerCase()} evidence).`;
  }
  const action = c.owner==="Unassigned"?"Assign an accountable owner, then complete the investigation."
    : c.rootCause==="Disputed"?"Reconcile the conflicting evidence and record one validated root cause."
    : c.rootCause!=="Validated"?"Validate the root cause with source evidence before approving a fix."
    : c.state==="Risk accepted"?"Confirm the risk acceptance owner and review date."
    : verified?"Spot-check the validation evidence, then keep monitoring."
    : c.change==="—"&&c.changeRequired?"Link the change record or document why none is required."
    : "Complete the change and run the agreed verification.";
  const criteria = [
    "Root cause is validated and traceable to source records",
    "Fix is implemented, with change linkage or a documented reason none is needed",
    ...(c.workaround?["Workaround is retired or formally accepted with an owner and review date"]:[]),
    "No recurrence over the agreed observation period (proposed: 7 days)",
    "Process owner signs off the verification"
  ];
  const reasons = [
    c.rootCause!=="Validated"?`the root cause is ${c.rootCause.toLowerCase()}`:"",
    c.evidence!=="Complete"?`the evidence is ${c.evidence.toLowerCase()}`:"",
    c.verification==="Not started"||c.verification.startsWith("Pending")?`verification is "${c.verification.toLowerCase()}"`:"",
    c.owner==="Unassigned"?"nobody is accountable":""
  ].filter(Boolean);
  const blocker = verified
    ? "The demo record meets the demo policy for a verified fix: evidence is complete and verification passed. A human reviewer should still check it."
    : c.state==="Risk accepted"
    ? "Risk acceptance is a decision to tolerate the issue, not a verified fix. The defect is still there."
    : `Cannot be treated as a verified permanent fix yet: ${reasons.join(", ")||"required evidence is not complete"}. Service restoration alone does not show the problem is gone.`;
  return {confirmed,proposed,unknown,available,missing,assessment,action,criteria,blocker};
}
function FindingBody({c}:{c:CaseItem}){
  const a = analyse(c);
  return <div className="finding">
    <div className="finding-group"><Pill kind="success">Confirmed demo facts</Pill><ul>{a.confirmed.map(x=><li key={x}>{x}</li>)}</ul></div>
    <div className="finding-group"><Pill kind="warning">Proposed assessment · not confirmed</Pill><p className="finding-assess">{a.assessment}</p><ul>{a.proposed.map(x=><li key={x}>{x}</li>)}</ul></div>
    <div className="finding-group"><Pill kind="neutral">Unknown</Pill>{a.unknown.length?<ul>{a.unknown.map(x=><li key={x}>{x}</li>)}</ul>:<p className="finding-note">No open unknowns in the demo record.</p>}</div>
    <div className="finding-cols">
      <div><h5>Evidence available</h5><ul>{a.available.map(x=><li key={x}>{x}</li>)}</ul></div>
      <div><h5>Evidence missing</h5>{a.missing.length?<ul>{a.missing.map(x=><li key={x}>{x}</li>)}</ul>:<p className="finding-note">None identified.</p>}</div>
    </div>
    <div className="finding-action"><h5>Recommended next action (suggestion)</h5><p>{a.action}</p></div>
    <div className="finding-group"><h5>Verification criteria (proposed)</h5><ul>{a.criteria.map(x=><li key={x}>{x}</li>)}</ul></div>
    <div className={`why-box ${c.state==="Verified permanent fix"?"ok":""}`}><strong>{c.state==="Verified permanent fix"?"Why this is shown as verified":"Why this is not verified yet"}</strong><p>{a.blocker}</p></div>
  </div>;
}
const money = (s:string) => s;
function Pill({children,kind="neutral"}:{children:React.ReactNode;kind?:string}) {
  return <span className={`pill ${kind}`}>{children}</span>;
}
function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [page,setPage] = useState("Overview");
  const [query,setQuery] = useState("");
  const [priority,setPriority] = useState("All priorities");
  const [selected,setSelected] = useState<CaseItem|null>(null);
  const [exceptionFilter,setExceptionFilter] = useState("All exceptions");
  const [showChecklist,setShowChecklist] = useState(false);
  const [reportReady,setReportReady] = useState(false);
  const [menuOpen,setMenuOpen] = useState(false);
  const [score,setScore] = useState({precision:"80",recall:"90",traceability:"100",timeSaved:"30",actionable:"70"});
  const [reviewed,setReviewed] = useState(false);
  const [scoreStatus,setScoreStatus] = useState("Loading saved targets…");
  const [scoreSaving,setScoreSaving] = useState(false);
  const [scoreUpdatedAt,setScoreUpdatedAt] = useState<string|null>(null);
  const [focusId,setFocusId] = useState<string|null>(null);
  const [evidenceFocus,setEvidenceFocus] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setScoreStatus("Sign in to load organization scorecard settings");
      return;
    }
    let active = true;
    fetch("/api/scorecard", { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(async response => { if (!response.ok) throw new Error(response.status === 401 ? "Session expired. Please sign in again." : "API request failed"); return response.json(); })
      .then(data => {
        if (!active) return;
        setScore({ precision: String(data.targets.precision), recall: String(data.targets.recall), traceability: String(data.targets.traceability), timeSaved: String(data.targets.timeSaved), actionable: String(data.targets.actionable) });
        setReviewed(Boolean(data.methodologyAgreed));
        setScoreUpdatedAt(data.updatedAt ?? null);
        setScoreStatus("Saved targets loaded from organization database");
      })
      .catch(error => { if (active) setScoreStatus(error instanceof Error ? error.message : "Unable to load scorecard"); });
    return () => { active = false; };
  }, [accessToken]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginStatus("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationSlug: organizationSlug.trim().toLowerCase(), email: loginEmail.trim().toLowerCase(), password: loginPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Sign in failed");
      if (typeof data.accessToken !== "string" || !data.accessToken) throw new Error("The server did not return a valid session token");
      setAccessToken(data.accessToken);
      setLoginPassword("");
      setLoginStatus("");
    } catch (error) {
      setLoginStatus(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    } finally {
      setLoginBusy(false);
    }
  }

  function signOut() {
    setAccessToken(null);
    setLoginPassword("");
    setPage("Overview");
    setSelected(null);
    setLoginStatus("You have signed out.");
  }

  async function saveScorecard() {
    setScoreSaving(true);
    setScoreStatus("Saving…");
    try {
      if (!accessToken) throw new Error("Please sign in before saving.");
      const response = await fetch("/api/scorecard", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ targets: score, methodologyAgreed: reviewed }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save scorecard");
      setScoreUpdatedAt(data.updatedAt ?? null);
      setScoreStatus("Saved to organization database");
    } catch (error) {
      setScoreStatus(error instanceof Error ? error.message : "Could not save scorecard");
    } finally {
      setScoreSaving(false);
    }
  }

  const filtered = useMemo(()=>seed.filter(c=>{
    const matchesQuery = `${c.id} ${c.service} ${c.summary} ${c.problem} ${c.owner}`.toLowerCase().includes(query.toLowerCase());
    const matchesPriority = priority==="All priorities" || c.priority===priority;
    const matchesException = exceptionFilter==="All exceptions" || c.exception.some(e=>e.toLowerCase().includes(exceptionFilter.toLowerCase()));
    return matchesQuery && matchesPriority && matchesException;
  }),[query,priority,exceptionFilter]);
  const exceptions = useMemo(()=>seed.filter(c=>c.exception.length>0),[]);
  const verified = seed.filter(c=>c.state==="Verified permanent fix").length;
  const recurring = new Set(
    seed
      .filter(c => c.recurrence >= 2 && /^PRB-/.test(c.problem))
      .map(c => c.problem)
  ).size;
  const recurringIncidentCases = seed.filter(c => c.recurrence >= 2).length;
  const overdue = seed.filter(c=>c.exception.some(e=>e.toLowerCase().includes("overdue")||e.toLowerCase().includes("owner"))).length;
  const workarounds = seed.filter(c=>c.workaround).length;

  function exportCsv() {
    const header = ["Incident ID","Priority","Service","Summary","Problem","Recurrence","Owner","Days Open","State","Root Cause","Evidence","Exceptions"];
    const rows = filtered.map(c=>[c.id,c.priority,c.service,c.summary,c.problem,c.recurrence,c.owner,c.daysOpen,c.state,c.rootCause,c.evidence,c.exception.join("; ")]);
    const csv = [header,...rows].map(row=>row.map(v=>`"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href=url; a.download="incident-to-fix-assurance-demo.csv"; a.click(); URL.revokeObjectURL(url);
  }
  function go(p:string){setPage(p);setMenuOpen(false);setSelected(null);setFocusId(null);setEvidenceFocus(false);}
  function openCase(c:CaseItem){setEvidenceFocus(false);setSelected(c);}
  function openEvidence(c:CaseItem){setEvidenceFocus(true);setSelected(c);}
  function reviewDemoAnalysis(c:CaseItem){setSelected(null);setEvidenceFocus(false);setMenuOpen(false);setPage("AI Evidence Review");setFocusId(c.id);}
  useEffect(()=>{
    if(selected&&evidenceFocus) document.getElementById("evidence-assessment")?.scrollIntoView({block:"start"});
  },[selected,evidenceFocus]);
  useEffect(()=>{
    if(page==="AI Evidence Review"&&focusId) document.getElementById(`finding-${focusId}`)?.scrollIntoView({block:"start"});
    else if(page==="AI Evidence Review") window.scrollTo({top:0});
  },[page,focusId]);

  const header = (title:string,sub:string,action?:React.ReactNode)=><div className="page-heading"><div><h1>{title}</h1><p>{sub}</p></div>{action}</div>;

  if (!accessToken) return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f3f6f9",fontFamily:"Inter,system-ui,sans-serif",color:"#182b3a"}}>
    <form onSubmit={signIn} style={{width:"100%",maxWidth:440,boxSizing:"border-box",background:"white",padding:32,borderRadius:18,border:"1px solid #dfe7ee",boxShadow:"0 18px 50px rgba(22,45,66,.09)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:26}}><div style={{width:44,height:44,borderRadius:12,display:"grid",placeItems:"center",background:"#e6f2f8",color:"#286b8a"}}><ShieldCheck size={24}/></div><div><strong style={{display:"block",fontSize:22}}>FixAssure</strong><span style={{fontSize:11,letterSpacing:1.2,color:"#6b7d8b"}}>IT OPERATIONS ASSURANCE</span></div></div>
      <h1 style={{fontSize:25,margin:"0 0 8px"}}>Sign in to your workspace</h1><p style={{color:"#647686",fontSize:14,lineHeight:1.55,margin:"0 0 24px"}}>Use the organization slug and account credentials provided by your FixAssure administrator.</p>
      <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:7}} htmlFor="org-slug">Organization slug</label><input id="org-slug" required autoComplete="organization" value={organizationSlug} onChange={e=>setOrganizationSlug(e.target.value)} placeholder="e.g. demo-enterprise" style={{width:"100%",boxSizing:"border-box",padding:"12px 13px",border:"1px solid #cad6df",borderRadius:9,marginBottom:16,fontSize:14}}/>
      <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:7}} htmlFor="login-email">Email address</label><input id="login-email" required type="email" autoComplete="username" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="you@company.com" style={{width:"100%",boxSizing:"border-box",padding:"12px 13px",border:"1px solid #cad6df",borderRadius:9,marginBottom:16,fontSize:14}}/>
      <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:7}} htmlFor="login-password">Password</label><input id="login-password" required type="password" autoComplete="current-password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} style={{width:"100%",boxSizing:"border-box",padding:"12px 13px",border:"1px solid #cad6df",borderRadius:9,marginBottom:18,fontSize:14}}/>
      {loginStatus&&<p role="alert" style={{fontSize:13,color:"#a32c2c",background:"#fff1f0",padding:10,borderRadius:8}}>{loginStatus}</p>}
      <button type="submit" disabled={loginBusy} style={{width:"100%",border:0,borderRadius:9,padding:13,background:loginBusy?"#7d9eaf":"#226783",color:"white",fontSize:14,fontWeight:700,cursor:loginBusy?"wait":"pointer"}}>{loginBusy?"Signing in…":"Sign in securely"}</button>
      <p style={{fontSize:12,color:"#748391",lineHeight:1.5,margin:"18px 0 0"}}>This prototype uses organization-scoped accounts. Demo dashboard records remain synthetic and are not loaded from a live ITSM system.</p>
    </form>
  </div>;

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen?"open":""}`}>
      <div className="brand">
        <div className="brand-mark"><ShieldCheck size={22}/></div>
        <div><strong>FixAssure</strong><span>IT OPERATIONS ASSURANCE</span></div>
        <button className="mobile-close" onClick={()=>setMenuOpen(false)}><X size={18}/></button>
      </div>
      <div className="workspace-label">WORKSPACE</div>
      <div className="workspace-switch"><div className="workspace-avatar">D</div><div><strong>{organizationSlug || "Organization workspace"}</strong><span>Authenticated workspace</span></div><ChevronDown size={15}/></div>
      <div className="nav-label">ASSURANCE</div>
      <nav>{nav.map(item=><button key={item.label} className={`nav-item ${page===item.label?"active":""}`} onClick={()=>go(item.label)}><item.icon size={18}/><span>{item.label}</span>{item.label==="Remediation Exceptions"&&<b className="nav-count">{exceptions.length}</b>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><strong>Need a walkthrough?</strong><p>Explore the assurance workflow using synthetic cases.</p><button onClick={()=>go("Incident-to-Fix Cases")}>Explore cases <ChevronRight size={14}/></button></div>
        <button className="nav-item" onClick={()=>go("Settings")}><Settings2 size={18}/><span>Settings & limitations</span></button>
        <div className="user-profile"><div className="profile-avatar">BS</div><div><strong>Founder workspace</strong><span>Prototype · Local demo</span></div><ChevronDown size={15}/></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu" onClick={()=>setMenuOpen(true)}><Menu size={20}/></button>
        <div className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>{page}</strong></div>
        <div className="topbar-actions"><span className="status-dot"></span><span className="connected-label">Authenticated session</span><button className="btn secondary" onClick={signOut}>Sign out</button><div className="top-avatar">{loginEmail.slice(0,2).toUpperCase()}</div></div>
      </header>
      <div className="demo-banner"><span><LockKeyhole size={15}/><strong>SYNTHETIC DEMO DATA</strong></span><span>No live ITSM connection · No customer data · Demo analysis only</span></div>
      <div className="content">
        {page==="Overview"&&<>
          {header("Executive assurance overview","See where service restoration is complete but permanent remediation may still be at risk.",<button className="btn secondary" onClick={()=>{go("Assurance Reports");setReportReady(true)}}><FileText size={16}/> Generate report</button>)}
          <div className="insight-banner"><div className="insight-icon"><Sparkles size={20}/></div><div><strong>Assurance insight</strong><p>{recurring} unique problem patterns are linked to repeat symptoms. {workarounds} still use a workaround, while only {verified} have a verified permanent fix. These are synthetic examples—not live operational findings.</p></div><button onClick={()=>go("AI Evidence Review")}>Review findings <ChevronRight size={16}/></button></div>
          <div className="kpi-grid">
            <Kpi icon={<Activity/>} label="Qualifying P1 / P2" value={String(seed.filter(c=>c.priority!=="P3").length)} note="Across demo records" trend="Sample data" tone="blue"/>
            <Kpi icon={<GitBranch/>} label="Unique recurring problem patterns" value={String(recurring)} note="Distinct linked problem IDs" trend="Review" tone="amber"/>
            <Kpi icon={<Clock3/>} label="Overdue / owner gaps" value={String(overdue)} note="Exceptions needing review" trend="Action needed" tone="red"/>
            <Kpi icon={<CheckCircle2/>} label="Verified permanent fixes" value={String(verified)} note="Evidence present in demo" trend="Verified" tone="green"/>
          </div>
          <div className="two-col">
            <section className="panel chart-panel"><div className="panel-head"><div><h2>Incident and fix trend</h2><p>Weekly sample trend · synthetic</p></div><Pill>7 weeks</Pill></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{top:8,right:8,left:-20,bottom:0}}><defs><linearGradient id="incFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3986a8" stopOpacity={0.22}/><stop offset="100%" stopColor="#3986a8" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef2"/><XAxis dataKey="week" tick={{fontSize:11,fill:"#718096"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:"#718096"}} axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="incidents" name="Incidents" stroke="#3986a8" fill="url(#incFill)" strokeWidth={2.5}/><Area type="monotone" dataKey="verified" name="Verified fixes" stroke="#2b927a" fill="transparent" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="legend-blue"/> Incidents</span><span><i className="legend-green"/> Verified fixes</span></div></section>
            <section className="panel chart-panel"><div className="panel-head"><div><h2>Case outcome mix</h2><p>Current lifecycle states</p></div><Pill>12 cases</Pill></div><div className="donut-layout"><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={77} paddingAngle={3} stroke="none">{statusData.map((s,i)=><Cell key={i} fill={s.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="donut-center"><strong>12</strong><span>cases</span></div></div><div className="legend-list">{statusData.map(s=><div key={s.name}><span><i style={{background:s.color}}/>{s.name}</span><strong>{s.value}</strong></div>)}</div></div></section>
          </div>
          <section className="panel"><div className="panel-head"><div><h2>Priority cases to review</h2><p>Examples of where restoration and permanent resolution differ</p></div><button className="text-button" onClick={()=>go("Incident-to-Fix Cases")}>View all cases <ChevronRight size={15}/></button></div><CaseTable cases={seed.filter(c=>c.priority==="P1"||c.exception.length>1).slice(0,5)} onOpen={openCase}/></section>
          <div className="footnote"><LockKeyhole size={14}/> All figures and records in this prototype are synthetic and do not represent actual customer incidents.</div>
        </>}

        {page==="Incident-to-Fix Cases"&&<>
          {header("Incident-to-Fix cases","Search and inspect the assurance record from restoration through remediation.",<button className="btn primary" onClick={exportCsv}><Download size={16}/> Export CSV</button>)}
          <div className="filters"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search incident, service, owner or problem…"/></div><select value={priority} onChange={e=>setPriority(e.target.value)}><option>All priorities</option><option>P1</option><option>P2</option><option>P3</option></select><span className="result-count">{filtered.length} cases</span></div>
          <section className="panel"><CaseTable cases={filtered} onOpen={openCase}/></section>
          <div className="footnote"><CircleHelp size={14}/> Select a case to inspect its evidence, timeline, remediation state and residual risk.</div>
        </>}

        {page==="AI Evidence Review"&&<>
          {header("AI evidence review","Demo analysis shows how an evidence-first assistant should separate facts, suggestions and unknowns.",<Pill kind="warning">Mock analysis</Pill>)}
          <div className="ai-disclaimer"><BrainCircuit size={18}/><div><strong>Demo analysis — no live AI model and no ITSM connection</strong><p>Every finding below is generated by fixed rules from synthetic demo records. No AI inference runs and no ServiceNow or Jira data is read. A production version would have to cite real source records and keep suggestions apart from confirmed facts.</p></div></div>
          <section className="panel why-panel"><h2>Why a permanent fix is not "verified" when evidence is incomplete</h2><p>Restoring service shows the symptom stopped. It does not show the cause was removed. A fix counts as verified only when all of these hold:</p><ol><li>The root cause is validated against source evidence.</li><li>The evidence is complete and traceable to records.</li><li>A change is linked, or the reason none is needed is documented.</li><li>The agreed verification criteria have been met, for example an observation period with no recurrence.</li></ol><p>If any item is missing, the case stays Restored, Contained or In progress. Risk acceptance is a decision to tolerate the issue, not proof it is fixed. In this demo, {seed.filter(c=>c.state!=="Verified permanent fix").length} of {seed.length} cases are not verified and {seed.filter(c=>c.evidence!=="Complete").length} have incomplete evidence.</p></section>
          <div className="finding-legend"><span><Pill kind="success">Confirmed demo facts</Pill> taken directly from the synthetic record</span><span><Pill kind="warning">Proposed</Pill> a suggestion that needs human review</span><span><Pill kind="neutral">Unknown</Pill> cannot be told from the record</span></div>
          {focusId&&<div className="focus-banner"><span>Showing demo analysis for <strong>{focusId}</strong>, highlighted below.</span><button className="text-button" onClick={()=>setFocusId(null)}>Clear highlight</button></div>}
          <div className="review-grid rich">{seed.filter(c=>c.exception.length>0||c.id===focusId).map(c=><article className={`review-card finding-card ${focusId===c.id?"focused":""}`} id={`finding-${c.id}`} key={c.id}><div className="review-card-top"><Pill kind={c.priority==="P1"?"danger":c.priority==="P2"?"warning":"neutral"}>{c.priority}</Pill><span>{c.id}</span></div><h3>{c.summary}</h3><div className="review-finding"><AlertTriangle size={16}/><span>Issue: {c.exception.length?c.exception.join(" · "):"No configured exception"}</span></div><FindingBody c={c}/><div className="review-card-foot"><span>{c.evidence} evidence · {c.state}</span><button className="text-button" onClick={()=>openEvidence(c)}>View evidence <ChevronRight size={14}/></button></div></article>)}</div>
          <section className="panel prompt-panel"><div className="prompt-icon"><Sparkles size={20}/></div><div><h2>Questions the assistant should ask</h2><ul><li>Which facts are directly supported by the source records?</li><li>What assumptions remain unverified or contradict the timeline?</li><li>Does the proposed fix address the suspected cause or only restore service?</li><li>What evidence would be needed to confirm sustainable remediation?</li></ul></div></section>
        </>}

        {page==="Remediation Exceptions"&&<>
          {header("Remediation exceptions","Prioritize governance gaps without treating every exception as an automatic failure.",<button className="btn secondary" onClick={exportCsv}><Download size={16}/> Export filtered cases</button>)}
          <div className="exception-summary"><div><span>Cases with exceptions</span><strong>{exceptions.length}</strong></div><div><span>Recurring incident cases</span><strong>{recurringIncidentCases}</strong></div><div><span>Missing evidence</span><strong>{seed.filter(c=>c.evidence==="Missing").length}</strong></div><div><span>Long-lived workaround</span><strong>{seed.filter(c=>c.workaround&&c.daysOpen>=12).length}</strong></div></div>
          <div className="filters"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search exceptions…"/></div><select value={exceptionFilter} onChange={e=>setExceptionFilter(e.target.value)}><option>All exceptions</option><option>Recurring incident</option><option>workaround</option><option>owner</option><option>RCA</option><option>verification</option><option>Overdue</option><option>Risk review</option></select><span className="result-count">{filtered.length} matching</span></div>
          <section className="panel"><CaseTable cases={filtered.filter(c=>c.exception.length>0)} onOpen={openCase}/></section>
        </>}

        {page==="Assurance Reports"&&<>
          {header("Assurance reports","Prepare an executive-ready summary of synthetic cases and unresolved remediation risks.",<button className="btn primary" onClick={()=>{setReportReady(true);setTimeout(()=>window.print(),100)}}><Download size={16}/> Print / save PDF</button>)}
          <section className="panel report-cover"><div className="report-brand"><div className="brand-mark"><ShieldCheck size={22}/></div><div><strong>FixAssure</strong><span>IT OPERATIONS ASSURANCE</span></div></div><Pill kind="warning">Synthetic demonstration</Pill><h2>Incident-to-Permanent-Fix Assurance Report</h2><p className="report-date">Prepared for: Demo Enterprise · Generated locally</p><div className="report-kpis"><div><span>Cases reviewed</span><strong>{seed.length}</strong></div><div><span>Unique recurring problem patterns</span><strong>{recurring}</strong></div><div><span>Verified fixes</span><strong>{verified}</strong></div><div><span>Workarounds in use</span><strong>{workarounds}</strong></div></div><h3>Executive observations</h3><ul><li>Several synthetic cases illustrate repeat symptoms where the service has been restored but the permanent-remediation status remains unresolved.</li><li>Cases with missing owners, overdue milestones or incomplete evidence require human review under the configured demo policy.</li><li>Risk-accepted cases remain distinct from verified permanent fixes and should retain an owner and review date.</li></ul><h3>Recommended actions</h3><ol><li>Validate problem ownership and remediation commitments for P1/P2 and recurring cases.</li><li>Review RCA evidence and explicitly separate confirmed facts from hypotheses.</li><li>Set verification criteria and observation periods for proposed permanent fixes.</li><li>Review deferred fixes and risk acceptance at the agreed date.</li></ol><p className="report-note">This is a product demonstration, not a report about a real organization. Figures and recommendations are based on synthetic records and have not been independently verified.</p>{reportReady&&<Pill kind="success">Report prepared for printing</Pill>}</section>
        </>}

        {page==="Pilot Scorecard"&&<>
          {header("Pilot evaluation scorecard","Proposed acceptance criteria to test with a human-reviewed reference set—not industry benchmarks.",<Pill kind={reviewed?"success":"warning"}>{reviewed?"Review marked complete":"Review not completed"}</Pill>)}
          <div className="ai-disclaimer"><Target size={18}/><div><strong>Agree targets before evaluating</strong><p>Set the qualifying population, sampling approach and reference labels with the customer. Report counts and sample size alongside percentages.</p></div></div>
          <section className="panel score-panel"><div className="panel-head"><div><h2>Proposed pilot targets</h2><p>Editable for planning; no measurements have been run.</p></div><Pill>Planning only</Pill></div>
            <div className="score-rows">{[
              ["Detection precision","Percentage of flagged exceptions confirmed valid by reviewers","precision","%"],
              ["Critical-gap recall","Percentage of reference-set critical gaps detected","recall","%"],
              ["Evidence traceability","Material findings with accessible source references","traceability","%"],
              ["Manual analysis time saved","Reduction against measured manual baseline","timeSaved","%"],
              ["Actionable findings","Reviewed findings judged actionable by process owners","actionable","%"]
            ].map(([label,desc,key,unit])=><div className="score-row" key={key}><div><strong>{label}</strong><p>{desc}</p></div><div className="score-input"><input type="number" min="0" max="100" value={score[key as keyof typeof score]} onChange={e=>setScore({...score,[key]:e.target.value})}/><span>{unit}</span></div></div>)}
            <div className="score-row"><div><strong>Unsupported causes presented as facts</strong><p>Required result: zero. Track every reviewed material claim.</p></div><Pill kind="danger">0 tolerated</Pill></div></div>
            <div className="score-footer"><label className="check-label"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/> Human-review methodology and sample have been agreed</label><div className="score-actions"><span className="score-save-status" role="status">{scoreStatus}{scoreUpdatedAt ? ` · Updated ${new Date(scoreUpdatedAt).toLocaleString()}` : ""}</span><button className="btn primary" onClick={saveScorecard} disabled={scoreSaving}>{scoreSaving ? "Saving…" : "Save targets"}</button><button className="btn secondary" onClick={()=>window.print()}><FileText size={16}/> Print scorecard</button></div></div>
          </section>
          <div className="two-col"><section className="panel compact-panel"><h2>Required evaluation notes</h2><ul><li>Reference set size and selection method</li><li>Reviewer expertise and disagreement handling</li><li>Precision and recall counts, not percentages alone</li><li>False positives, missed cases and severity</li><li>Data quality and unsupported-source limitations</li></ul></section><section className="panel compact-panel"><h2>Operational outcome measures</h2><ul><li>Median age of unresolved problems</li><li>Workaround duration</li><li>Verified remediation rate</li><li>Repeat incidents after claimed fixes</li><li>Accepted actions and customer impact</li></ul></section></div>
        </>}

        {page==="Consulting Services"&&<>
          {header("ITSM consulting services","A consulting-led path to validate the problem, improve governance and develop the product with evidence.",<Pill>Indicative offers</Pill>)}
          <div className="consulting-intro"><div className="consulting-icon"><BriefcaseBusiness size={22}/></div><div><h2>Start with the operational gap—not a software sale.</h2><p>These offers are designed for customer discovery and validation. Pricing is an initial hypothesis, not verified market pricing or a guarantee of demand.</p></div></div>
          <div className="package-grid">
            <Package icon={<Search/>} title="ITSM Assurance Diagnostic" price="₹35k–₹75k" duration="1–2 weeks" description="Review a defined sample of incident and problem records to identify where permanent remediation breaks down." bullets={["Incident-to-problem linkage","RCA evidence and ownership review","Recurring failures and workaround age","Executive report and prioritized actions"]}/>
            <Package icon={<Workflow/>} title="Governance Improvement" price="₹1L–₹2.5L" duration="3–6 weeks" description="Improve the operating controls connecting Incident, Problem, Change and Release Management." bullets={["Accountability and escalation rules","RCA and remediation criteria","Risk acceptance and review controls","KPIs and operating procedures"]}/>
            <Package icon={<BrainCircuit/>} title="AI Assurance Pilot" price="₹1.5L–₹4L" duration="4–6 weeks" description="Validate whether evidence-grounded AI findings improve operational assurance on controlled data." bullets={["Baseline and success criteria","Human-reviewed evaluation","AI finding and evidence comparison","Pilot outcome and next-step report"]}/>
          </div>
          <div className="checklist-cta"><div><h2>Prepare for customer discovery</h2><p>Use a structured checklist to qualify a prospect before committing to an implementation.</p></div><button className="btn primary" onClick={()=>setShowChecklist(!showChecklist)}><ListChecks size={16}/>{showChecklist?"Hide checklist":"Prepare discovery checklist"}</button></div>
          {showChecklist&&<section className="panel checklist-panel"><h2>Discovery checklist</h2>{["Which ITSM platform and edition are in use?","How many P1/P2 and recurring incidents occur monthly?","How are incident and problem records linked today?","What constitutes an accepted permanent fix?","Who owns overdue problems and workaround risk?","What reports or controls already solve this need?","Can the customer provide a permitted anonymized sample?","Who owns the budget and procurement decision?","What outcome would justify a paid pilot?","What security, privacy and data-residency requirements apply?"].map((s,i)=><label key={i} className="checklist-item"><input type="checkbox"/><span>{s}</span></label>)}<button className="btn secondary" onClick={()=>window.print()}><Download size={15}/> Print checklist</button></section>}
        </>}

        {page==="Settings"&&<>
          {header("Settings & MVP limitations","Prototype scope, assumptions and production-readiness boundaries.",<Pill kind="warning">Not production ready</Pill>)}
          <div className="two-col"><section className="panel compact-panel"><h2><LockKeyhole size={18}/> Current safeguards</h2><ul><li>Synthetic demo records only</li><li>No live ITSM connections or writes</li><li>Demo analysis is seeded, not live AI inference</li><li>No secrets or customer credentials required</li><li>CSV export contains demo records</li></ul></section><section className="panel compact-panel"><h2><ShieldAlert size={18}/> Limitations before real data</h2><ul><li>No authentication or production tenant isolation</li><li>No security certification</li><li>No approved data-processing agreement</li><li>No real connector or model provider configured</li><li>Human validation required for all material findings</li></ul></section></div>
          <section className="panel compact-panel"><h2>Lifecycle definitions</h2><div className="definition-list"><p><Pill kind="neutral">Restored</Pill> Service is operating again; underlying cause may remain.</p><p><Pill kind="warning">Contained</Pill> Immediate impact is controlled but residual risk remains.</p><p><Pill kind="info">Remediation in progress</Pill> Corrective work is active and not yet verified.</p><p><Pill kind="success">Verified permanent fix</Pill> Required evidence and agreed verification criteria are met.</p><p><Pill kind="purple">Risk accepted</Pill> An authorized owner accepts residual risk; this does not mean the defect was eliminated.</p></div></section>
        </>}
      </div>
      <footer className="app-footer"><span>FixAssure · Incident-to-Permanent-Fix Assurance</span><span><LockKeyhole size={13}/> Synthetic data only · Prototype v0.1</span></footer>
    </main>

    {selected&&<div className="drawer-backdrop" onClick={()=>setSelected(null)}><aside className="case-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">ASSURANCE RECORD</span><h2>{selected.id}</h2></div><button className="icon-button" onClick={()=>setSelected(null)}><X size={19}/></button></div><div className="drawer-content">
      <div className="drawer-title-row"><Pill kind={selected.priority==="P1"?"danger":selected.priority==="P2"?"warning":"neutral"}>{selected.priority}</Pill><Pill kind={selected.state==="Verified permanent fix"?"success":selected.state==="Risk accepted"?"purple":"warning"}>{selected.state}</Pill></div>
      <h3>{selected.summary}</h3><p className="muted">{selected.service} · Reported {selected.date}</p>
      <div className="drawer-kpis"><div><span>Recurrence count</span><strong>{selected.recurrence}</strong></div><div><span>Problem age</span><strong>{selected.daysOpen} days</strong></div></div>
      <section className="drawer-section"><h4><Workflow size={16}/> Lifecycle timeline</h4><Timeline state={selected.state} change={selected.change} verification={selected.verification}/></section>
      <section className={`drawer-section ${evidenceFocus?"evidence-highlight":""}`} id="evidence-assessment"><h4><FileCheck2 size={16}/> Evidence assessment</h4><div className="detail-row"><span>Root-cause status</span><Pill kind={selected.rootCause==="Validated"?"success":selected.rootCause==="Disputed"?"danger":"warning"}>{selected.rootCause}</Pill></div><div className="detail-row"><span>Evidence completeness</span><Pill kind={selected.evidence==="Complete"?"success":selected.evidence==="Partial"?"warning":"danger"}>{selected.evidence}</Pill></div><div className="evidence-box"><strong>Demo evidence note</strong><p>{selected.evidence==="Complete"?"The demo record includes a reference to validation evidence. Inspect the source record and criteria before treating the fix as verified.":selected.evidence==="Partial"?"The demo record contains partial evidence. Confirm the causal link and identify what is missing before approving remediation.":"The demo record lacks sufficient evidence to support a confirmed root cause or permanent-fix claim."}</p><span>Source: {selected.id} · Synthetic record</span></div><FindingBody c={selected}/></section>
      <section className="drawer-section"><h4><ShieldAlert size={16}/> Residual risk & exceptions</h4><div className="risk-box"><AlertTriangle size={16}/><span>{selected.risk}</span></div>{selected.exception.length?selected.exception.map(e=><div className="exception-line" key={e}><AlertTriangle size={14}/>{e}</div>):<div className="success-line"><CheckCircle2 size={15}/> No configured demo exceptions</div>}</section>
      <section className="drawer-section"><h4><GitBranch size={16}/> Remediation details</h4><div className="detail-row"><span>Problem reference</span><strong>{selected.problem}</strong></div><div className="detail-row"><span>Accountable owner</span><strong>{selected.owner}</strong></div><div className="detail-row"><span>Restoration method</span><strong>{selected.method}</strong></div><div className="detail-row"><span>Change required</span><strong>{selected.changeRequired?"Yes":"No — rationale required"}</strong></div><div className="detail-row"><span>Change reference</span><strong>{selected.change}</strong></div><div className="detail-row"><span>Verification</span><strong>{selected.verification}</strong></div></section>
      <div className="drawer-disclaimer"><LockKeyhole size={15}/> Synthetic demonstration. No production decision should be based on these records.</div>
    </div><div className="drawer-footer"><button className="btn secondary" onClick={()=>reviewDemoAnalysis(selected)}><BrainCircuit size={16}/> Review demo analysis</button></div></aside></div>}
  </div>;
}

function Kpi({icon,label,value,note,trend,tone}:{icon:React.ReactNode;label:string;value:string;note:string;trend:string;tone:string}){
  return <div className="kpi-card"><div className={`kpi-icon ${tone}`}>{icon}</div><div className="kpi-label">{label}<span className="kpi-trend">{trend}</span></div><div className="kpi-value">{value}</div><div className="kpi-note">{note}</div></div>;
}
function CaseTable({cases,onOpen}:{cases:CaseItem[];onOpen:(c:CaseItem)=>void}){
  return <div className="table-scroll"><table className="case-table"><thead><tr><th>Incident / service</th><th>Priority</th><th>Problem</th><th>Owner</th><th>Lifecycle state</th><th>Exceptions</th><th></th></tr></thead><tbody>{cases.map(c=><tr key={c.id} onClick={()=>onOpen(c)}><td><strong>{c.id}</strong><span>{c.service}</span><small>{c.summary}</small></td><td><Pill kind={c.priority==="P1"?"danger":c.priority==="P2"?"warning":"neutral"}>{c.priority}</Pill></td><td>{c.problem}</td><td>{c.owner==="Unassigned"?<Pill kind="danger">Unassigned</Pill>:c.owner}</td><td><Pill kind={c.state==="Verified permanent fix"?"success":c.state==="Risk accepted"?"purple":c.state==="Restored"?"neutral":"warning"}>{c.state}</Pill></td><td>{c.exception.length?<Pill kind="warning">{c.exception.length} flags</Pill>:<Pill kind="success">Clear</Pill>}</td><td><ChevronRight size={17} className="row-chevron"/></td></tr>)}</tbody></table>{cases.length===0&&<div className="empty-state"><Search size={24}/><strong>No cases match</strong><span>Try changing the search or filters.</span></div>}</div>;
}
function Timeline({state,change,verification}:{state:State;change:string;verification:string}){
  const steps = [
    ["Incident recorded","Incident reference and impact captured",true],
    ["Service restored","Service returned through a workaround or corrective action",true],
    ["Problem investigated","Cause and evidence reviewed",state!=="Restored"],
    ["Remediation decision","Fix, further investigation or risk acceptance",state==="Remediation in progress"||state==="Verified permanent fix"||state==="Risk accepted"],
    [change==="—"?"Change not required / not linked":"Change / release",change==="—"?"Applicability must be documented":change,change!=="—"||state==="Risk accepted"],
    ["Verification",verification,state==="Verified permanent fix"]
  ] as [string,string,boolean][];
  return <div className="timeline">{steps.map((s,i)=><div className={`timeline-step ${s[2]?"done":""}`} key={s[0]}><div className="timeline-marker">{s[2]?<CheckCircle2 size={15}/>:<span>{i+1}</span>}</div><div><strong>{s[0]}</strong><p>{s[1]}</p></div></div>)}</div>;
}
function Package({icon,title,price,duration,description,bullets}:{icon:React.ReactNode;title:string;price:string;duration:string;description:string;bullets:string[]}){
  return <section className="panel package-card"><div className="package-icon">{icon}</div><div className="package-duration">{duration}</div><h2>{title}</h2><div className="package-price">{price}</div><p>{description}</p><ul>{bullets.map(b=><li key={b}>{b}</li>)}</ul><div className="package-foot"><span>Indicative pricing hypothesis</span><CheckCircle2 size={15}/></div></section>;
}
export default App;
