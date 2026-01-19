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
  Loader2, Copy, Plus, Trash2, Calendar, Grid, Link as LinkIcon
} from 'lucide-react';

/* ========================================================================
   BAGIAN 1: KONFIGURASI AMAN (ENV VARIABLES)
   Sekarang kode ini membaca 'brankas' Vercel, bukan kode yang tertulis.
   ======================================================================== */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/* ========================================================================
   BAGIAN 2: SISTEM UI & LOGIC
   ======================================================================== */

// Inisialisasi Firebase
// Note: Jika config kosong (belum diset di Vercel), aplikasi akan error dengan aman.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TEAMS = [
  { id: 'team-1', name: 'Tim 1', members: ['Farel Fajar Al Azizy', 'Dimas Setya Prima Putra'] },
  { id: 'team-2', name: 'Tim 2', members: ['Hasbi Maulana Fathir', 'Muhammad Afif Naufal'] },
  { id: 'team-3', name: 'Tim 3', members: ['M. Rashya Arief A.', 'Rajendra Ges Abiyasa'] },
  { id: 'team-4', name: 'Tim 4', members: ['Ahmad Zidhan Mubaroq', 'Alfinza Rehandista'] },
];

const WORKFLOW_STEPS = [
  { id: 'step-1', title: 'Pre-Production', subtitle: 'Konsep & Aset', icon: <FolderOpen className="w-5 h-5" />, tasks: [{ id: 't1-1', label: 'Pahami Brief & Tujuan' }, { id: 't1-2', label: 'Download Aset Wajib' }, { id: 't1-3', label: 'Finalisasi Script/Naskah', hasAI: true }] },
  { id: 'step-2', title: 'Production', subtitle: 'Shooting & VO', icon: <Film className="w-5 h-5" />, tasks: [{ id: 't2-1', label: 'Cam: 1080p 60fps' }, { id: 't2-2', label: 'Ratio: 9:16 (Vertical)' }, { id: 't2-3', label: 'Lighting Check' }, { id: 't2-4', label: 'Voice Over Jelas' }] },
  { id: 'step-3', title: 'Editing Draft', subtitle: 'Assembly & Cut', icon: <MonitorPlay className="w-5 h-5" />, tasks: [{ id: 't3-1', label: 'Assembly sesuai Beat' }, { id: 't3-2', label: 'Subtitle Safe Area' }, { id: 't3-3', label: 'Color & Audio Mix' }] },
  { id: 'step-4', title: 'Review Phase', subtitle: 'Link Preview', isGatekeeper: true, icon: <AlertCircle className="w-5 h-5" />, tasks: [{ id: 't4-1', label: 'Export Low Res' }, { id: 't4-2', label: 'Upload Link GDrive' }] },
  { id: 'step-5', title: 'Final Export', subtitle: 'High Quality', icon: <CheckCircle2 className="w-5 h-5" />, tasks: [{ id: 't5-1', label: 'Revisi Final' }, { id: 't5-2', label: 'Export 1080p 60fps' }, { id: 't5-3', label: 'Upload ke Folder Final' }] }
];

const styles = `
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
  @keyframes blink { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-blink { animation: blink 4s infinite; }
  .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); }
  .glass-header { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(226, 232, 240, 0.6); }
`;

const RoboLogo = ({ size = 60, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={`overflow-visible ${className}`}>
    <g className="animate-float origin-bottom"><line x1="50" y1="15" x2="50" y2="30" stroke="#6366f1" strokeWidth="4" /><circle cx="50" cy="15" r="5" fill="#f43f5e" className="animate-pulse" /></g>
    <rect x="20" y="30" width="60" height="50" rx="12" fill="white" stroke="#6366f1" strokeWidth="4" />
    <rect x="25" y="35" width="50" height="40" rx="8" fill="#e0e7ff" fillOpacity="0.5" />
    <g className="animate-blink origin-center" style={{ transformOrigin: "50% 55%" }}><circle cx="38" cy="50" r="6" fill="#1e1b4b" /><circle cx="62" cy="50" r="6" fill="#1e1b4b" /></g>
    <path d="M40 65 Q50 70 60 65" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
    <rect x="12" y="45" width="8" height="20" rx="2" fill="#6366f1" /><rect x="80" y="45" width="8" height="20" rx="2" fill="#6366f1" />
  </svg>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  
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

  useEffect(() => {
    const qProjects = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
    });
    const qAssets = query(collection(db, "assets"), orderBy("createdAt", "desc"));
    const unsubAssets = onSnapshot(qAssets, (snapshot) => {
      const assetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssets(assetsData);
    });
    return () => { unsubProjects(); unsubAssets(); };
  }, []);

  const handleAddNewProject = async (teamId) => {
    try {
      const newProject = { teamId, status: 'In Progress', progress: 0, title: 'Tugas Baru', description: 'Deskripsi tugas baru...', completedTasks: [], isApproved: false, createdAt: serverTimestamp() };
      const docRef = await addDoc(collection(db, "projects"), newProject);
      setActiveProject({ id: docRef.id, ...newProject }); setEditForm({ title: newProject.title, description: newProject.description }); setIsEditingProject(true); setView('project-detail');
    } catch (e) { alert("Gagal membuat tugas: " + e.message); }
  };
  const handleDeleteProject = async (projectId) => { if (confirm("Yakin hapus tugas ini selamanya?")) { await deleteDoc(doc(db, "projects", projectId)); setView('team-projects'); } };
  const handleUpdateProject = async (projectId, data) => { await updateDoc(doc(db, "projects", projectId), data); if (activeProject && activeProject.id === projectId) { setActiveProject(prev => ({ ...prev, ...data })); } };
  const handleTaskToggle = (projectId, taskId) => {
    const currentProject = projects.find(p => p.id === projectId); if (!currentProject) return;
    const newCompleted = currentProject.completedTasks.includes(taskId) ? currentProject.completedTasks.filter(id => id !== taskId) : [...currentProject.completedTasks, taskId];
    const totalSteps = WORKFLOW_STEPS.reduce((acc, step) => acc + step.tasks.length, 0); const newProgress = Math.round((newCompleted.length / totalSteps) * 100);
    let status = currentProject.status;
    if (WORKFLOW_STEPS[3].tasks.map(t => t.id).every(id => newCompleted.includes(id)) && currentProject.previewLink && !currentProject.isApproved) { status = 'Waiting Review'; }
    handleUpdateProject(projectId, { completedTasks: newCompleted, progress: newProgress, status: status });
  };
  const handleAddAsset = async () => {
    if(!newAssetForm.title) return;
    let color = 'from-gray-400 to-gray-500'; if(newAssetForm.type === 'folder') color = 'from-blue-500 to-cyan-500'; if(newAssetForm.type === 'video') color = 'from-purple-500 to-pink-500'; if(newAssetForm.type === 'audio') color = 'from-pink-500 to-rose-500'; if(newAssetForm.type === 'font') color = 'from-orange-400 to-amber-400';
    await addDoc(collection(db, "assets"), { ...newAssetForm, color, createdAt: serverTimestamp() }); setIsAddingAsset(false); setNewAssetForm({ title: '', type: 'folder', link: '', size: '' });
  };
  const handleDeleteAsset = async (id) => { if(confirm("Hapus aset ini?")) await deleteDoc(doc(db, "assets", id)); };

  // --- GEMINI API CALL (SECURED) ---
  const callGeminiAPI = async (promptText) => {
    setIsAILoading(true); setAiResult(''); 
    // Mengambil API Key dari Environment Variable
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }) });
      const data = await response.json(); setAiResult(data.candidates?.[0]?.content?.parts?.[0]?.text || "Gagal generate.");
    } catch (e) { setAiResult("Error koneksi atau API Key belum diset."); } finally { setIsAILoading(false); }
  };
  const handleGenerateScript = () => { if(aiPrompt) callGeminiAPI(`Buatkan naskah video pendek (max 60s) TikTok/Reels topik: "${aiPrompt}". Bahasa Indonesia gaul, struktur: Hook, Isi, CTA.`); };
  const handleGenerateBrief = async (title) => {
    setIsAILoading(true); const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `Buat brief video singkat padat untuk videografer dari judul: "${title}". Sertakan Tujuan, Target Audiens, Mood.` }] }] }) });
      const data = await response.json(); setEditForm(prev => ({ ...prev, description: data.candidates?.[0]?.content?.parts?.[0]?.text || "" }));
    } catch (e) { alert("Gagal auto-brief"); } finally { setIsAILoading(false); }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'Revision Needed': return 'bg-red-100 text-red-700 border-red-200';
      case 'Waiting Review': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
  };
  const Layout = ({ children, title, subtitle, showBack, onBack, showAssets, showLogout }) => (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 max-w-md mx-auto shadow-2xl border-x border-slate-100 relative overflow-hidden">
        <style>{styles}</style>
        <div className="glass-header px-6 py-5 sticky top-0 z-30 flex justify-between items-center transition-all">
             <div className="flex items-center gap-3">
                {showBack && <button onClick={onBack} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-indigo-50 border border-slate-100 shadow-sm transition-transform active:scale-90"><ChevronLeft size={20} className="text-slate-600" /></button>}
                <div><h1 className="text-lg font-extrabold text-slate-800 leading-tight">{title}</h1>{subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}</div>
             </div>
             <div className="flex gap-2">
                {showAssets && <button onClick={() => setView('assets')} className="p-2.5 bg-white border border-slate-100 text-indigo-600 rounded-full hover:bg-indigo-50 shadow-sm transition-transform hover:rotate-12" title="Gudang Aset"><FolderOpen size={20} /></button>}
                {showLogout && <button onClick={() => { setCurrentUser(null); setView('login'); setLoginStep('role-select'); setPasswordInput(''); }} className="p-2.5 bg-white border border-red-100 text-red-500 rounded-full hover:bg-red-50 shadow-sm transition-transform hover:scale-110" title="Keluar"><LogOut size={20} /></button>}
             </div>
        </div>
        <div className="p-6 pb-24 animate-slide-up relative z-10">{children}</div>
    </div>
  );

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <style>{styles}</style>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-200 rounded-full blur-[100px] opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="w-full max-w-sm glass-card rounded-3xl shadow-2xl p-8 relative z-10 animate-slide-up border border-white/50">
          <div className="flex justify-center mb-6"><RoboLogo size={100} /></div>
          <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-1 tracking-tight">RoboEdu Studio</h1>
          <p className="text-center text-slate-500 text-sm mb-8 font-medium">Online Production System</p>
          {loginStep === 'role-select' && (
            <div className="space-y-4 animate-slide-up">
              <button onClick={() => { setSelectedRole('creator'); setLoginStep('password'); }} className="w-full py-4 bg-white/80 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl flex items-center px-4 transition-all group shadow-sm hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-4 text-white shadow-lg shadow-indigo-200"><FileVideo size={24} /></div>
                <div className="text-left"><div className="font-bold text-slate-800 text-lg">Tim Kreator</div><div className="text-xs text-slate-500">Login Kelompok</div></div>
                <ArrowRight className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
              </button>
              <button onClick={() => { setSelectedRole('supervisor'); setLoginStep('password'); }} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center px-4 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mr-4"><ShieldCheck size={24} className="text-cyan-400" /></div>
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
              <div className="flex items-center justify-between mb-6"><span className="text-sm font-bold text-slate-500">Login: <span className="text-indigo-600 capitalize">{selectedRole}</span></span><button type="button" onClick={() => { setLoginStep('role-select'); setPasswordInput(''); setLoginError(''); }} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button></div>
              <div className="relative mb-6 group"><Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} /><input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Masukkan Password..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner" autoFocus /></div>
              {loginError && <div className="mb-4 text-xs text-red-600 bg-red-50 p-3 rounded-xl flex items-center gap-2 border border-red-100 animate-pulse"><AlertCircle size={14} /> {loginError}</div>}
              <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"><Zap size={18} fill="currentColor" /> Masuk System</button>
            </form>
          )}
          {loginStep === 'team-select' && (
             <div className="animate-slide-up">
                <div className="flex items-center justify-between mb-4"><span className="text-sm font-bold text-slate-500">Pilih Tim Kamu:</span><button type="button" onClick={() => setLoginStep('role-select')} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button></div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {TEAMS.map((team) => (<button key={team.id} onClick={() => { setCurrentUser({ role: 'creator', teamId: team.id, name: team.name }); setView('dashboard'); }} className="w-full text-left px-4 py-3 rounded-xl border border-slate-100 hover:border-indigo-300 bg-white hover:bg-indigo-50 shadow-sm transition-all group"><div className="flex justify-between items-center mb-1"><span className="font-bold text-slate-800 group-hover:text-indigo-700">{team.name}</span><div className="flex items-center gap-1 text-slate-300 group-hover:text-indigo-400"><User size={12} /> <span className="text-[10px]">{team.members.length}</span></div></div><div className="text-[10px] text-slate-500 line-clamp-1">{team.members.join(' & ')}</div></button>))}
                </div>
             </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'team-list' && currentUser?.role === 'supervisor') {
    return (
      <Layout title="Dashboard" subtitle="Monitoring Tim" showLogout showAssets>
        <div className="grid grid-cols-1 gap-4">
          {TEAMS.map((team) => {
            const teamProjects = projects.filter(p => p.teamId === team.id);
            const activeCount = teamProjects.filter(p => p.status !== 'Approved').length;
            return (
              <div key={team.id} onClick={() => { setActiveTeamId(team.id); setView('team-projects'); }} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 cursor-pointer group active:scale-[0.98] transition-all relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 group-hover:animate-float">{team.name.split(' ')[1]}</div><div className="flex-1"><h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{team.name}</h3><p className="text-xs text-slate-500">{team.members.length} Anggota</p></div><ChevronLeft size={20} className="rotate-180 text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" /></div>
                <div className="flex gap-2 relative z-10"><div className="px-3 py-1.5 bg-slate-100 rounded-lg flex items-center gap-1.5"><Grid size={12} className="text-slate-500"/><span className="text-xs font-bold text-slate-600">{teamProjects.length} Tugas</span></div>{activeCount > 0 && <div className="px-3 py-1.5 bg-orange-100 rounded-lg flex items-center gap-1.5 animate-pulse"><Zap size={12} className="text-orange-500"/><span className="text-xs font-bold text-orange-600">{activeCount} Aktif</span></div>}</div>
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
        {teamProjects.length === 0 ? <div className="text-center py-20 opacity-50 flex flex-col items-center"><RoboLogo size={80} className="grayscale mb-4" /><p className="text-sm font-medium">Belum ada tugas.</p></div> : 
            <div className="space-y-4">{teamProjects.map(project => (
                <div key={project.id} onClick={() => { setActiveProject(project); setView('project-detail'); }} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 cursor-pointer active:scale-[0.98] transition-all relative">
                    <div className="flex justify-between items-start mb-3"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(project.status)}`}>{project.status}</span>{project.isApproved && <div className="bg-green-100 p-1 rounded-full"><CheckCircle2 size={14} className="text-green-600" /></div>}</div>
                    <h3 className="font-bold text-slate-800 mb-2 text-lg">{project.title}</h3>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div></div>
                    <div className="mt-2 text-right"><span className="text-[10px] font-bold text-slate-400">{project.progress}% Selesai</span></div>
                </div>
            ))}</div>
        }
        <div className="fixed bottom-8 right-6 z-40 max-w-md mx-auto w-full px-6 flex justify-end pointer-events-none"><button onClick={() => handleAddNewProject(team.id)} className="pointer-events-auto flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl shadow-indigo-200 hover:scale-105 transition-transform font-bold"><Plus size={20} /> Tambah Tugas</button></div>
      </Layout>
    );
  }

  if (view === 'dashboard' && currentUser?.role === 'creator') {
    const myProjects = projects.filter(p => p.teamId === currentUser.teamId);
    return (
      <Layout title={`Halo, ${currentUser.name.split(' ')[0]}!`} subtitle="Siap berkarya?" showLogout>
        <div onClick={() => setView('assets')} className="bg-slate-900 rounded-3xl p-6 mb-8 text-white shadow-2xl shadow-slate-200 flex items-center justify-between cursor-pointer group relative overflow-hidden transition-transform hover:scale-[1.02]">
           <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500 rounded-full blur-[50px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
           <div className="relative z-10"><h3 className="font-bold text-xl mb-1">Gudang Aset</h3><p className="text-xs text-slate-400 group-hover:text-white transition-colors">Font & Logo Resmi</p></div>
           <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all relative z-10 border border-white/10"><FolderOpen size={24} className="text-cyan-400"/></div>
        </div>
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg"><Calendar size={20} className="text-indigo-600"/> Jobdesk Tim Kami</h2>
        {myProjects.length === 0 ? <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-300"><p className="text-sm text-slate-400 font-medium">Hore! Belum ada tugas aktif.</p></div> : 
           <div className="space-y-4">{myProjects.map(project => (
              <div key={project.id} onClick={() => { setActiveProject(project); setView('project-detail'); }} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 cursor-pointer active:scale-[0.98] transition-all">
                  <div className="flex justify-between items-start mb-3"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(project.status)}`}>{project.status}</span>{project.isApproved && <div className="bg-green-100 p-1 rounded-full"><CheckCircle2 size={14} className="text-green-600" /></div>}</div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{project.title}</h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-1">{project.description}</p>
                  <div className="flex items-center gap-3"><div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div></div><span className="text-[10px] font-bold text-slate-400">{project.progress}%</span></div>
              </div>
           ))}</div>
        }
      </Layout>
    );
  }

  if (view === 'assets') {
    const isSupervisor = currentUser?.role === 'supervisor';
    return (
      <Layout title="Gudang Aset" subtitle="File Resmi" showBack onBack={() => setView(isSupervisor ? 'team-projects' : 'dashboard')}>
        <div className="space-y-4">
            {isSupervisor && isAddingAsset && (
                <div className="bg-white border border-indigo-200 p-5 rounded-3xl mb-6 shadow-lg animate-slide-up">
                    <h3 className="text-xs font-bold text-indigo-600 mb-3 uppercase tracking-wider flex items-center gap-2"><Plus size={14}/> Tambah File Baru</h3>
                    <input type="text" placeholder="Nama File (cth: Logo PNG)" className="w-full p-3 text-xs border border-slate-200 rounded-xl mb-3 focus:outline-none focus:border-indigo-500" value={newAssetForm.title} onChange={e => setNewAssetForm({...newAssetForm, title: e.target.value})} />
                    <div className="flex gap-2 mb-3"><select className="p-3 text-xs border border-slate-200 rounded-xl flex-1 bg-white" value={newAssetForm.type} onChange={e => setNewAssetForm({...newAssetForm, type: e.target.value})}><option value="folder">Folder</option><option value="video">Video</option><option value="audio">Audio</option><option value="font">File Lain</option></select><input type="text" placeholder="Size" className="w-1/3 p-3 text-xs border border-slate-200 rounded-xl" value={newAssetForm.size} onChange={e => setNewAssetForm({...newAssetForm, size: e.target.value})} /></div>
                    <input type="text" placeholder="Link Google Drive..." className="w-full p-3 text-xs border border-slate-200 rounded-xl mb-4 font-mono text-slate-500" value={newAssetForm.link} onChange={e => setNewAssetForm({...newAssetForm, link: e.target.value})} />
                    <div className="flex gap-2 justify-end"><button onClick={() => setIsAddingAsset(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500">Batal</button><button onClick={handleAddAsset} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">Simpan Aset</button></div>
                </div>
            )}
            {assets.map(asset => (
                <div key={asset.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-lg hover:border-indigo-50 transition-all group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${asset.color} text-white shadow-md`}>
                        {asset.type === 'folder' && <FolderOpen size={24} />}{asset.type === 'video' && <Film size={24} />}{asset.type === 'audio' && <MonitorPlay size={24} />}{asset.type === 'font' && <Edit2 size={24} />}
                    </div>
                    <div className="flex-1"><h3 className="font-bold text-slate-800 text-sm">{asset.title}</h3><p className="text-xs text-slate-400 font-medium">{asset.size}</p></div>
                    <div className="flex items-center gap-2">
                        <a href={asset.link} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 rounded-full text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><ExternalLink size={18} /></a>
                        {isSupervisor && <button onClick={() => handleDeleteAsset(asset.id)} className="p-3 bg-red-50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>}
                    </div>
                </div>
            ))}
        </div>
        {isSupervisor && !isAddingAsset && (<div className="fixed bottom-8 right-6 z-40 max-w-md mx-auto w-full px-6 flex justify-end pointer-events-none"><button onClick={() => setIsAddingAsset(true)} className="pointer-events-auto flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-full shadow-xl hover:scale-105 transition-transform font-bold"><Plus size={20} /> Upload</button></div>)}
      </Layout>
    );
  }

  if (view === 'project-detail' && activeProject) {
    const isSupervisor = currentUser?.role === 'supervisor'; const canEdit = isSupervisor;
    return (
      <Layout title={activeProject.title} subtitle={`Status: ${activeProject.status}`} showBack onBack={() => setView(isSupervisor ? 'team-projects' : 'dashboard')}>
        {showAIModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"><div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div><div className="flex justify-between items-center mb-6 relative z-10"><div className="flex items-center gap-2 text-indigo-600"><Sparkles size={24} className="animate-pulse"/><h3 className="font-bold text-xl">AI Assistant</h3></div><button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button></div>{!aiResult ? (<div className="relative z-10"><textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Tulis topik videonya disini..." className="w-full h-32 p-4 rounded-2xl border border-slate-200 text-sm mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none bg-slate-50" /><button onClick={handleGenerateScript} disabled={isAILoading || !aiPrompt} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50">{isAILoading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />} {isAILoading ? "Sedang Berpikir..." : "Buatkan Naskah"}</button></div>) : (<div className="relative z-10"><div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-700 h-64 overflow-y-auto mb-4 border border-slate-200 whitespace-pre-line leading-relaxed custom-scrollbar">{aiResult}</div><div className="flex gap-2"><button onClick={() => { setAiResult(''); setAiPrompt(''); }} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-300">Ulangi</button><button onClick={() => { navigator.clipboard.writeText(aiResult); setShowAIModal(false); }} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700"><Copy size={16} /> Salin</button></div></div>)}</div></div>)}
        {isEditingProject ? (
          <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-xl mb-8 animate-slide-up relative"><div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full opacity-50"></div><label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1 block">Judul Konten</label><input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full mb-4 p-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-indigo-500" /><div className="flex justify-between items-end mb-2"><label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Brief / Deskripsi</label>{editForm.title.length > 3 && <button onClick={() => handleGenerateBrief(editForm.title)} disabled={isAILoading} className="text-[10px] flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold transition-colors">{isAILoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Auto-Brief</button>}</div><textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full mb-4 p-3 rounded-xl border border-slate-200 text-xs h-32 focus:outline-none focus:border-indigo-500 bg-slate-50 resize-none" placeholder="Deskripsi tugas..." /><div className="flex gap-2 justify-end border-t border-slate-100 pt-4"><button onClick={() => handleDeleteProject(activeProject.id)} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl text-xs flex items-center gap-1 mr-auto font-bold"><Trash2 size={16}/> Hapus</button><button onClick={() => setIsEditingProject(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold">Batal</button><button onClick={() => handleUpdateProject(activeProject.id, {title: editForm.title, description: editForm.description}) || setIsEditingProject(false)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200"><Save size={14} /> Simpan</button></div></div>
        ) : (
          <div className="mb-8"><div className="flex justify-between items-start mb-4"><p className="text-sm text-slate-600 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm leading-relaxed whitespace-pre-line w-full">{activeProject.description}</p>{canEdit && <button onClick={() => { setEditForm({ title: activeProject.title, description: activeProject.description }); setIsEditingProject(true); }} className="ml-2 p-3 bg-white rounded-2xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-slate-100"><Edit2 size={18} /></button>}</div></div>
        )}
        <div className="space-y-6 relative"><div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200 z-0 rounded-full"></div>
           {WORKFLOW_STEPS.map((step, index) => {
             const isStepLocked = index > 0 && !WORKFLOW_STEPS[index - 1].tasks.every(t => activeProject.completedTasks.includes(t.id)); const isFinalStep = index === 4; const isFinalLocked = isFinalStep && !activeProject.isApproved; const isActuallyLocked = isStepLocked || isFinalLocked;
             return (
               <div key={step.id} className={`relative pl-4 transition-all duration-500 ${isActuallyLocked ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                 <div className="flex items-center gap-5 mb-4 relative z-10"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shrink-0 transition-colors ${isActuallyLocked ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white ring-4 ring-white'}`}>{step.icon}</div><div><h3 className="font-bold text-slate-800 text-lg">{step.title}</h3><p className="text-xs text-slate-500 font-medium">{step.subtitle}</p></div></div>
                 <div className="space-y-3 pl-20">
                    {step.tasks.map(task => {
                        const isChecked = activeProject.completedTasks.includes(task.id);
                        if(task.id === 't4-2') { return (<div key={task.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200"><div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-xs"><div className={`w-4 h-4 rounded-full border flex items-center justify-center ${activeProject.previewLink ? 'bg-indigo-600 border-indigo-600' : 'border-slate-400'}`}>{activeProject.previewLink && <CheckCircle2 size={10} className="text-white"/>}</div> Upload Link</div>{!isSupervisor && !activeProject.isApproved && <input type="text" className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" placeholder="Paste Link GDrive..." onBlur={(e) => { if(e.target.value) handleUpdateProject(activeProject.id, { previewLink: e.target.value, status: 'Waiting Review' }); }} defaultValue={activeProject.previewLink}/>}{activeProject.previewLink && <a href={activeProject.previewLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold mt-3 hover:bg-blue-100 transition-colors"><ExternalLink size={14}/> Buka Preview</a>}</div>) }
                        return (<div key={task.id} className="flex gap-2"><button disabled={isActuallyLocked || (isSupervisor)} onClick={() => handleTaskToggle(activeProject.id, task.id)} className={`flex-1 flex items-center p-3.5 rounded-2xl border text-left transition-all ${isChecked ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'} ${isActuallyLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}><div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600 scale-110' : 'border-slate-300 bg-transparent'}`}>{isChecked && <CheckCircle2 size={14} className="text-white" />}</div><span className={`text-xs font-bold ${isChecked ? 'text-indigo-700' : 'text-slate-600'}`}>{task.label}</span></button>{task.hasAI && !isChecked && !isActuallyLocked && !isSupervisor && (<button onClick={() => { setAiPrompt(''); setShowAIModal(true); }} className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white w-14 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"><Sparkles size={20} className="animate-pulse"/></button>)}</div>)
                    })}
                    {step.isGatekeeper && !isActuallyLocked && (<div className="mt-4 p-5 bg-orange-50 border border-orange-100 rounded-3xl"><div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0"><ShieldCheck size={16} className="text-orange-500" /></div><div className="w-full"><h4 className="text-xs font-extrabold text-orange-700 uppercase mb-2">Gatekeeper: Supervisor</h4>{activeProject.isApproved ? (<div className="bg-green-100 text-green-700 text-xs p-3 rounded-xl font-bold flex items-center gap-2 border border-green-200"><CheckCircle2 size={16} /> Disetujui!</div>) : (<div className="text-xs text-orange-600 font-medium mb-3">{activeProject.previewLink ? "Menunggu review." : "Upload link dulu."}</div>)}{isSupervisor && !activeProject.isApproved && activeProject.previewLink && (<div className="mt-3 border-t border-orange-200 pt-3"><textarea className="w-full p-3 text-xs border border-orange-200 rounded-xl mb-2 bg-white" rows="2" placeholder="Revisi..." value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)}></textarea><div className="grid grid-cols-2 gap-2"><button onClick={() => handleReviewAction(activeProject.id, false)} className="py-2.5 bg-white border border-red-200 text-red-500 rounded-xl text-xs font-bold">Revisi</button><button onClick={() => handleReviewAction(activeProject.id, true)} className="py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md">Approve</button></div></div>)}{activeProject.feedback && (<div className="mt-3 text-xs bg-white p-4 rounded-xl text-slate-700 border border-red-100 shadow-sm"><span className="font-bold text-red-500 block mb-1">Revisi:</span>"{activeProject.feedback}"</div>)}</div></div></div>)}
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
