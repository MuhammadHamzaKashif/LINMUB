import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Home() {
  // 1. Create a state variable to hold the user data
  const [user, setUser] = useState(null);
  // Optional: create a loading state so the screen doesn't flicker
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  // 2. useEffect runs automatically the second this page loads
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Grab the VIP wristband from local storage
        const token = localStorage.getItem("token");

        // Hit the Bouncer-protected route to get the user profile
        const res = await axios.get(`${API}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Save the user data into React state!
        setUser(res.data.user);
        setIsLoading(false);

      } catch (err) {
        console.error("Session expired or invalid token", err);
        // If the token is fake or expired, clear it and kick them out
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    fetchUserData();
  }, [navigate]); // The empty array ensures this only runs once on load


  // 3. Show a loading screen while we wait for the backend to reply
  if (isLoading) {
    return <div>Loading your Agora...</div>;
  }

  // 4. Display the data!
  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome back, {user.username}!</h2>
      <p>Your socializing style: {user.socializingCapability}</p>
      
      <hr style={{ margin: "20px 0" }} />
      
      <h3>The Agora (Thoughts Feed)</h3>
      <p>This is where the feed will go...</p>

      {/* Just a quick logout button to clear the token and leave */}
      <button 
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
        style={{ marginTop: "20px" }}
      >
        Logout
      </button>
    </div>
  );
}

export default Home;