import "./App.css";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaGithub, FaTwitter, FaLinkedin, FaChartBar, FaBolt, FaDatabase, FaClock } from "react-icons/fa";

// Simple authentication context (for demo purposes)
const AuthContext = {
  isAuthenticated: false,
  signIn(callback) {
    this.isAuthenticated = true;
    setTimeout(callback, 100); // simulate async
  },
  signOut(callback) {
    this.isAuthenticated = false;
    setTimeout(callback, 100); // simulate async
  }
};

// Landing Page Component
function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate authentication
    AuthContext.signIn(() => {
      navigate('/dashboard');
    });
  };

  const handleSocialLogin = (provider) => {
    // Simulate social login
    console.log(`Logging in with ${provider}`);
    AuthContext.signIn(() => {
      navigate('/dashboard');
    });
  };

  return (
    <div className="app">
      {/* 3D Background */}
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

      {/* Overlay content */}
      <div className="overlay">
        <motion.h1
          className="main-title"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          QuerySage
        </motion.h1>

        <motion.div
          className="glass-card"
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        >
          <p className="subtitle">
            An <span className="highlight">AI-powered</span> database
            observability tool that detects bottlenecks, analyzes query plans,
            and gives smart recommendations to keep your apps blazing fast.
          </p>
          <button className="neon-btn" onClick={() => setShowLogin(true)}>
            Sign Up
          </button>
        </motion.div>
      </div>

      {/* Slide-in Login Page */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            className="login-page"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <button className="close-btn" onClick={() => setShowLogin(false)}>
              ✕
            </button>
            <h2>Login</h2>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button className="login-btn" onClick={handleLogin}>Login</button>
            <div className="social-login">
              <p className="or-text">or Sign in with</p>
              <div className="social-buttons">
                <button className="social-btn google" onClick={() => handleSocialLogin('google')}>
                  <FaGoogle size={20} /> Google
                </button>
                <button className="social-btn github" onClick={() => handleSocialLogin('github')}>
                  <FaGithub size={20} /> GitHub
                </button>
                <button className="social-btn twitter" onClick={() => handleSocialLogin('twitter')}>
                  <FaTwitter size={20} /> Twitter
                </button>
                <button className="social-btn linkedin" onClick={() => handleSocialLogin('linkedin')}>
                  <FaLinkedin size={20} /> LinkedIn
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    AuthContext.signOut(() => {
      navigate('/');
    });
  };

  return (
    <div className="app">
      {/* Keep the same 3D background */}
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

      {/* Dashboard content with your glassmorphic style */}
      <div className="overlay">
        <div className="dashboard-header">
          <motion.h1 
            className="main-title"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            QuerySage Dashboard
          </motion.h1>
          <button className="neon-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <motion.div
          className="dashboard-content"
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        >
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="glass-card stat-card">
              <FaChartBar className="stat-icon" />
              <h3>Query Performance</h3>
              <div className="stat-value">94%</div>
              <div className="stat-trend positive">+2% from last week</div>
            </div>
            
            <div className="glass-card stat-card">
              <FaBolt className="stat-icon" />
              <h3>Slow Queries</h3>
              <div className="stat-value">12</div>
              <div className="stat-trend negative">-3 from last week</div>
            </div>
            
            <div className="glass-card stat-card">
              <FaDatabase className="stat-icon" />
              <h3>Database Size</h3>
              <div className="stat-value">2.4 GB</div>
              <div className="stat-trend">+0.2 GB from last week</div>
            </div>
            
            <div className="glass-card stat-card">
              <FaClock className="stat-icon" />
              <h3>Uptime</h3>
              <div className="stat-value">99.9%</div>
              <div className="stat-trend positive">No downtime this month</div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="main-content">
            <div className="glass-card query-analysis">
              <h2>Query Analysis</h2>
              <div className="analysis-placeholder">
                <p>Query performance metrics and optimization suggestions will appear here.</p>
              </div>
            </div>
            
            <div className="glass-card recommendations">
              <h2>Optimization Recommendations</h2>
              <div className="recommendation-list">
                <div className="recommendation-item">
                  <h4>Add Index to Users Table</h4>
                  <p>Expected performance improvement: 25%</p>
                </div>
                <div className="recommendation-item">
                  <h4>Optimize Slow Query #7</h4>
                  <p>Expected performance improvement: 40%</p>
                </div>
                <div className="recommendation-item">
                  <h4>Cache Frequently Accessed Data</h4>
                  <p>Expected performance improvement: 15%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Main App Component with Routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;