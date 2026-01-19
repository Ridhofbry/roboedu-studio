import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, 
  serverTimestamp, query, orderBy 
} from "firebase/firestore";
import { 
  Play, CheckCircle2, AlertCircle, FolderOpen, Film, FileVideo, ChevronLeft, 
  LogOut, ShieldCheck, MonitorPlay, Lock, ArrowRight, X, User, Edit2, 
  ExternalLink, Save, Zap, AlertTriangle, Download, Sparkles, Wand2, 
  Loader2, Copy, Plus, Trash2, Calendar, Grid, Mic, Users, Music
} from 'lucide-react';

/* ========================================================================
   1. KONFIGURASI (LIVE MODE)
   ======================================================================== */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Inisialisasi
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ========================================================================
   2. DATA & STYLING
   ======================================================================== */

const TEAMS = [
  { id: 'team-1', name: 'Tim 1', members: ['Farel Fajar Al Azizy', 'Dimas Setya Prima Putra'] },
  { id: 'team-2', name: 'Tim 2', members: ['Hasbi Maulana Fathir', 'Muhammad Afif Naufal'] },
  { id: 'team-3', name: 'Tim 3', members: ['M. Rashya Arief A.', 'Rajendra Ges Abiyasa'] },
  { id: 'team-4', name: 'Tim 4', members: ['Ahmad Zidhan Mubaroq', 'Alfinza Rehandista'] },
];

const WORKFLOW_STEPS = [
  { 
    id: 'step-1', title: 'Konsep', subtitle: 'Pre-Pro', icon: <FolderOpen size={18} />, 
    color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700',
    tasks: [{ id: 't1-1', label: 'Pahami Brief' }, { id: 't1-2', label: 'Download Aset' }, { id: 't1-3', label: 'Scripting', hasAI: true }] 
  },
  { 
    id: 'step-2', title: 'Produksi', subtitle: 'Shooting', icon: <Film size={18} />, 
    color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700',
    tasks: [{ id: 't2-1', label: 'Cam: 1080p 60fps' }, { id: 't2-2', label: 'Ratio: 9:16' }, { id: 't2-3', label: 'Lighting Aman' }] 
  },
  { 
    id: 'step-3', title: 'Audio', subtitle: 'Voice Over', icon: <Mic size={18} />, 
    color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700',
    tasks: [{ id: 't3-1', label: 'No Noise' }, { id: 't3-2', label: 'Intonasi Jelas' }, { id: 't3-3', label: 'Audio Level Pas' }] 
  },
  { 
    id: 'step-4', title: 'Editing', subtitle: 'Post-Pro', icon: <MonitorPlay size={18} />, 
    color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700',
    tasks: [{ id: 't4-1', label: 'Cutting Rapi' }, { id: 't4-2', label: 'Subtitle Safe Area' }, { id: 't4-3', label: 'Grading Pop' }] 
  },
  { 
    id: 'step-5', title: 'Final', subtitle: 'Ekspor', isGatekeeper: true, icon: <CheckCircle2 size={18} />, 
    color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700',
    tasks: [{ id: 't5-1', label: 'Upload Preview' }, { id: 't5-2', label: 'Cek Revisi' }, { id: 't5-3', label: 'Final 1080p' }] 
  }
];

// CSS Animations (Injecting via JS for simplicity in single file)
const globalStyles = `
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
  @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.5); }
  .glass-card-hover:hover { background: rgba(255, 255, 255, 0.9); transform: translateY(-2px); box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1); }
`;

// Komponen Robot Maskot
const RoboLogo = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible drop-shadow-xl">
    <g className="animate-[float_3s_ease-in-out_infinite] origin-bottom">
      <line x1="50" y1="10" x2="50" y2="30" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="10" r="6" fill="#f43f5e" className="animate-pulse" />
    </g>
    <rect x="20" y="30" width="60" height="50" rx="14" fill="white" stroke="#4f46e5" strokeWidth="4" />
    <rect x="26" y="36" width="48" height="38" rx="8" fill="#e0e7ff" />
    <g className="origin-center" style={{ transformOrigin: "50% 55%" }}>
      <circle cx="38" cy="52" r="5" fill="#1e1b4b" className="animate-[blink_4s_infinite]" />
      <circle cx="62" cy="52" r="5" fill="#1e1b4b" className="animate-[blink_4s_infinite]" />
    </g>
    <path d="M15 55 L20 55" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
    <path d="M80 55 L85 55" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

/* ========================================================================
   3. KOMPONEN LAYOUT (FIXED: Moved Outside App)
   ======================================================================== */

const Layout = ({ children, title, subtitle, showBack, onBack, showAssets, showLogout, setView, setCurrentUser, setLoginStep, setPasswordInput }) => (
  <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col">
      <style>{globalStyles}</style>
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Glass Header */}
      <div className="glass-panel px-6 py-5 sticky top-0 z-40 flex justify-between items-center transition-all shadow-sm">
           <div className="flex items-center gap-3">
              {showBack && (
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white shadow-sm border border-slate-100 active:scale-90 transition-all">
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-black text-slate-800 leading-none tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{subtitle}</p>}
              </div>
           </div>
           <div className="flex gap-2">
              {showAssets && (
                <button onClick={() => setView('assets')} className="w-10 h-10 bg-white/80 border border-slate-100 text-blue-600 rounded-full hover:bg-blue-50 shadow-sm transition-all hover:rotate-12 flex items-center justify-center">
                  <FolderOpen size={20} />
                </button>
              )}
              {showLogout && (
                <button onClick={() => { setCurrentUser(null); setView('login'); setLoginStep('role-select'); setPasswordInput(''); }} className="w-10 h-10 bg-white/80 border border-red-100 text-red-500 rounded-full hover:bg-red-50 shadow-sm transition-all hover:scale-110 flex items-center justify-center">
                  <LogOut size={20} />
                </button>
              )}
           </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 relative z-10 custom-scrollbar">
        {children}
      </div>
  </div>
);

/* ========================================================================
   4. APLIKASI UTAMA
   ======================================================================== */

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  
  // UI States
  const [view, setView] = useState('login'); 
  const [activeProject, setActiveProject] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);
  
  // Auth States
  const [loginStep, setLoginStep] = useState('role-select'); 
  const [selectedRole, setSelectedRole] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Form States (Supervisor)
  const [newAssetForm, setNewAssetForm] = useState({ title: '', type: 'folder', link: '', size: '' });
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [feedbackInput, setFeedbackInput] = useState('');
  
  // AI States
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  // --- FIREBASE SYNC ---
  useEffect(() => {
    const unsubP = onSnapshot(query(collection(db, "projects"), orderBy("createdAt", "desc")), s => 
      setProjects(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubA = onSnapshot(query(collection(db, "assets"), orderBy("createdAt", "desc")), s => 
      setAssets(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubP(); unsubA(); };
  }, []);

  // --- LOGIC FUNCTIONS ---
  const handleAddNewProject = async (teamId) => {
    const newProject = { teamId, status: 'In Progress', progress: 0, title: 'Konten Baru', description: 'Deskripsi...', completedTasks: [], isApproved: false, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, "projects"), newProject);
    setActiveProject({ id: docRef.id, ...newProject }); setEditForm({ title: '', description: '' }); setIsEditingProject(true); setView('project-detail');
  };

  const handleUpdateProject = async (id, data) => {
    await updateDoc(doc(db, "projects", id), data);
    if(activeProject?.id === id) setActiveProject(p => ({ ...p, ...data }));
  };

  const handleTaskToggle = (projId, taskId) => {
    const proj = projects.find(p => p.id === projId); if(!proj) return;
    const newCompleted = proj.completedTasks.includes(taskId) ? proj.completedTasks.filter(i => i !== taskId) : [...proj.completedTasks, taskId];
    const total = WORKFLOW_STEPS.reduce((a, s) => a + s.tasks.length, 0);
    const prog = Math.round((newCompleted.length / total) * 100);
    let status = proj.status;
    const allReview = WORKFLOW_STEPS[4].tasks.map(t => t.id).every(id => newCompleted.includes(id));
    if (allReview && proj.previewLink && !proj.isApproved) status = 'Waiting Review';
    if (prog === 100 && proj.isApproved) status = 'Approved';
    handleUpdateProject(projId, { completedTasks: newCompleted, progress: prog, status });
  };

  const handleScript = async () => {
    setIsAILoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ contents: [{ parts: [{ text: `Buat naskah TikTok pendek seru tentang: "${aiPrompt}". Bahasa Indonesia gaul.` }] }] }) });
      const data = await res.json(); setAiResult(data.candidates?.[0]?.content?.parts?.[0]?.text || "Gagal.");
    } catch { setAiResult("Error AI."); } finally { setIsAILoading(false); }
  };

  // --- VIEWS RENDERER ---

  // 1. LOGIN VIEW
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <style>{globalStyles}</style>
        {/* Animated Orbs */}
        <div className="absolute top-0 -left-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 -right-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob animation-delay-2000"></div>
        
        <div className="w-full max-w-sm glass-panel rounded-[2.5rem] shadow-2xl p-8 relative z-10 border border-white/60">
          <div className="flex justify-center mb-6"><RoboLogo size={90} /></div>
          <h1 className="text-3xl font-black text-center text-slate-800 mb-1 tracking-tight">RoboEdu<span className="text-indigo-600">.Studio</span></h1>
          <p className="text-center text-slate-500 text-sm mb-8 font-bold tracking-wide">CREATIVE PRODUCTION SYSTEM</p>
          
          {loginStep === 'role-select' && (
            <div className="space-y-4 animate-[slideUp_0.4s_ease-out]">
              <button onClick={() => { setSelectedRole('creator'); setLoginStep('password'); }} className="w-full p-1 bg-white hover:scale-[1.02] transition-transform rounded-2xl shadow-lg group">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 flex items-center">
                   <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white mr-4"><Users size={24}/></div>
                   <div className="text-left text-white flex-1"><div className="font-bold text-lg">Tim Kreator</div><div className="text-xs opacity-80">Login Kelompok</div></div>
                   <div className="w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center"><ArrowRight size={16}/></div>
                </div>
              </button>
              <button onClick={() => { setSelectedRole('supervisor'); setLoginStep('password'); }} className="w-full p-4 bg-slate-100 hover:bg-white border-2 border-transparent hover:border-slate-200 rounded-2xl flex items-center transition-all group">
                <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mr-4"><ShieldCheck size={24}/></div>
                <div className="text-left flex-1"><div className="font-bold text-slate-700 text-lg">Supervisor</div><div className="text-xs text-slate-400">Monitoring Mode</div></div>
              </button>
            </div>
          )}

          {loginStep === 'password' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (selectedRole === 'creator') passwordInput === 'SUKSES2026' ? setLoginStep('team-select') : setLoginError('Password Salah!');
              else if (selectedRole === 'supervisor') passwordInput === 'roboedu.ahr2026' ? (setCurrentUser({ role: 'supervisor', name: 'Supervisor' }) || setView('team-list')) : setLoginError('Password Salah!');
            }} className="animate-[slideUp_0.4s_ease-out]">
              <div className="flex items-center justify-between mb-6"><span className="text-sm font-bold text-slate-500">Kunci Akses: <span className="text-indigo-600 capitalize">{selectedRole}</span></span><button type="button" onClick={() => { setLoginStep('role-select'); setPasswordInput(''); setLoginError(''); }} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={16}/></button></div>
              <div className="relative mb-6 group"><Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} /><input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Masukkan Kode..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all" autoFocus /></div>
              {loginError && <div className="mb-4 text-xs text-red-600 bg-red-50 p-3 rounded-xl font-bold flex items-center gap-2"><AlertCircle size={14} /> {loginError}</div>}
              <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2">Buka Akses <Zap size={18} fill="currentColor"/></button>
            </form>
          )}

          {loginStep === 'team-select' && (
             <div className="animate-[slideUp_0.4s_ease-out]">
                <div className="flex items-center justify-between mb-4"><span className="text-sm font-bold text-slate-500">Pilih Tim Kamu:</span><button type="button" onClick={() => setLoginStep('role-select')} className="p-2 bg-slate-100 rounded-full"><X size={16} /></button></div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {TEAMS.map((team) => (
                    <button key={team.id} onClick={() => { setCurrentUser({ role: 'creator', teamId: team.id, name: team.name }); setView('dashboard'); }} className="w-full text-left p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-150 transition-transform"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-1"><span className="font-bold text-slate-800 text-lg group-hover:text-indigo-700">{team.name}</span></div>
                        <div className="text-[10px] font-medium text-slate-500">{team.members.join(' & ')}</div>
                      </div>
                    </button>
                  ))}
                </div>
             </div>
          )}
        </div>
        <div className="absolute bottom-6 text-[10px] font-bold text-slate-400 tracking-widest">POWERED BY ROBOEDU</div>
      </div>
    );
  }

  // 2. DASHBOARD VIEW (CREATOR)
  if (view === 'dashboard' && currentUser?.role === 'creator') {
    const myProjects = projects.filter(p => p.teamId === currentUser.teamId);
    return (
      <Layout title={`Halo, ${currentUser.name}!`} subtitle="Creative Dashboard" showLogout setView={setView} setCurrentUser={setCurrentUser} setLoginStep={setLoginStep} setPasswordInput={setPasswordInput}>
        
        {/* Hero Card */}
        <div onClick={() => setView('assets')} className="relative w-full h-40 rounded-[2rem] overflow-hidden shadow-2xl cursor-pointer group mb-8 transition-transform hover:scale-[1.02]">
           <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600"></div>
           <div className="absolute top-[-50%] left-[-20%] w-60 h-60 bg-white opacity-10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-50%] right-[-20%] w-60 h-60 bg-cyan-400 opacity-20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
           <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center"><FolderOpen className="text-white" size={24}/></div>
                 <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold tracking-wider">ASET RESMI</div>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-white leading-tight">Gudang File</h3>
                 <p className="text-xs text-indigo-100 font-medium">Download Logo, Font, & Bumper</p>
              </div>
           </div>
        </div>

        <h2 className="font-black text-slate-800 mb-4 text-lg flex items-center gap-2"><div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Jobdesk Aktif</h2>
        {myProjects.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300"><Calendar size={30}/></div>
              <p className="text-sm text-slate-400 font-bold">Belum ada tugas.</p>
           </div>
        ) : (
           <div className="space-y-4">
              {myProjects.map(project => (
              <div key={project.id} onClick={() => { setActiveProject(project); setView('project-detail'); }} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm glass-card-hover cursor-pointer transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide ${project.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{project.status}</span>
                    {project.isApproved && <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md shadow-emerald-200"><CheckCircle2 size={14}/></div>}
                  </div>
                  <h3 className="font-bold text-slate-800 text-xl mb-1 leading-tight">{project.title}</h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-1 font-medium">{project.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner"><div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div></div>
                    <span className="text-[10px] font-black text-slate-600">{project.progress}%</span>
                  </div>
              </div>
              ))}
          </div>
        )}
      </Layout>
    );
  }

  // 3. ASSETS & SUPERVISOR (Shared Logic with UI Upgrade)
  // ... (Kode bagian Supervisor dan Aset menggunakan logic yang sama tapi dibungkus Layout baru & Class CSS baru)
  // Saya persingkat bagian ini agar muat, tapi dengan style baru.

  if (view === 'team-list' && currentUser?.role === 'supervisor') {
    return (
      <Layout title="Dashboard" subtitle="Pilih Tim" showLogout showAssets setView={setView} setCurrentUser={setCurrentUser} setLoginStep={setLoginStep} setPasswordInput={setPasswordInput}>
        <div className="grid grid-cols-1 gap-4">
          {TEAMS.map((team) => {
            const count = projects.filter(p => p.teamId === team.id).length;
            return (
              <div key={team.id} onClick={() => { setActiveTeamId(team.id); setView('team-projects'); }} className="bg-white p-5 rounded-[2rem] border border-slate-100 glass-card-hover cursor-pointer transition-all relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-200">{team.name.split(' ')[1]}</div>
                  <div className="flex-1"><h3 className="font-black text-slate-800 text-xl">{team.name}</h3><p className="text-xs text-slate-500 font-bold">{team.members.length} Anggota</p></div>
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><ChevronLeft size={20} className="rotate-180"/></div>
                </div>
                <div className="flex gap-2 relative z-10"><div className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 text-xs font-bold">{count} Tugas</div></div>
              </div>
            );
          })}
        </div>
      </Layout>
    );
  }

  if (view === 'team-projects' && currentUser?.role === 'supervisor') {
    const tm = TEAMS.find(t => t.id === activeTeamId);
    const prj = projects.filter(p => p.teamId === activeTeamId);
    return (
      <Layout title={tm.name} subtitle="Jobdesk Manager" showBack onBack={() => setView('team-list')} showAssets setView={setView}>
        {prj.length === 0 ? <div className="text-center py-20 opacity-50"><FolderOpen size={48} className="mx-auto mb-2 text-slate-300"/><p className="text-sm font-bold text-slate-400">Kosong.</p></div> : 
            <div className="space-y-4">{prj.map(p => (
                <div key={p.id} onClick={() => { setActiveProject(p); setView('project-detail'); }} className="bg-white p-5 rounded-[2rem] border border-slate-100 glass-card-hover cursor-pointer">
                    <div className="flex justify-between mb-2"><span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{p.status}</span>{p.isApproved && <CheckCircle2 size={16} className="text-green-500"/>}</div>
                    <h3 className="font-bold text-slate-800 text-lg">{p.title}</h3>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden"><div className="bg-indigo-600 h-full rounded-full transition-all" style={{width: `${p.progress}%`}}></div></div>
                </div>
            ))}</div>
        }
        <button onClick={() => handleAddNewProject(tm.id)} className="fixed bottom-8 right-6 z-50 bg-slate-900 text-white h-14 px-6 rounded-full shadow-2xl flex items-center gap-2 font-bold hover:scale-105 transition-transform"><Plus/> Tugas Baru</button>
      </Layout>
    );
  }

  if (view === 'assets') {
    const isSup = currentUser?.role === 'supervisor';
    return (
      <Layout title="Gudang Aset" subtitle={isSup ? "Mode Edit" : "Download Area"} showBack onBack={() => setView(isSup ? 'team-projects' : 'dashboard')}>
        <div className="space-y-4">
            {isSup && isAddingAsset && (
                <div className="bg-white p-5 rounded-[2rem] border-2 border-indigo-100 shadow-xl mb-6 animate-[slideUp_0.3s_ease-out]">
                    <h3 className="text-xs font-black text-indigo-600 mb-3 uppercase tracking-wider">Upload File Baru</h3>
                    {/* INPUT FIX: Inputs are now stable because Layout is outside App */}
                    <input type="text" placeholder="Nama File (cth: Logo PNG)" className="w-full p-4 bg-slate-50 rounded-xl text-sm font-bold mb-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={newAssetForm.title} onChange={e => setNewAssetForm({...newAssetForm, title: e.target.value})} autoFocus />
                    <div className="flex gap-3 mb-3">
                        <select className="p-4 bg-slate-50 rounded-xl text-xs font-bold flex-1 outline-none appearance-none" value={newAssetForm.type} onChange={e => setNewAssetForm({...newAssetForm, type: e.target.value})}><option value="folder">📁 Folder</option><option value="video">🎬 Video</option><option value="audio">🎵 Audio</option></select>
                        <input type="text" placeholder="Size" className="w-1/3 p-4 bg-slate-50 rounded-xl text-xs font-bold outline-none" value={newAssetForm.size} onChange={e => setNewAssetForm({...newAssetForm, size: e.target.value})} />
                    </div>
                    <input type="text" placeholder="Link Google Drive..." className="w-full p-4 bg-slate-50 rounded-xl text-xs font-mono text-slate-500 mb-4 outline-none" value={newAssetForm.link} onChange={e => setNewAssetForm({...newAssetForm, link: e.target.value})} />
                    <div className="flex gap-2"><button onClick={() => setIsAddingAsset(false)} className="flex-1 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-500">Batal</button><button onClick={async () => { await addDoc(collection(db,"assets"), {...newAssetForm, color: 'bg-indigo-500', createdAt: serverTimestamp()}); setIsAddingAsset(false); setNewAssetForm({title:'',type:'folder',link:'',size:''}); }} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg">Simpan</button></div>
                </div>
            )}
            {assets.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm glass-card-hover flex items-center gap-4 group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md ${a.type === 'video' ? 'bg-purple-500' : a.type === 'audio' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                        {a.type === 'folder' ? <FolderOpen size={24}/> : a.type === 'video' ? <Film size={24}/> : <Music size={24}/>}
                    </div>
                    <div className="flex-1"><h3 className="font-bold text-slate-800 text-sm">{a.title}</h3><p className="text-[10px] text-slate-400 font-bold">{a.size}</p></div>
                    <div className="flex gap-2">
                        <a href={a.link} target="_blank" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"><ExternalLink size={18}/></a>
                        {isSup && <button onClick={() => deleteDoc(doc(db,"assets",a.id))} className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"><Trash2 size={18}/></button>}
                    </div>
                </div>
            ))}
        </div>
        {isSup && !isAddingAsset && <button onClick={() => setIsAddingAsset(true)} className="fixed bottom-8 right-6 z-50 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"><Plus size={28}/></button>}
      </Layout>
    );
  }

  // 4. PROJECT DETAIL (TIMELINE UI)
  if (view === 'project-detail' && activeProject) {
    const isSup = currentUser?.role === 'supervisor';
    return (
      <Layout title={activeProject.title} subtitle={activeProject.status} showBack onBack={() => setView(isSup ? 'team-projects' : 'dashboard')}>
        
        {/* AI Modal */}
        {showAIModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-[slideUp_0.2s_ease-out]"><div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl"><div className="flex justify-between items-center mb-4"><h3 className="font-black text-lg flex items-center gap-2 text-indigo-600"><Sparkles/> AI Script</h3><button onClick={() => setShowAIModal(false)} className="p-2 bg-slate-100 rounded-full"><X size={18}/></button></div>{!aiResult ? <><textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="Topik video..." className="w-full h-32 p-4 bg-slate-50 rounded-2xl text-sm font-medium mb-4 outline-none resize-none"/><button onClick={handleScript} disabled={isAILoading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex justify-center gap-2">{isAILoading ? <Loader2 className="animate-spin"/> : <Wand2/>} Buat Naskah</button></> : <><div className="h-60 overflow-y-auto text-xs bg-slate-50 p-4 rounded-2xl mb-4 whitespace-pre-line leading-relaxed custom-scrollbar">{aiResult}</div><button onClick={()=>{navigator.clipboard.writeText(aiResult);setShowAIModal(false)}} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Salin Naskah</button></>}</div></div>}

        {isEditingProject ? (
          <div className="bg-white p-6 rounded-[2rem] border-2 border-indigo-50 shadow-xl mb-8 animate-[slideUp_0.3s_ease-out]">
             <input type="text" value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})} className="w-full mb-4 p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Judul Tugas"/>
             <textarea value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})} className="w-full mb-4 p-4 bg-slate-50 rounded-2xl text-xs h-32 outline-none resize-none font-medium leading-relaxed" placeholder="Deskripsi..."/>
             <div className="flex gap-2 justify-end"><button onClick={()=>handleDeleteProject(activeProject.id)} className="px-4 py-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold">Hapus</button><button onClick={()=>setIsEditingProject(false)} className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">Batal</button><button onClick={()=>handleUpdateProject(activeProject.id, editForm) || setIsEditingProject(false)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg">Simpan</button></div>
          </div>
        ) : (
          <div className="mb-8 relative"><p className="text-sm text-slate-600 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm leading-relaxed whitespace-pre-line">{activeProject.description}</p>{isSup && <button onClick={()=>{setEditForm({title:activeProject.title,description:activeProject.description});setIsEditingProject(true)}} className="absolute -top-3 -right-3 p-3 bg-slate-800 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform"><Edit2 size={16}/></button>}</div>
        )}

        <div className="relative pb-10 pl-4">
           <div className="absolute left-[34px] top-4 bottom-0 w-1 bg-slate-200 rounded-full"></div> 
           {WORKFLOW_STEPS.map((step, index) => {
             const isLocked = index > 0 && !WORKFLOW_STEPS[index-1].tasks.every(t => activeProject.completedTasks.includes(t.id));
             const isFinalLocked = index === 4 && !activeProject.isApproved;
             const locked = isLocked || isFinalLocked;
             return (
               <div key={step.id} className={`relative pl-12 mb-8 transition-all ${locked ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                 <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg z-10 bg-gradient-to-br ${step.color} text-white ring-4 ring-white`}>{step.icon}</div>
                 <div className="mb-3 pl-2"><h3 className={`font-black text-lg ${step.text} tracking-tight`}>{step.title}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{step.subtitle}</p></div>
                 <div className={`bg-white rounded-[1.5rem] border-2 ${step.border} p-1.5 shadow-sm`}>
                    {step.tasks.map(t => {
                        const checked = activeProject.completedTasks.includes(t.id);
                        if(t.id === 't4-2') return (
                           <div key={t.id} className={`p-4 ${step.bg} rounded-xl m-1`}>
                              <div className={`flex items-center gap-2 mb-2 text-xs font-black ${step.text}`}>LINK DRIVE</div>
                              {!isSup && !activeProject.isApproved && <input type="text" className="w-full text-xs p-3 bg-white rounded-lg outline-none font-medium shadow-sm" placeholder="Paste link..." onBlur={e=>handleUpdateProject(activeProject.id,{previewLink:e.target.value,status:'Waiting Review'})} defaultValue={activeProject.previewLink}/>}
                              {activeProject.previewLink && <a href={activeProject.previewLink} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 bg-white rounded-lg text-xs font-bold mt-2 shadow-sm hover:scale-[1.02] transition-transform">Buka Video <ExternalLink size={12}/></a>}
                           </div>
                        )
                        return (
                            <button key={t.id} disabled={locked || isSup} onClick={() => handleTaskToggle(activeProject.id, t.id)} className={`w-full text-left p-3.5 m-0.5 rounded-xl flex items-center gap-3 transition-all ${checked ? `bg-gradient-to-r ${step.color} text-white shadow-md scale-[1.01]` : 'bg-white hover:bg-slate-50'}`}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${checked ? 'border-white' : 'border-slate-300'}`}>{checked && <CheckCircle2 size={12} className="text-white"/>}</div>
                                <span className={`text-xs font-bold ${checked ? 'text-white' : 'text-slate-600'}`}>{t.label}</span>
                                {t.hasAI && !locked && !checked && !isSup && <div onClick={e=>{e.stopPropagation();setShowAIModal(true)}} className="ml-auto bg-white/20 p-1.5 rounded-lg hover:bg-white/40"><Sparkles size={14} className={checked?'text-white':'text-purple-500'}/></div>}
                            </button>
                        )
                    })}
                    {step.isGatekeeper && !locked && (
                        <div className="mt-2 p-4 bg-orange-50 border-t-2 border-orange-100 rounded-b-xl">
                           <div className="flex gap-2 mb-2 items-center"><ShieldCheck size={14} className="text-orange-500"/><h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest">SUPERVISOR APPROVAL</h4></div>
                           {activeProject.isApproved ? <div className="bg-emerald-100 text-emerald-700 text-xs p-3 rounded-xl font-black text-center shadow-sm">✅ DISETUJUI</div> : <p className="text-xs text-slate-400 font-medium mb-2 pl-6">Menunggu review...</p>}
                           {isSup && !activeProject.isApproved && activeProject.previewLink && (
                               <div><textarea className="w-full p-3 text-xs bg-white rounded-xl mb-2 outline-none border border-orange-100 font-medium" rows="2" placeholder="Catatan revisi..." value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)}></textarea><div className="flex gap-2"><button onClick={() => {handleUpdateProject(activeProject.id, {isApproved:false,status:'Revision Needed',feedback:feedbackInput});setFeedbackInput('')}} className="flex-1 py-3 bg-white text-orange-600 font-bold text-xs rounded-xl border border-orange-200">Minta Revisi</button><button onClick={() => handleUpdateProject(activeProject.id, {isApproved:true,status:'Approved',feedback:''})} className="flex-1 py-3 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg">Approve</button></div></div>
                           )}
                           {activeProject.feedback && <div className="mt-2 bg-white p-3 rounded-xl text-xs text-orange-600 font-bold border border-orange-100">" {activeProject.feedback} "</div>}
                        </div>
                    )}
                 </div>
               </div>
             )
           })}
        </div>
      </Layout>
    );
  }
  return null;
}
