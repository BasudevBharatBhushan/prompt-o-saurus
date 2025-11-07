import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import skeletonImage from "../assets/images/skeleton.png";
import { useAppContext } from "../context/AppContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

import one from "../assets/images/1.png";
import two from "../assets/images/2.png";
import three from "../assets/images/3.png";
import four from "../assets/images/4.png";

const Level: React.FC = () => {
  const { isUserSignedIn, level, setLevel, setIsReportGenerated, userID } =
    useAppContext();
  const navigate = useNavigate();

  const [selectedLevel, setSelectedLevel] = useState(level || "");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [playedLevels, setPlayedLevels] = useState<string[]>([]);

  const levels = [
    { src: one, label: "EASY" },
    { src: two, label: "MEDIUM" },
    { src: three, label: "HARD" },
    { src: four, label: "EXPERT" },
  ];

  // ✅ On mount, check sign-in status first
  useEffect(() => {
    const init = async () => {
      const signedIn = await isUserSignedIn();
      console.log("Signed-in status on mount:", signedIn);
      setIsSignedIn(signedIn);
    };
    init();
  }, []);

  // ✅ Once userID is available and signed in, fetch levels played
  useEffect(() => {
    if (isSignedIn && userID) {
      console.log("UserID now available:", userID);
      fetchLevelPlayed();
    }
  }, [isSignedIn, userID]);

  const handleSelect = (label: string) => {
    setSelectedLevel(label);
    setLevel(label);
  };

  const fetchLevelPlayed = async (): Promise<void> => {
    if (!userID) {
      console.warn("UserID not available yet — skipping fetchLevelPlayed.");
      return;
    }

    const findPayload = {
      fmServer: "kibiz-linux.smtech.cloud",
      method: "findRecord",
      methodBody: {
        database: "KibiAIDemo",
        layout: "KiBiAISessions",
        limit: 20,
        dateformats: 0,
        query: [{ UserID: userID }],
      },
      session: { token: "", required: "", kill_session: true },
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_FM_API}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: import.meta.env.VITE_FM_AUTH,
        },
        body: JSON.stringify(findPayload),
      });

      const findData = await response.json();
      const records =
        findData && findData.records && Array.isArray(findData.records)
          ? findData.records
          : [];

      console.log("Level played records:", records);

      // Extract unique levels user has already played
      const levelsPlayed = [
        ...new Set<string>(
          records
            .map((r: any) => (r.Level ? String(r.Level).trim() : ""))
            .filter(Boolean)
        ),
      ];

      setPlayedLevels(levelsPlayed);
      console.log("Played levels:", levelsPlayed);
    } catch (err) {
      console.error("Error fetching levels played:", err);
    }
  };

  const handleClick = async (): Promise<void> => {
    if (!selectedLevel) {
      alert("Please select a level before continuing.");
      return;
    }

    setIsReportGenerated(false);

    if (isSignedIn) {
      navigate("/preview");
    } else {
      navigate("/user-form");
    }
  };

  return (
    <div className="w-screen min-h-[calc(100vh-60px)] bg-white flex justify-center items-start overflow-hidden">
      <div className="grid grid-rows-[auto_1fr_auto] w-full min-h-screen px-6 py-6 lg:py-10 xl:py-2 max-w-2xl mx-auto">
        <Header />

        <div className="flex flex-col items-center justify-center gap-8 text-center">
          <p className="text-[#5e17eb] text-xl lg:text-2xl font-bold mb-4">
            Choose a level to continue
          </p>

          <div className="grid grid-cols-2 gap-8 lg:gap-12 w-full max-w-md">
            {levels.map((item, index) => {
              const isPlayed = playedLevels.includes(item.label);
              const isSelected = selectedLevel === item.label;

              return (
                <div
                  key={index}
                  onClick={() => !isPlayed && handleSelect(item.label)}
                  title={
                    isPlayed
                      ? "You’ve already played this level"
                      : "Click to select this level"
                  }
                  className={`flex flex-col items-center justify-center transition-transform duration-200 ${
                    isPlayed
                      ? "opacity-60 cursor-not-allowed pointer-events-none"
                      : "cursor-pointer hover:scale-105"
                  } ${isSelected ? "scale-105" : ""}`}
                >
                  <div
                    className={`rounded-2xl shadow-md p-2 border-4 ${
                      isSelected
                        ? "border-[#5e17eb] bg-purple-100"
                        : "border-transparent bg-gray-100"
                    }`}
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      className="w-full h-auto rounded-xl object-contain"
                    />
                  </div>
                  <p
                    className={`text-sm lg:text-lg font-semibold mt-2 ${
                      isSelected ? "text-[#5e17eb]" : "text-gray-800"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <button
              className="bg-[#5e17eb] hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 px-8 py-3 text-lg"
              onClick={handleClick}
            >
              <img src={skeletonImage} alt="" className="h-6 lg:h-7" />
              <span>CONTINUE</span>
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Level;
