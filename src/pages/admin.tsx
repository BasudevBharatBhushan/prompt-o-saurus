import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const ADMIN_EMAIL = "priya@kibizsystems.com";
const ADMIN_PASSWORD = "kibiz";
const LOCAL_KEY = "admin_session";

// Session validity: 1 month in milliseconds
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000;
const FM_API = import.meta.env.VITE_FM_API;
const FM_AUTH = import.meta.env.VITE_FM_AUTH;

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Check login state on mount
  useEffect(() => {
    const session = localStorage.getItem(LOCAL_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      if (Date.now() < parsed.expiry) {
        setIsLoggedIn(true);
        fetchLeaderboard();
      } else {
        localStorage.removeItem(LOCAL_KEY); // expired
      }
    }
  }, []);

  // Demo login validation
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const expiry = Date.now() + SESSION_EXPIRY;
      localStorage.setItem(LOCAL_KEY, JSON.stringify({ email, expiry }));
      setIsLoggedIn(true);
      fetchLeaderboard();
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(FM_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: FM_AUTH,
        },
        body: JSON.stringify({
          fmServer: "kibiz-linux.smtech.cloud",
          method: "findRecord",
          methodBody: {
            database: "KibiAIDemo",
            layout: "LeaderBoard",
            query: [{ UserID: ">0" }],
            sort: [{ fieldName: "TotalScore", sortOrder: "descend" }],
            limit: 20,
            offset: 1,
            session: { token: "", required: "" },
          },
        }),
      });
      const data = await response.json();
      setLeaderboard(data.records || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSample1 = () => {
    navigate("/preview-template");
  };

  // Rank icon
  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🏆";
    if (rank === 2) return "🏆";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center overflow-x-hidden overflow-y-auto p-4 lg:p-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <Header />

        {!isLoggedIn ? (
          <div className="bg-gray-50 rounded-2xl shadow-md border border-gray-200 w-full max-w-md p-8 mt-16">
            <h2 className="text-[#5e17eb] text-3xl font-bold mb-6 text-center">
              Admin Login
            </h2>
            <form onSubmit={handleLogin} className="space-y-5">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#5e17eb] hover:bg-purple-700 text-white font-semibold rounded-full py-3 text-lg transition-all duration-200 transform hover:scale-105"
              >
                Login
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="w-full mt-12 bg-gray-50 rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-[#5e17eb] text-3xl font-bold text-center mb-6">
                Leaderboard
              </h2>

              {loading ? (
                <div className="text-gray-500 text-center py-8 text-lg">
                  Loading leaderboard...
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="w-full flex flex-col gap-4">
                  {leaderboard.map((item, index) => (
                    <div
                      key={item.recordId}
                      className={`flex justify-between items-center w-full bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all ${
                        index < 3 ? "border-[#5e17eb]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-[#5e17eb] min-w-[40px] text-center">
                          {getRankIcon(index + 1)}
                        </span>
                        <span className="text-lg md:text-xl font-semibold text-gray-800">
                          {item.Name}
                        </span>
                      </div>
                      <div className="text-lg md:text-xl font-bold text-[#5e17eb]">
                        {item.TotalScore}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 text-center py-8 text-lg">
                  No leaderboard data found.
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-10 mb-12">
              <button
                onClick={handleViewSample1}
                className="bg-[#5e17eb] hover:bg-purple-700 text-white font-semibold rounded-full px-8 py-3 text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                View Sample Templates
              </button>
            </div>
          </>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Admin;
