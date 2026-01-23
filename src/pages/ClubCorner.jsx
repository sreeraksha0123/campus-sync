import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore'; 
import { db } from '../firebase';
import { Users, ChevronLeft, Calendar, MapPin, Loader2, Clock, Plus, X, CheckCircle } from 'lucide-react';

const ClubCorner = ({ setPage }) => {
  const [view, setView] = useState('list');
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [filter, setFilter] = useState('All'); 
  const [loading, setLoading] = useState(false);
  
  // Dynamic Club List
  const [clubs, setClubs] = useState([]);
  
  // Add Club Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClub, setNewClub] = useState({ name: '', category: 'Tech', desc: '' });
  const [isAdding, setIsAdding] = useState(false);

  // 1. NORMALIZER (Logic Kept)
  const normalize = (str) => {
    return String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  // 2. FETCH CLUBS
  const fetchClubs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'club_profiles'));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if(list.length === 0) {
            setClubs([{ id: '1', name: 'Bitwise Coding Club', category: 'Tech', desc: 'Coding the future.' }]);
        } else {
            setClubs(list);
        }
      } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // 3. FETCH EVENTS
  useEffect(() => {
    if (selectedClub) {
      const fetchEvents = async () => {
        setLoading(true);
        try {
          const snapshot = await getDocs(collection(db, "clubs"));
          const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const myEvents = allEvents.filter(event => {
             const dbOrg = normalize(event.organizer);
             const selectedOrg = normalize(selectedClub.name);
             return dbOrg.includes(selectedOrg) || selectedOrg.includes(dbOrg);
          });

          myEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
          setClubEvents(myEvents);
        } catch (error) { console.error(error); }
        setLoading(false);
      };
      fetchEvents();
    }
  }, [selectedClub]);

  // 4. HANDLE ADD NEW CLUB
  const handleAddClub = async () => {
    if (!newClub.name || !newClub.desc) return alert("Please fill all fields");
    setIsAdding(true);
    try {
        await addDoc(collection(db, 'club_profiles'), {
            name: newClub.name,
            category: newClub.category,
            desc: newClub.desc,
            timestamp: new Date()
        });
        
        setShowAddModal(false);
        setNewClub({ name: '', category: 'Tech', desc: '' });
        await fetchClubs(); 
        alert("✅ Club Added Successfully!");
    } catch (error) {
        alert("Error: " + error.message);
    }
    setIsAdding(false);
  };

  const getFilteredEvents = () => {
    const now = new Date(); now.setHours(0,0,0,0);
    return clubEvents.filter(event => {
      const eventDate = new Date(event.date); 
      if (isNaN(eventDate.getTime())) return true; 

      if (filter === 'All') return true;
      if (filter === 'Upcoming') return eventDate >= now;
      if (filter === 'Past') return eventDate < now;
      return true;
    });
  };

  // --- VIEW 1: CLUB LIST ---
  if (view === 'list') {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-950 min-h-screen pb-24 relative transition-colors duration-300">
        
        {/* BACK TO HOME BUTTON */}
        <div className="p-4">
          <button 
            onClick={() => setPage('home')} 
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-bold mb-4"
          >
            <ChevronLeft size={20} /> Back to Dashboard
          </button>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 pl-4">Student Clubs</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-4">
          {/* Create Club Button */}
          <button 
             onClick={() => setShowAddModal(true)}
             className="w-full bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800 p-6 rounded-2xl flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"
          >
             <Plus size={24} />
             <span>Create New Club</span>
          </button>

          {/* Club Cards */}
          {clubs.map(club => (
            <div key={club.id} onClick={() => { setSelectedClub(club); setView('details'); }} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between cursor-pointer active:scale-95 transition-transform hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${club.category === 'Tech' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'}`}>
                    <Users size={24} />
                </div>
                <div>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white">{club.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{club.desc}</p>
                </div>
              </div>
              <ChevronLeft className="rotate-180 text-gray-300 dark:text-gray-600" />
            </div>
          ))}
        </div>

        {/* MODAL */}
        {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 border dark:border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Club</h2>
                        <button onClick={() => setShowAddModal(false)} className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <X size={20} className="text-gray-500 dark:text-gray-400"/>
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Club Name</label>
                            <input 
                                value={newClub.name} 
                                onChange={(e) => setNewClub({...newClub, name: e.target.value})}
                                className="w-full border-b-2 border-gray-200 dark:border-gray-700 bg-transparent py-2 font-bold text-gray-800 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
                                placeholder="e.g. Robotics Club"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                            <select 
                                value={newClub.category}
                                onChange={(e) => setNewClub({...newClub, category: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-1 text-sm font-bold text-gray-700 dark:text-white outline-none border border-transparent dark:border-gray-700"
                            >
                                <option value="Tech">Tech</option>
                                <option value="Art">Art</option>
                                <option value="Music">Music</option>
                                <option value="Sports">Sports</option>
                                <option value="Social">Social</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Tagline</label>
                            <input 
                                value={newClub.desc} 
                                onChange={(e) => setNewClub({...newClub, desc: e.target.value})}
                                className="w-full border-b-2 border-gray-200 dark:border-gray-700 bg-transparent py-2 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
                                placeholder="e.g. Building the future..."
                            />
                        </div>
                        <button 
                            onClick={handleAddClub} 
                            disabled={isAdding}
                            className="w-full bg-black dark:bg-blue-600 text-white py-3 rounded-xl font-bold mt-2 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            {isAdding ? <Loader2 className="animate-spin"/> : <><CheckCircle size={18}/> Create Club</>}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: DETAILS ---
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-24 transition-colors duration-300">
      
      <div className="bg-gray-900 dark:bg-black text-white p-6 rounded-b-3xl shadow-xl sticky top-0 z-10">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white transition-colors"><ChevronLeft size={20} /> Back to Clubs</button>
        <h1 className="text-3xl font-bold">{selectedClub.name}</h1>
        <p className="text-gray-400 mt-1">{selectedClub.desc}</p>
      </div>
      
      {/* Filters */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {['All', 'Upcoming', 'Past'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === f ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>{f}</button>
        ))}
      </div>
      
      {/* Event List */}
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {loading ? (
            <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-blue-500"/></div>
        ) : getFilteredEvents().length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 mt-10">No {filter} events found.</div>
        ) : (
          getFilteredEvents().map(event => (
            <div key={event.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border-l-4 border-blue-500 dark:border-blue-400 transition-colors">
              <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">{event.name}</h3>
                  {normalize(event.organizer) !== normalize(selectedClub.name) && (
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full whitespace-nowrap">via {event.organizer}</span>
                  )}
              </div>
              
              <div className="flex flex-col gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2 font-medium"><Calendar size={16} className="text-blue-500" /> {event.date}</div>
                {event.time && <div className="flex items-center gap-2 font-medium"><Clock size={16} className="text-orange-500" /> {event.time}</div>}
                <div className="flex items-center gap-2 font-medium"><MapPin size={16} className="text-red-500" /> {event.venue || 'Campus Hall'}</div>
              </div>
              
              <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg leading-relaxed">{event.description || event.desc || event.details}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClubCorner;