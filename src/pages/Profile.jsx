import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Key, LogOut } from 'lucide-react';

const Profile = ({ setPage }) => {
  const { userData, logout, changeUserPassword } = useAuth();
  const [newPass, setNewPass] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogout = async () => {
    await logout();
    // App wrapper will redirect to Login automatically
  };

  const handlePasswordChange = async () => {
    try {
      await changeUserPassword(newPass);
      setMsg("Password Updated!");
      setNewPass('');
    } catch (e) {
      setMsg("Error: " + e.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen pb-24 transition-colors duration-300">
      
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-colors">My Profile</h1>

      {/* User Info Card */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm mb-6 border border-gray-200 dark:border-gray-800 transition-colors">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400 transition-colors">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                {userData?.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 capitalize transition-colors">
                {userData?.role}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 transition-colors">
          <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-2 transition-colors">
            <span>ID (USN/Emp):</span> 
            <span className="font-bold text-gray-900 dark:text-white">{userData?.identifier}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-2 transition-colors">
            <span>Department:</span> 
            <span className="font-bold text-gray-900 dark:text-white">{userData?.department}</span>
          </div>
          {userData?.role === 'student' && (
             <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-2 transition-colors">
               <span>Year:</span> 
               <span className="font-bold text-gray-900 dark:text-white">{userData?.year}</span>
             </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white transition-colors">
            <Key size={18} /> Change Password
        </h3>
        
        <input 
          type="password" 
          value={newPass} 
          onChange={(e) => setNewPass(e.target.value)} 
          placeholder="New Password" 
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
        />
        
        <button onClick={handlePasswordChange} className="bg-gray-800 dark:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors hover:opacity-90">
            Update
        </button>
        
        {msg && <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-bold transition-colors">{msg}</p>}
      </div>

      <button onClick={handleLogout} className="w-full mt-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
};

export default Profile;