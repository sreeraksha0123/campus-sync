import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore'; 
import { db } from '../firebase';
import { BookOpen, Calendar, ChevronLeft, Search, Loader2, Info } from 'lucide-react';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'Civil', 'ISE', 'AIML', 'AIDS', 'Aero'];

const Notices = ({ setPage }) => {
  const { userData } = useAuth(); 
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [search, setSearch] = useState('');

  // 1. THE ULTIMATE NORMALIZER (Logic Kept Intact)
  const normalize = (str) => {
    return String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  useEffect(() => {
    if (userData) {
        if (userData.department) setDeptFilter(userData.department);
        // Smart Year Logic
        if (userData.year) {
            const y = String(userData.year);
            if (/[056789]/.test(y)) setYearFilter("All");
            else if (y.includes("1")) setYearFilter("1st Year");
            else if (y.includes("2")) setYearFilter("2nd Year");
            else if (y.includes("3")) setYearFilter("3rd Year");
            else if (y.includes("4")) setYearFilter("4th Year");
            else setYearFilter("All");
        } else { setYearFilter("All"); }
    }
  }, [userData]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const q = await getDocs(collection(db, 'notices'));
        const list = q.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNotices(list);
      } catch (error) { console.error(error); }
      setLoading(false);
    };
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter(notice => {
    const deptMatch = (deptFilter === 'All') ? (notice.targetDept === 'All') : (notice.targetDept === 'All' || notice.targetDept === deptFilter);
    const yearMatch = (yearFilter === 'All') ? (notice.targetYear === 'General') : (notice.targetYear === 'General' || notice.targetYear === yearFilter);

    const searchTerm = normalize(search);
    const titleMatch = normalize(notice.title).includes(searchTerm);
    const detailMatch = normalize(notice.details).includes(searchTerm);

    return deptMatch && yearMatch && (titleMatch || detailMatch);
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-24 font-sans transition-colors duration-300">
      
      <div className="bg-blue-600 dark:bg-blue-900 p-6 rounded-b-3xl shadow-lg text-white sticky top-0 z-10 transition-colors">
        <button onClick={() => setPage('home')} className="flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors">
            <ChevronLeft size={20} /> Back to Home
        </button>
        <h1 className="text-3xl font-bold">Academic Board</h1>
        <p className="text-blue-100 opacity-80 text-sm mt-1">
            Viewing <span className="font-bold text-white underline decoration-blue-300 underline-offset-4">{deptFilter} • {yearFilter}</span>
        </p>
      </div>

      <div className="p-4 space-y-3"> 
         <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
            <input 
                type="text" 
                placeholder="Search notices..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            />
         </div>

         <div className="flex gap-2">
            <select 
                value={deptFilter} 
                onChange={(e) => setDeptFilter(e.target.value)} 
                className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-200 text-sm shadow-sm outline-none focus:border-blue-500 transition-colors"
            >
               <option value="All">General Notices (All)</option>
               {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>

            <select 
                value={yearFilter} 
                onChange={(e) => setYearFilter(e.target.value)} 
                className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-200 text-sm shadow-sm outline-none focus:border-blue-500 transition-colors"
            >
               <option value="All">General (All Years)</option>
               <option value="1st Year">1st Year</option>
               <option value="2nd Year">2nd Year</option>
               <option value="3rd Year">3rd Year</option>
               <option value="4th Year">4th Year</option>
            </select>
         </div>
      </div>
      
      <div className="px-4 space-y-4">
        {loading ? (
            <div className="flex justify-center mt-12"><Loader2 className="animate-spin text-blue-600 dark:text-blue-400"/></div>
        ) : filteredNotices.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 mt-10">No notices found.</div>
        ) : (
           filteredNotices.map((notice) => (
             // CARD: Added dark background, border, and text colors
             <div key={notice.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors">
                
                {/* Side Color Bar */}
                <div className={`absolute top-0 left-0 w-1 h-full ${notice.targetDept === 'All' ? 'bg-orange-400' : 'bg-blue-500'}`}></div>
                
                <div className="flex justify-between items-start mb-2">
                   <div className="flex gap-2">
                        {/* Tags: Added dark mode transparency */}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${notice.targetDept === 'All' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'}`}>
                            {notice.targetDept === 'All' ? 'General' : notice.targetDept}
                        </span>
                   </div>
                   <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs font-medium">
                        <Calendar size={12} /> {notice.date}
                   </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight mb-2 transition-colors">
                    {notice.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line transition-colors">
                    {notice.details}
                </p>
             </div>
           ))
        )}
      </div>
    </div>
  );
};
export default Notices;