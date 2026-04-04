import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, id, error, icon, type = 'text', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-5 flex flex-col items-start w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-semibold tracking-wide text-secondary-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      
      <div className="relative group w-full">
        {/* Left Icon (if provided) */}
        {icon && (
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300">
            {icon}
          </div>
        )}

        <input
          id={id}
          type={currentType}
          className={`appearance-none block w-full py-3.5 border rounded-xl shadow-sm bg-card placeholder-gray-400 focus:outline-none text-sm transition-all duration-200
            ${icon ? 'ps-11' : 'ps-4'}
            ${isPassword ? 'pe-11' : 'pe-4'}
            ${error 
              ? 'border-destructive focus:ring-4 focus:ring-destructive/20 focus:border-destructive' 
              : 'border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary'}
          `}
          {...props}
        />

        {/* Password Visibility Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-400 hover:text-emerald-600 focus:outline-none transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-destructive font-medium animate-pulse">{error}</p>}
    </div>
  );
};

export default Input;
