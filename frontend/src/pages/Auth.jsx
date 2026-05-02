import { useState } from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';

// auth page handles login and redirects to the secure area
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"; 

function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, {
        username,
        password,
      });

      if (res.status === 200) {
        // saves auth token and enter app
        localStorage.setItem("token", res.data.token);
        navigate('/home'); 
      }

    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Auth;