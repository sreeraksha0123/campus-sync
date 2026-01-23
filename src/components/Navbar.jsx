import { Home, PlusCircle, User, Calendar } from 'lucide-react';

const Navbar = ({ setPage }) => {
  //const { userData } = useAuth();
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-50">
      
      {/* Home */}
      <button onClick={() => setPage('home')} className="bg-white text-gray-600 px-5 py-3 rounded-full shadow-lg border">
        <Home size={24} />
      </button>

      {/*Calendar Button */}
      <button 
        onClick={() => setPage('calendar')} 
        className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
      >
        <Calendar size={24} />
      </button>

      <button 
        onClick={() => setPage('admin')} 
        className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <PlusCircle size={28} />
      </button>

      {/* Profile Button */}
      <button onClick={() => setPage('profile')} className="bg-white text-gray-600 px-5 py-3 rounded-full shadow-lg border">
        <User size={24} />
      </button>

    </div>
  );
};

export default Navbar;