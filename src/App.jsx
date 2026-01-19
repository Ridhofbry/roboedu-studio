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
  Loader2, Copy, Plus, Trash2, Calendar, Grid, Mic, Users
} from 'lucide-react';

/* ========================================================================
   KONFIGURASI (PREVIEW MODE)
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

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ========================================================================
   DATA & STRUKTUR
   ======================================================================== */

const TEAMS = [
  { id: 'team-1', name: 'Tim 1', members: ['Farel Fajar Al Azizy', 'Dimas Setya Prima Putra'] },
  { id: 'team-2', name: 'Tim 2', members: ['Hasbi Maulana Fathir', 'Muhammad Afif Naufal'] },
  { id: 'team-3', name: 'Tim 3', members: ['M. Rashya Arief A.', 'Rajendra Ges Abiyasa'] },
  { id: 'team-4', name: 'Tim 4', members: ['Ahmad Zidhan Mubaroq', 'Alfinza Rehandista'] },
];

const WORKFLOW_STEPS = [
  { 
    id: 'step-1', title: 'Konsep (Pre-Pro)', subtitle: 'Briefing & Naskah', icon: <FolderOpen className="w-5 h-5 text-white" />, 
    color: 'bg-blue-500', lightColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700',
    tasks: [{ id: 't1-1', label: 'Pahami Brief & Tujuan' }, { id: 't1-2', label: 'Download Aset Wajib' }, { id: 't1-3', label: 'Finalisasi Script/Naskah', hasAI: true }] 
  },
  { 
    id: 'step-2', title: 'Produksi (Shooting)', subtitle: 'Take Video & Stok', icon: <Film className="w-5 h-5 text-white" />, 
    color: 'bg-amber-500', lightColor: 'bg-amber-50', borderColor: 'border-amber-200', textColor: 'text-amber-700',
    tasks: [{ id: 't2-1', label: 'Cam: 1080p 60fps' }, { id: 't2-2', label: 'Ratio: 9:16 (Vertical)' }, { id: 't2-3', label: 'Cek Lighting (No Backlight)' }] 
  },
  { 
    id: 'step-3', title: 'Audio (Voice Over)', subtitle: 'Rekaman Suara', icon: <Mic className="w-5 h-5 text-white" />, 
    color: 'bg-purple-500', lightColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-700',
    tasks: [{ id: 't3-1', label: 'Rekam di Ruang Hening' }, { id: 't3-2', label: 'Intonasi Jelas & Tegas' }, { id: 't3-3', label: 'Cek Noise Audio' }] 
  },
  { 
    id: 'step-4', title: 'Pasca Produksi', subtitle: 'Editing & Mixing', icon: <MonitorPlay className="w-5 h-5 text-white" />, 
    color: 'bg-pink-500', lightColor: 'bg-pink-50', borderColor: 'border-pink-200', textColor: 'text-pink-700',
    tasks: [{ id: 't4-1', label: 'Assembly Sesuai Beat' }, { id: 't4-2', label: 'Subtitle (Safe Area)' }, { id: 't4-3', label: 'Color Grading Pop' }] 
  },
  { 
    id: 'step-5', title: 'Finalisasi & Ekspor', subtitle: 'Review & Upload', isGatekeeper: true, icon: <CheckCircle2 className="w-5 h-5 text-white" />, 
    color: 'bg-emerald-500', lightColor: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-700',
    tasks: [{ id: 't5-1', label: 'Upload Preview Low-Res' }, { id: 't5-2', label: 'Revisi (Jika Ada)' }, { id: 't5-3', label: 'Ekspor Final 1080p' }] 
  }
];

const styles = `
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
  @keyframes blink { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-blink { animation: blink 4s infinite; }
  .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  .timeline-line { position: absolute; left: 24px; top: 30px; bottom: -20px; width: 4px; background: #e2e8f0; z-index: 0; border-radius: 99px; }
`;

const RoboLogo = ({ size = 60, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={`overflow-visible ${className}`}>
    <g className="animate-float origin-bottom"><line x1="50" y1="10" x2="50" y2="30" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" /><circle cx="50" cy="10" r="6" fill="#f43f5e" className="animate-pulse" /></g>
    <rect x="20" y="30" width="60" height="50" rx="14" fill="white" stroke="#3b82f6" strokeWidth="4" />
    <rect x="26" y="36" width="48" height="38" rx="8" fill="#eff6ff" />
    <g className="animate-blink origin-center" style={{ transformOrigin: "50% 55%" }}><circle cx="38" cy="52" r="5" fill="#1e3a8a" /><circle cx="62" cy="52" r="5" fill="#1e3a8a" /></g>
    <path d="M40 68 Q50 75 60 68" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
    <path d="M15 55 L20 55" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" /><path d="M80 55 L85 55" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // { role, teamId, name }
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  
  // UI States
  const [view, setView] = useState('login'); 
  const [activeProject, setActiveProject] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [loginStep, setLoginStep] = useState('role-select'); 
  const [selectedRole, setSelectedRole] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [newAssetForm, setNewAssetForm] = useState({ title: '', type: 'folder', link: '', size: '' });
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [feedbackInput, setFeedbackInput] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    const qProjects = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => { setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }, (err) => console.error(err));
    const qAssets = query(collection(db, "assets"), orderBy("createdAt", "desc"));
    const unsubAssets = onSnapshot(qAssets, (snapshot) => { setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }, (err) => console.error(err));
    return () => { unsubProjects(); unsubAssets(); };
  }, []);

  // --- ACTIONS ---
  const handleAddNewProject = async (teamId) => {
    const newProject = { teamId, status: 'In Progress', progress: 0, title: 'Konten Baru', description: 'Deskripsi tugas...', completedTasks: [], isApproved: false, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, "projects"), newProject);
    setActiveProject({ id: docRef.id, ...newProject }); setEditForm({ title: newProject.title, description: newProject.description }); setIsEditingProject(true); setView('project-detail');
  };
  const handleDeleteProject = async (projectId) => { if (confirm("Hapus tugas ini?")) { await deleteDoc(doc(db, "projects", projectId)); setView('team-projects'); } };
  const handleUpdateProject = async (projectId, data) => { await updateDoc(doc(db, "projects", projectId), data); if (activeProject?.id === projectId) setActiveProject(prev => ({ ...prev, ...data })); };
  const handleTaskToggle = (projectId, taskId) => {
    const proj = projects.find(p => p.id === projectId); if (!proj) return;
    const newCompleted = proj.completedTasks.includes(taskId) ? proj.completedTasks.filter(id => id !== taskId) : [...proj.completedTasks, taskId];
    const total = WORKFLOW_STEPS.reduce((acc, s) => acc + s.tasks.length, 0); const prog = Math.round((newCompleted.length / total) * 100);
    let status = proj.status;
    const allReviewTasks = WORKFLOW_STEPS[4].tasks.map(t => t.id).every(id => newCompleted.includes(id)); 
    if (allReviewTasks && proj.previewLink && !proj.isApproved) status = 'Waiting Review';
    if (prog === 100 && proj.isApproved) status = 'Approved';
    handleUpdateProject(projectId, { completedTasks: newCompleted, progress: prog, status });
  };
  const handleAddAsset = async () => {
    if(!newAssetForm.title) return;
    let color = 'bg-gray-100 text-gray-500'; if(newAssetForm.type === 'folder') color = 'bg-blue-100 text-blue-600'; if(newAssetForm.type === 'video') color = 'bg-purple-100 text-purple-600'; if(newAssetForm.type === 'audio') color = 'bg-pink-100 text-pink-600';
    await addDoc(collection(db, "assets"), { ...newAssetForm, color, createdAt: serverTimestamp() }); setIsAddingAsset(false); setNewAssetForm({ title: '', type: 'folder', link: '', size: '' });
  };
  const handleDeleteAsset = async (id) => { if(confirm("Hapus aset?")) await deleteDoc(doc(db, "assets", id)); };

  // --- GEMINI AI ---
  const callGeminiAPI = async (prompt) => {
    setIsAILoading(true); setAiResult(''); 
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await res.json(); setAiResult(data.candidates?.[0]?.content?.parts?.[0]?.text || "Gagal.");
    } catch { setAiResult("Error koneksi."); } finally { setIsAILoading(false); }
  };
  const handleScript = () => { if(aiPrompt) callGeminiAPI(`Buat naskah video TikTok pendek (60s) topik: "${aiPrompt}". Bahasa Indonesia gaul. Struktur: Hook, Isi, CTA.`); };
  const handleBrief = async (title) => {
    setIsAILoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `Buat brief video singkat untuk videografer dari judul: "${title}". Sertakan Tujuan, Audiens, Mood.` }] }] }) });
      const data = await res.json(); setEditForm(p => ({ ...p, description: data.candidates?.[0]?.content?.parts?.[0]?.text || "" }));
    } catch { alert("Gagal auto-brief"); } finally { setIsAILoading(false); }
  };

  // --- RENDER HELPERS ---
  const Layout = ({ children, title, subtitle, showBack, onBack, showAssets, showLogout }) => (
    <div className="min-h-screen bg-white font-sans text-slate-800 max-w-md mx-auto shadow-2xl border-x border-slate-100 relative overflow-hidden">
        <style>{styles}</style>
        <div className="bg-white/90 backdrop-blur-md px-6 py-5 sticky top-0 z-30 flex justify-between items-center border-b border-slate-100 transition-all">
             <div className="flex items-center gap-3">
                {showBack && <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-transform active:scale-90"><ChevronLeft size={20} className="text-slate-600" /></button>}
                <div><h1 className="text-lg font-extrabold text-slate-800 leading-tight tracking-tight">{title}</h1>{subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}</div>
             </div>
             <div className="flex gap-2">
                {showAssets && <button onClick={() => setView('assets')} className="p-2.5 bg-slate-50 text-blue-600 rounded-full hover:bg-blue-50 transition-transform hover:rotate-12"><FolderOpen size={20} /></button>}
                {showLogout && <button onClick={() => { setCurrentUser(null); setView('login'); setLoginStep('role-select'); setPasswordInput(''); }} className="p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-transform hover:scale-110"><LogOut size={20} /></button>}
             </div>
        </div>
        <div className="p-6 pb-24 animate-slide-up relative z-10">{children}</div>
    </div>
  );

  // --- VIEWS ---

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <style>{styles}</style>
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 relative z-10 animate-slide-up border border-white">
          <div className="flex justify-center mb-6"><RoboLogo size={100} /></div>
          <h1 className="text-3xl font-black text-center text-slate-900 mb-1 tracking-tight">RoboEdu<span className="text-blue-600">.Studio</span></h1>
          <p className="text-center text-slate-400 text-sm mb-8 font-medium">Production Management System</p>
          
          {loginStep === 'role-select' && (
            <div className="space-y-3 animate-slide-up">
              <button onClick={() => { setSelectedRole('creator'); setLoginStep('password'); }} className="w-full py-4 bg-blue-50 hover:bg-blue-100 border-2 border-transparent hover:border-blue-200 rounded-2xl flex items-center px-4 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mr-4 text-blue-600 shadow-sm"><FileVideo size={24} /></div>
                <div className="text-left"><div className="font-bold text-slate-800 text-lg">Tim Kreator</div><div className="text-xs text-blue-600 font-bold">Login Disini</div></div>
                <ArrowRight className="ml-auto text-blue-300 group-hover:text-blue-600 transition-colors" size={24} />
              </button>
              <button onClick={() => { setSelectedRole('supervisor'); setLoginStep('password'); }} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center px-4 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mr-4"><ShieldCheck size={24} className="text-amber-400" /></div>
                <div className="text-left"><div className="font-bold text-lg">Supervisor</div><div className="text-xs text-slate-400">Monitoring & Assign</div></div>
              </button>
            </div>
          )}

          {loginStep === 'password' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (selectedRole === 'creator') passwordInput === 'SUKSES2026' ? setLoginStep('team-select') : setLoginError('Password Salah!');
              else if (selectedRole === 'supervisor') passwordInput === 'roboedu.ahr2026' ? (setCurrentUser({ role: 'supervisor', name: 'Supervisor' }) || setView('team-list')) : setLoginError('Password Salah!');
            }} className="animate-slide-up">
              <div className="flex items-center justify-between mb-6"><span className="text-sm font-bold text-slate-500">Login: <span className="text-blue-600 capitalize">{selectedRole}</span></span><button type="button" onClick={() => { setLoginStep('role-select'); setPasswordInput(''); setLoginError(''); }} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button></div>
              <div className="relative mb-6"><Lock className="absolute left-4 top-3.5 text-slate-400" size={18} /><input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Masukkan Password..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" autoFocus /></div>
              {loginError && <div className="mb-4 text-xs text-red-600 bg-red-50 p-3 rounded-xl flex items-center gap-2 border border-red-100 animate-pulse"><AlertCircle size={14} /> {loginError}</div>}
              <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">Lanjut <ArrowRight size={18}/></button>
            </form>
          )}

          {/* TEAM SELECTION - DIRECT LOGIN */}
          {loginStep === 'team-select' && (
             <div className="animate-slide-up">
                <div className="flex items-center justify-between mb-4"><span className="text-sm font-bold text-slate-500">Pilih Kelompok:</span><button type="button" onClick={() => setLoginStep('role-select')} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button></div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {TEAMS.map((team) => (
                    <button key={team.id} onClick={() => { setCurrentUser({ role: 'creator', teamId: team.id, name: team.name }); setView('dashboard'); }} className="w-full text-left px-4 py-3 rounded-xl border border-slate-100 hover:border-blue-300 bg-white hover:bg-blue-50 shadow-sm transition-all group">
                      <div className="flex justify-between items-center mb-1"><span className="font-bold text-slate-800 group-hover:text-blue-700">{team.name}</span><div className="flex items-center gap-1 text-slate-300 group-hover:text-blue-400"><Users size={12} /> <span className="text-[10px]">{team.members.length} Org</span></div></div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{team.members.join(' & ')}</div>
                    </button>
                  ))}
                </div>
             </div>
          )}
        </div>
      </div>
    );
  }

  // --- SUPERVISOR VIEWS ---
  if (view === 'team-list' && currentUser?.role === 'supervisor') {
    return (
      <Layout title="Dashboard" subtitle="Pilih Tim" showLogout showAssets>
        <div className="grid grid-cols-1 gap-4">
          {TEAMS.map((team) => {
            const teamProjects = projects.filter(p => p.teamId === team.id);
            const activeCount = teamProjects.filter(p => p.status !== 'Approved').length;
            return (
              <div key={team.id} onClick={() => { setActiveTeamId(team.id); setView('team-projects'); }} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 cursor-pointer group active:scale-[0.98] transition-all relative overflow-hidden">
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">{team.name.split(' ')[1]}</div>
                  <div className="flex-1"><h3 className="font-bold text-slate-800 text-lg">{team.name}</h3><p className="text-xs text-slate-500">{team.members.length} Anggota</p></div>
                  <ChevronLeft size={20} className="rotate-180 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                </div>
                <div className="flex gap-2 relative z-10"><div className="px-3 py-1 bg-slate-100 rounded text-slate-600 text-xs font-bold">{teamProjects.length} Tugas</div>{activeCount > 0 && <div className="px-3 py-1 bg-amber-100 text-amber-600 text-xs font-bold flex items-center gap-1"><Zap size={10}/> {activeCount} Aktif</div>}</div>
              </div>
            );
          })}
        </div>
      </Layout>
    );
  }

  if (view === 'team-projects' && currentUser?.role === 'supervisor') {
    const team = TEAMS.find(t => t.id === activeTeamId);
    const teamProjects = projects.filter(p => p.teamId === activeTeamId);
    return (
      <Layout title={team.name} subtitle="Daftar Jobdesk" showBack onBack={() => setView('team-list')} showAssets>
        {teamProjects.length === 0 ? <div className="text-center py-20 opacity-50 flex flex-col items-center"><FolderOpen size={48} className="text-slate-300 mb-2"/><p className="text-sm font-medium text-slate-400">Belum ada tugas.</p></div> : 
            <div className="space-y-4">{teamProjects.map(project => (
                <div key={project.id} onClick={() => { setActiveProject(project); setView('project-detail'); }} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 cursor-pointer active:scale-[0.98] transition-all">
                    <div className="flex justify-between items-start mb-2"><span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">{project.status}</span>{project.isApproved && <CheckCircle2 size={18} className="text-emerald-500" />}</div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{project.title}</h3>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden"><div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div></div>
                </div>
            ))}</div>
        }
        <div className="fixed bottom-8 right-6 z-40"><button onClick={() => handleAddNewProject(team.id)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform font-bold"><Plus size={20} /> Tambah</button></div>
      </Layout>
    );
  }

  // --- CREATOR DASHBOARD ---
  if (view === 'dashboard' && currentUser?.role === 'creator') {
    const myProjects = projects.filter(p => p.teamId === currentUser.teamId);
    return (
      <Layout title={`Halo, ${currentUser.name}!`} subtitle="Siap berkarya?" showLogout>
        <div onClick={() => setView('assets')} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-8 text-white shadow-xl shadow-blue-200 flex items-center justify-between cursor-pointer active:scale-95 transition-transform">
           <div><h3 className="font-bold text-xl mb-1">Gudang Aset</h3><p className="text-xs opacity-80">Logo, Font, & Template</p></div>
           <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"><FolderOpen size={24} className="text-white"/></div>
        </div>
        <h2 className="font-bold text-slate-800 mb-4 text-lg">Tugas Tim Kamu</h2>
        {myProjects.length === 0 ? <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl"><p className="text-sm text-slate-400 font-bold">Belum ada tugas.</p></div> : 
           <div className="space-y-4">{myProjects.map(project => (
              <div key={project.id} onClick={() => { setActiveProject(project); setView('project-detail'); }} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 cursor-pointer active:scale-[0.98] transition-all">
                  <div className="flex justify-between items-start mb-3"><span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">{project.status}</span>{project.isApproved && <CheckCircle2 size={18} className="text-emerald-500" />}</div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{project.title}</h3>
                  <div className="flex items-center gap-3"><div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div></div><span className="text-[10px] font-bold text-slate-400">{project.progress}%</span></div>
              </div>
           ))}</div>
        }
      </Layout>
    );
  }

  // --- ASSETS ---
  if (view === 'assets') {
    const isSupervisor = currentUser?.role === 'supervisor';
    return (
      <Layout title="Gudang Aset" subtitle="File Resmi" showBack onBack={() => setView(isSupervisor ? 'team-projects' : 'dashboard')}>
        <div className="space-y-3">
            {isSupervisor && isAddingAsset && (
                <div className="bg-white border-2 border-blue-100 p-4 rounded-3xl mb-4 shadow-lg animate-slide-up">
                    <h3 className="text-xs font-bold text-blue-600 mb-3 uppercase">Upload File</h3>
                    <input type="text" placeholder="Nama File" className="w-full p-3 text-xs bg-slate-50 rounded-xl mb-2 outline-none" value={newAssetForm.title} onChange={e => setNewAssetForm({...newAssetForm, title: e.target.value})} />
                    <div className="flex gap-2 mb-2"><select className="p-3 text-xs bg-slate-50 rounded-xl flex-1 outline-none" value={newAssetForm.type} onChange={e => setNewAssetForm({...newAssetForm, type: e.target.value})}><option value="folder">Folder</option><option value="video">Video</option><option value="audio">Audio</option></select><input type="text" placeholder="Size" className="w-1/3 p-3 text-xs bg-slate-50 rounded-xl outline-none" value={newAssetForm.size} onChange={e => setNewAssetForm({...newAssetForm, size: e.target.value})} /></div>
                    <input type="text" placeholder="Link Google Drive..." className="w-full p-3 text-xs bg-slate-50 rounded-xl mb-4 outline-none font-mono" value={newAssetForm.link} onChange={e => setNewAssetForm({...newAssetForm, link: e.target.value})} />
                    <div className="flex gap-2 justify-end"><button onClick={() => setIsAddingAsset(false)} className="px-4 py-2 text-slate-400 text-xs font-bold">Batal</button><button onClick={handleAddAsset} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Simpan</button></div>
                </div>
            )}
            {assets.map(asset => (
                <div key={asset.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${asset.color} text-white`}>
                        {asset.type === 'folder' && <FolderOpen size={20} />}{asset.type === 'video' && <Film size={20} />}{asset.type === 'audio' && <MonitorPlay size={20} />}
                    </div>
                    <div className="flex-1"><h3 className="font-bold text-slate-800 text-sm">{asset.title}</h3><p className="text-[10px] text-slate-400">{asset.size}</p></div>
                    <a href={asset.link} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 text-blue-600 rounded-full"><ExternalLink size={16} /></a>
                    {isSupervisor && <button onClick={() => handleDeleteAsset(asset.id)} className="p-2 bg-red-50 text-red-500 rounded-full"><Trash2 size={16} /></button>}
                </div>
            ))}
        </div>
        {isSupervisor && !isAddingAsset && <div className="fixed bottom-8 right-6 z-40"><button onClick={() => setIsAddingAsset(true)} className="bg-slate-900 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform"><Plus size={24} /></button></div>}
      </Layout>
    );
  }

  // --- PROJECT DETAIL (TIMELINE VIEW) ---
  if (view === 'project-detail' && activeProject) {
    const isSupervisor = currentUser?.role === 'supervisor';
    return (
      <Layout title={activeProject.title} subtitle={activeProject.status} showBack onBack={() => setView(isSupervisor ? 'team-projects' : 'dashboard')}>
        
        {/* AI Modal */}
        {showAIModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"><div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="text-purple-500"/> AI Script</h3><button onClick={() => setShowAIModal(false)}><X size={20}/></button></div>{!aiResult ? (<><textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="Topik..." className="w-full h-32 p-3 bg-slate-50 rounded-xl text-sm mb-4 outline-none"/><button onClick={handleScript} disabled={isAILoading} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold">{isAILoading ? "..." : "Buat"}</button></>) : (<><div className="h-60 overflow-y-auto text-xs bg-slate-50 p-4 rounded-xl mb-4 whitespace-pre-line">{aiResult}</div><button onClick={() => {navigator.clipboard.writeText(aiResult); setShowAIModal(false);}} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold">Salin</button></>)}</div></div>)}

        {isEditingProject ? (
          <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-xl mb-8 animate-slide-up">
             <label className="text-[10px] font-bold text-blue-500 uppercase mb-1 block">Judul</label>
             <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full mb-4 p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none" />
             <div className="flex justify-between mb-2"><label className="text-[10px] font-bold text-blue-500 uppercase">Brief</label><button onClick={() => handleBrief(editForm.title)} className="text-[10px] flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold"><Sparkles size={10}/> Auto-Brief</button></div>
             <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full mb-4 p-3 bg-slate-50 rounded-xl text-xs h-32 outline-none" />
             <div className="flex gap-2 justify-end"><button onClick={() => handleDeleteProject(activeProject.id)} className="px-4 py-2 text-red-500 text-xs font-bold">Hapus</button><button onClick={() => setIsEditingProject(false)} className="px-4 py-2 text-slate-400 text-xs font-bold">Batal</button><button onClick={() => handleUpdateProject(activeProject.id, editForm) || setIsEditingProject(false)} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Simpan</button></div>
          </div>
        ) : (
          <div className="mb-8"><div className="flex justify-between items-start mb-4"><p className="text-sm text-slate-600 bg-slate-50 p-5 rounded-3xl border border-slate-100 leading-relaxed whitespace-pre-line w-full">{activeProject.description}</p>{isSupervisor && <button onClick={() => { setEditForm({ title: activeProject.title, description: activeProject.description }); setIsEditingProject(true); }} className="ml-2 p-3 bg-white border border-slate-100 rounded-2xl text-slate-400"><Edit2 size={18} /></button>}</div></div>
        )}

        <div className="relative pb-10">
           {/* GARIS TIMELINE */}
           <div className="timeline-line"></div> 
           
           {WORKFLOW_STEPS.map((step, index) => {
             const isLocked = index > 0 && !WORKFLOW_STEPS[index - 1].tasks.every(t => activeProject.completedTasks.includes(t.id));
             const isFinal = index === 4;
             const isFinalLocked = isFinal && !activeProject.isApproved;
             const lockedState = isLocked || isFinalLocked;

             return (
               <div key={step.id} className={`relative pl-16 mb-8 transition-all ${lockedState ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                 {/* STEP ICON (BULLET POINT) */}
                 <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg z-10 ${step.color} border-4 border-white`}>
                    {step.icon}
                 </div>
                 
                 <div className="mb-3">
                    <h3 className={`font-black text-lg ${step.textColor}`}>{step.title}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{step.subtitle}</p>
                 </div>

                 <div className={`bg-white rounded-3xl border-2 ${step.borderColor} p-1 shadow-sm overflow-hidden`}>
                    {step.tasks.map(task => {
                        const isChecked = activeProject.completedTasks.includes(task.id);
                        if(task.id === 't4-2') return (
                           <div key={task.id} className={`p-4 ${step.lightColor} rounded-2xl m-1`}>
                              <div className={`flex items-center gap-2 mb-2 text-xs font-bold ${step.textColor}`}><div className={`w-4 h-4 rounded-full border-2 border-current flex items-center justify-center`}>{activeProject.previewLink && <div className="w-2 h-2 bg-current rounded-full"/>}</div> Upload Link</div>
                              {!isSupervisor && !activeProject.isApproved && <input type="text" className="w-full text-xs p-3 bg-white rounded-xl outline-none" placeholder="Link Drive..." onBlur={e => handleUpdateProject(activeProject.id, { previewLink: e.target.value, status: 'Waiting Review' })} defaultValue={activeProject.previewLink}/>}
                              {activeProject.previewLink && <a href={activeProject.previewLink} target="_blank" className={`flex items-center justify-center gap-2 w-full py-3 bg-white ${step.textColor} rounded-xl text-xs font-bold mt-2 shadow-sm`}>Buka Preview</a>}
                           </div>
                        )
                        return (
                            <button key={task.id} disabled={lockedState || isSupervisor} onClick={() => handleTaskToggle(activeProject.id, task.id)} className={`w-full text-left p-3 m-1 rounded-2xl flex items-center gap-3 transition-all ${isChecked ? step.color + ' text-white shadow-md' : 'bg-white hover:bg-slate-50'}`}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isChecked ? 'border-white' : 'border-slate-300'}`}>{isChecked && <CheckCircle2 size={12} className="text-white" />}</div>
                                <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-600'}`}>{task.label}</span>
                                {task.hasAI && !lockedState && !isChecked && !isSupervisor && <div onClick={(e) => {e.stopPropagation(); setShowAIModal(true);}} className="ml-auto bg-purple-100 text-purple-600 p-1.5 rounded-lg"><Sparkles size={12}/></div>}
                            </button>
                        )
                    })}
                    
                    {step.isGatekeeper && !lockedState && (
                        <div className="mt-2 p-4 bg-orange-50 border-t-2 border-orange-100">
                           <div className="flex gap-3 mb-2"><ShieldCheck size={16} className="text-orange-500"/><h4 className="text-xs font-black text-orange-600 uppercase">Supervisor Check</h4></div>
                           {activeProject.isApproved ? <div className="bg-emerald-100 text-emerald-700 text-xs p-3 rounded-xl font-bold text-center">✅ Disetujui! Lanjut Ekspor</div> : <p className="text-xs text-slate-400 ml-7 mb-2">Menunggu persetujuan...</p>}
                           {isSupervisor && !activeProject.isApproved && activeProject.previewLink && (
                               <div><textarea className="w-full p-3 text-xs bg-white rounded-xl mb-2 outline-none border border-orange-100" rows="2" placeholder="Revisi..." value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)}></textarea><div className="flex gap-2"><button onClick={() => handleReviewAction(activeProject.id, false)} className="flex-1 py-2 bg-white text-orange-600 font-bold text-xs rounded-lg border border-orange-200">Revisi</button><button onClick={() => handleReviewAction(activeProject.id, true)} className="flex-1 py-2 bg-orange-500 text-white font-bold text-xs rounded-lg shadow-lg">Approve</button></div></div>
                           )}
                           {activeProject.feedback && <div className="mt-2 bg-white p-3 rounded-xl text-xs text-orange-600 font-medium border border-orange-100">" {activeProject.feedback} "</div>}
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
