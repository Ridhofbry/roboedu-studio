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
    Quote, Upload, Terminal, Mail, Key
} from 'lucide-react';

// --- PRODUCTION IMPORTS ---
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "firebase/auth";
import {
    getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc,
    collection, addDoc, onSnapshot, query, where, orderBy, getDocs
} from "firebase/firestore";
// IMPORT STORAGE
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- HELPER FUNCTION FOR DATES ---
const formatFirestoreDate = (date) => {
    if (!date) return '-';
    try {
        if (typeof date === 'string') return date;
        if (date?.toDate && typeof date.toDate === 'function') return date.toDate().toLocaleDateString();
        if (date?.seconds) return new Date(date.seconds * 1000).toLocaleDateString();
        return 'Invalid Date';
    } catch (e) {
        return 'Date Error';
    }
};

/* ========================================================================
   1. KONFIGURASI API & SAFETY CHECK
   ======================================================================== */

const API_KEY_EXISTS = import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, db, storage;

if (API_KEY_EXISTS) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app); // Initialize Storage
        setPersistence(auth, browserLocalPersistence).catch(console.error);
    } catch (error) {
        console.error("Firebase Init Error:", error);
    }
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = import.meta.env.VITE_ONESIGNAL_REST_API_KEY;

/* ========================================================================
   2. DATA STATIK & UTILITIES
   ======================================================================== */

const SUPER_ADMIN_EMAILS = [
    "mhmmadridho64@gmail.com",
    "eengene70@gmail.com",
    "robo.roboedu@gmail.com"
];

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
        tasks: [{ id: 't1-1', label: 'Pahami Brief' }, { id: 't1-2', label: 'Download Aset' }, { id: 't1-3', label: 'Scripting', hasAI: true }]
    },
    {
        id: 'step-2', title: 'Produksi', subtitle: 'Shooting', icon: <Film size={18} />,
        color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700',
        tasks: [{ id: 't2-1', label: 'Cam: 1080p 30fps' }, { id: 't2-2', label: 'Ratio: 9:16' }, { id: 't2-3', label: 'Lighting Aman' }]
    },
    {
        id: 'step-3', title: 'Audio', subtitle: 'Voice Over', icon: <Mic size={18} />,
        color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-700',
        tasks: [{ id: 't3-1', label: 'No Noise' }, { id: 't3-2', label: 'Intonasi Jelas' }, { id: 't3-3', label: 'Audio Level Pas' }]
    },
    {
        id: 'step-4', title: 'Editing', subtitle: 'Post-Pro', icon: <MonitorPlay size={18} />,
        color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', text: 'text-pink-700', isGatekeeper: true,
        tasks: [{ id: 't4-1', label: 'Cutting Rapi' }, { id: 't4-2', label: 'Subtitle Safe Area' }, { id: 't4-3', label: 'Grading Pop' }, { id: 't4-4', label: 'Upload Preview (480p)' }]
    },
    {
        id: 'step-5', title: 'Final', subtitle: 'Submission', icon: <CheckCircle2 size={18} />,
        color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-700',
        tasks: [{ id: 't5-1', label: 'Cek 1080p Final' }, { id: 't5-2', label: 'Upload Link Result' }]
    }
];

const ALL_TASK_IDS = WORKFLOW_STEPS.flatMap(step => step.tasks.map(t => t.id));

/* ========================================================================
   3. API FUNCTIONS
   ======================================================================== */

const sendOneSignalNotification = async (targetRole, message, teamName) => {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) return;
    const heading = targetRole === 'supervisor' ? `Laporan: ${teamName}` : `Update: ${teamName}`;
    const options = {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json', Authorization: `Basic ${ONESIGNAL_API_KEY}` },
        body: JSON.stringify({ app_id: ONESIGNAL_APP_ID, included_segments: ["All"], contents: { en: message }, headings: { en: heading } })
    };
    try { await fetch('https://onesignal.com/api/v1/notifications', options); } catch (err) { console.error("Gagal kirim notif", err); }
};

const generateAIScript = async (prompt) => {
    if (!genAI) return "Error: API Key Gemini Missing";
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) { return "Gagal generate script. Coba lagi."; }
};

/* ========================================================================
   4. UI COMPONENTS
   ======================================================================== */

const Toast = ({ message, type = 'success' }) => (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[110] flex items-center gap-2 animate-[slideDown_0.3s_ease-out] ${type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
        {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
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
                    <button type="button" onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={18} /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

const PerformanceChart = ({ data = [0, 0, 0, 0, 0, 0, 0], title = "Produktivitas Tim" }) => {
    const maxVal = Math.max(...data, 5);
    const points = data.map((val, i) => `${i * 50},${100 - (val / maxVal * 80)}`).join(' ');
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    return (
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-lg mb-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div><h4 className="font-bold text-slate-700 text-sm flex items-center gap-2"><Activity size={16} className="text-indigo-600" /> {title}</h4><span className="text-[10px] text-slate-400">Performa Minggu Ini (Reset Senin)</span></div>
                <div className="text-right"><div className="flex items-center gap-1 text-emerald-600 font-black text-sm bg-emerald-50 px-2 py-1 rounded-lg"><TrendingUp size={14} /> {data.reduce((a, b) => a + b, 0)} Selesai</div></div>
            </div>
            <div className="h-24 w-full relative">
                <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs><linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0" /></linearGradient></defs>
                    <path d={`M0,100 ${points} 300,100`} fill="url(#chartGradient)" className="transition-all duration-1000 ease-in-out" />
                    <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md" />
                    {data.map((val, i) => { const y = 100 - (val / maxVal * 80); return (<g key={i}><circle cx={i * 50} cy={y} r="4" fill="white" stroke="#6366f1" strokeWidth="2" className="group-hover:r-6 transition-all" /><text x={i * 50} y="115" fontSize="10" textAnchor="middle" fill="#94a3b8" className="font-bold">{days[i]}</text></g>) })}
                </svg>
            </div>
        </div>
    );
};

const BotEvaluation = ({ project }) => {
    if (!project.completedAt || !project.deadline) return null;
    const completed = new Date(project.completedAt);
    const deadline = new Date(project.deadline);
    completed.setHours(0, 0, 0, 0); deadline.setHours(0, 0, 0, 0);
    const isLate = completed > deadline;
    return (
        <div className={`mt-4 p-4 rounded-2xl border flex items-center gap-4 ${isLate ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className={`p-3 rounded-full ${isLate ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{isLate ? <AlertTriangle size={24} /> : <Bot size={24} />}</div>
            <div className="flex-1"><h4 className={`font-bold text-sm ${isLate ? 'text-red-700' : 'text-emerald-700'}`}>{isLate ? "ANALISA BOT: PROJECT MOLOR 🐢" : "ANALISA BOT: TEPAT WAKTU 🚀"}</h4><div className="text-xs text-slate-500 mt-1 space-y-1"><p>📅 Deadline: <span className="font-bold">{project.deadline}</span></p><p>✅ Selesai: <span className="font-bold">{new Date(project.completedAt).toLocaleDateString()}</span></p></div></div>
        </div>
    )
}

const WeeklyBotReport = ({ projects }) => {
    const report = useMemo(() => {
        const now = new Date(); const currentDay = now.getDay(); const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const startOfWeek = new Date(now); startOfWeek.setHours(0, 0, 0, 0); startOfWeek.setDate(now.getDate() - diffToMonday);
        let completed = 0; let late = 0; let onTime = 0;
        projects.forEach(p => {
            if (p.status === 'Completed' && p.completedAt) {
                const completedDate = new Date(p.completedAt);
                if (completedDate >= startOfWeek) {
                    completed++;
                    if (p.deadline) { const deadline = new Date(p.deadline); if (completedDate > deadline) late++; else onTime++; } else { onTime++; }
                }
            }
        });
        return { completed, late, onTime };
    }, [projects]);
    const getMessage = () => {
        if (report.completed === 0) return "Minggu ini belum ada project selesai. Ayo semangat tim!";
        if (report.late > 0) return `Minggu ini produktif, namun ada ${report.late} project yang melebihi deadline. Perhatikan ketepatan waktu!`;
        return `Performa Luar Biasa! ${report.completed} Project selesai tepat waktu minggu ini. Pertahankan!`;
    };
    return (
        <div className="bg-indigo-900 text-white p-6 rounded-[2.5rem] shadow-xl border border-indigo-700 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 p-16 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10 flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><Terminal size={24} className="text-emerald-300" /></div>
                <div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">Bot Report</span><span className="text-[10px] opacity-70 font-mono">Minggu Ini</span></div><h3 className="font-bold text-lg leading-tight mb-2">Laporan Performa Tim</h3><p className="text-sm opacity-90 font-medium leading-relaxed">"{getMessage()}"</p><div className="flex gap-4 mt-4 text-xs font-bold"><div className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-400" /> {report.onTime} Tepat Waktu</div>{report.late > 0 && <div className="flex items-center gap-1"><AlertTriangle size={14} className="text-red-400" /> {report.late} Terlambat</div>}</div></div>
            </div>
        </div>
    );
};

/* ========================================================================
   MAIN APPLICATION
   ======================================================================== */

export default function App() {
    // --- STATE ---
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [view, setView] = useState('landing');
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // Data Containers
    const [projects, setProjects] = useState([]);
    const [news, setNews] = useState([]);
    const [assets, setAssets] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);

    // Content States
    const [weeklyContent, setWeeklyContent] = useState({ title: "Belum ada highlight", image: "" });
    const [siteLogo, setSiteLogo] = useState("https://lh3.googleusercontent.com/d/1uJHar8EYXpRnL8uaPvhePEHWG-BasH9m");

    // UI States
    const [showPendingAlert, setShowPendingAlert] = useState(false);
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [toast, setToast] = useState(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [spotlightIndex, setSpotlightIndex] = useState(0);

    // Selection States
    const [activeProject, setActiveProject] = useState(null);
    const [activeTeamId, setActiveTeamId] = useState(null);
    const [selectedNews, setSelectedNews] = useState(null);
    const [selectedPendingUser, setSelectedPendingUser] = useState(null);

    // Form States
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

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
    const [aiResult, setAiResult] = useState('');
    const [imageUploadState, setImageUploadState] = useState({ isOpen: false, slotIndex: null, urlInput: '' });

    // Modal Toggles
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
    const [isEditLogoOpen, setIsEditLogoOpen] = useState(false);
    const [isEditWeeklyOpen, setIsEditWeeklyOpen] = useState(false);
    const [isEditNewsOpen, setIsEditNewsOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null, type: 'neutral' });
    const [isAILoading, setIsAILoading] = useState(false);

    // --- HELPERS ---
    const calculateProgress = (tasks) => {
        const total = WORKFLOW_STEPS.reduce((acc, s) => acc + s.tasks.length, 0);
        return total === 0 ? 0 : Math.round((tasks.length / total) * 100);
    };

    const getWeeklyAnalytics = (teamId) => {
        const data = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();
        const day = now.getDay();
        const diff = day === 0 ? 6 : day - 1;
        const start = new Date(now);
        start.setDate(now.getDate() - diff);
        start.setHours(0, 0, 0, 0);

        projects.forEach(p => {
            if (p.status === 'Completed' && p.completedAt) {
                const d = new Date(p.completedAt);
                if (d >= start && (teamId === 'all' || String(p.teamId) === String(teamId))) {
                    const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
                    data[idx]++;
                }
            }
        });
        return data;
    };

    // --- FIREBASE AUTH LISTENER ---
    useEffect(() => {
        if (!auth) return;
        setIsAuthChecking(true);
        const unsubAuth = onAuthStateChanged(auth, async (u) => {
            try {
                setUser(u);
                if (u) {
                    const docRef = doc(db, 'users', u.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const d = docSnap.data();

                        // --- AUTO-FIX: Typo 'tema-' -> 'team-' ---
                        if (d.teamId && typeof d.teamId === 'string' && d.teamId.includes('tema-')) {
                            const fixedId = d.teamId.replace('tema-', 'team-');
                            console.log(`🔵 FIXING TYPO: ${d.teamId} -> ${fixedId}`);
                            await updateDoc(docRef, { teamId: fixedId });
                            d.teamId = fixedId; // Use fixed value locally
                        }

                        if (SUPER_ADMIN_EMAILS.includes(u.email) && d.role !== 'super_admin') {
                            await updateDoc(docRef, { role: 'super_admin' });
                            setUserData({ ...d, role: 'super_admin' });
                        } else {
                            setUserData(d);
                        }
                        // Redirect Logic
                        if (!d.isProfileComplete) {
                            setView('profile-setup');
                        } else {
                            // ✅ Super Admin & Supervisor ke team-list
                            if (d.role === 'super_admin' || d.role === 'supervisor') {
                                setView('team-list');
                            } else {
                                setView('dashboard');
                            }
                        }
                    } else {
                        // User not in DB
                        if (SUPER_ADMIN_EMAILS.includes(u.email)) {
                            console.log('🔵 DEBUG: Creating new Super Admin user');
                            const newAdmin = {
                                email: u.email,
                                displayName: '',  // ✅ Kosong untuk force profile setup
                                photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email)}&background=random`,
                                role: 'super_admin',
                                isProfileComplete: false,
                                nameChangeCount: 0,
                                uid: u.uid,
                                school: '',
                                city: '',
                                bio: 'Super Administrator'
                            };
                            console.log('🔵 DEBUG: New admin data:', newAdmin);

                            await setDoc(docRef, newAdmin);
                            console.log('🔵 DEBUG: User saved to Firestore');

                            setUserData(newAdmin);
                            console.log('🔵 DEBUG: State updated');

                            const q = query(collection(db, 'pending_users'), where('email', '==', u.email));
                            const snaps = await getDocs(q);
                            snaps.forEach(async (doc) => await deleteDoc(doc.ref));

                            console.log('🔵 DEBUG: Setting view to profile-setup');
                            setView('profile-setup');
                            setProfileForm({ username: '', school: '', city: '' });
                            console.log('🔵 DEBUG: Profile form reset');
                        } else {
                            // Cek apakah sudah ada di pending list?
                            const q = query(collection(db, 'pending_users'), where('email', '==', u.email));
                            const querySnap = await getDocs(q);

                            // Jika user tidak ada di DB User & tidak ada di Pending -> Berarti Ghost User / Error Register
                            // Kita tidak otomatis buat di sini lagi, karena sudah ditangani di handleEmailAuth

                            await signOut(auth);
                            setUserData(null);
                            setView('landing');
                            setShowPendingAlert(true);
                        }
                    }
                } else {
                    setUserData(null);
                    setView('landing');
                }
            } catch (err) {
                console.error("Auth Error:", err);
            } finally {
                setIsAuthChecking(false);
                setLoadingLogin(false);
            }
        });
        return () => unsubAuth();
    }, []);

    // --- DATA LISTENERS ---
    useEffect(() => {
        // OneSignal Initialization
        if (window.OneSignalDeferred && ONESIGNAL_APP_ID) {
            window.OneSignalDeferred.push(async function (OneSignal) {
                await OneSignal.init({
                    appId: ONESIGNAL_APP_ID,
                    safari_web_id: "web.onesignal.auto.123", // Optional
                    notifyButton: { enable: true },
                    allowLocalhostAsSecureOrigin: true,
                });
                // Auto-prompt
                OneSignal.Slidedown.promptPush();
            });
        }

        if (!db) return;


        // Error Handler
        const handleDbError = (context) => (error) => {
            console.error(`Error fetching ${context}:`, error);
            if (error.code === 'permission-denied') {
                showToast(`Akses Ditolak: Gagal memuat ${context}. Cek Rules!`, "error");
            }
        };

        const unsubProj = onSnapshot(collection(db, 'projects'),
            (s) => setProjects(s.docs.map(d => ({ id: d.id, ...d.data() }))),
            handleDbError("Projects")
        );

        const unsubNews = onSnapshot(collection(db, 'news'),
            (s) => setNews(s.docs.map(d => ({ id: d.id, ...d.data() }))),
            handleDbError("News")
        );

        const unsubAssets = onSnapshot(collection(db, 'assets'),
            (s) => setAssets(s.docs.map(d => ({ id: d.id, ...d.data() }))),
            handleDbError("Assets")
        );

        const unsubConfig = onSnapshot(doc(db, 'site_config', 'main'), (d) => {
            if (d.exists()) { const data = d.data(); if (data.logo) setSiteLogo(data.logo); if (data.weekly) setWeeklyContent(data.weekly); }
        }, handleDbError("Config"));

        return () => { unsubProj(); unsubNews(); unsubAssets(); unsubConfig(); };
    }, []);

    // --- AUTO-SYNC ACTIVE PROJECT ---
    // Fixes issue where checklist updates don't show immediately
    useEffect(() => {
        if (activeProject && projects.length > 0) {
            const updated = projects.find(p => p.id === activeProject.id);
            if (updated) setActiveProject(updated);
        }
    }, [projects]);

    useEffect(() => {
        if (!db) return;
        const unsubPublicUsers = onSnapshot(query(collection(db, 'users'), orderBy('displayName')), (s) => {
            const users = s.docs.map(d => ({ ...d.data(), uid: d.id }));
            setUsersList(users);
        });
        let unsubPending = () => { };
        if (userData?.role === 'super_admin' || userData?.role === 'supervisor') {
            unsubPending = onSnapshot(collection(db, 'pending_users'), (s) => {
                setPendingUsers(s.docs.map(d => ({ ...d.data(), id: d.id })));
            });
        }
        return () => { unsubPublicUsers(); unsubPending(); };
    }, [userData?.role]);

    useEffect(() => {
        if (view === 'landing' && usersList.length > 0) {
            const i = setInterval(() => setSpotlightIndex(p => (p + 1) % usersList.length), 10000);
            return () => clearInterval(i);
        }
    }, [view, usersList]);

    // --- HANDLERS ---
    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
    // STRICT SEQUENCE LOCK: Enforce step-by-step progress
    const isTaskLocked = (taskId, completedTasks) => {
        const idx = ALL_TASK_IDS.indexOf(taskId);

        // 1. Basic Sequential Lock (Must complete previous task first)
        if (idx > 0 && !completedTasks.includes(ALL_TASK_IDS[idx - 1])) return true;

        // 2. Gatekeeper Logic (Special Step 4 -> Step 5 Block)
        // If current task is in Step 5 (Final), check if Project is Approved
        const step5Tasks = ['t5-1', 't5-2'];
        if (step5Tasks.includes(taskId)) {
            // Task in Final Step is LOCKED if Project is NOT Approved yet
            if (!activeProject?.isApproved) return true;
        }

        return false;
    };
    const autoCorrectGDriveLink = (url) => { const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/); return match && match[1] ? `https://lh3.googleusercontent.com/d/${match[1]}` : url; };

    const requestConfirm = (title, message, action, type = 'danger') => { setConfirmModal({ isOpen: true, title, message, action, type }); };
    const executeConfirmAction = () => { if (confirmModal.action) confirmModal.action(); setConfirmModal({ ...confirmModal, isOpen: false }); };

    // AUTH
    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoadingLogin(true);
        setShowPendingAlert(false);
        try {
            if (isRegistering) {
                // EXPLICIT REGISTRATION FLOW
                const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                const u = userCredential.user;

                // 1. Create Pending User Doc explicitly
                await addDoc(collection(db, 'pending_users'), {
                    email: u.email,
                    displayName: "New Member",
                    photoURL: `https://ui-avatars.com/api/?name=${u.email}&background=random`,
                    date: new Date().toLocaleDateString(),
                    uid: u.uid
                });

                // 2. Immediate Sign Out (prevent auto-login)
                await signOut(auth);

                // 3. UI Feedback
                setShowPendingAlert(true);
                setView('landing');
                showToast("Registrasi berhasil! Tunggu admin.", "success");
            } else {
                await signInWithEmailAndPassword(auth, authEmail, authPassword);
            }
        } catch (err) {
            let errorMsg = err.message;
            if (err.code === 'auth/invalid-credential') errorMsg = "Email atau password salah.";
            if (err.code === 'auth/email-already-in-use') errorMsg = "Email ini sudah terdaftar.";
            showToast(errorMsg, "error");
        } finally {
            setLoadingLogin(false);
        }
    };

    const handleLogout = async () => { await signOut(auth); setView('landing'); setShowMobileMenu(false); };

    // PROFILE
    const handleProfileSubmit = async () => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                displayName: profileForm.username,
                school: profileForm.school,
                city: profileForm.city,
                isProfileComplete: true,
                bio: userData?.bio || "Member Baru"
            });

            const updatedDocSnap = await getDoc(doc(db, 'users', user.uid));
            if (updatedDocSnap.exists()) {
                const updatedData = updatedDocSnap.data();
                setUserData(updatedData);

                if (updatedData.role === 'super_admin' || updatedData.role === 'supervisor') {
                    setView('team-list');
                } else {
                    setView('dashboard');
                }
                showToast(`Selamat datang, ${profileForm.username}`);
            }
        } catch (e) {
            showToast("Gagal: " + e.message, "error");
        }
    };

    const handlePhotoUpload = async (file) => {
        if (!file) return;
        if (!storage) return showToast("Storage tidak tersedia", "error");

        try {
            console.log('🔵 DEBUG: Uploading photo...', file.name);
            const fileRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const photoURL = await getDownloadURL(fileRef);
            console.log('🔵 DEBUG: Photo uploaded:', photoURL);

            await updateDoc(doc(db, 'users', user.uid), { photoURL });
            setUserData({ ...userData, photoURL });
            setEditProfileData({ ...editProfileData, photoURL });
            showToast('Foto berhasil diupload!');
        } catch (e) {
            console.error('Upload error:', e);
            showToast('Upload gagal: ' + e.message, 'error');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            let newCount = userData.nameChangeCount || 0;
            if (editProfileData.displayName !== userData.displayName) {
                if (newCount >= 2) return showToast("Batas ganti nama habis!", "error");
                newCount++;
            }
            await updateDoc(doc(db, 'users', user.uid), {
                displayName: editProfileData.displayName, bio: editProfileData.bio, photoURL: editProfileData.photoURL, nameChangeCount: newCount
            });
            setIsEditProfileOpen(false); showToast("Profil diupdate!");
        } catch (e) { showToast("Gagal update", "error"); }
    };

    // ADMIN
    const handleConfirmApproval = async () => {
        if (!selectedPendingUser) return;
        try {
            const newUser = {
                uid: selectedPendingUser.uid, email: selectedPendingUser.email, displayName: selectedPendingUser.displayName, photoURL: selectedPendingUser.photoURL, role: approvalForm.role, teamId: approvalForm.role === 'creator' ? approvalForm.teamId : (approvalForm.role === 'tim_khusus' ? 'team-5' : null), isProfileComplete: false, nameChangeCount: 0
            };
            if (!newUser.uid) { showToast("Error: UID Missing", "error"); return; }

            await setDoc(doc(db, 'users', selectedPendingUser.uid), newUser);
            await deleteDoc(doc(db, 'pending_users', selectedPendingUser.id));
            setIsApprovalModalOpen(false); setSelectedPendingUser(null); showToast("User Disetujui!");
        } catch (e) { showToast("Gagal Approve", "error"); }
    };
    const handleRejectUser = (u) => { requestConfirm("Tolak?", "Hapus user.", async () => { await deleteDoc(doc(db, 'pending_users', u.id)); showToast("Ditolak."); }); };

    // PROJECTS
    const handleAddProject = async () => {
        try {
            console.log('🔵 DEBUG: Add project called', newProjectForm);
            if (!newProjectForm.title) return showToast("Isi judul!", "error");

            const p = {
                title: newProjectForm.title,
                isBigProject: newProjectForm.isBigProject || false,  // Ensure not undefined
                teamId: (userData.role === 'supervisor' || userData.role === 'super_admin')
                    ? (newProjectForm.teamId || 'team-1')
                    : userData.teamId,
                deadline: newProjectForm.deadline || '',  // Ensure not undefined
                status: 'In Progress',
                progress: 0,
                isApproved: false,
                previewImages: (newProjectForm.isBigProject || false) ? Array(20).fill(null) : [],
                completedTasks: [],
                equipment: '',
                script: '',
                feedback: '',
                finalLink: '',
                previewLink: '',
                createdAt: new Date().toLocaleDateString(),
                proposalStatus: 'None'
            };

            console.log('🔵 DEBUG: Saving project to Firestore...', p);
            await addDoc(collection(db, 'projects'), p);
            console.log('🔵 DEBUG: Project saved successfully!');

            // Reset form
            setNewProjectForm({ title: '', isBigProject: false, teamId: 'team-1', deadline: '' });
            setIsAddProjectOpen(false);
            showToast("Project Dibuat!");
        } catch (error) {
            console.error('🔴 ERROR: Add project failed', error);
            showToast("Gagal buat project: " + error.message, "error");
        }
    };
    const handleUpdateProjectFirestore = async (id, data) => { try { await updateDoc(doc(db, 'projects', id), data); } catch (e) { showToast("Gagal update project", "error"); } };
    const handleDeleteProject = (id) => { requestConfirm("Hapus Project?", "Permanen.", async () => { await deleteDoc(doc(db, 'projects', id)); if (activeProject?.id === id) { setActiveProject(null); setView('dashboard'); } showToast("Project Dihapus"); }); };
    const toggleTask = (projId, taskId) => {
        const proj = projects.find(p => p.id === projId);
        if (!proj) return;

        // Allow creator to toggle their own tasks
        // Admin can view but this function is for creators only in UI
        if (userData.role === 'creator' || userData.role === 'tim_khusus') {
            if (isTaskLocked(taskId, proj.completedTasks)) return showToast("Tugas terkunci!", "error");
            const newTasks = proj.completedTasks.includes(taskId) ? proj.completedTasks.filter(t => t !== taskId) : [...proj.completedTasks, taskId];
            const newProgress = calculateProgress(newTasks);
            const status = newProgress === 100 ? 'Completed' : proj.status;
            handleUpdateProjectFirestore(projId, { completedTasks: newTasks, progress: newProgress, status });
        }
    };
    const handleRemoveImage = (index) => { const newImages = [...activeProject.previewImages]; newImages[index] = null; handleUpdateProjectFirestore(activeProject.id, { previewImages: newImages }); };
    const handleImageSubmit = async () => { if (imageUploadState.slotIndex !== null) { const newImages = [...activeProject.previewImages]; newImages[imageUploadState.slotIndex] = imageUploadState.urlInput; await handleUpdateProjectFirestore(activeProject.id, { previewImages: newImages }); setImageUploadState({ isOpen: false, slotIndex: null, urlInput: '' }); showToast("Foto tersimpan!"); } };
    // --- NOTIFICATION HELPERS ---
    const getTeamName = (proj) => TEAMS.find(t => t.id === proj.teamId)?.name || 'Unknown Team';

    const handleSubmitPreview = (proj) => {
        if (!proj.previewLink) return showToast("Link kosong!", "error");

        // VALIDATION: Must be Google Drive
        if (!proj.previewLink.includes('drive.google.com') && !proj.previewLink.includes('docs.google.com')) {
            return showToast("Wajib Link Google Drive!", "error");
        }

        requestConfirm("Kirim Preview?", "Notifikasi akan dikirim ke Supervisor.", () => {
            handleUpdateProjectFirestore(proj.id, { status: "Preview Submitted" });
            // 1. Notify Supervisor
            sendOneSignalNotification('supervisor', `Review preview: "${proj.title}"`, getTeamName(proj));
            // 2. Notify Creator (Confirmation)
            sendOneSignalNotification('creator', `Preview Terkirim: "${proj.title}"`, getTeamName(proj));

            showToast("Preview Terkirim ke Supervisor! 📤");
        }, 'neutral');
    };

    const handleApprovalAction = (isApproved, feedback) => {
        if (!isApproved && !feedback) return showToast("Isi revisi!", "error");

        const statusMsg = isApproved ? "Preview Approved" : "Revisi Baru";

        requestConfirm(isApproved ? "Approve Preview?" : "Kirim Revisi?", `Tim ${getTeamName(activeProject)} akan dapat notifikasi.`, () => {
            handleUpdateProjectFirestore(activeProject.id, {
                isApproved,
                status: isApproved ? "Approved" : "Revision Needed",
                feedback: isApproved ? "" : feedback
            });
            sendOneSignalNotification('creator', statusMsg, getTeamName(activeProject));
            showToast(isApproved ? "Approved! Tim diberitahu. ✅" : "Revisi Terkirim! 📢");
        }, isApproved ? 'success' : 'danger');
    };

    const handleSubmitFinalRegular = (proj) => {
        if (!proj.finalLink) return showToast("Link kosong!", "error");

        // VALIDATION: Must be Google Drive
        if (!proj.finalLink.includes('drive.google.com') && !proj.finalLink.includes('docs.google.com')) {
            return showToast("Wajib Link Google Drive!", "error");
        }

        requestConfirm("Submit Final?", "Project akan ditandai SELESAI & Masuk Arsip.", () => {
            handleUpdateProjectFirestore(proj.id, { status: "Completed", progress: 100, completedAt: new Date().toISOString() });
            sendOneSignalNotification('supervisor', `FINAL SUBMIT: ${proj.title}`, getTeamName(proj));

            // Notify Creator too (Validation)
            sendOneSignalNotification('creator', `Sukses Submit Final: ${proj.title}`, getTeamName(proj));

            setView('dashboard');
            showToast("Project Selesai! 🎉");
        }, 'neutral');
    };

    const handleProposeConcept = () => {
        if (!activeProject.finalLink) return showToast("Isi link!", "error");
        handleUpdateProjectFirestore(activeProject.id, { proposalStatus: 'Pending' });
        sendOneSignalNotification('supervisor', `Pengajuan: ${activeProject.title}`, 'Tim 5');
        sendOneSignalNotification('creator', `Konsep Diajukan: ${activeProject.title}`, 'Tim 5');
    };

    const handleReviewProposal = (isAcc, feedback) => {
        if (isAcc) {
            handleUpdateProjectFirestore(activeProject.id, { proposalStatus: 'Approved', feedback: '' });
            sendOneSignalNotification('creator', `Konsep DISETUJUI.`, 'Tim 5');
        } else {
            if (!feedback) return showToast("Isi pesan!", "error");
            handleUpdateProjectFirestore(activeProject.id, { proposalStatus: 'Revision', feedback });
            sendOneSignalNotification('creator', `REVISI Konsep: ${feedback}`, 'Tim 5');
        }
    };

    const handleRePropose = () => {
        handleUpdateProjectFirestore(activeProject.id, { proposalStatus: 'Pending' });
        sendOneSignalNotification('supervisor', `Pengajuan ULANG: "${activeProject.title}"`, 'Tim 5');
        sendOneSignalNotification('creator', `Revisi Dikirim: "${activeProject.title}"`, 'Tim 5');
    };

    const handleSubmitFinalTim5 = () => {
        requestConfirm("Yakin Submit?", "Project selesai.", () => {
            handleUpdateProjectFirestore(activeProject.id, { status: "Completed", progress: 100, completedAt: new Date().toISOString() });
            sendOneSignalNotification('supervisor', `FINAL SUBMIT Tim 5: ${activeProject.title}`, 'Tim 5');
            sendOneSignalNotification('creator', `Sukses Submit Final: ${activeProject.title}`, 'Tim 5');
            setView('dashboard');
        }, 'neutral');
    };
    const handleAddAsset = async () => { if (!newAssetForm.title) return; await addDoc(collection(db, 'assets'), { ...newAssetForm, date: new Date().toLocaleDateString() }); setIsAddAssetOpen(false); showToast("Aset Ditambah"); };
    const handleDeleteAsset = (id) => { requestConfirm("Hapus Aset?", "Permanen.", async () => { await deleteDoc(doc(db, 'assets', id)); showToast("Aset Dihapus"); }); };
    const handleSaveNews = async () => { if (newsForm.id) { await updateDoc(doc(db, 'news', newsForm.id), newsForm); } setIsEditNewsOpen(false); showToast("Berita Update"); };
    const handleSaveLogo = async () => { await setDoc(doc(db, 'site_config', 'main'), { logo: logoForm }, { merge: true }); setIsEditLogoOpen(false); showToast("Logo Update"); };
    const handleSaveWeekly = async () => {
        try {
            console.log("🔵 DEBUG: Saving weekly highlight...", weeklyForm);
            // Optimistic update
            setWeeklyContent(weeklyForm);

            await setDoc(doc(db, 'site_config', 'main'), { weekly: weeklyForm }, { merge: true });
            console.log("🔵 DEBUG: Weekly highlight saved to Firestore");

            setIsEditWeeklyOpen(false);
            showToast("Highlight Update Success!");
        } catch (e) {
            console.error("🔴 ERROR Saving Weekly:", e);
            showToast("Gagal update: " + e.message, "error");
        }
    };
    const handleScript = async () => { setIsAILoading(true); const text = await generateAIScript(aiPrompt); setAiResult(text); setIsAILoading(false); };

    const handleOpenApproveModal = (u) => { setSelectedPendingUser(u); setApprovalForm({ role: 'creator', teamId: 'team-1' }); setIsApprovalModalOpen(true); };
    const handleEditNewsUI = (item) => { setNewsForm(item); setIsEditNewsOpen(true); };

    // --- SAFETY CHECK RENDER ---
    if (!API_KEY_EXISTS) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-8 text-center font-sans">
                <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Konfigurasi Hilang!</h1>
                    <p className="text-slate-500 mb-4 text-sm">Website ini belum terhubung ke Firebase.</p>
                </div>
            </div>
        );
    }

    // --- RENDER LOADING SCREEN (AUTH CHECK) ---
    if (isAuthChecking || loadingLogin) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-600 font-bold text-sm">Memuat RoboEdu Studio...</p>
            </div>
        );
    }

    // Styles
    const globalStyles = `
    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
    @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-blob { animation: blob 7s infinite; }
    .glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.5); }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  `;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative w-full overflow-x-hidden selection:bg-indigo-200 selection:text-indigo-900">
            <style>{globalStyles}</style>
            {toast && <Toast message={toast.msg} type={toast.type} />}

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0"><div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[100px] animate-blob"></div><div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div></div>

            {/* NAVBAR */}
            <nav className="fixed top-0 w-full z-50 px-4 py-3 md:px-6 md:py-4">
                <div className="glass-panel px-4 py-3 md:px-6 md:py-3 flex justify-between items-center transition-all shadow-sm max-w-7xl mx-auto rounded-2xl">
                    <div onClick={() => setView('landing')} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        {/* DYNAMIC LOGO */}
                        <div className="relative group">
                            <img src={siteLogo} className="h-8 w-auto object-contain drop-shadow-md" />
                            {(userData?.role === 'supervisor' || userData?.role === 'super_admin') && (
                                <button onClick={(e) => { e.stopPropagation(); setLogoForm(siteLogo); setIsEditLogoOpen(true); }} className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50"><Edit3 size={10} className="text-slate-500" /></button>
                            )}
                        </div>
                        <h1 className="font-black text-slate-800 text-lg hidden sm:block">RoboEdu<span className="text-indigo-600">.Studio</span></h1>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={() => setView('landing')} className={`text-sm font-bold transition-colors ${view === 'landing' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Beranda</button>
                        {/* ARCHIVE BUTTON REMOVED FROM NAVBAR - NOW IN DASHBOARD/HOME */}

                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-800">{userData?.displayName || user.email}</p>
                                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{userData?.role?.replace('_', ' ')}</p>
                                </div>
                                {/* Only show Settings if profile is complete */}
                                {userData?.isProfileComplete && (
                                    <button onClick={() => { setEditProfileData(userData); setIsEditProfileOpen(true); }} className="relative group">
                                        <img src={userData?.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-indigo-100 bg-slate-200 object-cover group-hover:border-indigo-300 transition-colors" />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-white rounded-full border border-slate-200 flex items-center justify-center"><Settings size={8} className="text-slate-500" /></div>
                                    </button>
                                )}
                                {!userData?.isProfileComplete && <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-10 h-10 rounded-full border-2 border-slate-200 bg-slate-100 object-cover" />}

                                {userData?.role === 'super_admin' && (
                                    <button onClick={() => setView('user-management')} className="relative p-2 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors" title="Manajemen User">
                                        <UserPlus size={18} />
                                        {pendingUsers.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                                    </button>
                                )}

                                {view !== 'dashboard' && view !== 'team-list' && view !== 'user-management' && view !== 'profile-setup' && userData?.isProfileComplete && (
                                    <button onClick={() => setView((userData.role === 'supervisor' || userData.role === 'super_admin') ? 'team-list' : 'dashboard')} className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">Dashboard <ArrowRight size={14} /></button>
                                )}
                                <button onClick={handleLogout} className="p-2 bg-slate-100 rounded-full text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"><LogOut size={16} /></button>
                            </div>
                        ) : (
                            <button onClick={() => setView('login')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 hover:scale-105 transition-all shadow-xl flex items-center gap-2">Masuk</button>
                        )}
                    </div>
                    <button className="md:hidden p-2 text-slate-600 bg-slate-100 rounded-lg transition-colors hover:bg-slate-200" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                        {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* MOBILE MENU */}
            {showMobileMenu && (
                <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-24 px-6 animate-[slideDown_0.3s_ease-out] md:hidden flex flex-col gap-4">
                    {user ? (
                        <>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100" onClick={() => {
                                if (userData?.isProfileComplete) {
                                    setEditProfileData(userData); setIsEditProfileOpen(true); setShowMobileMenu(false);
                                }
                            }}>
                                <img src={userData?.photoURL || user.photoURL} className="w-12 h-12 rounded-full border border-slate-200" />
                                <div>
                                    <p className="font-bold text-slate-800">{userData?.displayName || user.email}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-indigo-600 font-black uppercase">{userData?.role?.replace('_', ' ')}</p>
                                        {userData?.isProfileComplete && <span className="text-[10px] text-slate-400 bg-white px-1 rounded border">Edit Profil</span>}
                                    </div>
                                </div>
                            </div>
                            {userData?.role === 'super_admin' && (
                                <button onClick={() => { setView('user-management'); setShowMobileMenu(false); }} className="w-full p-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-left border border-slate-100 flex items-center justify-between">
                                    <span>Manajemen User</span>
                                    {pendingUsers.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full">{pendingUsers.length} New</span>}
                                </button>
                            )}
                            <button onClick={() => { setView('landing'); setShowMobileMenu(false); }} className="p-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-left border border-transparent hover:border-slate-100 transition-all">Beranda</button>

                            {view !== 'profile-setup' && userData?.isProfileComplete && (
                                <button onClick={() => { setView((userData.role === 'supervisor' || userData.role === 'super_admin') ? 'team-list' : 'dashboard'); setShowMobileMenu(false); }} className="p-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-left border border-transparent hover:border-slate-100 transition-all">Dashboard</button>
                            )}
                            <button onClick={handleLogout} className="p-4 rounded-xl font-bold text-red-500 hover:bg-red-50 text-left flex items-center gap-2 border border-transparent hover:border-red-100 transition-all"><LogOut size={18} /> Keluar</button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <button onClick={() => { setView('landing'); setShowMobileMenu(false); }} className="w-full p-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-left border border-slate-100">Beranda</button>
                            <button onClick={() => { setView('login'); setShowMobileMenu(false); }} className="w-full p-4 bg-slate-900 text-white rounded-xl font-bold text-center shadow-lg">Masuk Akun</button>
                        </div>
                    )}
                </div>
            )}

            {/* --- CONTENT AREA (SAMA SEPERTI SEBELUMNYA) --- */}
            <div className="flex-1 p-4 md:p-8 pb-32 relative z-10 w-full min-h-screen">
                <div className="max-w-7xl mx-auto w-full">

                    {/* VIEW: PROFILE SETUP */}
                    {view === 'profile-setup' && (
                        <div className="pt-20 flex justify-center animate-[slideUp_0.4s_ease-out]">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm"><UserPlus size={32} /></div>
                                    <h2 className="text-2xl font-black text-slate-800">Lengkapi Profil Anda</h2>
                                    <p className="text-sm text-slate-500 font-medium mt-2">Halo! Sebelum mulai, perkenalkan diri Anda lebih detail.</p>
                                </div>
                                <div className="space-y-5">
                                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><User size={14} /> Username / Nama Panggilan</label><input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200 transition-all" placeholder="Contoh: Budi Santoso" value={profileForm.username} onChange={e => setProfileForm({ ...profileForm, username: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><School size={14} /> Asal Sekolah / Universitas</label><input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200 transition-all" placeholder="Contoh: SMKN 1 Jakarta" value={profileForm.school} onChange={e => setProfileForm({ ...profileForm, school: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><MapPin size={14} /> Asal Kota / Kabupaten</label><select className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer" value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}><option value="">-- Pilih Kota --</option>{INDONESIAN_CITIES.map(city => (<option key={city} value={city}>{city}</option>))}</select></div>
                                    <button onClick={handleProfileSubmit} disabled={!profileForm.username || !profileForm.school || !profileForm.city} className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${(!profileForm.username || !profileForm.school || !profileForm.city) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>Simpan & Masuk <ArrowRight size={18} /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEW: LANDING */}
                    {view === 'landing' && (
                        <div className="pt-20 animate-[fadeIn_0.5s]">
                            {showPendingAlert && (
                                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-10 flex items-start md:items-center gap-4 shadow-lg animate-[slideDown_0.3s_ease-out]">
                                    <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 shrink-0"><Clock size={24} /></div>
                                    <div className="flex-1"><h3 className="text-amber-800 font-bold text-lg mb-1">Status Akun: Menunggu Persetujuan</h3><p className="text-amber-700 text-xs md:text-sm font-medium">Permintaan login Anda telah dikirim ke Administrator.</p></div>
                                    <button onClick={() => setShowPendingAlert(false)} className="p-2 text-amber-400 hover:text-amber-700"><X size={20} /></button>
                                </div>
                            )}

                            <div className="text-center mb-12">
                                <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">Portal Internal v5.0</span>
                                <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-4 tracking-tight leading-tight">Pusat Produksi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Digital</span></h1>
                                <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">Platform manajemen konten terintegrasi. Login dibatasi hanya untuk anggota yang telah disetujui oleh Administrator.</p>
                            </div>

                            <div className="max-w-5xl mx-auto bg-white p-4 rounded-[2.5rem] shadow-xl border border-slate-100 mb-12 relative group overflow-hidden hover:shadow-2xl transition-all duration-500">
                                <div className="relative rounded-[2rem] overflow-hidden aspect-video shadow-inner bg-slate-200">
                                    <img src={weeklyContent.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Highlight" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 md:p-10 flex flex-col justify-end text-white">
                                        <span className="self-start bg-pink-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase mb-2 shadow-lg tracking-wider">Weekly Highlight</span>
                                        <h2 className="text-2xl md:text-4xl font-bold leading-tight">{weeklyContent.title}</h2>
                                    </div>
                                </div>
                                {(userData?.role === 'supervisor' || userData?.role === 'super_admin') && (
                                    <button onClick={() => { setWeeklyForm(weeklyContent); setIsEditWeeklyOpen(true); }} className="absolute top-8 right-8 bg-white/90 backdrop-blur text-slate-800 px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform z-20 opacity-0 group-hover:opacity-100"><Edit3 size={14} className="text-indigo-600" /> Edit Highlight</button>
                                )}
                            </div>

                            {/* WEEKLY BOT REPORT PANEL IN LANDING PAGE */}
                            <div className="max-w-5xl mx-auto mb-12">
                                <WeeklyBotReport projects={projects} />
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 mb-20">
                                {news.map(n => (
                                    <div key={n.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden flex flex-col h-full">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-all group-hover:bg-indigo-100"></div>
                                        {(userData?.role === 'supervisor' || userData?.role === 'super_admin') && (
                                            <button onClick={() => handleEditNewsUI(n)} className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-sm text-indigo-600 hover:scale-110 transition-transform"><Edit3 size={14} /></button>
                                        )}
                                        <div className="relative z-10 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">{n.category}</span>
                                                <span className="text-slate-400 text-[10px] font-bold">{n.date}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors leading-tight mb-4">{n.title}</h3>
                                            <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{n.summary}</p>
                                            <div onClick={() => setSelectedNews(n)} className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-600 cursor-pointer mt-auto"><BookOpen size={14} /> Baca Detail</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="max-w-4xl mx-auto mb-20">
                                <h3 className="text-center font-black text-slate-800 text-xl mb-6">Mengenal Tim Kami</h3>
                                {usersList.length > 0 && (
                                    <div className="bg-white rounded-[3rem] shadow-xl p-8 border border-slate-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                            <div className="shrink-0 w-32 h-32 md:w-40 md:h-40 relative">
                                                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-pulse"></div>
                                                <img
                                                    key={`img-${spotlightIndex}`}
                                                    src={usersList[spotlightIndex]?.photoURL}
                                                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg animate-[fadeIn_0.5s]"
                                                />
                                            </div>
                                            <div className="text-center md:text-left animate-[slideUp_0.5s] key={`text-${spotlightIndex}`}">
                                                <div className="inline-block bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-2 tracking-wider">
                                                    {usersList[spotlightIndex]?.role?.replace('_', ' ')}
                                                </div>
                                                <h2 className="text-3xl font-black text-slate-800 mb-3">{usersList[spotlightIndex]?.displayName}</h2>
                                                <div className="relative">
                                                    <Quote size={24} className="absolute -top-3 -left-4 text-slate-200 transform -scale-x-100" />
                                                    <p className="text-slate-500 font-medium italic relative z-10 pl-4">{usersList[spotlightIndex]?.bio || "Belum ada bio."}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-center gap-2 mt-8">
                                            {usersList.slice(0, 10).map((_, idx) => (
                                                <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === spotlightIndex ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Login View */}
                    {view === 'login' && (
                        <div className="flex flex-col items-center justify-center pt-20 animate-[slideUp_0.4s_ease-out]">
                            <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 relative z-10 border border-slate-100">
                                <div className="flex flex-col items-center justify-center mb-8 gap-4">
                                    <img src={siteLogo} className="h-16 w-auto object-contain" />
                                    <h1 className="text-2xl font-black text-center text-slate-900 tracking-tight">RoboEdu<span className="text-indigo-600">.Studio</span></h1>
                                </div>

                                {/* EMAIL PASSWORD FORM */}
                                <form onSubmit={handleEmailAuth} className="space-y-4">
                                    <div>
                                        <label className="block text-left text-xs font-bold text-slate-400 mb-1 ml-1">Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                required
                                                className="w-full p-4 pl-12 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200"
                                                placeholder="user@sekolah.id"
                                                value={authEmail}
                                                onChange={e => setAuthEmail(e.target.value)}
                                            />
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-left text-xs font-bold text-slate-400 mb-1 ml-1">Password</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                required
                                                className="w-full p-4 pl-12 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200"
                                                placeholder="••••••••"
                                                value={authPassword}
                                                onChange={e => setAuthPassword(e.target.value)}
                                            />
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loadingLogin} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-3">
                                        {loadingLogin ? <Loader2 className="animate-spin" /> : (isRegistering ? <UserPlus size={20} /> : <Shield size={20} />)}
                                        {isRegistering ? "Daftar Akun Baru" : "Masuk"}
                                    </button>
                                </form>

                                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                                    <p className="text-xs text-slate-500 font-medium mb-2">
                                        {isRegistering ? "Sudah punya akun?" : "Belum punya akun?"}
                                    </p>
                                    <button
                                        onClick={() => setIsRegistering(!isRegistering)}
                                        className="text-indigo-600 font-bold text-sm hover:underline"
                                    >
                                        {isRegistering ? "Login Sekarang" : "Daftar Sekarang"}
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => setView('landing')} className="mt-8 flex items-center gap-2 text-slate-400 text-xs font-bold hover:text-indigo-600 transition-colors"><ChevronLeft size={14} /> Kembali ke Beranda</button>
                        </div>
                    )}

                    {/* User Management */}
                    {view === 'user-management' && userData?.role === 'super_admin' && (
                        <div className="pt-20 animate-[fadeIn_0.3s]">
                            <div className="flex items-center gap-2 mb-6"><button onClick={() => setView('dashboard')} className="p-2 bg-white rounded-full hover:bg-slate-100"><ChevronLeft /></button><h2 className="text-3xl font-black text-slate-800">Manajemen Akses</h2></div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-[2rem] border border-orange-100 shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-orange-400"></div>
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-orange-600"><AlertCircle size={20} /> Menunggu Persetujuan ({pendingUsers.length})</h3>
                                    <div className="space-y-4">
                                        {pendingUsers.length === 0 ? <div className="text-center py-10 text-slate-400 text-sm italic">Tidak ada permintaan baru.</div> : pendingUsers.map(u => (
                                            <div key={u.id} className="p-4 bg-orange-50 rounded-2xl flex items-center gap-3 border border-orange-100">
                                                <img src={u.photoURL} className="w-10 h-10 rounded-full bg-white" />
                                                <div className="flex-1 min-w-0"><div className="font-bold text-slate-800 text-sm truncate">{u.displayName}</div><div className="text-xs text-slate-500 truncate">{u.email}</div></div>
                                                <div className="flex gap-2">
                                                    {/* Explicit button types and handlers */}
                                                    <button type="button" onClick={() => handleRejectUser(u)} className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"><X size={16} /></button>
                                                    <button type="button" onClick={() => handleOpenApproveModal(u)} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-colors"><CheckCircle2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700"><Users size={20} /> User Terdaftar ({usersList.length})</h3>
                                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                        {usersList.slice(0, 10).map((u, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                                <img src={u.photoURL} className="w-8 h-8 rounded-full bg-slate-200" />
                                                <div className="flex-1"><div className="font-bold text-sm text-slate-800">{u.displayName}</div><div className="text-[10px] uppercase font-bold text-indigo-500">{u.role}</div></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Team List */}
                    {view === 'team-list' && (
                        <div className="pt-20 animate-[fadeIn_0.3s]">
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div onClick={() => setView('results')} className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-8 rounded-[2rem] shadow-xl flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform h-48 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all"></div>
                                    <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner relative z-10"><LinkIcon size={28} /></div>
                                    <div className="relative z-10"><h3 className="font-bold text-2xl leading-tight mb-1">Link Hasil</h3><p className="text-sm opacity-80 font-medium">Kumpulan Final Drive Project</p></div>
                                </div>
                                <div onClick={() => setView('archive')} className="bg-slate-800 text-white p-8 rounded-[2rem] shadow-xl flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform h-48 relative overflow-hidden group">
                                    <div className="absolute bottom-0 left-0 p-32 bg-indigo-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
                                    <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner relative z-10"><Archive size={28} /></div>
                                    <div className="relative z-10"><h3 className="font-bold text-2xl leading-tight mb-1">Arsip Lama</h3><p className="text-sm opacity-80 font-medium">History Data & Recap</p></div>
                                </div>
                            </div>
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="font-bold text-slate-700 text-xl flex items-center gap-2"><Users size={20} className="text-indigo-600" /> Daftar Tim Produksi</h3>
                                {userData?.role === 'super_admin' && <button onClick={() => setView('user-management')} className="text-xs font-bold text-indigo-600 hover:underline">Kelola Akses User</button>}
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                                {TEAMS.map(team => {
                                    const count = projects.filter(p => String(p.teamId) === String(team.id) && p.status !== 'Completed').length;
                                    return (
                                        <div key={team.id} onClick={() => { setActiveTeamId(team.id); setView('dashboard'); }} className={`bg-white p-6 rounded-[2rem] border cursor-pointer hover:scale-105 transition-all shadow-sm group ${team.isSpecial ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100 hover:border-indigo-200'}`}>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-md text-xl ${team.isSpecial ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-indigo-500 to-blue-600'}`}>{team.isSpecial ? <Lock size={24} /> : team.name.split(' ')[1]}</div>
                                                <div className="flex-1"><h3 className="font-black text-slate-800 text-xl group-hover:text-indigo-600 transition-colors">{team.name}</h3></div>
                                            </div>
                                            <div className="inline-block px-3 py-1 rounded-lg text-xs font-bold border bg-white">{count} Project Aktif</div>
                                        </div>
                                    );
                                })}
                                <div onClick={() => setView('assets')} className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-100 transition-colors border-dashed border-2 min-h-[160px]">
                                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><FolderOpen size={24} /></div>
                                    <h3 className="font-bold text-blue-800 text-lg">Kelola Aset & File</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dashboard & Project Detail */}
                    {view === 'dashboard' && userData && ( // Added safety check
                        <div className="pt-20 animate-[fadeIn_0.3s]">
                            {(userData?.role === 'supervisor' || userData?.role === 'super_admin') && activeTeamId && (
                                <button onClick={() => { setActiveTeamId(null); setView('team-list'); }} className="mb-4 text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"><ChevronLeft size={14} /> Kembali ke List Tim</button>
                            )}
                            <div className="flex justify-between items-end mb-6">
                                <h2 className="text-3xl font-black text-slate-800">
                                    {(userData?.role === 'supervisor' || userData?.role === 'super_admin')
                                        ? (activeTeamId ? TEAMS.find(t => t.id === activeTeamId)?.name : "Dashboard Admin")
                                        : TEAMS.find(t => t.id === userData?.teamId)?.name}
                                </h2>
                                <div className="flex gap-2">
                                    {(userData?.role === 'supervisor' || userData?.role === 'super_admin') && activeTeamId && (
                                        <button onClick={() => {
                                            const tm = TEAMS.find(t => t.id === activeTeamId);
                                            setNewProjectForm({ ...newProjectForm, teamId: tm.id, isBigProject: tm.isSpecial });
                                            setIsAddProjectOpen(true);
                                        }} className="bg-slate-900 text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2"><Plus size={14} /> Project Baru</button>
                                    )}
                                    {/* CREATOR ARCHIVE BUTTON IN DASHBOARD */}
                                    {(userData?.role === 'creator' || userData?.role === 'tim_khusus') && (
                                        <button onClick={() => setView('archive')} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full font-bold text-xs shadow-sm flex items-center gap-2 hover:bg-slate-50"><Archive size={14} /> Arsip Project</button>
                                    )}
                                    {(userData?.role === 'supervisor' || userData?.role === 'super_admin') && (
                                        <button onClick={() => setView('archive')} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full font-bold text-xs shadow-sm flex items-center gap-2 hover:bg-slate-50"><Archive size={14} /> Arsip Project</button>
                                    )}
                                </div>
                            </div>

                            <PerformanceChart
                                data={getWeeklyAnalytics((userData?.role === 'supervisor' || userData?.role === 'super_admin') ? activeTeamId || 'all' : userData?.teamId)}
                                title="Statistik Mingguan"
                            />

                            <div className="grid md:grid-cols-2 gap-4 mt-6">
                                {projects
                                    .filter(p => {
                                        if (p.status === 'Completed') return false;

                                        if (userData?.role === 'supervisor' || userData?.role === 'super_admin') {
                                            return activeTeamId ? (String(p.teamId) === String(activeTeamId)) : true;
                                        } else {
                                            // Robust string check
                                            return String(p.teamId) === String(userData?.teamId);
                                        }
                                    })
                                    .map(p => (
                                        <div key={p.id} onClick={() => { setActiveProject(p); setView('project-detail'); }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg cursor-pointer transition-all">
                                            <div className="flex justify-between mb-4"><span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{p.status}</span></div>
                                            <h3 className="font-bold text-xl mb-4 text-slate-800">{p.title}</h3>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${p.progress}%` }}></div></div>
                                        </div>
                                    ))}
                            </div>


                            {/* Empty State with Debug Info */}
                            {projects.filter(p => p.status !== 'Completed' && (userData?.role === 'supervisor' || userData?.role === 'super_admin' ? (activeTeamId ? String(p.teamId).toLowerCase().trim() === String(activeTeamId).toLowerCase().trim() : true) : String(p.teamId).toLowerCase().trim() === String(userData?.teamId).toLowerCase().trim())).length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="font-bold">Belum ada project aktif di Tim ini.</p>
                                    <p className="text-xs mt-2 max-w-xs mx-auto">Sistem hanya menampilkan Project yang memiliki <b>teamId</b> sama persis dengan akun Anda.</p>
                                    <div className="text-[10px] mt-4 font-mono opacity-50 bg-slate-100 inline-block px-4 py-2 rounded text-left">
                                        <p>Debug Info:</p>
                                        <p>My Account Team: "{userData?.teamId}"</p>
                                        <p>Total Projects in DB: {projects.length}</p>
                                        <p>Sample Project Team: "{projects[0]?.teamId || 'N/A'}"</p>
                                        <p>Matching Status: {projects.some(p => String(p.teamId).trim() === String(userData?.teamId).trim()) ? "MATCH FOUND (Hidden?)" : "NO MATCH"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'project-detail' && activeProject && (
                        <div className="pt-20 animate-[fadeIn_0.3s]">
                            {/* ... (Project Detail rendering logic) ... */}
                            <div className="max-w-5xl mx-auto">
                                <button onClick={() => setView('dashboard')} className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600"><ChevronLeft size={14} /> Kembali</button>
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                    {/* ... (Project Header) ... */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex gap-2 mb-2">
                                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">{activeProject.status}</span>
                                                {activeProject.isApproved && !activeProject.isBigProject && <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={10} /> Approved</span>}
                                            </div>
                                            <h1 className="text-3xl font-black text-slate-800">{activeProject.title}</h1>
                                        </div>
                                        {(userData?.role === 'supervisor' || userData?.role === 'super_admin') && (
                                            <button onClick={() => handleDeleteProject(activeProject.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"><Trash2 size={20} /></button>
                                        )}
                                    </div>

                                    {activeProject.isBigProject ? (
                                        <div className="space-y-6">
                                            <div className="bg-amber-50 p-8 rounded-[2.5rem] shadow-sm border border-amber-200 relative">
                                                <div className="absolute top-8 right-8 text-right hidden md:block">
                                                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Deadline</div>
                                                    <div className="text-lg font-black text-amber-800 flex items-center justify-end gap-1"><Calendar size={16} /> {activeProject.deadline}</div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                                    <div>
                                                        <label className="text-xs font-black text-amber-700 uppercase block mb-2 tracking-wider">Script & Naskah</label>
                                                        <div className="relative">
                                                            <textarea disabled={userData?.role !== 'tim_khusus'} className="w-full bg-white p-4 rounded-2xl text-sm font-medium text-slate-700 border border-amber-200 h-60 outline-none focus:ring-4 focus:ring-amber-200/50 transition-all custom-scrollbar resize-none shadow-sm" value={activeProject.script} onChange={e => handleUpdateProjectFirestore(activeProject.id, { script: e.target.value })} placeholder="Isi naskah detail disini..." />
                                                            {userData?.role === 'tim_khusus' && <button onClick={() => setShowAIModal(true)} className="absolute bottom-4 right-4 p-2 bg-amber-500 text-white rounded-lg shadow hover:bg-amber-600 transition-transform hover:scale-110"><Wand2 size={16} /></button>}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-black text-amber-700 uppercase block mb-2 tracking-wider">List Alat & Equipment</label>
                                                        <textarea disabled={userData?.role !== 'tim_khusus'} className="w-full bg-white p-4 rounded-2xl text-sm font-medium text-slate-700 border border-amber-200 h-60 outline-none focus:ring-4 focus:ring-amber-200/50 transition-all custom-scrollbar resize-none shadow-sm" value={activeProject.equipment} onChange={e => handleUpdateProjectFirestore(activeProject.id, { equipment: e.target.value })} placeholder="List kamera, lighting, audio..." />
                                                    </div>
                                                </div>
                                                <div className="mb-8">
                                                    <div className="flex justify-between items-end mb-4"><label className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-2"><ImageIcon size={16} /> Preview Komposisi (Max 20)</label><span className="text-[10px] text-amber-600 font-bold">{(activeProject.previewImages || []).filter(Boolean).length} / 20 Terisi</span></div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                        {(activeProject.previewImages || []).map((img, idx) => (
                                                            <div key={idx} className="aspect-square rounded-xl bg-white border border-amber-100 shadow-sm relative overflow-hidden group">
                                                                {img ? <><img src={img} className="w-full h-full object-cover" />{userData?.role === 'tim_khusus' && <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"><button onClick={() => handleRemoveImage(idx)} className="p-2 bg-red-500 text-white rounded-lg"><Trash2 size={14} /></button></div>}<button onClick={() => window.open(img, '_blank')} className="absolute bottom-2 right-2 p-1 bg-black/50 text-white rounded text-[10px] opacity-0 group-hover:opacity-100"><Maximize2 size={12} /></button></> : <div onClick={() => { if (userData?.role !== 'tim_khusus') return; setImageUploadState({ isOpen: true, slotIndex: idx, urlInput: '' }); }} className={`w-full h-full flex flex-col items-center justify-center text-amber-200 ${userData?.role === 'tim_khusus' ? 'cursor-pointer hover:bg-amber-50 hover:text-amber-400' : 'cursor-default'}`}><Plus size={24} /><span className="text-[10px] font-bold">Slot {idx + 1}</span></div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-2xl border border-amber-100">
                                                    <label className="text-xs font-black text-amber-700 uppercase block mb-3 tracking-wider flex items-center gap-2"><CheckCircle2 size={16} /> Final Submission (G-Drive)</label>

                                                    {activeProject.proposalStatus === 'Pending' && (
                                                        <div className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center text-blue-600 text-sm font-bold flex items-center justify-center gap-2">
                                                            <Loader2 className="animate-spin" size={16} /> Konsep Sedang Direview Admin
                                                        </div>
                                                    )}
                                                    {activeProject.proposalStatus === 'Revision' && (
                                                        <div className="mb-4 bg-red-50 p-4 rounded-xl border border-red-100 text-left">
                                                            <div className="text-xs font-bold text-red-500 uppercase mb-1">Catatan Revisi Admin:</div>
                                                            <p className="text-sm text-red-700 font-medium">{activeProject.feedback}</p>
                                                        </div>
                                                    )}
                                                    {activeProject.proposalStatus === 'Approved' && (
                                                        <div className="mb-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center text-emerald-600 text-sm font-bold flex items-center justify-center gap-2">
                                                            <Check size={16} /> Konsep Telah Disetujui. Silakan Submit Final.
                                                        </div>
                                                    )}

                                                    <div className="flex gap-3 flex-col md:flex-row">
                                                        <input
                                                            type="text"
                                                            className="flex-1 p-3 text-xs rounded-xl border border-amber-200 outline-none focus:ring-2 focus:ring-amber-300"
                                                            placeholder="Paste Link Final GDrive..."
                                                            value={activeProject.finalLink || ''}
                                                            onChange={e => handleUpdateProjectFirestore(activeProject.id, { finalLink: e.target.value })}
                                                            disabled={activeProject.status === 'Completed' || (userData?.role === 'tim_khusus' && activeProject.proposalStatus === 'Pending')}
                                                        />

                                                        {userData?.role === 'tim_khusus' && activeProject.status !== 'Completed' && (
                                                            <>
                                                                {(activeProject.proposalStatus === 'None' || activeProject.proposalStatus === 'Revision') && (
                                                                    <button
                                                                        onClick={activeProject.proposalStatus === 'None' ? handleProposeConcept : handleRePropose}
                                                                        disabled={!activeProject.finalLink || activeProject.previewImages.filter(Boolean).length === 0}
                                                                        className="px-6 py-3 bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-blue-600 disabled:bg-slate-300 transition-all whitespace-nowrap"
                                                                    >
                                                                        {activeProject.proposalStatus === 'Revision' ? "Ajukan Ulang" : "Ajukan Konsep"}
                                                                    </button>
                                                                )}

                                                                {activeProject.proposalStatus === 'Approved' && (
                                                                    <button
                                                                        onClick={() => handleSubmitFinalTim5()}
                                                                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-600 transition-all whitespace-nowrap"
                                                                    >
                                                                        Submit Final
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}

                                                        {(userData?.role === 'supervisor' || userData?.role === 'super_admin') && activeProject.proposalStatus === 'Pending' && (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleReviewProposal(true)} className="px-4 py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-600">ACC Pengajuan</button>
                                                                <button onClick={() => {
                                                                    const fb = prompt("Masukkan pesan revisi:");
                                                                    if (fb) handleReviewProposal(false, fb);
                                                                }} className="px-4 py-3 bg-red-500 text-white rounded-xl text-xs font-bold shadow hover:bg-red-600">Revisi</button>
                                                            </div>
                                                        )}

                                                        {(activeProject.status === 'Completed' || ((userData?.role === 'supervisor' || userData?.role === 'super_admin') && activeProject.finalLink)) && (
                                                            <a href={activeProject.finalLink} target="_blank" className="px-6 py-3 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl font-bold text-xs text-center hover:bg-amber-100 whitespace-nowrap">Buka Link</a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-6">
                                            {WORKFLOW_STEPS.map((step, idx) => (
                                                <div key={idx} className="border-l-2 border-slate-100 pl-6 pb-6 relative">
                                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${step.tasks.every(t => activeProject.completedTasks.includes(t.id)) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">{step.icon} {step.title} {step.isGatekeeper && <ShieldCheck size={14} className="text-purple-500" />}</h4>
                                                    {step.id === 'step-4' && (
                                                        <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 mb-4">
                                                            <h5 className="text-xs font-black text-purple-700 uppercase mb-3 flex items-center gap-2"><MonitorPlay size={14} /> Preview & Approval</h5>
                                                            {(userData?.role === 'supervisor' || userData?.role === 'super_admin') ? (
                                                                <div className="space-y-4">
                                                                    {activeProject.previewLink ? (
                                                                        <div className="space-y-3">
                                                                            <a href={activeProject.previewLink} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 bg-white text-purple-600 rounded-xl font-bold text-sm shadow-sm border border-purple-200 hover:bg-purple-50 transition-colors"><PlayCircle size={16} /> Tonton Preview (GDrive)</a>
                                                                            {!activeProject.isApproved && (
                                                                                <div className="flex flex-col gap-4 pt-4 border-t border-purple-100">
                                                                                    <textarea className="w-full p-4 text-xs rounded-2xl border border-red-200 bg-white outline-none focus:ring-2 focus:ring-red-200 resize-none font-medium" rows={3} placeholder="Tulis catatan revisi disini (wajib diisi jika revisi)..." value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)}></textarea>
                                                                                    <div className="flex gap-3">
                                                                                        <button onClick={() => handleApprovalAction(true)} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-emerald-600 transition-all hover:scale-105 flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Approve Preview</button>
                                                                                        <button onClick={() => handleApprovalAction(false, feedbackInput)} className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-red-600 transition-all hover:scale-105 flex items-center justify-center gap-2"><X size={18} /> Kirim Revisi</button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {activeProject.isApproved && <div className="text-center py-4 bg-emerald-100 text-emerald-700 rounded-2xl text-sm font-bold border border-emerald-200 flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Preview Telah Disetujui</div>}
                                                                        </div>
                                                                    ) : <div className="text-center py-4 text-xs text-purple-400 italic">Belum ada preview yang di-submit creator.</div>}
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    <input type="text" className="w-full p-3 text-xs rounded-xl border border-purple-200 outline-none focus:ring-2 focus:ring-purple-300" placeholder="Paste link GDrive Preview (480p)..." value={activeProject.previewLink || ''} onChange={e => handleUpdateProjectFirestore(activeProject.id, { previewLink: e.target.value })} disabled={activeProject.isApproved} />
                                                                    {activeProject.feedback && !activeProject.isApproved && <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-xs text-red-600 flex items-start gap-2"><AlertCircle size={16} className="shrink-0 mt-0.5" /><div><strong className="block mb-1">Catatan Revisi Supervisor:</strong> {activeProject.feedback}</div></div>}
                                                                    <button onClick={() => handleSubmitPreview(activeProject)} disabled={activeProject.isApproved || !activeProject.previewLink} className="w-full py-3 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all">{activeProject.isApproved ? "Preview Disetujui" : "Submit Preview"}</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="space-y-2">
                                                        {step.tasks.map(task => {
                                                            const isLocked = isTaskLocked(task.id, activeProject.completedTasks);
                                                            return (
                                                                <div key={task.id}>
                                                                    {task.id === 't5-2' ? (
                                                                        <div className={`mt-4 bg-emerald-50 p-6 rounded-3xl border border-emerald-100 transition-all relative overflow-hidden ${!activeProject.isApproved ? 'opacity-70 bg-slate-50 border-slate-200' : ''}`}>
                                                                            {!activeProject.isApproved && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] text-center p-4"><div className="p-3 bg-white rounded-full shadow-md mb-2"><Lock size={20} className="text-red-500" /></div><div className="text-xs font-bold text-red-500 uppercase tracking-wider">Terkunci</div><div className="text-[10px] text-slate-500 font-medium">Menunggu Approval Preview</div></div>}
                                                                            <h5 className="text-xs font-black text-emerald-700 uppercase mb-3 flex items-center gap-2"><CheckCircle2 size={14} /> Final Submission</h5>
                                                                            <div className="flex flex-col gap-3 relative z-10">
                                                                                {(userData?.role === 'supervisor' || userData?.role === 'super_admin') ? (
                                                                                    activeProject.finalLink ? <a href={activeProject.finalLink} target="_blank" className="w-full py-3 bg-white text-emerald-600 border border-emerald-200 rounded-xl font-bold text-xs text-center shadow-sm hover:bg-emerald-50">Buka Link Final</a> : <div className="text-center text-xs text-emerald-400 italic">Menunggu submit final...</div>
                                                                                ) : (
                                                                                    <>
                                                                                        <input type="text" className="w-full p-3 text-xs rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-300" placeholder="Paste Link Final GDrive (1080p)..." value={activeProject.finalLink || ''} onChange={e => handleUpdateProjectFirestore(activeProject.id, { finalLink: e.target.value })} disabled={activeProject.status === 'Completed' || !activeProject.isApproved} />
                                                                                        <button onClick={() => handleSubmitFinalRegular(activeProject)} disabled={!activeProject.finalLink || activeProject.status === 'Completed' || !activeProject.isApproved} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all">Submit Final & Selesai</button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div onClick={() => toggleTask(activeProject.id, task.id)} className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${activeProject.completedTasks.includes(task.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'} ${isLocked ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}>
                                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${activeProject.completedTasks.includes(task.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300'}`}>{activeProject.completedTasks.includes(task.id) && <CheckCircle2 size={12} />}</div>
                                                                            <span className="text-sm text-slate-600 font-medium">{task.label} {isLocked && <span className="text-[10px] text-red-400 ml-1">(Terkunci)</span>}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Assets View Logic */}
                    {view === 'assets' && (
                        <div className="pt-20 animate-[fadeIn_0.3s]">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <button onClick={() => setView((userData?.role === 'supervisor' || userData?.role === 'super_admin') ? 'team-list' : 'dashboard')} className="mb-2 text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"><ChevronLeft size={14} /> Kembali</button>
                                    <h2 className="text-3xl font-black text-slate-800">Gudang Aset</h2>
                                </div>
                                {(userData?.role === 'supervisor' || userData?.role === 'super_admin') && (
                                    <button onClick={() => setIsAddAssetOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"><Plus size={18} /> Upload</button>
                                )}
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {assets.map(a => (
                                    <div key={a.id} onClick={() => a.link && window.open(a.link, '_blank')} className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all group relative ${a.link ? 'cursor-pointer hover:border-indigo-300' : ''}`}>
                                        {a.link && <div className="absolute top-2 right-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"><LinkIcon size={12} /></div>}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-md ${a.type === 'folder' ? 'bg-blue-500' : a.type === 'audio' ? 'bg-pink-500' : 'bg-purple-500'}`}>{a.type === 'folder' ? <FolderOpen size={24} /> : a.type === 'audio' ? <Mic size={24} /> : <FileVideo size={24} />}</div>
                                        <div className="flex-1 min-w-0"><h4 className="font-bold text-slate-800 text-sm truncate">{a.title}</h4><p className="text-xs text-slate-400 font-bold">{a.size}</p></div>
                                        {(userData?.role === 'supervisor' || userData?.role === 'super_admin') && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteAsset(a.id); }} className="p-2 bg-slate-50 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results View Logic */}
                    {view === 'results' && (
                        <div className="pt-20 animate-[fadeIn_0.3s]">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <button onClick={() => setView('team-list')} className="mb-2 text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"><ChevronLeft size={14} /> Kembali</button>
                                    <h2 className="text-3xl font-black text-slate-800">Hasil Final</h2>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.filter(p => p.finalLink).map(p => (
                                    <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                                        <div className="flex justify-between mb-4"><span className="text-[10px] bg-slate-100 px-2 py-1 rounded-md font-bold uppercase text-slate-600">{TEAMS.find(t => t.id === p.teamId)?.name}</span><span className="text-[10px] text-slate-400 font-bold">{formatFirestoreDate(p.createdAt)}</span></div>
                                        <h3 className="font-bold text-slate-800 text-lg mb-6 leading-tight">{p.title}</h3>
                                        <a href={p.finalLink} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"><LinkIcon size={16} /> Buka Link Drive</a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Archive View - Completed Projects */}
                    {view === 'archive' && (
                        <div className="pt-20 animate-[fadeIn_0.3s]">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <button onClick={() => {
                                        if ((userData?.role === 'supervisor' || userData?.role === 'super_admin') && !activeTeamId) {
                                            setView('team-list');
                                        } else {
                                            setView('dashboard');
                                        }
                                    }} className="mb-2 text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"><ChevronLeft size={14} /> Kembali</button>
                                    <h2 className="text-3xl font-black text-slate-800">Arsip Project (Fixed)</h2>
                                    <p className="text-sm text-slate-500 mt-1">Project yang sudah selesai</p>
                                </div>
                            </div>

                            <div className="mb-10">
                                <PerformanceChart data={getWeeklyAnalytics((userData?.role === 'supervisor' || userData?.role === 'super_admin') ? activeTeamId || 'all' : userData?.teamId)} title="Statistik Arsip Mingguan" />
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                                {projects
                                    .filter(p => {
                                        // Show completed projects only
                                        if (p.status !== 'Completed') return false;

                                        // Team-based filter
                                        if (userData?.role === 'supervisor' || userData?.role === 'super_admin') {
                                            return activeTeamId ? (String(p.teamId) === String(activeTeamId)) : true;
                                        } else {
                                            return String(p.teamId) === String(userData?.teamId);
                                        }
                                    })
                                    .map(p => (
                                        <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                                            <div className="flex justify-between mb-4">
                                                <span className="text-[10px] bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-bold uppercase flex items-center gap-1">
                                                    <CheckCircle2 size={10} /> Completed
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    {formatFirestoreDate(p.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-600">
                                                    {TEAMS.find(t => t.id === p.teamId)?.name}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-lg mb-3 leading-tight">{p.title}</h3>
                                            <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden mb-4">
                                                <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
                                            </div>
                                            {p.finalLink && (
                                                <a href={p.finalLink} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                                    <LinkIcon size={16} /> Buka Hasil Final
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                {projects.filter(p => {
                                    if (p.status !== 'Completed') return false;
                                    if (p.status !== 'Completed') return false;
                                    if (userData?.role === 'supervisor' || userData?.role === 'super_admin') {
                                        return activeTeamId ? (String(p.teamId) === String(activeTeamId)) : true;
                                    } else {
                                        return String(p.teamId) === String(userData?.teamId);
                                    }
                                }).length === 0 && (
                                        <div className="col-span-full text-center py-20">
                                            <Archive size={48} className="mx-auto text-slate-300 mb-4" />
                                            <p className="text-slate-400 font-medium">Belum ada project yang selesai</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* --- IMAGE UPLOAD MODAL --- */}
            <Modal isOpen={imageUploadState.isOpen} onClose={() => setImageUploadState({ ...imageUploadState, isOpen: false })} title="Upload Preview (Link)">
                {/* ... (Existing Modal Content) ... */}
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 leading-relaxed border border-slate-200">
                        <p className="font-bold text-indigo-600 mb-1">Tips Bot GDrive:</p>Paste link Google Drive biasa, lalu klik tombol "Auto-Fix Link" agar gambar bisa muncul di preview.
                    </div>
                    <input type="text" className="w-full p-4 bg-white rounded-2xl text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200" placeholder="https://..." value={imageUploadState.urlInput} onChange={e => setImageUploadState({ ...imageUploadState, urlInput: e.target.value })} />
                    {imageUploadState.urlInput.includes('drive.google.com') && (<button onClick={() => setImageUploadState({ ...imageUploadState, urlInput: autoCorrectGDriveLink(imageUploadState.urlInput) })} className="w-full py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-200 transition-colors"><Zap size={14} /> Auto-Fix Link (Bot)</button>)}
                    <button onClick={handleImageSubmit} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700">Simpan Gambar</button>
                </div>
            </Modal>

            {/* --- CONFIRMATION MODAL (GENERIC) --- */}
            <Modal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} title={confirmModal.title}>
                <div className="p-4 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce ${confirmModal.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{confirmModal.type === 'danger' ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}</div>
                    <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">{confirmModal.message}</p>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Batal</button>
                        <button onClick={executeConfirmAction} className={`flex-1 py-3 text-white rounded-xl font-bold ${confirmModal.type === 'danger' ? 'bg-red-500' : 'bg-blue-600'}`}>Ya, Lanjutkan</button>
                    </div>
                </div>
            </Modal>

            {/* --- ADD PROJECT MODAL WITH DEADLINE --- */}
            <Modal isOpen={isAddProjectOpen} onClose={() => setIsAddProjectOpen(false)} title="Project Baru">
                <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Judul Project</label><input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none font-medium" placeholder="Judul Project..." value={newProjectForm.title} onChange={e => setNewProjectForm({ ...newProjectForm, title: e.target.value })} /></div>
                    {newProjectForm.isBigProject && (
                        <div className="animate-[fadeIn_0.3s]">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Deadline Project</label>
                            <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none font-medium" value={newProjectForm.deadline} onChange={e => setNewProjectForm({ ...newProjectForm, deadline: e.target.value })} />
                        </div>
                    )}
                    <button onClick={handleAddProject} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">Buat Project</button>
                </div>
            </Modal>

            {/* --- ADD ASSET MODAL (MISSING FIX) --- */}
            <Modal isOpen={isAddAssetOpen} onClose={() => setIsAddAssetOpen(false)} title="Upload Aset Baru">
                <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Nama File</label><input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium" placeholder="Contoh: Logo.png" value={newAssetForm.title} onChange={e => setNewAssetForm({ ...newAssetForm, title: e.target.value })} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Link URL</label><input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium" placeholder="https://..." value={newAssetForm.link || ''} onChange={e => setNewAssetForm({ ...newAssetForm, link: e.target.value })} /></div>
                    <div className="flex gap-3">
                        <div className="flex-1"><label className="block text-xs font-bold text-slate-500 mb-1">Tipe File</label><select className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none flex-1 font-medium cursor-pointer" value={newAssetForm.type} onChange={e => setNewAssetForm({ ...newAssetForm, type: e.target.value })}><option value="folder">Folder</option><option value="audio">Audio</option><option value="video">Video</option></select></div>
                        <div className="w-1/3"><label className="block text-xs font-bold text-slate-500 mb-1">Ukuran (MB)</label><input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none font-medium" placeholder="Size" value={newAssetForm.size} onChange={e => setNewAssetForm({ ...newAssetForm, size: e.target.value })} /></div>
                    </div>
                    <button onClick={handleAddAsset} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg mt-2 hover:bg-indigo-700 transition-all">Simpan Aset</button>
                </div>
            </Modal>

            {/* --- EDIT PROFILE MODAL --- */}
            <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="Edit Profil">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap</label>
                        <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-indigo-500" value={editProfileData.displayName} onChange={e => setEditProfileData({ ...editProfileData, displayName: e.target.value })} />
                        <p className="text-[10px] text-slate-400 mt-1">Kesempatan ganti nama tersisa: <span className="font-bold text-indigo-500">{2 - (userData?.nameChangeCount || 0)}x</span></p>
                    </div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Bio Singkat</label><textarea className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-indigo-500 h-24 resize-none" value={editProfileData.bio} onChange={e => setEditProfileData({ ...editProfileData, bio: e.target.value })} /></div>

                    {/* FIX: userData bukan user */}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-slate-400 mb-1">Asal Sekolah</label><input type="text" disabled className="w-full p-4 bg-slate-100 rounded-2xl text-sm border border-slate-200 text-slate-500 cursor-not-allowed" value={userData?.school || '-'} /></div>
                        <div><label className="block text-xs font-bold text-slate-400 mb-1">Asal Kota</label><input type="text" disabled className="w-full p-4 bg-slate-100 rounded-2xl text-sm border border-slate-200 text-slate-500 cursor-not-allowed" value={userData?.city || '-'} /></div>
                    </div>

                    {/* FIX: Real Firebase Storage Upload */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Upload Foto Profil</label>
                        <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                // Base64 Storage Strategy (No Firebase Storage needed)
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    const img = new Image();
                                    img.onload = () => {
                                        const canvas = document.createElement('canvas');
                                        const ctx = canvas.getContext('2d');

                                        // Resize to 200x200 for profile optimization
                                        const maxWidth = 200;
                                        const scale = maxWidth / img.width;
                                        canvas.width = maxWidth;
                                        canvas.height = img.height * scale;

                                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                                        // Compress to JPEG 0.7 quality
                                        const base64String = canvas.toDataURL('image/jpeg', 0.7);

                                        setEditProfileData({ ...editProfileData, photoURL: base64String });
                                        showToast("Foto siap disimpan!");
                                    };
                                    img.src = event.target.result;
                                };
                                reader.readAsDataURL(file);
                            }}
                        />
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                {editProfileData.photoURL ? (
                                    <img src={editProfileData.photoURL} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={24} /></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('photo-upload').click()}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                                >
                                    <Camera size={14} /> Pilih Foto Baru
                                </button>
                                <p className="text-[10px] text-slate-400 mt-1 ml-1">JPG, PNG max 2MB</p>
                            </div>
                        </div>

                        {editProfileData.photoURL !== userData?.photoURL && (
                            <div className="mt-2 flex items-center justify-center gap-2 text-emerald-500">
                                <img src={editProfileData.photoURL} className="w-10 h-10 rounded-full border-2 border-emerald-200" />
                                <span className="text-xs font-bold">Foto baru siap disimpan!</span>
                            </div>
                        )}
                    </div>
                    <button onClick={handleUpdateProfile} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"><Save size={18} /> Simpan Profil</button>
                </div>
            </Modal >

            {/* --- MODAL APPROVAL USER --- */}
            {/* Ensure this modal is rendered at root level of return */}
            <Modal isOpen={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)} title="Persetujuan Akses User">
                {selectedPendingUser ? (
                    <div className="space-y-6 animate-[fadeIn_0.3s]">
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <img src={selectedPendingUser.photoURL} className="w-12 h-12 rounded-full bg-white shadow-sm" />
                            <div><p className="font-bold text-slate-800">{selectedPendingUser.displayName}</p><p className="text-xs text-slate-500">{selectedPendingUser.email}</p></div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Pilih Role</label>
                            <div className="grid grid-cols-1 gap-2">
                                <button type="button" onClick={() => setApprovalForm({ ...approvalForm, role: 'creator' })} className={`p-3 rounded-xl border text-left text-sm font-bold ${approvalForm.role === 'creator' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'text-slate-600'}`}>Creator</button>
                                <button type="button" onClick={() => setApprovalForm({ ...approvalForm, role: 'tim_khusus' })} className={`p-3 rounded-xl border text-left text-sm font-bold ${approvalForm.role === 'tim_khusus' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'text-slate-600'}`}>Tim Khusus</button>
                                <button type="button" onClick={() => setApprovalForm({ ...approvalForm, role: 'supervisor' })} className={`p-3 rounded-xl border text-left text-sm font-bold ${approvalForm.role === 'supervisor' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'text-slate-600'}`}>Supervisor</button>
                            </div>
                        </div>


                        {/* Team Selection for Creator */}
                        {
                            approvalForm.role === 'creator' && (
                                <div className="space-y-2 animate-[fadeIn_0.3s]">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Pilih Penempatan Tim</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TEAMS.filter(t => !t.isSpecial).map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setApprovalForm({ ...approvalForm, teamId: t.id })}
                                                className={`p-3 rounded-xl border text-left text-sm font-bold transition-all ${approvalForm.teamId === t.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        }

                        <button type="button" onClick={handleConfirmApproval} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition-all">Setujui Akses</button>
                    </div >
                ) : (<div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-slate-300" /></div>)
                }
            </Modal >

            {/* Other modals (Edit Weekly, News, Approval, etc.) remain standard as previous */}
            {/* ... (Keeping previous modal implementations for brevity) ... */}
            <Modal isOpen={isEditWeeklyOpen} onClose={() => setIsEditWeeklyOpen(false)} title="Edit Weekly Highlight">
                <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Judul Highlight</label><input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-indigo-500 transition-colors" value={weeklyForm.title} onChange={e => setWeeklyForm({ ...weeklyForm, title: e.target.value })} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">URL Gambar (Unsplash)</label><input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-indigo-500 transition-colors" value={weeklyForm.image} onChange={e => setWeeklyForm({ ...weeklyForm, image: e.target.value })} /></div>
                    <button onClick={handleSaveWeekly} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"><Save size={18} /> Simpan Perubahan</button>
                </div>
            </Modal>

            <Modal isOpen={isEditNewsOpen} onClose={() => setIsEditNewsOpen(false)} title="Edit Berita">
                <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Judul Berita</label><input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-indigo-500" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Ringkasan (Depan)</label><input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-indigo-500" value={newsForm.summary} onChange={e => setNewsForm({ ...newsForm, summary: e.target.value })} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Konten Lengkap</label><textarea className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none focus:border-indigo-500 h-40 resize-none" value={newsForm.content} onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} /></div>
                    <button onClick={handleSaveNews} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"><Save size={18} /> Simpan Berita</button>
                </div>
            </Modal>

            <Modal isOpen={isEditLogoOpen} onClose={() => setIsEditLogoOpen(false)} title="Edit Logo Sekolah">
                <div className="space-y-4">
                    <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 outline-none" value={logoForm} onChange={e => setLogoForm(e.target.value)} placeholder="Paste link logo..." />
                    {logoForm.includes('drive.google.com') && <button onClick={() => setLogoForm(autoCorrectGDriveLink(logoForm))} className="w-full py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Zap size={14} /> Auto-Fix Link GDrive</button>}
                    <button onClick={handleSaveLogo} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">Simpan Logo</button>
                </div>
            </Modal>

            {/* --- DETAIL BERITA MODAL --- */}
            <Modal isOpen={!!selectedNews} onClose={() => setSelectedNews(null)} title="Detail Berita">
                {selectedNews && (
                    <div className="animate-[fadeIn_0.2s]">
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase mb-4 inline-block">{selectedNews.category}</span>
                        <h2 className="text-2xl font-black text-slate-800 mb-4 leading-tight">{selectedNews.title}</h2>
                        <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-[2rem] mb-4 border border-slate-100 font-medium whitespace-pre-line">{selectedNews.content}</div>
                        <div className="text-xs text-slate-400 font-bold text-right">Diposting: {selectedNews.date}</div>
                    </div>
                )}
            </Modal>

        </div>
    );
}
