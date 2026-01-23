import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-full shadow-xl transition-all duration-300 
                 bg-white text-gray-800 hover:bg-gray-100
                 dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700
                 border border-gray-200 dark:border-gray-700"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;