import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, User, BookOpen, Hash, GraduationCap, Lock } from 'lucide-react';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'Civil', 'ISE', 'AIML', 'AIDS', 'Aero'];

const Signup = ({ switchToLogin }) => {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', password: '', usn: '', department: 'CSE', year: '1st Year'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await signup(formData.usn, formData.password, {
            name: formData.name,
            department: formData.department,
            year: formData.year
        });
    } catch (error) {
        alert("Signup Failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
       <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl p-8 border border-gray-100 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6 text-sm">Join Campus Sync today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
             {/* Name */}
             <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex items-center gap-3">
                <User size={18} className="text-gray-400"/>
                <input required placeholder="Full Name" className="bg-transparent w-full outline-none font-bold text-gray-900 dark:text-white placeholder-gray-400"
                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             </div>

             {/* USN */}
             <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex items-center gap-3">
                <Hash size={18} className="text-gray-400"/>
                <input required placeholder="USN (e.g. 1DS23CS001)" className="bg-transparent w-full outline-none font-bold text-gray-900 dark:text-white uppercase placeholder-gray-400"
                   value={formData.usn} onChange={e => setFormData({...formData, usn: e.target.value})} />
             </div>

             {/* Password */}
             <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex items-center gap-3">
                <Lock size={18} className="text-gray-400"/>
                <input required type="password" placeholder="Password (Min 6 chars)" className="bg-transparent w-full outline-none font-bold text-gray-900 dark:text-white placeholder-gray-400"
                   value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
             </div>

             <div className="flex gap-2">
                {/* Department */}
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex-1 flex items-center gap-2">
                    <BookOpen size={18} className="text-gray-400"/>
                    <select 
                        className="bg-transparent w-full outline-none font-bold text-gray-900 dark:text-white text-sm cursor-pointer"
                        value={formData.department} 
                        onChange={e => setFormData({...formData, department: e.target.value})}
                    >
                        {/* 🟢 FIXED: Added text-black to ensure visibility in dropdowns */}
                        {DEPARTMENTS.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
                    </select>
                </div>

                {/* Year */}
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex-1 flex items-center gap-2">
                    <GraduationCap size={18} className="text-gray-400"/>
                    <select 
                        className="bg-transparent w-full outline-none font-bold text-gray-900 dark:text-white text-sm cursor-pointer"
                        value={formData.year} 
                        onChange={e => setFormData({...formData, year: e.target.value})}
                    >
                        {/* 🟢 FIXED: Added text-black */}
                        <option className="text-black">1st Year</option>
                        <option className="text-black">2nd Year</option>
                        <option className="text-black">3rd Year</option>
                        <option className="text-black">4th Year</option>
                    </select>
                </div>
             </div>

             <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                {loading ? <Loader2 className="animate-spin"/> : "Sign Up"}
             </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
             Already have an account? <button onClick={switchToLogin} className="text-blue-600 font-bold hover:underline">Log in</button>
          </p>
       </div>
    </div>
  );
};
export default Signup;