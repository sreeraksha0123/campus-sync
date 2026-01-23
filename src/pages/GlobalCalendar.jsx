import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ChevronLeft, ChevronRight, Loader2, MapPin, Clock, CalendarPlus } from 'lucide-react';

const GlobalCalendar = ({ setPage }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({}); 
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const toLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().split('T')[0];
  };

  const parseDate = (raw) => {
    if (!raw) return null;
    let str = String(raw).trim();

    
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    try {
        str = str.replace(/^(sun|mon|tue|wed|thu|fri|sat)[a-z]*,?\s*/i, '');
        str = str.replace(/(\d+)(st|nd|rd|th)/gi, '$1');

        if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(str)) {
            const parts = str.split(/[/-]/);
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }

        let dateObj = new Date(str);
        if (!isNaN(dateObj.getTime())) {
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        return null;
    } catch (e) { return null; }
  };

  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const addToGoogleCalendar = (ev) => {
    const startStr = ev.startDate || ev.date;
    const endStr = ev.endDate || ev.date; 

    const startDate = startStr.replace(/-/g, '');
    
    let endDateObj = new Date(endStr);
    endDateObj.setDate(endDateObj.getDate() + 1); 
    
    const y = endDateObj.getFullYear();
    const m = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const d = String(endDateObj.getDate()).padStart(2, '0');
    const endDate = `${y}${m}${d}`;

    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', ev.title);
    googleUrl.searchParams.append('dates', `${startDate}/${endDate}`);
    googleUrl.searchParams.append('details', ev.desc || "Event via Campus Sync");
    googleUrl.searchParams.append('location', ev.venue || "College Campus");

    window.open(googleUrl.toString(), '_blank');
  };

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const collections = ['notices', 'clubs', 'competitions', 'placements'];
        const results = await Promise.all(collections.map(c => getDocs(collection(db, c))));
        
        let mergedEvents = {};

        results.forEach((snapshot, index) => {
          const type = collections[index];
          snapshot.docs.forEach(doc => {
            const data = doc.data();

            const rawStart = data.date || data.startDate || data.eventDate || data.deadline || data.timestamp?.toDate?.()?.toISOString().split('T')[0];
            const validStart = parseDate(rawStart);

            const rawEnd = data.endDate || data.toDate || data.deadline; 
            const validEnd = rawEnd ? parseDate(rawEnd) : null;

            if (validStart) {
                const eventObj = {
                    id: doc.id,
                    type: type, 
                    title: data.title || data.name || data.eventName || data.company || "Untitled Event",
                    desc: data.details || data.desc || data.role || data.description || "",
                    time: data.time || "",
                    venue: data.venue || "",
                    startDate: validStart,
                    endDate: validEnd || validStart
                };

                let dateRange = [validStart];
                if (validEnd && validEnd !== validStart) {
                    dateRange = getDatesInRange(validStart, validEnd);
                }

                dateRange.forEach(dateKey => {
                    if (!mergedEvents[dateKey]) mergedEvents[dateKey] = [];
                    const exists = mergedEvents[dateKey].some(e => e.id === eventObj.id);
                    if (!exists) mergedEvents[dateKey].push(eventObj);
                });
            }
          });
        });
        setEvents(mergedEvents);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      }
      setLoading(false);
    };
    fetchAllEvents();
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formatDateKey = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  const getTypeColor = (type) => {
    if (type === 'clubs') return 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300';
    if (type === 'notices') return 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300';
    if (type === 'competitions') return 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300';
    if (type === 'placements') return 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300';
    return 'bg-gray-100';
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-32 transition-colors duration-300">
      
      <div className="bg-white dark:bg-gray-900 p-6 rounded-b-3xl shadow-lg sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => setPage('home')} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <ChevronLeft size={20} /> Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Master Schedule</h1>
        </div>
        <div className="flex justify-between items-center">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:scale-110 transition-transform dark:text-white"><ChevronLeft/></button>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white">{monthNames[month]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:scale-110 transition-transform dark:text-white"><ChevronRight/></button>
        </div>
      </div>

      <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        
        {/* CALENDAR GRID */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-7 mb-4 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-xs font-bold text-gray-400 uppercase tracking-wider">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateKey = formatDateKey(day);
                    const hasEvents = events[dateKey];
                    const isSelected = selectedDate === dateKey;

                    return (
                        <div 
                            key={day} 
                            onClick={() => setSelectedDate(dateKey)}
                            className={`
                                relative h-14 md:h-24 rounded-2xl border flex flex-col items-start justify-start p-2 cursor-pointer transition-all
                                ${isSelected 
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105 z-10' 
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500'}
                            `}
                        >
                            <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>{day}</span>
                            <div className="flex gap-1 mt-auto flex-wrap content-end w-full">
                                {hasEvents && hasEvents.slice(0, 3).map((ev, idx) => (
                                    <div key={idx} className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : (ev.type === 'placements' ? 'bg-green-500' : ev.type === 'clubs' ? 'bg-purple-500' : ev.type === 'competitions' ? 'bg-orange-500' : 'bg-blue-500')}`} />
                                ))}
                                {hasEvents && hasEvents.length > 3 && <span className="text-[8px] opacity-50">+</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* EVENTS LIST SIDEBAR */}
        <div className="w-full lg:w-1/3 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Events for <span className="text-blue-600 dark:text-blue-400">{selectedDate}</span>
            </h3>

            {loading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600 dark:text-blue-400"/></div>
            ) : !events[selectedDate] ? (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-400">
                    No events scheduled for this day.
                </div>
            ) : (
                events[selectedDate].map((ev, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform group">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getTypeColor(ev.type)}`}>
                                {ev.type}
                            </span>
                            {ev.time && <div className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12}/> {ev.time}</div>}
                        </div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-lg leading-tight">{ev.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{ev.desc}</p>
                        {ev.venue && <div className="mt-3 flex items-center gap-1 text-xs font-bold text-gray-400"><MapPin size={12}/> {ev.venue}</div>}
                        
                        <button 
                           onClick={() => addToGoogleCalendar(ev)}
                           className="w-full mt-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                           <CalendarPlus size={16} /> Add to Google Calendar
                        </button>
                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
};

export default GlobalCalendar;