import React, { createContext, useState, useContext } from "react";

// Create context
const AppContext = createContext<any>(null);

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  // Global state variables
  const [userID, setUserID] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [level, setLevel] = useState("EASY");
  const [score, setScore] = useState<any>(null);
  const [templateID, setTemplateID] = useState(1);
  const [reportJson, setReportJson] = useState(null);
  const [reportSetup, setReportSetup] = useState(null);
  const [reportConfig, setReportConfig] = useState(null);
  const [customReportConfig, setCustomReportConfig] = useState(null);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  // Function to check and restore session
  const isUserSignedIn = async (): Promise<boolean> => {
    try {
      const stored = localStorage.getItem("kibiai_user");
      if (!stored) return false;

      const { userData, expiry } = JSON.parse(stored);
      const isValid = expiry && new Date(expiry) > new Date();

      console.log("Session valid:", isValid);

      // If invalid or email missing
      if (!isValid || !userData?.UserEmail) {
        localStorage.removeItem("kibiai_user");
        return false;
      }

      // Build the find payload (same structure as your reference)
      const findPayload = {
        fmServer: "kibiz-linux.smtech.cloud",
        method: "findRecord",
        methodBody: {
          database: "KibiAIDemo",
          layout: "KiBiAIUser",
          limit: 1,
          dateformats: 0,
          query: [{ UserEmail: userData.UserEmail.replace(/@/g, "\\@") }],
        },
        session: {
          token: "",
          required: "",
          kill_session: true,
        },
      };

      console.log("Verifying user with payload:", findPayload);

      // Fetch user from FileMaker
      const findResponse = await fetch(`${import.meta.env.VITE_FM_API}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: import.meta.env.VITE_FM_AUTH,
        },
        body: JSON.stringify(findPayload),
      });

      const findData = await findResponse.json();

      // Safely extract records
      const records =
        findData && findData.records && Array.isArray(findData.records)
          ? findData.records
          : [];

      if (records.length > 0) {
        const record = records[0];

        // Restore user details into global state
        if (record.recordId) setUserID(record.recordId.toString());
        if (record.Name) setUserName(record.Name);

        console.log("User session restored:", record);

        return true;
      } else {
        localStorage.removeItem("kibiai_user");
        return false;
      }
    } catch (err) {
      console.error("Error verifying user session:", err);
      localStorage.removeItem("kibiai_user");
      return false;
    }
  };

  // Values accessible everywhere
  const value = {
    userID,
    setUserID,
    userName,
    setUserName,
    level,
    setLevel,
    score,
    setScore,
    templateID,
    setTemplateID,
    isUserSignedIn,
    reportJson,
    setReportJson,
    reportSetup,
    setReportSetup,
    reportConfig,
    setReportConfig,
    customReportConfig,
    setCustomReportConfig,
    isReportGenerated,
    setIsReportGenerated,
    totalScore,
    setTotalScore,
    userEmail,
    setUserEmail,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook for easy access
export function useAppContext() {
  return useContext(AppContext);
}
