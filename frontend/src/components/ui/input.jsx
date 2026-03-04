import React from "react";

export const Input = React.forwardRef(
  ({ className = "", type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";