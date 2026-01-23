import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Upload, Loader2, Megaphone, Users, Trophy, Briefcase, Sparkles, PlusCircle, PenTool } from 'lucide-react';

const Admin = () => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
  const MODEL_NAME = "gemini-2.5-flash-lite";

  const [activeTab, setActiveTab] = useState('notices'); 
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [clubsList, setClubsList] = useState([]);

  // 1. FETCH CLUBS ON LOAD
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'club_profiles'));
        const list = snapshot.docs.map(d => d.data().name);
        if (list.length === 0) setClubsList(["Bitwise Coding Club", "Canvas Crew", "Rhythm Squad"]);
        else setClubsList(list);
      } catch (e) { console.error(e); }
    };
    fetchClubs();
  }, [success]); 

  // ==========================================
  // MANUAL ENTRY LOGIC
  // ==========================================
  const handleManualEntry = () => {
      setFormData({}); 
      if (activeTab === 'clubs' && clubsList.length > 0) {
          setFormData({ clubName: clubsList[0] });
      }
      setStep(2); 
  };

  // ==========================================
  // AI & UPLOAD LOGIC
  // ==========================================
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAnalyzing(true); 

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        
        // Define Schemas
        let schema = "";
        if(activeTab === 'placements') schema = '{ "company": "...", "role": "...", "ctc": "...", "eligibility": "...", "deadline": "...", "details": "..." }';
        else if(activeTab === 'competitions') schema = '{ "eventName": "...", "organizer": "...", "scope": "...", "prizes": "...", "date": "...", "details": "..." }';
        else if(activeTab === 'notices') schema = '{ "title": "...", "date": "...", "targetYear": "...", "targetDept": "...", "details": "..." }';
        else schema = '{ "eventName": "...", "date": "...", "clubName": "...", "details": "..." }';

        const prompt = `Analyze Poster. Extract JSON: ${schema}. If a field is missing, leave it empty.`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: file.type, data: base64Data } }] }] })
        });

        const json = await response.json();
        if(json.error) throw new Error(json.error.message);
        
        const text = json.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
        let parsed = JSON.parse(text);
        
        // DATA NORMALIZER
        if (!parsed.details) parsed.details = parsed.description || parsed.summary || parsed.content || "";
        if (!parsed.title && parsed.eventName) parsed.title = parsed.eventName;

        // SANITIZE TARGET YEAR
        if (activeTab === 'notices') {
            const y = String(parsed.targetYear || "").toLowerCase();
            if (/[056789]/.test(y)) parsed.targetYear = "General"; 
            else if (y.includes("1")) parsed.targetYear = "1st Year"; 
            else if (y.includes("2")) parsed.targetYear = "2nd Year"; 
            else if (y.includes("3")) parsed.targetYear = "3rd Year"; 
            else if (y.includes("4")) parsed.targetYear = "4th Year"; 
            else parsed.targetYear = "General"; 
        }

        // SANITIZE TARGET DEPT
        if (activeTab === 'notices') {
             const d = String(parsed.targetDept || "").toLowerCase();
             const validDepts = ["CSE", "AIML", "AIDS", "ISE", "ECE", "EEE", "Mech", "Aero"];
             const match = validDepts.find(dept => d.includes(dept.toLowerCase()));
             parsed.targetDept = match || "All";
        }

        // Auto-match club
        if (activeTab === 'clubs' && !parsed.clubName) parsed.clubName = clubsList[0];

        setFormData(parsed);
        setAnalyzing(false); 
        setStep(2); 
      };
    } catch (error) { alert(error.message); setAnalyzing(false); }
  };

  const handlePost = async () => {
    setLoading(true);
    try {
      if (activeTab === 'create_club') {
         await addDoc(collection(db, 'club_profiles'), {
            name: formData.name, category: formData.category, desc: formData.desc, timestamp: new Date()
         });
         alert("✅ New Club Created!");
      } else {
         let collectionName = activeTab; 
         let payload = { ...formData, timestamp: new Date(), category: activeTab };

         if (activeTab === 'clubs') {
            payload.organizer = formData.clubName;
            payload.name = formData.eventName;
         } else if (activeTab === 'competitions') {
            payload.name = formData.eventName;
         } else if (activeTab === 'notices') {
            payload.targetYear = formData.targetYear || "General";
            payload.targetDept = formData.targetDept || "All";
         }
         
         // 1. ADD TO FIREBASE ONLY
         await addDoc(collection(db, collectionName), payload);

         // 2. SHOW SUCCESS MESSAGE (No API Sync)
         alert("✅ Event synced to Campus Calendar! \n\nTo add this to your personal Google Calendar, please visit the 'Calendar' page.");
      }
      
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setStep(1); setFormData({}); }, 1000);
    } catch (error) { alert(error.message); }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen pb-32 flex flex-col items-center transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Admin Upload</h1>

      {!analyzing && step === 1 && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            { id: 'notices', icon: Megaphone, label: 'Notices' },
            { id: 'clubs', icon: Users, label: 'Clubs' },
            { id: 'competitions', icon: Trophy, label: 'Contests' },
            { id: 'placements', icon: Briefcase, label: 'Jobs' },
            { id: 'create_club', icon: PlusCircle, label: 'Add Club' }
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setStep(1); }} className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-transparent dark:border-gray-800'}`}>
              <tab.icon size={16}/> {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'create_club' ? (
         <div className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl space-y-4 animate-in fade-in border dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Register New Club</h2>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Club Name</label><input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none" placeholder="e.g. Robotics Club"/></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Category</label><input value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none" placeholder="e.g. Tech / Art"/></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Description</label><textarea value={formData.desc || ''} onChange={(e) => setFormData({...formData, desc: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 text-sm h-20 resize-none bg-transparent text-gray-900 dark:text-white focus:outline-none" placeholder="Short tagline..."/></div>
            <button onClick={handlePost} disabled={loading} className="w-full py-3 bg-black dark:bg-blue-600 text-white rounded-xl font-bold mt-4">{loading ? <Loader2 className="animate-spin mx-auto"/> : "Create Club"}</button>
         </div>
      ) : (
        analyzing ? (
            <div className="w-full max-w-md h-72 bg-white dark:bg-gray-900 rounded-3xl shadow-xl flex flex-col items-center justify-center animate-in fade-in border dark:border-gray-800"><Sparkles className="h-10 w-10 text-blue-600 animate-pulse" /><h2 className="mt-4 font-bold text-gray-900 dark:text-white">AI is Analyzing...</h2></div>
        ) : step === 1 ? (
            <div className="w-full max-w-md flex flex-col gap-4">
                <label className="w-full h-56 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <Upload className="text-blue-600 h-8 w-8 mb-4" /><p className="font-bold text-gray-600 dark:text-gray-300 text-lg">Upload {activeTab} Poster</p><input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
                <div className="flex items-center w-full"><div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div><span className="px-3 text-gray-400 text-xs font-bold uppercase">OR</span><div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div></div>
                <button onClick={handleManualEntry} className="w-full py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"><PenTool size={18} /> Enter Details Manually</button>
            </div>
        ) : (
            <div className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl space-y-4 border dark:border-gray-800">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold capitalize text-gray-900 dark:text-white">{activeTab} Details</h2><button onClick={() => setStep(1)} className="text-sm text-blue-500 font-bold">Change</button></div>

            {activeTab === 'clubs' && (
                <>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase">Select Club</label><select value={formData.clubName || ''} onChange={(e) => setFormData({...formData, clubName: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-blue-600 dark:text-blue-400 cursor-pointer focus:outline-none">{clubsList.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase">Event Name</label><input value={formData.eventName || ''} onChange={(e) => setFormData({...formData, eventName: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none"/></div>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase">Venue</label><input value={formData.venue || ''} onChange={(e) => setFormData({...formData, venue: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none"/></div>
                </>
            )}

            {activeTab === 'competitions' && (
               <>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase">Event Name</label><input value={formData.eventName || ''} onChange={(e) => setFormData({...formData, eventName: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none"/></div>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase">Organizer</label><input value={formData.organizer || ''} onChange={(e) => setFormData({...formData, organizer: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none" placeholder="e.g. Student Council"/></div>
                <div className="flex gap-4">
                   <div className="flex-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Scope</label><input value={formData.scope || ''} onChange={(e) => setFormData({...formData, scope: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none" placeholder="Inter/Intra"/></div>
                   <div className="flex-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Prizes</label><input value={formData.prizes || ''} onChange={(e) => setFormData({...formData, prizes: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none" placeholder="₹10k"/></div>
                </div>
               </>
            )}
            
            {activeTab === 'notices' && (
                <>
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase">Title</label><input value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none"/></div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Year</label>
                            <select value={formData.targetYear || "General"} onChange={(e) => setFormData({...formData, targetYear: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none">
                                <option value="General" className="text-black">General (All Years)</option>
                                <option value="1st Year" className="text-black">1st Year</option>
                                <option value="2nd Year" className="text-black">2nd Year</option>
                                <option value="3rd Year" className="text-black">3rd Year</option>
                                <option value="4th Year" className="text-black">4th Year</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Dept</label>
                            <select value={formData.targetDept || "All"} onChange={(e) => setFormData({...formData, targetDept: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none">
                                <option value="All" className="text-black">All Depts</option>
                                <option value="CSE" className="text-black">CSE</option>
                                <option value="AIML" className="text-black">AIML</option>
                                <option value="AIDS" className="text-black">AIDS</option>
                                <option value="ISE" className="text-black">ISE</option>
                                <option value="ECE" className="text-black">ECE</option>
                                <option value="EEE" className="text-black">EEE</option>
                                <option value="Mech" className="text-black">Mech</option>
                                <option value="Aero" className="text-black">Aero</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'placements' && (
                <>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase">Company</label><input value={formData.company || ''} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none"/></div>
                <div className="flex gap-4">
                   <div className="flex-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Role</label><input value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none"/></div>
                   <div className="flex-1"><label className="text-[10px] font-bold text-gray-400 uppercase">CTC</label><input value={formData.ctc || ''} onChange={(e) => setFormData({...formData, ctc: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none"/></div>
                </div>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase">Eligibility</label><input value={formData.eligibility || ''} onChange={(e) => setFormData({...formData, eligibility: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none" placeholder="e.g. CSE, CGPA > 8.0"/></div>
                </>
            )}

            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Date/Deadline</label><input value={formData.date || formData.deadline || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none" placeholder="YYYY-MM-DD"/></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Details</label><textarea value={formData.details || ''} onChange={(e) => setFormData({...formData, details: e.target.value})} className="w-full py-2 border-b border-gray-200 dark:border-gray-700 text-sm h-20 resize-none bg-transparent text-gray-900 dark:text-white focus:outline-none"/></div>

            <div className="flex gap-2 mt-4"><button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-gray-500 dark:text-gray-400">Cancel</button><button onClick={handlePost} disabled={loading} className="flex-1 py-3 bg-gray-900 dark:bg-blue-600 text-white rounded-xl font-bold flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin"/> : "Confirm Post"}</button></div>
            </div>
        )
      )}
    </div>
  );
};

export default Admin;