import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import DynamicReport from "../components/sections/DynamicReport";

// === Types ===
interface Template {
  recordId: string;
  TemplateName: string;
  Level: string;
  SetupJSON: string;
  ReportConfigJSON: string;
  ReportJSON: string;
}

interface SessionData {
  email: string;
  expiry: number;
}

interface ApiResponse {
  records?: Template[];
}

// === Constants ===
const ADMIN_EMAIL = "priya@kibizsystems.com";
const ADMIN_PASSWORD = "kibiz"; // WARNING: Replace with secure auth in production
const LOCAL_KEY = "admin_session";
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000;

const FM_API = import.meta.env.VITE_FM_API;
const FM_AUTH = import.meta.env.VITE_FM_AUTH;

// === Main Component ===
const PreviewTemplate: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [level, setLevel] = useState<string>("MEDIUM");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewJson, setPreviewJson] = useState<any>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // === Auto-login from localStorage ===
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      try {
        const parsed: SessionData = JSON.parse(stored);
        if (Date.now() < parsed.expiry) {
          setIsLoggedIn(true);
          fetchTemplates(level);
        } else {
          localStorage.removeItem(LOCAL_KEY);
        }
      } catch {
        localStorage.removeItem(LOCAL_KEY);
      }
    }
  }, []);

  // === Update preview when ReportJSON changes ===
  useEffect(() => {
    if (selected?.ReportJSON) {
      try {
        const parsed =
          typeof selected.ReportJSON === "string"
            ? JSON.parse(selected.ReportJSON)
            : selected.ReportJSON;
        setPreviewJson(parsed);
        setJsonError(null);
      } catch (e) {
        setPreviewJson(null);
        setJsonError("Invalid JSON format");
      }
    } else {
      setPreviewJson(null);
      setJsonError(null);
    }
  }, [selected?.ReportJSON]);

  // === Login Handler ===
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const expiry = Date.now() + SESSION_EXPIRY;
      localStorage.setItem(LOCAL_KEY, JSON.stringify({ email, expiry }));
      setIsLoggedIn(true);
      fetchTemplates(level);
    } else {
      alert("Invalid credentials.");
    }
  };

  // === Fetch Templates ===
  const fetchTemplates = useCallback(async (lvl: string) => {
    setLoading(true);
    setTemplates([]);
    setSelected(null);
    setPreviewJson(null);

    const payload = {
      fmServer: "kibiz-linux.smtech.cloud",
      method: "findRecord",
      methodBody: {
        database: "KibiAIDemo",
        layout: "KiBiAITemplates",
        query: [{ Level: lvl }],
        limit: 20,
        offset: 1,
        session: { token: "", required: "" },
      },
    };

    try {
      const res = await fetch(FM_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: FM_AUTH,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data: ApiResponse = await res.json();
      setTemplates(data.records || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setMessage("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  // === Update Template ===
  const handleUpdate = async () => {
    if (!selected) return;

    setSaving(true);
    setMessage(null);

    const payload = {
      fmServer: "kibiz-linux.smtech.cloud",
      method: "updateRecord",
      methodBody: {
        database: "KibiAIDemo",
        layout: "KiBiAITemplates",
        recordId: selected.recordId,
        record: {
          TemplateName: selected.TemplateName,
          SetupJSON: selected.SetupJSON,
          ReportConfigJSON: selected.ReportConfigJSON,
        },
      },
      session: { token: "", required: "" },
    };

    try {
      const res = await fetch(FM_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: FM_AUTH,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage("Template updated successfully!");
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("Error updating template.");
    } finally {
      setSaving(false);
    }
  };

  // === Logout ===
  const handleLogout = () => {
    localStorage.removeItem(LOCAL_KEY);
    setIsLoggedIn(false);
    setTemplates([]);
    setSelected(null);
    setPreviewJson(null);
  };

  // === Login Screen ===
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen min-w-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-9 h-9 text-white"
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
              <p className="text-gray-600 mt-1">Template Management System</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // === Main Dashboard ===
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Template Manager
            </h2>
            <div className="h-6 w-px bg-gray-300" />
            <select
              value={level}
              onChange={(e) => {
                const val = e.target.value;
                setLevel(val);
                fetchTemplates(val);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
          {/* Left: Templates + Editor */}
          <div className="flex flex-col gap-6">
            {/* Template List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-64 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Available Templates
              </h3>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading...</p>
                    </div>
                  </div>
                ) : templates.length > 0 ? (
                  <div className="space-y-2">
                    {templates.map((t) => (
                      <div
                        key={t.recordId}
                        onClick={() => setSelected(t)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selected?.recordId === t.recordId
                            ? "border-purple-500 bg-purple-50"
                            : "border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800 truncate">
                            {t.TemplateName || "Untitled"}
                          </span>
                          <span className="text-xs px-2 py-1 bg-white border rounded-full text-gray-600">
                            {t.Level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 mt-10">
                    No templates found
                  </p>
                )}
              </div>
            </div>

            {/* Editor */}
            {selected ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Template
                  </h3>
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition ${
                      saving
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-md"
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={selected.TemplateName || ""}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          TemplateName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {["SetupJSON", "ReportConfigJSON", "ReportJSON"].map(
                    (field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.replace("JSON", "")} JSON
                        </label>
                        <textarea
                          rows={field === "ReportJSON" ? 6 : 4}
                          value={selected[field as keyof Template] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelected({ ...selected, [field]: val });
                            if (field === "ReportJSON") {
                              try {
                                JSON.parse(val);
                                setJsonError(null);
                              } catch {
                                setJsonError("Invalid JSON");
                              }
                            }
                          }}
                          className={`w-full px-4 py-2 border font-mono text-xs rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                            field === "ReportJSON" && jsonError
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {field === "ReportJSON" && jsonError && (
                          <p className="text-red-600 text-xs mt-1">
                            {jsonError}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>

                {message && (
                  <div
                    className={`mx-5 mb-5 p-3 rounded-lg text-sm font-medium ${
                      message.includes("success")
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="font-medium">Select a template to edit</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Live Preview
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${previewJson ? "bg-green-500" : "bg-gray-300"}`}
                />
                <span className="text-xs font-medium text-gray-600">
                  {previewJson ? "Valid JSON" : "No Data"}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-5 bg-gray-50">
              {previewJson ? (
                <DynamicReport jsonData={previewJson} />
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-400">
                  <div>
                    <svg
                      className="w-20 h-20 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="font-medium">No Preview</p>
                    <p className="text-sm mt-1">
                      Enter valid Report JSON to see preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PreviewTemplate;
