import { useState, useEffect, useRef } from "react";

const SearchInput = ({ value, onChange, placeholder, debounceMs = 300, className }) => {
  const [newValue, setValue] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  return (
    <input
      placeholder={placeholder}
      value={newValue}
      onChange={handleChange}
      className={`flex h-10 w-full rounded-md border border-neutrals-40 bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-neutrals-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
    />
  );
};

export default SearchInput;