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
        localStorage.removeItem(LOCAL_KEY);
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
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getRankGradient = (rank: number) => {
    switch (rank) {
      case 1:
        // Softer gold with white-light highlight
        return "from-yellow-100 via-amber-200 to-yellow-300";
      case 2:
        // Clean silver gradient
        return "from-gray-100 via-gray-200 to-gray-300";
      case 3:
        // Subtle bronze/copper tone
        return "from-orange-100 via-amber-200 to-orange-300";
      default:
        // Gentle violet gradient for lower ranks
        return "from-purple-100 via-violet-200 to-purple-300";
    }
  };

  return (
    <div className="w-full min-h-screen  flex flex-col items-center overflow-x-hidden overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center px-4 lg:px-6">
        <Header />

        {!isLoggedIn ? (
          <div className="w-full flex items-center justify-center py-20">
            <div className="relative bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-md p-10 backdrop-blur-sm">
              {/* Decorative gradient orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#5e17eb] to-purple-700 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-[#5e17eb] text-4xl font-bold mb-2 text-center">
                  Admin Portal
                </h2>
                <p className="text-gray-500 text-center mb-8">
                  Sign in to access the dashboard
                </p>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#5e17eb] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#5e17eb] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#5e17eb] to-purple-700 hover:from-purple-700 hover:to-[#5e17eb] text-white font-semibold rounded-xl py-3.5 text-base shadow-lg shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/40"
                  >
                    Sign In
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Header */}
            {/* <div className="w-full mt-12 mb-8">
              <div className="bg-gradient-to-r from-[#5e17eb] to-purple-700 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
                </div>
              </div>
            </div> */}

            {/* Stats Cards */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Total Players
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {leaderboard.length}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Top Score
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {leaderboard.length > 0
                        ? leaderboard[0]?.TotalScore || 0
                        : 0}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Avg Score
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {leaderboard.length > 0
                        ? Math.round(
                            leaderboard.reduce(
                              (sum, item) => sum + (item.TotalScore || 0),
                              0
                            ) / leaderboard.length
                          )
                        : 0}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="w-full mb-8 bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[#5e17eb] text-3xl font-bold">
                      Leaderboard
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Top performers ranked by score
                    </p>
                  </div>
                  <button
                    onClick={fetchLeaderboard}
                    className="bg-white hover:bg-gray-50 text-[#5e17eb] font-medium rounded-xl px-5 py-2.5 border border-purple-200 transition-all hover:shadow-md flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-[#5e17eb] rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 text-lg">
                      Loading leaderboard...
                    </p>
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((item, index) => (
                      <div
                        key={item.recordId}
                        className={`group flex items-center justify-between bg-gradient-to-r ${
                          index < 3
                            ? "from-purple-50 to-white"
                            : "from-gray-50 to-white"
                        } border ${
                          index < 3 ? "border-purple-200" : "border-gray-200"
                        } rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
                      >
                        <div className="flex items-center gap-5">
                          <div
                            className={`w-14 h-14 bg-gradient-to-br ${getRankGradient(index + 1)} 
                            rounded-xl flex items-center justify-center 
                            shadow-md ring-1 ring-white/40 
                            transition-all transform hover:scale-110 hover:shadow-lg duration-200 ease-out`}
                          >
                            <span className="text-white text-2xl font-bold">
                              {typeof getRankIcon(index + 1) === "number"
                                ? `#${getRankIcon(index + 1)}`
                                : getRankIcon(index + 1)}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#5e17eb] transition-colors">
                              {item.Name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Player ID: {item.UserID}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-3xl font-bold bg-gradient-to-r from-[#5e17eb] to-purple-700 bg-clip-text text-transparent">
                              {item.TotalScore}
                            </p>
                            <p className="text-xs text-gray-500">points</p>
                          </div>

                          <svg
                            className="w-6 h-6 text-gray-300 group-hover:text-[#5e17eb] transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-lg">
                      No leaderboard data available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="w-full flex justify-center mb-12">
              <button
                onClick={handleViewSample1}
                className="group bg-gradient-to-r from-[#5e17eb] to-purple-700 hover:from-purple-700 hover:to-[#5e17eb] text-white font-semibold rounded-2xl px-10 py-4 text-lg shadow-xl shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 flex items-center gap-3"
              >
                <svg
                  className="w-6 h-6 group-hover:rotate-12 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View Sample Templates
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
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
