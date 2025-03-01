import { useState } from "react";
import { FaMars, FaVenus, FaTransgender, FaTimes } from "react-icons/fa";

const UserForm = ({ onSubmit }) => {
  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const [user, setUser] = useState({ name: "", birthYear: "", genderFilter: "", interests: [] });
  const [interestInput, setInterestInput] = useState("");

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleGenderSelect = (gender) => {
    setUser({ ...user, genderFilter: gender });
  };

  const handleInterestAdd = (e) => {
    if (e.key === "Enter" && interestInput.trim() !== "") {
      e.preventDefault();
      setUser({ ...user, interests: [...user.interests, interestInput.trim()] });
      setInterestInput("");
    }
  };

  const handleInterestRemove = (interest) => {
    setUser({ ...user, interests: user.interests.filter((i) => i !== interest) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();  // Use onSubmit instead of props.onStartMatching
    } else {
      console.error("onSubmit is not provided to UserForm");
    }
  };
  
  

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 px-4">
      <h2 className="text-2xl font-semibold text-white text-center mb-6">
        Join Anonymous Chat
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 w-80 sm:w-96">
        {/* Name Input */}
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={user.name}
          onChange={handleChange}
          className="w-full p-3 bg-transparent text-white border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-300"
        />

        {/* Birth Year Dropdown */}
        <select
          name="birthYear"
          value={user.birthYear}
          onChange={handleChange}
          className="w-full p-3 bg-transparent text-white border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <option value="" className="text-gray-900">Select Birth Year</option>
          {birthYears.map((year) => (
            <option key={year} value={year} className="text-gray-900">{year}</option>
          ))}
        </select>

        {/* Gender Filter Tiles */}
        <div className="flex justify-between space-x-3">
          {[
            { gender: "man", label: "Man", icon: <FaMars size={20} /> },
            { gender: "both", label: "Both", icon: <FaTransgender size={20} /> },
            { gender: "woman", label: "Woman", icon: <FaVenus size={20} /> },
          ].map(({ gender, label, icon }) => (
            <button
              key={gender}
              type="button"
              onClick={() => handleGenderSelect(gender)}
              className={`flex flex-col items-center p-2 w-16 h-16 rounded-lg transition-all ${
                user.genderFilter === gender
                  ? "bg-white/20 text-white border border-white/40"
                  : "bg-transparent text-white border border-white/30 hover:bg-white/10"
              }`}
            >
              {icon}
              <span className="mt-1 text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Interests Input */}
        <div className="w-full bg-transparent border border-white/30 text-white rounded-lg p-3">
          <input
            type="text"
            placeholder="Add interests (press Enter)..."
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={handleInterestAdd}
            className="w-full bg-transparent focus:outline-none placeholder-gray-300"
          />
          <div className="flex flex-wrap mt-2">
            {user.interests.map((interest, index) => (
              <span
                key={index}
                className="flex items-center bg-white/20 text-white text-sm px-2 py-1 rounded-lg m-1"
              >
                {interest}
                <FaTimes
                  size={12}
                  className="ml-2 cursor-pointer"
                  onClick={() => handleInterestRemove(interest)}
                />
              </span>
            ))}
          </div>
        </div>

        {/* Submit Button */}
              <button
                  type="submit"
                  className={`w-full p-3 rounded-lg font-medium transition-all ${user.name && user.birthYear && user.genderFilter
                          ? "bg-white/20 text-white hover:bg-white/30"
                          : "bg-white/10 text-gray-400 cursor-not-allowed"
                      }`}
                  disabled={!user.name || !user.birthYear || !user.genderFilter}
              >
                  Start Chatting
              </button>
      </form>
    </div>
  );
};

export default UserForm;
