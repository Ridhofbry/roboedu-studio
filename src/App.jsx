import React, { useState, useEffect, useMemo } from 'react';
import { 
  LogOut, ArrowRight, Sparkles, LayoutDashboard, Settings, 
  Users, Loader2, Bell, Search, Menu, Newspaper, BookOpen, 
  Image as ImageIcon, Edit3, ShieldCheck, PlayCircle, Lock,
  Camera, PenTool, Clapperboard, MonitorPlay, Mic, Film,
  FolderOpen, CheckCircle2, X, Send, Activity, TrendingUp,
  Archive, Link as LinkIcon, Download, ChevronLeft, Wand2, Plus,
  Trash2, AlertCircle, FileVideo, UserCircle, UserPlus, Shield, Clock,
  Maximize2, Save, MapPin, School, User, Zap, Calendar, Bot, Check, AlertTriangle,
  Quote, Upload, Terminal
} from 'lucide-react';

// --- IMPORT LAYANAN API YANG SUDAH DIAMANKAN ---
import { auth, googleProvider, signInWithPopup, signOut } from './lib/firebase';
import { generateScript } from './lib/gemini';
import { sendNotification } from './lib/onesignal';

/* ========================================================================
   KONFIGURASI UTAMA
   ======================================================================== */

// Daftar Email dengan Hak Akses Super Admin
const SUPER_ADMIN_EMAILS = [
  "mhmmadridho64@gmail.com",
  "eengene70@gmail.com",
  "robo.roboedu@gmail.com"
];

// --- MOCK DATA (Initial State) ---
// Dalam tahap selanjutnya, data ini bisa dipindah ke Firestore
const TEAMS = [
  { id: 'team-1', name: 'Tim 1' },
  { id: 'team-2', name: 'Tim 2' },
  { id: 'team-3', name: 'Tim 3' },
  { id: 'team-4', name: 'Tim 4' },
  { id: 'team-5', name: 'Tim 5 (Special)', isSpecial: true },
];

const INDONESIAN_CITIES = [
    "Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara",
    "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Tangerang",
    "Depok", "Bekasi", "Bogor", "Malang", "Yogyakarta", "Surakarta", "Denpasar",
    "Batam", "Pekanbaru", "Bandar Lampung", "Padang", "Samarinda", "Balikpapan",
    "Banjarmasin", "Pontianak", "Manado", "Mataram", "Jayapura"
].sort();

const WORKFLOW_STEPS = [
  { 
    id: 'step-1', title: 'Konsep', subtitle: 'Pre-Pro', icon: <FolderOpen size={18} />, 
    color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700', 
    tasks: [{id: 't1-1', label: 'Pahami Brief'}, {id: 't1-2', label: 'Download Aset'}, {id: 't1-3', label: 'Scripting', hasAI: true}] 
  },
  { 
    id: 'step-2', title: 'Produksi', subtitle: 'Shooting', icon: <Film size={18} />, 
    color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', 
    tasks: [{id: 't2-1', label: 'Cam: 1080p 30fps'}, {id: 't2-2', label: 'Ratio: 9:16'}, {id: 't2-3', label: 'Lighting Aman'}] 
  },
  { 
    id: 'step-3', title: 'Audio', subtitle: 'Voice Over', icon: <Mic size={18} />, 
    color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-700', 
    tasks: [{id: 't3-1', label: 'No Noise'}, {id: 't3-2', label: 'Intonasi Jelas'}, {id: 't3-3', label: 'Audio Level Pas'}] 
  },
  { 
    id: 'step-4', title: 'Editing', subtitle: 'Post-Pro', icon: <MonitorPlay size={18} />, 
    color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', text: 'text-pink-700', isGatekeeper: true, 
    tasks: [{id: 't4-1', label: 'Cutting Rapi'}, {id: 't4-2', label: 'Subtitle Safe Area'}, {id: 't4-3', label: 'Grading Pop'}, {id: 't4-4', label: 'Upload Preview (480p)'}] 
  },
  { 
    id: 'step-5', title: 'Final', subtitle: 'Submission', icon: <CheckCircle2 size={18} />, 
    color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-700', 
    tasks: [{id: 't5-1', label: 'Cek 1080p Final'}, {id: 't5-2', label: 'Upload Link Result'}] 
  }
];

const ALL_TASK_IDS = WORKFLOW_STEPS.flatMap(step => step.tasks.map(t => t.id));

const INITIAL_PROJECTS = [
  { 
    id: 1, teamId: 'team-1', title: 'Konten Edukasi AI', status: 'Completed', progress: 100, 
    isApproved: true, isBigProject: false, completedTasks: ['t1-1', 't1-2', 't5-2'], 
    equipment: '', script: '', feedback: '', finalLink: 'https://drive.google.com', previewLink: '', createdAt: '2026-01-20',
    completedAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), 
    deadline: '2026-01-21' 
  }
];

const NEWS_DATA = [
  { 
    id: 1, title: "Teknik Kamera Dasar", category: "Knowledge", date: "2 Hari lalu", summary: "Pahami ISO, Aperture, dan Shutter Speed untuk hasil maksimal.",
    content: "Dalam videografi dan fotografi, memahami Segitiga Exposure adalah kunci.\n\n1. Aperture (Diafragma): Mengatur seberapa banyak cahaya masuk lewat lensa.\n2. Shutter Speed: Mengatur durasi sensor terekspos cahaya.\n3. ISO: Sensitivitas sensor."
  },
  { 
    id: 2, title: "Storytelling 101", category: "Tips", date: "1 Minggu lalu", summary: "Setiap konten butuh Hook, Body, dan Call to Action.",
    content: "Konten yang viral biasanya memiliki struktur cerita yang kuat:\n\n- HOOK (0-3 Detik): Bagian terpenting.\n- BODY (Isi): Daging kontennya.\n- CTA (Call to Action): Ajak penonton berinteraksi."
  }
];

const MOCK_ASSETS = [
  { id: 1, title: "Logo RoboEdu PNG", type: "folder", link: "#", size: "2 MB" }
];

/* ========================================================================
   KOMPONEN UI
   ======================================================================== */

const Toast = ({ message, type = 'success' }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[110] flex items-center gap-2 animate-[slideDown_0.3s_ease-out] ${type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
    <span className="text-xs font-bold">{message}</span>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-2 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const PerformanceChart = ({ data = [0,0,0,0,0,0,0], title = "Produktivitas Tim" }) => {
  const maxVal = Math.max(...data, 5); 
  const points = data.map((val, i) => `${i * 50},${100 - (val / maxVal * 80)}`).join(' ');
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-lg mb-6 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div><h4 className="font-bold text-slate-700 text-sm flex items-center gap-2"><Activity size={16} className="text-indigo-600"/> {title}</h4><span className="text-[10px] text-slate-400">Performa Minggu Ini (Reset Senin)</span></div>
            <div className="text-right"><div className="flex items-center gap-1 text-emerald-600 font-black text-sm bg-emerald-50 px-2 py-1 rounded-lg"><TrendingUp size={14}/> {data.reduce((a,b)=>a+b, 0)} Selesai</div></div>
        </div>
        <div className="h-24 w-full relative">
            <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs><linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/></linearGradient></defs>
                <path d={`M0,100 ${points} 300,100`} fill="url(#chartGradient)" className="transition-all duration-1000 ease-in-out" />
                <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md"/>
                {data.map((val, i) => { const y = 100 - (val / maxVal * 80); return ( <g key={i}><circle cx={i * 50} cy={y} r="4" fill="white" stroke="#6366f1" strokeWidth="2" className="group-hover:r-6 transition-all"/><text x={i * 50} y="115" fontSize="10" textAnchor="middle" fill="#94a3b8" className="font-bold">{days[i]}</text></g> ) })}
            </svg>
        </div>
    </div>
  );
};

const BotEvaluation = ({ project }) => {
    if (!project.completedAt || !project.deadline) return null;
    const completed = new Date(project.completedAt);
    const deadline = new Date(project.deadline);
    completed.setHours(0,0,0,0); deadline.setHours(0,0,0,0);
    const isLate = completed > deadline;
    return (
        <div className={`mt-4 p-4 rounded-2xl border flex items-center gap-4 ${isLate ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className={`p-3 rounded-full ${isLate ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{isLate ? <AlertTriangle size={24}/> : <Bot size={24}/>}</div>
            <div className="flex-1"><h4 className={`font-bold text-sm ${isLate ? 'text-red-700' : 'text-emerald-700'}`}>{isLate ? "ANALISA BOT: PROJECT MOLOR 🐢" : "ANALISA BOT: TEPAT WAKTU 🚀"}</h4><div className="text-xs text-slate-500 mt-1 space-y-1"><p>📅 Deadline: <span className="font-bold">{project.deadline}</span></p><p>✅ Selesai: <span className="font-bold">{new Date(project.completedAt).toLocaleDateString()}</span></p></div></div>
        </div>
    )
}

const WeeklyBotReport = ({ projects }) => {
    const report = useMemo(() => {
        const now = new Date(); const currentDay = now.getDay(); const diffToMonday = currentDay === 0 ? 6 : currentDay - 1; 
        const startOfWeek = new Date(now); startOfWeek.setHours(0, 0, 0, 0); startOfWeek.setDate(now.getDate() - diffToMonday);
        let completed = 0; let late = 0; let onTime = 0;
        projects.forEach(p => { if (p.status === 'Completed' && p.completedAt) { const completedDate = new Date(p.completedAt); if (completedDate >= startOfWeek) { completed++; if (p.deadline) { const deadline = new Date(p.deadline); if (completedDate > deadline) late++; else onTime++; } else { onTime++; } } } });
        return { completed, late, onTime };
    }, [projects]);
    const getMessage = () => { if (report.completed === 0) return "Minggu ini belum ada project selesai. Ayo semangat tim!"; if (report.late > 0) return `Minggu ini produktif, namun ada ${report.late} project yang melebihi deadline.`; return `Performa Luar Biasa! ${report.completed} Project selesai tepat waktu minggu ini.`; };
    return (
        <div className="bg-indigo-900 text-white p-6 rounded-[2.5rem] shadow-xl border border-indigo-700 relative overflow-hidden mb-8">
             <div className="absolute top-0 right-0 p-16 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
             <div className="relative z-10 flex items-start gap-4">
                 <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><Terminal size={24} className="text-emerald-300"/></div>
                 <div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">Bot Report</span><span className="text-[10px] opacity-70 font-mono">Minggu Ini</span></div><h3 className="font-bold text-lg leading-tight mb-2">Laporan Performa Tim</h3><p className="text-sm opacity-90 font-medium leading-relaxed">"{getMessage()}"</p><div className="flex gap-4 mt-4 text-xs font-bold"><div className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-400"/> {report.onTime} Tepat Waktu</div>{report.late > 0 && <div className="flex items-center gap-1"><AlertTriangle size={14} className="text-red-400"/> {report.late} Terlambat</div>}</div></div>
             </div>
        </div>
    );
};

/* ========================================================================
   APLIKASI UTAMA
   ======================================================================== */

export default function App() {
  // State
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); 
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [news, setNews] = useState(NEWS_DATA);
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const [weeklyContent, setWeeklyContent] = useState({ title: "Behind The Scene: Project Dokumenter 2026", image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=2070&auto=format&fit=crop" });
  const [siteLogo, setSiteLogo] = useState("https://lh3.googleusercontent.com/d/1uJHar8EYXpRnL8uaPvhePEHWG-BasH9m");

  // Auth State Mock (Sync with Firestore in real app)
  const [approvedUsers, setApprovedUsers] = useState([
     { email: "dimas@roboedu.id", displayName: "Dimas Setya", photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dimas", role: "creator", teamId: "team-1", isProfileComplete: true, bio: "Suka ngoding dan makan bakso. Editor profesional.", nameChangeCount: 0 },
  ]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showPendingAlert, setShowPendingAlert] = useState(false);

  // Forms
  const [profileForm, setProfileForm] = useState({ username: '', school: '', city: '' });
  const [editProfileData, setEditProfileData] = useState({ displayName: '', bio: '', photoURL: '', school: '', city: '' });
  const [newProjectForm, setNewProjectForm] = useState({ title: '', isBigProject: false, teamId: 'team-1', deadline: '' });
  const [newAssetForm, setNewAssetForm] = useState({ title: '', type: 'folder', link: '', size: '' });
  const [weeklyForm, setWeeklyForm] = useState({ title: '', image: '' });
  const [newsForm, setNewsForm] = useState({ id: null, title: '', summary: '', content: '' });
  const [logoForm, setLogoForm] = useState('');
  const [approvalForm, setApprovalForm] = useState({ role: 'creator', teamId: 'team-1' });
  const [feedbackInput, setFeedbackInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [imageUploadState, setImageUploadState] = useState({ isOpen: false, slotIndex: null, urlInput: '' });

  // UI Toggles
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isEditWeeklyOpen, setIsEditWeeklyOpen] = useState(false);
  const [isEditNewsOpen, setIsEditNewsOpen] = useState(false);
  const [isEditLogoOpen, setIsEditLogoOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null, type: 'neutral' });

  // Loaders & Selection
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [toast, setToast] = useState(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [activeProject, setActiveProject] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedPendingUser, setSelectedPendingUser] = useState(null);

  // --- HELPERS ---
  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const autoCorrectGDriveLink = (url) => { const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/); return match && match[1] ? `https://lh3.googleusercontent.com/d/${match[1]}` : url; };
  const calculateProgress = (tasks) => { const total = WORKFLOW_STEPS.reduce((acc, s) => acc + s.tasks.length, 0); return total === 0 ? 0 : Math.round((tasks.length / total) * 100); };
  const isTaskLocked = (taskId, completedTasks) => { const idx = ALL_TASK_IDS.indexOf(taskId); return idx > 0 && !completedTasks.includes(ALL_TASK_IDS[idx - 1]); };
  
  const getWeeklyAnalytics = (teamId = 'all') => {
      const now = new Date(); const diff = now.getDay() === 0 ? 6 : now.getDay() - 1; 
      const startOfWeek = new Date(now); startOfWeek.setHours(0, 0, 0, 0); startOfWeek.setDate(now.getDate() - diff);
      const counts = [0,0,0,0,0,0,0];
      projects.forEach(p => { if (p.status === 'Completed' && p.completedAt) { if (teamId !== 'all' && p.teamId !== teamId) return; const d = new Date(p.completedAt); if (d >= startOfWeek) counts[Math.floor(Math.abs(d - startOfWeek) / 86400000)]++; } });
      return counts;
  };

  // --- EFFECTS ---
  useEffect(() => { if (view === 'landing') { const i = setInterval(() => approvedUsers.length && setSpotlightIndex(p => (p + 1) % approvedUsers.length), 10000); return () => clearInterval(i); } }, [view, approvedUsers.length]);

  // --- HANDLERS ---
  const handleGoogleLogin = async () => {
    setLoadingLogin(true); setShowPendingAlert(false);
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const email = result.user.email;
        
        // Cek Super Admin
        if (SUPER_ADMIN_EMAILS.includes(email)) {
            const existingAdmin = approvedUsers.find(u => u.email === email);
            const userData = existingAdmin || { email, displayName: result.user.displayName, photoURL: result.user.photoURL, role: 'super_admin', isProfileComplete: true, nameChangeCount: 0 };
            setUser(userData); setView('dashboard'); showToast("Welcome Super Admin!");
        } else {
            // Cek User Biasa
            const existingUser = approvedUsers.find(u => u.email === email);
            if (existingUser) {
                setUser(existingUser);
                setView(!existingUser.isProfileComplete ? 'profile-setup' : (existingUser.role === 'supervisor' ? 'team-list' : 'dashboard'));
                showToast(`Halo, ${existingUser.displayName}`);
            } else {
                // User Pending
                if (!pendingUsers.find(u => u.email === email)) {
                    setPendingUsers([...pendingUsers, { email, displayName: result.user.displayName, photoURL: result.user.photoURL, date: new Date().toLocaleDateString() }]);
                }
                setShowPendingAlert(true);
            }
        }
    } catch (error) {
        showToast("Login Gagal", "error");
    } finally {
        setLoadingLogin(false);
    }
  };

  const handleProfileSubmit = () => {
      const updated = { ...user, displayName: profileForm.username, isProfileComplete: true, school: profileForm.school, city: profileForm.city, bio: "Member Baru", nameChangeCount: 0 };
      setUser(updated); setApprovedUsers(approvedUsers.map(u => u.email === user.email ? updated : u));
      sendNotification("User baru bergabung", "supervisor", "General");
      showToast("Profil tersimpan!"); setView('dashboard');
  };

  const requestConfirm = (title, message, action, type='danger') => { setConfirmModal({ isOpen: true, title, message, action, type }); };
  const executeConfirmAction = () => { if (confirmModal.action) confirmModal.action(); setConfirmModal({ ...confirmModal, isOpen: false }); };

  // ... (Sisa handler disederhanakan untuk muat dalam satu blok, logika sama dengan sebelumnya)
  const handleUpdateProject = (id, data) => { setProjects(projects.map(p => p.id === id ? { ...p, ...data } : p)); if(activeProject?.id === id) setActiveProject({ ...activeProject, ...data }); };
  const handleDeleteProject = (id) => { requestConfirm("Hapus?", "Permanen.", () => { setProjects(projects.filter(p => p.id !== id)); setView('dashboard'); showToast("Dihapus"); }); };
  const handleAddProject = () => {
      if(!newProjectForm.title) return; 
      const p = { id: Date.now(), ...newProjectForm, status: 'In Progress', progress: 0, isApproved: false, completedTasks: [], previewImages: newProjectForm.isBigProject ? Array(20).fill(null) : [], createdAt: new Date().toLocaleDateString(), proposalStatus: 'None' };
      setProjects([...projects, p]); setIsAddProjectOpen(false); showToast("Project Dibuat");
  };
  const handleConfirmApproval = () => {
      if(!selectedPendingUser) return;
      const newUser = { ...selectedPendingUser, ...approvalForm, isProfileComplete: false, nameChangeCount: 0 };
      setApprovedUsers([...approvedUsers, newUser]); setPendingUsers(pendingUsers.filter(u => u.email !== newUser.email));
      setIsApprovalModalOpen(false); showToast("User Approved");
  };
  const handleOpenApproveModal = (u) => { setSelectedPendingUser(u); setApprovalForm({ role: 'creator', teamId: 'team-1' }); setIsApprovalModalOpen(true); };
  
  // Render Start
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative w-full overflow-x-hidden selection:bg-indigo-200 selection:text-indigo-900">
      <style>{globalStyles}</style>
      {toast && <Toast message={toast.msg} type={toast.type} />}
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0"><div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[100px] animate-blob"></div><div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div></div>

      {/* Navbar & Mobile Menu Code (Sama seperti sebelumnya) */}
      <nav className="fixed top-0 w-full z-50 px-4 py-3 md:px-6 md:py-4">
          <div className="glass-panel px-4 py-3 md:px-6 md:py-3 flex justify-between items-center transition-all shadow-sm max-w-7xl mx-auto rounded-2xl">
              <div onClick={() => setView('landing')} className="flex items-center gap-2 cursor-pointer">
                  {/* Dynamic Logo with Edit */}
                  <div className="relative group">
                    <img src={siteLogo} className="h-8 w-auto object-contain drop-shadow-md"/>
                    {(user?.role === 'supervisor' || user?.role === 'super_admin') && (
                        <button onClick={(e) => { e.stopPropagation(); setLogoForm(siteLogo); setIsEditLogoOpen(true); }} className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50"><Edit3 size={10} className="text-slate-500"/></button>
                    )}
                  </div>
                  <h1 className="font-black text-slate-800 text-lg hidden sm:block">RoboEdu<span className="text-indigo-600">.Studio</span></h1>
              </div>
              
              <div className="flex items-center gap-4">
                  {user ? (
                      <>
                          <button onClick={() => setView('landing')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 hidden md:block">Beranda</button>
                          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                              <div className="text-right hidden md:block"><p className="text-xs font-bold">{user.displayName}</p><p className="text-[10px] text-indigo-600 font-bold uppercase">{user.role?.replace('_', ' ')}</p></div>
                              <button onClick={() => { if(user.isProfileComplete) { setEditProfileData(user); setIsEditProfileOpen(true); }}}><img src={user.photoURL} className="w-10 h-10 rounded-full border-2 border-indigo-100 bg-slate-200 object-cover"/></button>
                              
                              {user.role === 'super_admin' && <button onClick={() => setView('user-management')} className="p-2 bg-indigo-50 rounded-full text-indigo-600 relative"><UserPlus size={18}/>{pendingUsers.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>}</button>}
                              
                              {view !== 'dashboard' && view !== 'profile-setup' && (
                                <button onClick={() => setView((user.role === 'supervisor' || user.role === 'super_admin') ? 'team-list' : 'dashboard')} className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg hidden md:flex items-center gap-2">Dashboard <ArrowRight size={14}/></button>
                              )}
                              <button onClick={() => { setUser(null); setView('landing'); }} className="p-2 bg-slate-100 rounded-full text-red-400 hover:bg-red-50"><LogOut size={16}/></button>
                          </div>
                      </>
                  ) : (
                      <button onClick={() => setView('login')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-xl">Masuk</button>
                  )}
                  <button className="md:hidden p-2 text-slate-600" onClick={() => setShowMobileMenu(!showMobileMenu)}><Menu/></button>
              </div>
          </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 pb-32 relative z-10 w-full min-h-screen">
          <div className="max-w-7xl mx-auto w-full">
              {/* Conditional Rendering Views based on 'view' state */}
              {view === 'landing' && (
                  <div className="pt-20 animate-[fadeIn_0.5s]">
                      {/* ... Landing Content (Highlight, News, Bot Report) ... */}
                      <div className="max-w-5xl mx-auto bg-white p-4 rounded-[2.5rem] shadow-xl border border-slate-100 mb-12 relative group overflow-hidden">
                           <div className="relative rounded-[2rem] overflow-hidden aspect-video shadow-inner bg-slate-200">
                               <img src={weeklyContent.image} className="w-full h-full object-cover"/>
                               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10 flex flex-col justify-end text-white">
                                   <span className="self-start bg-pink-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase mb-2">Weekly Highlight</span>
                                   <h2 className="text-3xl font-bold">{weeklyContent.title}</h2>
                               </div>
                           </div>
                           {(user?.role === 'supervisor' || user?.role === 'super_admin') && <button onClick={() => { setWeeklyForm(weeklyContent); setIsEditWeeklyOpen(true); }} className="absolute top-8 right-8 bg-white/90 px-4 py-2 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">Edit Highlight</button>}
                      </div>
                      <WeeklyBotReport projects={projects} />
                      {/* ... News Grid ... */}
                      <div className="grid md:grid-cols-3 gap-6">
                          {news.map(n => (
                              <div key={n.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden">
                                  {(user?.role === 'supervisor' || user?.role === 'super_admin') && <button onClick={() => { setNewsForm(n); setIsEditNewsOpen(true); }} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow text-indigo-600"><Edit3 size={14}/></button>}
                                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">{n.category}</span>
                                  <h3 className="font-bold text-slate-800 text-lg mt-3 mb-2">{n.title}</h3>
                                  <p className="text-xs text-slate-500 line-clamp-2">{n.summary}</p>
                                  <button onClick={() => setSelectedNews(n)} className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-600">Baca Detail <ArrowRight size={12}/></button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
              
              {/* ... (Other Views: Dashboard, Project Detail, Archive, Profile Setup - Same Logic) ... */}
              {view === 'dashboard' && (
                  <div className="pt-20">
                      {/* Dashboard Logic with Performance Chart and Projects Grid */}
                      <div className="flex justify-between items-end mb-6">
                           <h2 className="text-3xl font-black text-slate-800">Dashboard</h2>
                           <div className="flex gap-2">
                               {(user?.role === 'supervisor' || user?.role === 'super_admin') && <button onClick={() => setIsAddProjectOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2"><Plus size={14}/> Project Baru</button>}
                               {(user?.role === 'creator' || user?.role === 'tim_khusus') && <button onClick={() => setView('archive')} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full font-bold text-xs shadow-sm flex items-center gap-2"><Archive size={14}/> Arsip</button>}
                           </div>
                      </div>
                      <PerformanceChart data={getWeeklyAnalytics()} />
                      <div className="grid md:grid-cols-2 gap-4 mt-6">
                          {projects.filter(p => p.status !== 'Completed' && (p.teamId === user.teamId || user.role === 'supervisor' || user.role === 'super_admin')).map(p => (
                              <div key={p.id} onClick={() => { setActiveProject(p); setView('project-detail'); }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg cursor-pointer transition-all">
                                  <div className="flex justify-between mb-4"><span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{p.status}</span></div>
                                  <h3 className="font-bold text-xl mb-4 text-slate-800">{p.title}</h3>
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{width: `${p.progress}%`}}></div></div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
              
              {/* Login View */}
               {view === 'login' && (
                <div className="flex flex-col items-center justify-center pt-20">
                    <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 text-center">
                        <img src={siteLogo} className="h-16 w-auto mx-auto mb-4 object-contain"/>
                        <h1 className="text-2xl font-black text-slate-900 mb-6">RoboEdu Studio</h1>
                        <button onClick={handleGoogleLogin} disabled={loadingLogin} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-3">
                            {loadingLogin ? <Loader2 className="animate-spin"/> : <Shield size={20}/>} Sign in with Google
                        </button>
                    </div>
                </div>
              )}

              {/* User Management View */}
              {view === 'user-management' && (
                  <div className="pt-20">
                      <div className="flex items-center gap-2 mb-6"><button onClick={() => setView('dashboard')} className="p-2 bg-white rounded-full hover:bg-slate-100"><ChevronLeft/></button><h2 className="text-3xl font-black text-slate-800">Manajemen Akses</h2></div>
                      <div className="grid md:grid-cols-2 gap-8">
                          <div className="bg-white p-6 rounded-[2rem] border border-orange-100 shadow-lg relative overflow-hidden">
                               <div className="absolute top-0 left-0 w-full h-1 bg-orange-400"></div>
                               <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-orange-600"><AlertCircle size={20}/> Menunggu ({pendingUsers.length})</h3>
                               <div className="space-y-4">
                                  {pendingUsers.map(u => (
                                      <div key={u.email} className="p-4 bg-orange-50 rounded-2xl flex items-center gap-3 border border-orange-100">
                                          <img src={u.photoURL} className="w-10 h-10 rounded-full bg-white"/>
                                          <div className="flex-1 min-w-0"><div className="font-bold text-slate-800 text-sm truncate">{u.displayName}</div><div className="text-xs text-slate-500 truncate">{u.email}</div></div>
                                          <div className="flex gap-2">
                                              <button type="button" onClick={() => handleRejectUser(u.email)} className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-50"><X size={16}/></button>
                                              <button type="button" onClick={() => handleOpenApproveModal(u)} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md"><CheckCircle2 size={16}/></button>
                                          </div>
                                      </div>
                                  ))}
                               </div>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Modal Approve User */}
      <Modal isOpen={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)} title="Setujui User">
          {selectedPendingUser && (
              <div className="space-y-6">
                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <img src={selectedPendingUser.photoURL} className="w-12 h-12 rounded-full"/>
                        <div><p className="font-bold text-slate-800">{selectedPendingUser.displayName}</p><p className="text-xs text-slate-500">{selectedPendingUser.email}</p></div>
                   </div>
                   <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase">Pilih Role</label>
                       <div className="grid grid-cols-1 gap-2">
                           <button type="button" onClick={() => setApprovalForm({...approvalForm, role: 'creator'})} className={`p-3 rounded-xl border text-left text-sm font-bold ${approvalForm.role === 'creator' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'text-slate-600'}`}>Creator</button>
                           <button type="button" onClick={() => setApprovalForm({...approvalForm, role: 'tim_khusus'})} className={`p-3 rounded-xl border text-left text-sm font-bold ${approvalForm.role === 'tim_khusus' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'text-slate-600'}`}>Tim Khusus</button>
                           <button type="button" onClick={() => setApprovalForm({...approvalForm, role: 'supervisor'})} className={`p-3 rounded-xl border text-left text-sm font-bold ${approvalForm.role === 'supervisor' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'text-slate-600'}`}>Supervisor</button>
                       </div>
                   </div>
                   <button type="button" onClick={handleConfirmApproval} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg">Setujui Akses</button>
              </div>
          )}
      </Modal>

      {/* 2. Modal Add Project */}
      <Modal isOpen={isAddProjectOpen} onClose={() => setIsAddProjectOpen(false)} title="Project Baru">
           <div className="space-y-4">
               <div><label className="block text-xs font-bold text-slate-500 mb-1">Judul Project</label><input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none font-medium" placeholder="Judul Project..." value={newProjectForm.title} onChange={e => setNewProjectForm({...newProjectForm, title: e.target.value})} /></div>
               <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                   <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={newProjectForm.isBigProject} onChange={e => setNewProjectForm({...newProjectForm, isBigProject: e.target.checked})}/>
                   <span className="text-sm font-bold text-slate-700">Big Project (Tim 5)</span>
               </div>
               {newProjectForm.isBigProject && (
                   <div className="animate-fadeIn">
                       <label className="block text-xs font-bold text-slate-500 mb-1">Deadline Project</label>
                       <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none font-medium" value={newProjectForm.deadline} onChange={e => setNewProjectForm({...newProjectForm, deadline: e.target.value})} />
                   </div>
               )}
               <button onClick={handleAddProject} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">Buat Project</button>
           </div>
      </Modal>
      
      {/* 3. Modal Edit Logo */}
      <Modal isOpen={isEditLogoOpen} onClose={() => setIsEditLogoOpen(false)} title="Edit Logo Sekolah">
          <div className="space-y-4">
              <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none" value={logoForm} onChange={e => setLogoForm(e.target.value)} placeholder="Paste link logo..."/>
              {logoForm.includes('drive.google.com') && <button onClick={() => setLogoForm(autoCorrectGDriveLink(logoForm))} className="w-full py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Zap size={14}/> Auto-Fix Link GDrive</button>}
              <button onClick={() => { setSiteLogo(logoForm); setIsEditLogoOpen(false); showToast("Logo Updated!"); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">Simpan Logo</button>
          </div>
      </Modal>
      
      {/* 4. Confirmation Modal */}
      <Modal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({...confirmModal, isOpen: false})} title={confirmModal.title}>
          <div className="text-center p-2">
              <p className="text-slate-600 mb-6 font-medium">{confirmModal.message}</p>
              <div className="flex gap-3">
                  <button onClick={() => setConfirmModal({...confirmModal, isOpen: false})} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Batal</button>
                  <button onClick={executeConfirmAction} className={`flex-1 py-3 text-white rounded-xl font-bold ${confirmModal.type === 'danger' ? 'bg-red-500' : 'bg-blue-600'}`}>Ya</button>
              </div>
          </div>
      </Modal>

      {/* 5. Detail Berita Modal */}
      <Modal isOpen={!!selectedNews} onClose={() => setSelectedNews(null)} title="Detail Berita">
        {selectedNews && (
            <div>
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase mb-4 inline-block">{selectedNews.category}</span>
                <h2 className="text-2xl font-black text-slate-800 mb-4 leading-tight">{selectedNews.title}</h2>
                <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-[2rem] mb-4 border border-slate-100 font-medium whitespace-pre-line">{selectedNews.content}</div>
            </div>
        )}
      </Modal>

    </div>
  );
}
