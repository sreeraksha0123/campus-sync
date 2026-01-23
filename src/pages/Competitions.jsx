import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, Calendar, MapPin, ChevronLeft, Search, Loader2 } from 'lucide-react';

const Competitions = ({ setPage }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 1. NORMALIZER
  const normalize = (str) => {
    return String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = await getDocs(collection(db, 'competitions'));
        const list = q.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(list);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => {
      const s = normalize(search);
      return normalize(e.name).includes(s) || normalize(e.organizer).includes(s);
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-24 transition-colors duration-300">
      
      <div className="bg-orange-500 dark:bg-orange-800 p-6 rounded-b-3xl shadow-lg text-white sticky top-0 z-10 transition-colors">
        <button onClick={() => setPage('home')} className="flex items-center gap-2 text-orange-100 hover:text-white mb-4 transition-colors">
            <ChevronLeft size={20} /> Back to Home
        </button>
        <h1 className="text-3xl font-bold">Competitions</h1>
      </div>

      <div className="p-4">
         <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
            
            <input 
                type="text" 
                placeholder="Find hackathons, quizzes..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            />
         </div>
      </div>

      <div className="px-4 space-y-4">
         {loading ? (
             <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-orange-500"/></div>
         ) : filteredEvents.length === 0 ? (
             <div className="text-center text-gray-400 dark:text-gray-500">No competitions found.</div>
         ) : (
            filteredEvents.map(event => (
              // CARD: Added dark background and text
              <div key={event.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border-l-4 border-orange-500 dark:border-orange-500 transition-colors">
                 
                 <h3 className="font-bold text-gray-800 dark:text-white text-lg transition-colors">
                    {event.name}
                 </h3>
                 
                 <p className="text-xs font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wide mb-2">
                    {event.organizer} • {event.scope}
                 </p>
                 
                 <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1"><Calendar size={14}/> {event.date}</div>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold"><Trophy size={14}/> {event.prizes}</div>
                 </div>
                 
                 <p className="text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg leading-relaxed transition-colors">
                    {event.description || event.details}
                 </p>
              </div>
            ))
         )}
      </div>
    </div>
  );
};
export default Competitions;