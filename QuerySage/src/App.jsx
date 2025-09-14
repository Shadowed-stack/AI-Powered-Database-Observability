import "./App.css";
import { useState, useContext, createContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGoogle,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaBolt,
  FaDatabase,
  FaClock,
  FaRobot,
  FaMicrochip,
  FaHdd,
} from "react-icons/fa";

/* ---------- AUTH CONTEXT ---------- */
const AuthContext = createContext();
function useAuth() {
  return useContext(AuthContext);
}
function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("auth") === "true"
  );

  const signIn = (cb) => {
    setIsAuthenticated(true);
    localStorage.setItem("auth", "true");
    cb();
  };

  const signOut = (cb) => {
    setIsAuthenticated(false);
    localStorage.removeItem("auth");
    cb();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ---------- PROTECTED ROUTE ---------- */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

/* ---------- 3D BACKGROUND ---------- */
function ThreeBG() {
  return (
    <Canvas className="three-canvas" camera={{ position: [0, 0, 7] }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 6]} intensity={1.2} />
      <Float speed={2} rotationIntensity={1}>
        <mesh>
          <icosahedronGeometry args={[2.2, 1]} />
          <meshStandardMaterial
            color="#0ff"
            wireframe
            opacity={0.5}
            transparent
            emissive="#0ff"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
    </Canvas>
  );
}

/* ---------- LANDING PAGE ---------- */
function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    signIn(() => navigate("/dashboard"));
  };

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    handleLogin();
  };

  return (
    <div className="app">
      <ThreeBG />
      <div className="overlay">
        <motion.h1
          className="main-title"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          QuerySage
        </motion.h1>
        <motion.div
          className="glass-card"
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          <p className="subtitle">
            An <span className="highlight">AI-powered</span> database
            observability tool that detects bottlenecks and gives smart
            recommendations.
          </p>
          <button className="neon-btn" onClick={() => setShowLogin(true)}>
            Sign Up
          </button>
        </motion.div>
      </div>
      <AnimatePresence>
        {showLogin && (
          <motion.div
            className="login-page"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7 }}
          >
            <button className="close-btn" onClick={() => setShowLogin(false)}>
              ✕
            </button>
            <h2>Login</h2>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>
            <div className="social-login">
              <p className="or-text">or Sign in with</p>
              <div className="social-buttons">
                <button
                  className="social-btn google"
                  onClick={() => handleSocialLogin("Google")}
                >
                  <FaGoogle /> Google
                </button>
                <button
                  className="social-btn github"
                  onClick={() => handleSocialLogin("GitHub")}
                >
                  <FaGithub /> GitHub
                </button>
                <button
                  className="social-btn twitter"
                  onClick={() => handleSocialLogin("Twitter")}
                >
                  <FaTwitter /> Twitter
                </button>
                <button
                  className="social-btn linkedin"
                  onClick={() => handleSocialLogin("LinkedIn")}
                >
                  <FaLinkedin /> LinkedIn
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- CHATBOT ---------- */
function Chatbot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about your queries." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${API_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, k: 3, history: messages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.answer || "No answer returned." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Error contacting server." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <FaRobot className="chatbot-icon" /> QueryBot
        </div>
        <div className="chatbot-status">Online</div>
      </div>
      <div className="chatbot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.from === "user" ? "user" : ""}`}>
            <div className="message-avatar">
              {m.from === "user" ? "U" : "Q"}
            </div>
            <div className="message-content">
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
      <div className="chatbot-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="neon-btn" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

/* ---------- DASHBOARD ---------- */
function Dashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    memory_percent: 0,
    disk_percent: 0,
    db_file_size_mb: 0,
    uptime_seconds: 0,
  });
  const [plotUrl, setPlotUrl] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_URL}/system_metrics`);
      const data = await res.json();
      setMetrics(data);
      setPlotUrl(`${API_URL}/clustering_plot?t=${Date.now()}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptimize = async () => {
    try {
      await fetch(`${API_URL}/optimize_queries`, { method: "POST" });
      alert("Optimization complete!");
      fetchMetrics();
    } catch (err) {
      alert("Error optimizing database");
    }
  };

  const handleLogout = () => signOut(() => navigate("/"));

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <ThreeBG />

      <div className="overlay" style={{ zIndex: 2, textAlign: "center" }}>
        <div className="dashboard-header">
          <motion.h1
            className="main-title"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            QuerySage Dashboard
          </motion.h1>
          <button className="neon-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div
        className="dashboard-content"
        style={{
          position: "relative",
          zIndex: 2,
          marginTop: "180px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <div
          className="metrics"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <div className="metric-card">
            <FaDatabase className="metric-icon" />
            <h3>DB File Size</h3>
            <p>{metrics.db_file_size_mb} MB</p>
          </div>
          <div className="metric-card">
            <FaMicrochip className="metric-icon" />
            <h3>Memory Usage</h3>
            <p>{metrics.memory_percent}%</p>
          </div>
          <div className="metric-card">
            <FaHdd className="metric-icon" />
            <h3>Disk Usage</h3>
            <p>{metrics.disk_percent}%</p>
          </div>
          <div className="metric-card">
            <FaClock className="metric-icon" />
            <h3>Uptime</h3>
            <p>{Math.floor(metrics.uptime_seconds / 3600)} hrs</p>
          </div>
        </div>

        <button className="neon-btn optimize-btn" onClick={handleOptimize}>
          <FaBolt className="optimize-icon" /> Optimize Queries
        </button>

        {plotUrl && (
          <div className="plot-container">
            <h3>Clustering Plot</h3>
            <img
              src={plotUrl}
              alt="Clustering Plot"
              style={{ maxWidth: "80%", borderRadius: "12px" }}
            />
          </div>
        )}
      </div>

      <Chatbot />
    </div>
  );
}

/* ---------- MAIN APP ---------- */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
