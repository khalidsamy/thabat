import React from 'react';

const Button = ({ children, isLoading, className = '', ...props }) => {
  return (
    <button
      disabled={isLoading}
      className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white tracking-wide bg-gradient-to-r from-emerald-600 to-primary hover:from-emerald-500 hover:to-emerald-400 focus:outline-none focus:ring-4 focus:ring-primary/30 active:scale-[0.98] hover:scale-[1.01] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md transition-all duration-300 ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ms-1 me-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};

export default Button;
