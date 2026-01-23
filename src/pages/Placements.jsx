import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Briefcase, Calendar, ChevronLeft, Search, Loader2, DollarSign } from 'lucide-react';

const Placements = ({ setPage }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 🟢 1. NORMALIZER
  const normalize = (str) => {
    return String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = await getDocs(collection(db, 'placements'));
        const list = q.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        setJobs(list);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(j => {
      const s = normalize(search);
      return normalize(j.company).includes(s) || normalize(j.role).includes(s);
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-24 transition-colors duration-300">
      
      <div className="bg-green-600 dark:bg-green-800 p-6 rounded-b-3xl shadow-lg text-white sticky top-0 z-10 transition-colors">
        <button onClick={() => setPage('home')} className="flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors">
            <ChevronLeft size={20} /> Back
        </button>
        <h1 className="text-3xl font-bold">Placement Cell</h1>
      </div>

      <div className="p-4">
         <div className="relative">
            
            <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
            
            <input 
                type="text" 
                placeholder="Search companies, roles..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            />
         </div>
      </div>

      <div className="px-4 space-y-4">
         {loading ? (
             <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-green-600 dark:text-green-400"/></div>
         ) : filteredJobs.length === 0 ? (
             <div className="text-center text-gray-400 dark:text-gray-500">No drives found.</div>
         ) : (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border-l-4 border-green-500 dark:border-green-500 transition-colors">
                 <div className="flex justify-between items-start">
                     <h3 className="font-bold text-gray-800 dark:text-white text-xl transition-colors">
                        {job.company}
                     </h3>
                     <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md text-xs font-bold uppercase transition-colors">
                        {job.role}
                     </span>
                 </div>
                 
                 <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 my-3">
                    <div className="flex items-center gap-1"><Calendar size={14}/> {job.date || job.deadline}</div>
                    <div className="flex items-center gap-1 text-gray-800 dark:text-gray-200 font-bold"><DollarSign size={14}/> {job.ctc}</div>
                 </div>
                 
                 <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm transition-colors">
                     <p className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">Eligibility</p>
                     <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {job.eligibility}
                     </p>
                 </div>
              </div>
            ))
         )}
      </div>
    </div>
  );
};
export default Placements;