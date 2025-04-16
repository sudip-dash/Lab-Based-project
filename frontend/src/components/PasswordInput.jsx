import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({
  name,
  placeholder,
  onChange,
  required = false,
  minLength = 6,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [value, setValue] = useState("");

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(e); // pass back to parent
  };

  const isValid = value.length >= minLength;

  return (
    <div className="relative w-fit">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        onChange={handleInputChange}
        onBlur={() => setTouched(true)}
        required={required}
        className={`border p-2 m-2 rounded-lg pr-20 ${
          touched && !isValid ? "border-red-500" : "border-black"
        }`}
      />

      {/* Eye Icon and Show/Hide label */}
      <span
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer text-gray-600 flex items-center gap-1"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
        <span className="text-sm">{showPassword ? "Hide" : "Show"}</span>
      </span>

      {/* Error message */}
      {touched && !isValid && (
        <div className="text-red-600 font-semibold ml-2 mt-1 text-sm">
          Password must be at least {minLength} characters long.
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
