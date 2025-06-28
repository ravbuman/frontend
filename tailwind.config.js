/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4CAF50',
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
        },
        secondary: {
          light: '#A5D6A7',
          DEFAULT: '#81C784',
          dark: '#66BB6A',
        },
      },
    },
  },
  plugins: [],
  safelist: [
    // Background colors with hex values
    'bg-[#2ecc71]',
    'bg-[#27ae60]',
    'bg-[#f8faf8]',
    'bg-[#34495e]',
    'bg-[#a8e6cf]',
    'bg-[#f7fafc]',
    'bg-[#edf2f7]',
    'bg-[#e2e8f0]',
    'bg-[#718096]',
    'bg-[#4a5568]',
    'bg-[#ffffff]',
    'bg-[#fff]',
    
    // Text colors with hex values
    'text-[#2ecc71]',
    'text-[#27ae60]',
    'text-[#f8faf8]',
    'text-[#34495e]',
    'text-[#a8e6cf]',
    'text-[#f7fafc]',
    'text-[#edf2f7]',
    'text-[#e2e8f0]',
    'text-[#718096]',
    'text-[#4a5568]',
    'text-[#ffffff]',
    'text-[#fff]',
    
    // Shadow colors
    'shadow-[#2ecc71]/25',
    'shadow-[#2ecc71]/30',
    'shadow-[#2ecc71]/5',
    'shadow-[#2ecc71]/20',
    'shadow-red-500/25',
    
    // Border colors
    'border-[#2ecc71]/40',
    'border-[#2ecc71]/30',
    'border-green-100/50',
    'border-green-400/30',
    'border-red-400/40',
    
    // Gradient directions
    'bg-gradient-to-r',
    'bg-gradient-to-l',
    'bg-gradient-to-b',
    'bg-gradient-to-t',
    'bg-gradient-to-bl',
    'bg-gradient-to-br',
    'bg-gradient-to-tr',
    'bg-gradient-to-tl',
    
    // Gradient colors
    'from-[#2ecc71]',
    'to-[#27ae60]',
    'from-[#27ae60]',
    'to-[#2ecc71]',
    'from-[#2ecc71]/10',
    'to-[#27ae60]/5',
    'from-[#27ae60]/10',
    'to-[#2ecc71]/5',
    'from-[#2ecc71]/15',
    
    // Complex gradients
    'bg-gradient-to-r from-[#2ecc71] to-[#27ae60]',
    'bg-gradient-to-l from-[#27ae60] to-[#2ecc71]',
    'bg-gradient-to-br from-[#2ecc71]/15 to-transparent',
    
    // Background with opacity
    'bg-white/80',
    'bg-white/60',
    'bg-white/40',
    'bg-white/30',
    'bg-white/90',
    'bg-black/60',
    'bg-red-500/95',
    
    // Standard Tailwind colors
    'bg-green-50',
    'bg-emerald-50',
    'bg-green-100',
    'bg-green-100/50',
    'bg-green-400',
    'bg-green-700',
    'bg-green-600',
    'bg-emerald-600',
    'bg-blue-50/50',
    'bg-blue-100',
    'bg-blue-100/50',
    'bg-purple-100',
    'bg-purple-50',
    'bg-orange-100',
    'bg-orange-50',
    'bg-red-100',
    'bg-red-50',
    'bg-gray-50/50',
    'bg-gray-100/70',
    'bg-gray-100',
    'bg-gray-200',
    'bg-gray-300',
    'bg-gray-400',
    'bg-gray-500',
    'bg-gray-600',
    'bg-gray-700',
    'bg-gray-800',
    'bg-gray-900',
    'bg-white',
    
    // Text colors
    'text-white',
    'text-gray-600',
    'text-gray-700',
    'text-gray-800',
    'text-gray-900',
    'text-green-600',
    'text-green-700',
    'text-green-500',
    'text-emerald-500',
    'text-emerald-600',
    'text-blue-700',
    'text-blue-500',
    'text-purple-700',
    'text-purple-600',
    'text-orange-700',
    'text-orange-600',
    'text-red-700',
    'text-red-600',
    'text-red-500',
    'text-black',
    
    // Hover states
    'hover:bg-[#2ecc71]',
    'hover:bg-[#27ae60]',
    'hover:text-[#2ecc71]',
    'hover:text-[#27ae60]',
    'hover:bg-green-50',
    'hover:bg-red-50',
    'hover:bg-gray-50/50',
    'hover:bg-gray-100/70',
    'hover:bg-white',
    'hover:bg-[#f8faf8]',
    
    // Focus states
    'focus:bg-[#2ecc71]',
    'focus:text-[#2ecc71]',
    
    // Active states
    'active:bg-[#2ecc71]',
    'active:text-[#2ecc71]',
  ],
}
