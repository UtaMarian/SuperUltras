import React, { useState, useEffect } from "react";
import { showNotification } from "../../utils/NotificationMan";

function WelcomeEvent({ event, userClaims = 0 }) {
  // milestones = valorile recompenselor
  const milestones = [10, 50, 200];

  // indexul se bazează direct pe numărul de claimuri
  const [collectedIndex, setCollectedIndex] = useState(userClaims - 1);

  useEffect(() => {
    setCollectedIndex(userClaims - 1);
  }, [userClaims]);

  const handleClaim = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API}/events/${event._id}/claim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("token"),
          },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        // marchează progresul local: crește numărul de claimuri
        setCollectedIndex((prev) => prev + 1);
        showNotification("success", "Reward claimed", `+${data.reward.cash} 💵`);
      } else {
        showNotification(
    "danger",
    "Failed",
    `${data.message} ${data.hours} hours and ${data.minutes} minutes`
  );
      }
    } catch (err) {
      showNotification("danger", "Error", "Server error");
    }
  };

  return (
    <div
      className="min-h-[800px] flex flex-col items-center justify-center relative text-white overflow-hidden"
      style={{
        backgroundImage: `url(${process.env.REACT_APP_API}/${event.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay pentru contrast */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Conținut */}
      <div className="relative z-10 max-w-2xl w-full text-center p-6">
        <h2 className="text-4xl font-bold mb-4">{event.title}</h2>
        <p className="mb-8">{event.description}</p>

        {/* Progress bar */}
        <div className="relative w-full h-4 bg-gray-700 rounded-full mb-12">
          <div
            className="absolute left-0 top-0 h-4 bg-green-500 rounded-full transition-all"
            style={{
              width: `${((collectedIndex + 1) / milestones.length) * 100}%`,
            }}
          />
          <div className="absolute inset-0 flex justify-between items-center px-2">
            {milestones.map((m, i) => (
              <div key={i} className="flex flex-col items-center relative">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition ${
                    i <= collectedIndex
                      ? "bg-green-400 text-black"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="mt-2 text-sm">{m} 💵</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buton claim */}
        <button
          onClick={handleClaim}
          disabled={collectedIndex >= milestones.length - 1}
          className={`px-6 py-3 rounded-xl font-semibold transition ${
            collectedIndex >= milestones.length - 1
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {collectedIndex >= milestones.length - 1
            ? "All rewards claimed ✅"
            : "Collect Reward 🎁"}
        </button>
      </div>
    </div>
  );
}

export default WelcomeEvent;
