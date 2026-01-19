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
  Loader2, Copy, Plus, Trash2, Calendar, Grid, Mic, Users, Music, Archive, BarChart3
} from 'lucide-react';

/* ========================================================================
   KONFIGURASI (LIVE MODE)
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
const RECAP_DRIVE_LINK = "https://drive.google.com/drive/folders/139aQ5p4ECgiEwtAQ3cE73yjhfYzY9ZPC?usp=drive_link";

// Inisialisasi
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ========================================================================
   DATA & STYLING
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
    tasks: [{ id: 't2-1', label: 'Cam: 1080p 30fps' }, { id: 't2-2', label: 'Ratio: 9:16' }, { id: 't2-3', label: 'Lighting Aman' }] 
  },
  { 
    id: 'step-3', title: 'Audio', subtitle: 'Voice Over', icon: <Mic size={18} />, 
    color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700',
    tasks: [{ id: 't3-1', label: 'No Noise' }, { id: 't3-2', label: 'Intonasi Jelas' }, { id: 't3-3', label: 'Audio Level Pas' }] 
  },
  { 
    id: 'step-4', title: 'Editing', subtitle: 'Post-Pro', icon: <MonitorPlay size={18} />, isGatekeeper: true,
    color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700',
    tasks: [{ id: 't4-1', label: 'Cutting Rapi' }, { id: 't4-2', label: 'Subtitle Safe Area' }, { id: 't4-3', label: 'Grading Pop' }, { id: 't4-4', label: 'Upload Preview (480p)' }] 
  },
  { 
    id: 'step-5', title: 'Final', subtitle: 'Submission', icon: <CheckCircle2 size={18} />, 
    color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700',
    tasks: [{ id: 't5-1', label: 'Cek 1080p Final' }, { id: 't5-2', label: 'Upload Link Result' }] 
  }
];

// CSS Animations
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
   3. KOMPONEN LAYOUT
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
           <div className="flex items-center gap-3 overflow-hidden">
              {showBack && (
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white shadow-sm border border-slate-100 active:scale-90 transition-all shrink-0">
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black text-slate-800 leading-none tracking-tight truncate">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 truncate">{subtitle}</p>}
              </div>
           </div>
           <div className="flex gap-2 shrink-0">
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
  
  // Form States
  const [newAssetForm, setNewAssetForm] = useState({ title: '', type: 'folder', link: '', size: '' });
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSaving, setIsSaving] = useState(false); 
  
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
    try {
      setIsSaving(true);
      const newProject = { teamId, status: 'In Progress', progress: 0, title: 'Konten Baru', description: 'Deskripsi...', completedTasks: [], isApproved: false, createdAt: serverTimestamp() };
      const docRef = await addDoc(collection(db, "projects"), newProject);
      setActiveProject({ id: docRef.id, ...newProject }); 
      setEditForm({ title: '', description: '' }); 
      setIsEditingProject(true); 
      setView('project-detail');
    } catch (e) { alert("Error: " + e.message); } 
    finally { setIsSaving(false); }
  };

  const handleDeleteProject = async (id) => {
    if(!id) return;
    if (confirm("Yakin hapus tugas ini selamanya?")) {
      try {
        setIsSaving(true);
        await deleteDoc(doc(db, "projects", id));
        setView(currentUser?.role === 'supervisor' ? 'team-projects' : 'dashboard');
      } catch (e) { alert("Gagal hapus: " + e.message); }
      finally { setIsSaving(false); }
    }
  };

  const handleUpdateProject = async (id, data) => {
    try {
      setIsSaving(true);
      await updateDoc(doc(db, "projects", id), data);
      if(activeProject?.id === id) setActiveProject(p => ({ ...p, ...data }));
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const handleTaskToggle = (projId, taskId) => {
    const proj = projects.find(p => p.id === projId); if(!proj) return;
    const newCompleted = proj.completedTasks.includes(taskId) ? proj.completedTasks.filter(i => i !== taskId) : [...proj.completedTasks, taskId];
    const total = WORKFLOW_STEPS.reduce((a, s) => a + s.tasks.length, 0);
    const prog = Math.round((newCompleted.length / total) * 100);
    
    // Logic Status Update Flowchart Revisi
    let status = proj.status;
    const isStep4Done = WORKFLOW_STEPS[3].tasks.map(t => t.id).every(id => newCompleted.includes(id));
    
    // Jika Step 4 (Post-Pro) selesai & ada link preview & belum diapprove -> Waiting Review
    if (isStep4Done && proj.previewLink && !proj.isApproved) status = 'Waiting Review';
    if (proj.isApproved) status = 'Approved'; // Kalau sudah diapprove supervisor, status Approved
    if (prog === 100) status = 'Completed'; // Kalau Step 5 selesai

    handleUpdateProject(projId, { completedTasks: newCompleted, progress: prog, status });
  };

  const handleScript = async () => {
    setIsAILoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ contents: [{ parts: [{ text: `Buat naskah TikTok pendek seru tentang: "${aiPrompt}". Bahasa Indonesia gaul.` }] }] }) });
      const data = await res.json(); setAiResult(data.candidates?.[0]?.content?.parts?.[0]?.text || "Gagal.");
    } catch { setAiResult("Error AI."); } finally { setIsAILoading(false); }
  };

  // Helper untuk membersihkan form saat batal
  const cancelEdit = () => {
    setIsEditingProject(false);
    // Kembalikan form ke nilai asli jika batal
    if(activeProject) setEditForm({ title: activeProject.title, description: activeProject.description });
  };

  const handleAddAsset = async () => {
    if(!newAssetForm.title) return;
    try {
        let color = 'bg-gray-100 text-gray-500'; if(newAssetForm.type === 'folder') color = 'bg-blue-100 text-blue-600'; if(newAssetForm.type === 'video') color = 'bg-purple-100 text-purple-600'; if(newAssetForm.type === 'audio') color = 'bg-pink-100 text-pink-600';
        await addDoc(collection(db, "assets"), { ...newAssetForm, color, createdAt: serverTimestamp() }); 
        setIsAddingAsset(false); 
        setNewAssetForm({ title: '', type: 'folder', link: '', size: '' });
    } catch (e) { alert("Gagal tambah aset: " + e.message); }
  };

  const handleDeleteAsset = async (id) => { if(confirm("Hapus aset?")) await deleteDoc(doc(db, "assets", id)); };

  // --- VIEWS RENDERER ---

  // 1. LOGIN VIEW
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <style>{globalStyles}</style>
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 relative z-10 animate-[slideUp_0.4s_ease-out] border border-white">
          <div className="flex justify-center mb-6"><RoboLogo size={100} /></div>
          <h1 className="text-3xl font-black text-center text-slate-900 mb-1 tracking-tight">RoboEdu<span className="text-indigo-600">.Studio</span></h1>
          <p className="text-center text-slate-400 text-sm mb-8 font-medium">Production Management System</p>
          
          {loginStep === 'role-select' && (
            <div className="space-y-3 animate-[slideUp_0.4s_ease-out]">
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
            }} className="animate-[slideUp_0.4s_ease-out]">
              <div className="flex items-center justify-between mb-6"><span className="text-sm font-bold text-slate-500">Login: <span className="text-blue-600 capitalize">{selectedRole}</span></span><button type="button" onClick={() => { setLoginStep('role-select'); setPasswordInput(''); setLoginError(''); }} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button></div>
              <div className="relative mb-6"><Lock className="absolute left-4 top-3.5 text-slate-400" size={18} /><input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Masukkan Password..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" autoFocus /></div>
              {loginError && <div className="mb-4 text-xs text-red-600 bg-red-50 p-3 rounded-xl flex items-center gap-2 border border-red-100 animate-pulse"><AlertCircle size={14} /> {loginError}</div>}
              <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">Lanjut <ArrowRight size={18}/></button>
            </form>
          )}

          {loginStep === 'team-select' && (
             <div className="animate-[slideUp_0.4s_ease-out]">
                <div className="flex items-center justify-between mb-4"><span className="text-sm font-bold text-slate-500">Pilih Tim Kamu:</span><button type="button" onClick={() => setLoginStep('role-select')} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button></div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {TEAMS.map((team) => (
                    <button key={team.id} onClick={() => { setCurrentUser({ role: 'creator', teamId: team.id, name: team.name }); setView('dashboard'); }} className="w-full text-left px-4 py-3 rounded-xl border border-slate-100 hover:border-blue-300 bg-white hover:bg-blue-50 shadow-sm transition-all group">
                      <div className="flex justify-between items-center mb-1"><span className="font-bold text-slate-800 group-hover:text-blue-700">{team.name}</span><div className="flex items-center gap-1 text-slate-300 group-hover:text-blue-400"><Users size={12} /> <span className="text-[10px]">{team.members.length}</span></div></div>
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

  // --- ARCHIVE VIEW (SEPARATE PAGE) ---
  if (view === 'archive') {
    const isSup = currentUser?.role === 'supervisor';
    // Filter logic: if supervisor view all, if creator view own team
    const filterFn = isSup ? (p => true) : (p => p.teamId === currentUser.teamId);
    
    // Sort logic for archive (oldest first or completed)
    const archivedProjects = projects.filter(filterFn).slice(10); // Show projects after the first 10

    return (
      <Layout title="Arsip & Analitik" subtitle="Data Project Lama" showBack onBack={() => setView(isSup ? 'team-list' : 'dashboard')}>
         {/* DRIVE CARD */}
         <div onClick={() => window.open(RECAP_DRIVE_LINK, '_blank')} className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2rem] p-6 mb-8 text-white shadow-xl flex items-center justify-between cursor-pointer active:scale-95 transition-transform relative overflow-hidden">
             <div className="relative z-10"><h3 className="font-bold text-xl mb-1">Recap Content</h3><p className="text-xs opacity-90">Buka Google Drive Arsip</p></div>
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center"><Archive size={24} className="text-white"/></div>
         </div>

         {/* ANALYTICS SIMPLE */}
         <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Total Project</div>
                <div className="text-2xl font-black text-slate-800">{projects.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Selesai</div>
                <div className="text-2xl font-black text-emerald-600">{projects.filter(p => p.status === 'Approved' || p.status === 'Completed').length}</div>
            </div>
         </div>

         <h3 className="font-bold text-slate-700 mb-4 px-2">Riwayat Lama ({archivedProjects.length})</h3>
         {archivedProjects.length === 0 ? <div className="text-center py-10 text-slate-400 text-sm">Belum ada arsip lama (masih {'<'} 10 project).</div> : 
            <div className="space-y-3">
                {archivedProjects.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center opacity-80 hover:opacity-100 transition-opacity">
                        <div><h4 className="font-bold text-slate-700 text-sm">{p.title}</h4><span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{p.status}</span></div>
                        <div className="text-[10px] text-slate-400">{p.createdAt?.toDate().toLocaleDateString('id-ID') || '-'}</div>
                    </div>
                ))}
            </div>
         }
      </Layout>
    )
  }

  // --- ASSETS PAGE ---
  if (view === 'assets') {
    const isSup = currentUser?.role === 'supervisor';
    // Back logic: if supervisor came from team-list, go back there. If creator, go back dashboard.
    // If supervisor was inside a team detail (activeTeamId set), go back to team-projects.
    // Simplifying for supervisor: Go back to team-list (Main Dashboard) to avoid complexity blank screen
    const backView = isSup ? 'team-list' : 'dashboard';

    return (
      <Layout title="Gudang Aset" subtitle={isSup ? "Mode Pengelola" : "Download File Resmi"} showBack onBack={() => setView(backView)}>
        <div className="space-y-3">
            {isSup && isAddingAsset && (
                <div className="bg-white border-2 border-blue-100 p-4 rounded-3xl mb-4 shadow-lg animate-slide-up">
                    <h3 className="text-xs font-bold text-blue-600 mb-3 uppercase">Upload File</h3>
                    <input type="text" placeholder="Nama File" className="w-full p-3 text-xs bg-slate-50 rounded-xl mb-2 outline-none border focus:border-blue-500 transition-all" value={newAssetForm.title} onChange={e => setNewAssetForm({...newAssetForm, title: e.target.value})} />
                    <div className="flex gap-2 mb-2"><select className="p-3 text-xs bg-slate-50 rounded-xl flex-1 outline-none border" value={newAssetForm.type} onChange={e => setNewAssetForm({...newAssetForm, type: e.target.value})}><option value="folder">Folder</option><option value="video">Video</option><option value="audio">Audio</option></select><input type="text" placeholder="Size" className="w-1/3 p-3 text-xs bg-slate-50 rounded-xl outline-none border" value={newAssetForm.size} onChange={e => setNewAssetForm({...newAssetForm, size: e.target.value})} /></div>
                    <input type="text" placeholder="Link Google Drive..." className="w-full p-3 text-xs bg-slate-50 rounded-xl mb-4 outline-none border font-mono" value={newAssetForm.link} onChange={e => setNewAssetForm({...newAssetForm, link: e.target.value})} />
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
                    {isSup && <button onClick={() => handleDeleteAsset(asset.id)} className="p-2 bg-red-50 text-red-500 rounded-full"><Trash2 size={16} /></button>}
                </div>
            ))}
        </div>
        {isSup && !isAddingAsset && <div className="fixed bottom-8 right-6 z-40"><button onClick={() => setIsAddingAsset(true)} className="bg-slate-900 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform"><Plus size={24} /></button></div>}
      </Layout>
    );
  }

  // --- SUPERVISOR VIEWS ---
  if (view === 'team-list' && currentUser?.role === 'supervisor') {
    return (
      <Layout title="Dashboard Supervisor" subtitle="Monitoring Tim" showLogout setView={setView} setCurrentUser={setCurrentUser} setLoginStep={setLoginStep} setPasswordInput={setPasswordInput}>
        
        {/* NEW BUTTON: ARSIP & ANALITIK */}
        <div onClick={() => setView('archive')} className="bg-slate-800 text-white p-5 rounded-[2rem] shadow-lg mb-6 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
                <div className="bg-white/10 p-3 rounded-xl"><BarChart3 size={20}/></div>
                <div><h3 className="font-bold text-lg">Arsip & Analitik</h3><p className="text-xs text-slate-400">Cek Data & History Project</p></div>
            </div>
            <ChevronLeft className="rotate-180 text-slate-500"/>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {TEAMS.map((team) => {
            const count = projects.filter(p => p.teamId === team.id).length;
            return (
              <div key={team.id} onClick={() => { setActiveTeamId(team.id); setView('team-projects'); }} className="bg-white p-5 rounded-[2rem] border border-slate-100 glass-card-hover cursor-pointer transition-all relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-200">{team.name.split(' ')[1]}</div>
                  <div className="flex-1"><h3 className="font-black text-slate-800 text-xl">{team.name}</h3><p className="text-xs text-slate-500 font-bold line-clamp-1">{team.members.join(' & ')}</p></div>
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
    // Limit show 10 latest
    const prj = projects.filter(p => p.teamId === activeTeamId).slice(0, 10);
    
    return (
      <Layout title={tm.name} subtitle={tm.members.join(' & ')} showBack onBack={() => setView('team-list')} showAssets setView={setView}>
        {prj.length === 0 ? <div className="text-center py-20 opacity-50"><FolderOpen size={48} className="mx-auto mb-2 text-slate-300"/><p className="text-sm font-bold text-slate-400">Belum ada tugas.</p></div> : 
            <div className="space-y-4">
                {prj.map(p => (
                <div key={p.id} onClick={() => { setActiveProject(p); setView('project-detail'); }} className="bg-white p-5 rounded-[2rem] border border-slate-100 glass-card-hover cursor-pointer">
                    <div className="flex justify-between mb-2"><span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{p.status}</span>{p.isApproved && <CheckCircle2 size={16} className="text-green-500"/>}</div>
                    <h3 className="font-bold text-slate-800 text-lg">{p.title}</h3>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden"><div className="bg-indigo-600 h-full rounded-full transition-all" style={{width: `${p.progress}%`}}></div></div>
                </div>
            ))}</div>
        }
        
        <button onClick={() => handleAddNewProject(tm.id)} disabled={isSaving} className="fixed bottom-8 right-6 z-50 bg-slate-900 text-white h-14 px-6 rounded-full shadow-2xl flex items-center gap-2 font-bold hover:scale-105 transition-transform">
            {isSaving ? <Loader2 className="animate-spin"/> : <Plus/>} Tugas Baru
        </button>
      </Layout>
    );
  }

  // --- CREATOR DASHBOARD ---
  if (view === 'dashboard' && currentUser?.role === 'creator') {
    const tm = TEAMS.find(t => t.id === currentUser.teamId);
    const myProjects = projects.filter(p => p.teamId === currentUser.teamId).slice(0, 10);

    return (
      <Layout title={`Halo, ${currentUser.name}!`} subtitle={tm.members.join(' & ')} showLogout setView={setView} setCurrentUser={setCurrentUser} setLoginStep={setLoginStep} setPasswordInput={setPasswordInput}>
        <div onClick={() => setView('assets')} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-8 text-white shadow-xl shadow-blue-200 flex items-center justify-between cursor-pointer active:scale-95 transition-transform">
           <div><h3 className="font-bold text-xl mb-1">Gudang Aset</h3><p className="text-xs opacity-80">Logo, Font, & Template</p></div>
           <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"><FolderOpen size={24} className="text-white"/></div>
        </div>
        
        <div className="flex justify-between items-end mb-4">
            <h2 className="font-bold text-slate-800 text-lg">Tugas Terbaru</h2>
        </div>

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

  // --- PROJECT DETAIL (TIMELINE UI) ---
  if (view === 'project-detail' && activeProject) {
    const isSup = currentUser?.role === 'supervisor';
    return (
      <Layout title={activeProject.title} subtitle={activeProject.status} showBack onBack={() => setView(isSup ? 'team-projects' : 'dashboard')}>
        
        {/* AI Modal */}
        {showAIModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-[slideUp_0.2s_ease-out]"><div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl"><div className="flex justify-between items-center mb-4"><h3 className="font-black text-lg flex items-center gap-2 text-indigo-600"><Sparkles/> AI Script</h3><button onClick={() => setShowAIModal(false)} className="p-2 bg-slate-100 rounded-full"><X size={18}/></button></div>{!aiResult ? <><textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="Topik video..." className="w-full h-32 p-4 bg-slate-50 rounded-2xl text-sm font-medium mb-4 outline-none resize-none"/><button onClick={handleScript} disabled={isAILoading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex justify-center gap-2">{isAILoading ? <Loader2 className="animate-spin"/> : <Wand2/>} Buat Naskah</button></> : <><div className="h-60 overflow-y-auto text-xs bg-slate-50 p-4 rounded-2xl mb-4 whitespace-pre-line leading-relaxed custom-scrollbar">{aiResult}</div><button onClick={()=>{navigator.clipboard.writeText(aiResult);setShowAIModal(false)}} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Salin Naskah</button></>}</div></div>}

        {/* EDIT FORM (Hanya muncul jika supervisor aktif klik tombol edit) */}
        {isEditingProject && isSup ? (
          <div className="bg-white p-6 rounded-[2rem] border-2 border-indigo-50 shadow-xl mb-8 animate-[slideUp_0.3s_ease-out]">
             <input type="text" value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})} className="w-full mb-4 p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Judul Tugas"/>
             <textarea value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})} className="w-full mb-4 p-4 bg-slate-50 rounded-2xl text-xs h-32 outline-none resize-none font-medium leading-relaxed" placeholder="Deskripsi..."/>
             <div className="flex gap-2 justify-end">
                <button onClick={()=>handleDeleteProject(activeProject.id)} disabled={isSaving} className="px-4 py-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">Hapus</button>
                <button onClick={cancelEdit} className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Batal</button>
                <button onClick={()=>handleUpdateProject(activeProject.id, editForm) || setIsEditingProject(false)} disabled={isSaving} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-transform">
                    {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
             </div>
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
                        
                        if(t.id === 't4-4') return (
                           <div key={t.id} className={`p-4 ${step.bg} rounded-xl m-1`}>
                              <div className={`flex items-center gap-2 mb-2 text-xs font-black ${step.text}`}>LINK PREVIEW (480p)</div>
                              {!isSup && !activeProject.isApproved && <input type="text" className="w-full text-xs p-3 bg-white rounded-lg outline-none font-medium shadow-sm" placeholder="Paste link..." onBlur={e=>handleUpdateProject(activeProject.id,{previewLink:e.target.value,status:'Waiting Review'})} defaultValue={activeProject.previewLink}/>}
                              {activeProject.previewLink && <a href={activeProject.previewLink} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 bg-white rounded-lg text-xs font-bold mt-2 shadow-sm hover:scale-[1.02] transition-transform">Buka Preview <ExternalLink size={12}/></a>}
                           </div>
                        )
                        
                        if(t.id === 't5-2') return (
                           <div key={t.id} className={`p-4 bg-emerald-50 rounded-xl m-1`}>
                              <div className={`flex items-center gap-2 mb-2 text-xs font-black text-emerald-700`}>LINK FINAL (DRIVE)</div>
                              {!isSup && <input type="text" className="w-full text-xs p-3 bg-white rounded-lg outline-none font-medium shadow-sm" placeholder="Paste link..." />}
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
                           <div className="flex gap-2 mb-2 items-center"><ShieldCheck size={14} className="text-orange-500"/><h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest">SUPERVISOR CHECK</h4></div>
                           {activeProject.isApproved ? <div className="bg-emerald-100 text-emerald-700 text-xs p-3 rounded-xl font-black text-center shadow-sm">✅ DISETUJUI</div> : <p className="text-xs text-slate-400 font-medium mb-2 pl-6">Menunggu review...</p>}
                           
                           {isSup && !activeProject.isApproved && activeProject.previewLink && (
                               <div><textarea className="w-full p-3 text-xs bg-white rounded-xl mb-2 outline-none border border-orange-100 font-medium" rows="2" placeholder="Catatan revisi..." value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)}></textarea><div className="flex gap-2"><button onClick={() => {handleUpdateProject(activeProject.id, {isApproved:false,status:'Revision Needed',feedback:feedbackInput});setFeedbackInput('')}} className="flex-1 py-3 bg-white text-orange-600 font-bold text-xs rounded-xl border border-orange-200 hover:bg-orange-50">Minta Revisi</button><button onClick={() => handleUpdateProject(activeProject.id, {isApproved:true,status:'Approved',feedback:''})} className="flex-1 py-3 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform">Approve</button></div></div>
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
