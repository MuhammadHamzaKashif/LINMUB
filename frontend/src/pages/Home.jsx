import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// home page fetches the current user profile and guards the route
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Home() {
  
  const [user, setUser] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  // load current user profile from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        
        const token = localStorage.getItem("token");

        
        const res = await axios.get(`${API}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        
        setUser(res.data.user);
        setIsLoading(false);

      } catch (err) {
        console.error("Session expired or invalid token", err);
        // clear invalid token and redirect to login
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    fetchUserData();
  }, [navigate]); 


  
  if (isLoading) {
    return <div>Loading your Agora...</div>;
  }

  
  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome back, {user.username}!</h2>
      <p>Your socializing style: {user.socializingCapability}</p>
      
      <hr style={{ margin: "20px 0" }} />
      
      <h3>The Agora (Thoughts Feed)</h3>
      <p>This is where the feed will go...</p>

      
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