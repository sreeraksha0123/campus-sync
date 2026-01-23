import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Loader2, User, Lock } from 'lucide-react'; // Changed Mail icon to User
import { motion } from 'framer-motion';

const Login = ({ switchToSignup }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ usn: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await login(formData.usn, formData.password);
    } catch (error) {
        alert("Login Failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-b-[50%] scale-150 -translate-y-10 opacity-20"></div>

        <div className="relative z-10 mt-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl mb-6">
                <LayoutDashboard size={40} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Campus Sync</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Welcome back, Student.</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* 🟢 USN Input */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex items-center gap-3 border border-transparent focus-within:border-indigo-500 transition-colors">
                    <User className="text-gray-400"/>
                    <input 
                        required 
                        placeholder="Enter USN (e.g. 1DS23CS001)" 
                        className="bg-transparent w-full outline-none font-bold text-gray-900 dark:text-white uppercase placeholder-gray-400"
                        value={formData.usn} 
                        onChange={e => setFormData({...formData, usn: e.target.value})} 
                    />
                </div>
                
                {/* Password Input */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex items-center gap-3 border border-transparent focus-within:border-indigo-500 transition-colors">
                    <Lock className="text-gray-400"/>
                    <input 
                        required 
                        type="password" 
                        placeholder="Password" 
                        className="bg-transparent w-full outline-none font-bold text-gray-900 dark:text-white placeholder-gray-400"
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 hover:shadow-2xl transition-all"
                >
                    {loading ? <Loader2 className="animate-spin"/> : "Log In"}
                </motion.button>
            </form>

            <p className="text-sm text-gray-500 mt-6">
                New here? <button onClick={switchToSignup} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Create an account</button>
            </p>
        </div>
      </div>
    </div>
  );
};
export default Login;