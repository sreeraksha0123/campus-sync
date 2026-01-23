import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, Trophy, Briefcase, Plus, Loader2, X, Sparkles, 
  ChevronRight, Zap, Target, Layout, ArrowUpRight, Moon, Sun, Calendar
} from 'lucide-react';
import { collection, addDoc, getDocs } from 'firebase/firestore'; 
import { db } from '../firebase';

const Home = ({ setPage }) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
  const MODEL_NAME = "gemini-2.5-flash-lite";

  const { userData } = useAuth(); 
  const [isUploading, setIsUploading] = useState(false);
  const [scannedData, setScannedData] = useState(null); 
  const [reviewOpen, setReviewOpen] = useState(false);
  const [validClubs, setValidClubs] = useState(["Bitwise Coding Club"]);

  // 🟢 THEME STATE LOGIC
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // 🟢 APPLY THEME EFFECT
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // ANIMATION VARIANTS
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  // FETCH CLUBS
  useEffect(() => {
     const getClubs = async () => {
        try {
           const snap = await getDocs(collection(db, 'club_profiles'));
           if(!snap.empty) setValidClubs(snap.docs.map(d => d.data().name));
        } catch (e) { console.error(e); }
     };
     getClubs();
  }, []);

  const categories = [
      { id: 'academic', name: 'Academic', desc: 'Notices & Syllabus', icon: <BookOpen size={24} />, bg: 'from-blue-500 to-cyan-500', text: 'text-blue-100', accent: 'bg-blue-500' }, 
      { id: 'clubs', name: 'Clubs', desc: 'Events & Activities', icon: <Users size={24} />, bg: 'from-purple-500 to-pink-500', text: 'text-purple-100', accent: 'bg-purple-500' }, 
      { id: 'competitions', name: 'Contests', desc: 'Hackathons & More', icon: <Trophy size={24} />, bg: 'from-orange-400 to-red-500', text: 'text-orange-100', accent: 'bg-orange-500' }, 
      { id: 'placements', name: 'Jobs', desc: 'Placement Drives', icon: <Briefcase size={24} />, bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-100', accent: 'bg-emerald-500' }
  ];

  // AI UPLOAD HANDLER
  const handleSmartUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setReviewOpen(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        const prompt = `Analyze. JSON: { "category": "notices/clubs/competitions/placements", "title": "...", "date": "...", "details": "...", "clubName": "..." }`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: file.type, data: base64Data } }] }] })
        });
        const json = await response.json();
        if(json.error) throw new Error(json.error.message);
        const text = json.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
        let data = JSON.parse(text);
        if (data.category === 'clubs') {
           if (!data.clubName) data.clubName = validClubs[0]; 
           const lowerName = (data.clubName || "").toLowerCase();
           const match = validClubs.find(c => lowerName.includes(c.toLowerCase().split(' ')[0]));
           if (match) data.clubName = match;
        }
        setScannedData(data);
        setIsUploading(false);
      };
    } catch (error) { alert(error.message); setIsUploading(false); setReviewOpen(false); }
  };

  // POST TO FIREBASE
  const confirmPost = async () => {
    try {
      let collectionName = scannedData.category; 
      let payload = { ...scannedData, timestamp: new Date() };
      if (collectionName === 'clubs') {
        payload.organizer = scannedData.clubName;
        payload.name = scannedData.title;
        delete payload.clubName;
      } else if (collectionName === 'notices') {
        payload.targetYear = scannedData.targetYear || "General";
        payload.targetDept = scannedData.targetDept || "All";
      }
      await addDoc(collection(db, collectionName), payload);
      setReviewOpen(false);
      setScannedData(null);
      alert("✅ Posted Successfully!");
    } catch (error) { alert(error.message); }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300 font-sans">
      
      <div className="w-full px-6 py-4 flex justify-between items-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">C</div>
             <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">Campus Sync</span>
          </div>

          <div className="flex items-center gap-4">
             {/* 🟢 THEME TOGGLE */}
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 hover:scale-110 transition-all shadow-sm border border-gray-200 dark:border-gray-700"
                aria-label="Toggle Dark Mode"
             >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>
          </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-8"> 

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white shadow-2xl min-h-[320px] flex flex-col justify-center w-full"
        >
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-pulse delay-700"></div>

          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 w-full">
            <div className="max-w-3xl">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6"
                >
                  <Zap size={16} className="text-yellow-300 fill-yellow-300"/>
                  <span className="text-sm font-bold tracking-wide text-white">Dashboard v2.0</span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6"
                >
                  Welcome back,<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                    {userData?.name?.split(' ')[0] || 'Student'}
                  </span>
                </motion.h1>
                
                <p className="text-xl text-indigo-100 max-w-2xl leading-relaxed">
                  Your academic hub. Check results, join events, and explore opportunities.
                </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden lg:flex flex-col bg-white/10 backdrop-blur-lg p-6 rounded-3xl border border-white/20 min-w-[320px]"
            >
              <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><Target className="text-white"/></div>
                <div><p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Department</p><p className="font-bold text-xl">{userData?.department || 'CSE'}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><Calendar className="text-white"/></div>
                <div><p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Academic Year</p><p className="font-bold text-xl">{userData?.year || '2025'}</p></div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="w-full">
           <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
                <Layout size={24} className="text-blue-600 dark:text-blue-400"/>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Quick Access</h2>
           </div>

           <motion.div 
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
           >
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage(cat.id)}
                  className={`relative overflow-hidden p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl ${cat.shadow} group text-left h-72 flex flex-col justify-between transition-all w-full`}
                >
                   {/* Gradient Hover Effect */}
                   <div className={`absolute inset-0 bg-gradient-to-br ${cat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                   <div className="relative z-10 w-full">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.bg} flex items-center justify-center text-white shadow-md mb-6 group-hover:scale-110 transition-transform duration-300`}>
                         {cat.icon}
                      </div>
                      
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors">
                        {cat.name}
                      </h3>
                      <p className={`text-base font-medium mt-2 ${cat.text.replace('100', '500')} dark:text-gray-400 group-hover:text-white/90 transition-colors`}>
                        {cat.desc}
                      </p>
                   </div>
                   
                   <div className="relative z-10 flex justify-end w-full">
                      <div className="bg-gray-50 dark:bg-gray-800 group-hover:bg-white/20 p-3 rounded-full transition-colors">
                        <ArrowUpRight size={24} className="text-gray-400 dark:text-gray-500 group-hover:text-white"/>
                      </div>
                   </div>
                </motion.button>
              ))}
           </motion.div>
        </div>

        
        {reviewOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-lg bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
                >
                    {isUploading ? (
                        <div className="text-center py-12">
                            <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600 mb-6"/>
                            <h3 className="font-bold text-gray-800 dark:text-white text-xl animate-pulse">AI is Analyzing...</h3>
                            <p className="text-gray-400 text-sm mt-2">Extracting details automatically</p>
                        </div>
                    ) : scannedData && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <Sparkles size={20} />
                                    <span className="font-bold uppercase text-xs tracking-wider">Detected: {scannedData.category}</span>
                                </div>
                                <button onClick={() => setReviewOpen(false)} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors">
                                    <X size={20} className="text-gray-600 dark:text-gray-300"/>
                                </button>
                            </div>
                            
                            {scannedData.category === 'clubs' && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                                    <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-2">Assign to Club</label>
                                    <select value={scannedData.clubName} onChange={(e) => setScannedData({...scannedData, clubName: e.target.value})} 
                                            className="w-full bg-transparent text-blue-900 dark:text-blue-200 font-bold text-sm focus:outline-none cursor-pointer">
                                        {validClubs.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Title</label>
                                <input value={scannedData.title || scannedData.eventName || scannedData.company} onChange={(e) => setScannedData({...scannedData, title: e.target.value})} 
                                       className="w-full text-xl font-bold border-b-2 border-gray-200 pb-2 focus:outline-none focus:border-blue-600 bg-transparent dark:text-white transition-colors" placeholder="Event Title"/>
                            </div>
                            
                            <div className="space-y-4">
                                <input value={scannedData.date} onChange={(e) => setScannedData({...scannedData, date: e.target.value})} 
                                    className="w-full p-4 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="Date (YYYY-MM-DD)"/>
                                <textarea value={scannedData.details} onChange={(e) => setScannedData({...scannedData, details: e.target.value})} 
                                          className="w-full p-4 rounded-xl text-sm h-32 resize-none bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="Details"/>
                            </div>
                            
                            <button onClick={confirmPost} className="w-full py-4 rounded-xl font-bold text-lg bg-gray-900 dark:bg-blue-600 text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                Confirm & Post
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Home;
