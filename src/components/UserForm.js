import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMars, FaVenus, FaTransgender, FaTimes, FaCheck } from "react-icons/fa";

const UserForm = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const [user, setUser] = useState({
    userId: null,
    name: "",
    birthYear: "",
    gender: "",
    genderPreference: "",
    interests: [],
    isInterestFilterEnabled: true, // Added to initial state
  });
  const [interestInput, setInterestInput] = useState("");
  const [isInterestFilterEnabled, setIsInterestFilterEnabled] = useState(true); // Use separate state for toggle to avoid useEffect dependency issues

  // Load user data from local storage on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    let initialUser;

    if (storedUser) {
      // Check if storedUser has a userId, if not, generate one
      if (!storedUser.userId) {
        storedUser.userId = crypto.randomUUID(); // Generate new userId if missing
        localStorage.setItem("currentUser", JSON.stringify(storedUser)); // Update local storage with new userId
      }
      initialUser = storedUser;
    } else {
      // Generate userId when creating a new user object for the first time
      initialUser = { userId: crypto.randomUUID(), name: "", birthYear: "", gender: "", genderPreference: "", interests: [], isInterestFilterEnabled: true };
      localStorage.setItem("currentUser", JSON.stringify(initialUser));
    }
    setUser(initialUser); // Set the user state with the (potentially updated) initialUser
    setIsInterestFilterEnabled(initialUser.isInterestFilterEnabled !== undefined ? initialUser.isInterestFilterEnabled : true);
  }, []);


  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleGenderPreferenceSelect = (gender) => {
    setUser({ ...user, genderPreference: gender });
  };

  const handleInterestAdd = (e) => {
    if (isInterestFilterEnabled && e.key === "Enter" && interestInput.trim() !== "") {
      e.preventDefault();
      setUser({ ...user, interests: [...user.interests, interestInput.trim()] });
      setInterestInput("");
    }
  };

  const handleInterestRemove = (interest) => {
    setUser({ ...user, interests: user.interests.filter((i) => i !== interest) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.name && user.birthYear && user.gender && user.genderPreference) {
      try {
        // Update local storage with current user state before enqueuing
        const userToSave = {...user, isInterestFilterEnabled: isInterestFilterEnabled}; // Include toggle state
        localStorage.setItem("currentUser", JSON.stringify(userToSave));

        const userPayload = {
          userId: user.userId,
          name: user.name,
          birthYear: parseInt(user.birthYear),
          gender: user.gender.toUpperCase(),
          genderPreference: user.genderPreference.toUpperCase(),
          interests: isInterestFilterEnabled ? user.interests : [],
          isInterestFilterEnabled: isInterestFilterEnabled,
          country: "INDIA",
          activeChatSessionIds: [],
          friendUserIds: [],
        };
        console.log("Enqueuing user:", userPayload);

        const enqueueResponse = await fetch("http://localhost:8080/chat/enqueue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userPayload),
        });

        if (!enqueueResponse.ok) {
          throw new Error(`HTTP error! status: ${enqueueResponse.status}`);
        }

        console.log("User enqueued successfully.");
        navigate("/matching");
      } catch (error) {
        console.error("Error enqueuing user:", error);
        alert("Failed to join matching queue. Please try again.");
      }
    }
  };

  const handleInterestsToggle = () => {
    setIsInterestFilterEnabled(!isInterestFilterEnabled);
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

        {/* Birth Year and Gender in one row */}
        <div className="flex space-x-4">
          {/* Birth Year Dropdown */}
          <select
            name="birthYear"
            value={user.birthYear}
            onChange={handleChange}
            className="flex-1 p-3 bg-transparent text-white border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="" className="text-gray-900">Birth Year</option>
            {birthYears.map((year) => (
              <option key={year} value={year} className="text-gray-900">{year}</option>
            ))}
          </select>

          {/* Gender Selection Dropdown */}
          <select
            name="gender"
            value={user.gender}
            onChange={handleChange}
            className="flex-1 p-3 bg-transparent text-white border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="" className="text-gray-900">Gender</option>
            <option value="MALE" className="text-gray-900">Male</option>
            <option value="FEMALE" className="text-gray-900">Female</option>
            <option value="OTHER" className="text-gray-900">Other</option>
          </select>
        </div>

        {/* Gender Filter Tiles */}
        <div className="flex justify-between space-x-3">
          {[
            { gender: "MALE", label: "Man", icon: <FaMars size={20} /> },
            { gender: "BOTH", label: "Both", icon: <FaTransgender size={20} /> },
            { gender: "FEMALE", label: "Woman", icon: <FaVenus size={20} /> },
          ].map(({ gender, label, icon }) => (
            <button
              key={gender}
              type="button"
              onClick={() => handleGenderPreferenceSelect(gender)}
              className={`flex flex-col items-center p-2 w-16 h-16 rounded-lg transition-all ${
                user.genderPreference === gender
                  ? "bg-white/20 text-white border border-white/40"
                  : "bg-transparent text-white border border-white/30 hover:bg-white/10"
              }`}
            >
              {icon}
              <span className="mt-1 text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Interests Input with Sliding Toggle Switch - Single Row Layout */}
        <div className="w-full bg-transparent border border-white/30 text-white rounded-lg p-3 flex items-start justify-between">
          <div className="flex items-center flex-wrap max-w-[calc(100%-80px)]">
            {/* Interests Tags/Chips */}
            {isInterestFilterEnabled && Array.isArray(user.interests) && user.interests.map((interest, index) => (
              <span
                key={index}
                className="flex items-center bg-white/20 text-white text-sm px-2 py-1 rounded-lg m-1 mr-2"
              >
                {interest}
                <FaTimes
                  size={12}
                  className="ml-2 cursor-pointer"
                  onClick={() => handleInterestRemove(interest)}
                />
              </span>
            ))}
            <input
              type="text"
              placeholder="Add interests"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={handleInterestAdd}
              className="flex-grow bg-transparent focus:outline-none placeholder-gray-300"
              disabled={!isInterestFilterEnabled}
              style={{ opacity: isInterestFilterEnabled ? 1 : 0.5 }}
            />
          </div>
          <button
            type="button"
            onClick={handleInterestsToggle}
            className="ml-2 relative w-12 h-6 rounded-full bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 flex-none"
            aria-label={isInterestFilterEnabled ? "Turn off interests" : "Turn on interests"}
          >
            <span
              className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 transform ${isInterestFilterEnabled ? 'translate-x-6 bg-green-400' : ''}`}
            />
            {!isInterestFilterEnabled && (
              <FaTimes size={12} className="absolute top-1/2 left-1 text-gray-300 -translate-y-1/2" />
            )}
            {isInterestFilterEnabled && (
              <FaCheck size={12} className="absolute top-1/2 right-1 text-white -translate-y-1/2" />
            )}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full p-3 rounded-lg font-medium transition-all ${
            user.name && user.birthYear && user.gender && user.genderPreference
              ? "bg-white/20 text-white hover:bg-white/30"
              : "bg-white/10 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!user.name || !user.birthYear || !user.gender || !user.genderPreference}
        >
          Start Chatting
        </button>
      </form>
    </div>
  );
};

export default UserForm;