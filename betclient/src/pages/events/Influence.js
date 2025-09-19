import React, { useState, useEffect } from "react";
import { showNotification } from "../../utils/NotificationMan";

function DoubleInfluenceEvent({ event, influenceActiveUntil }) {
  // userEffectEnd = data până la care este activ efectul (poate veni de la backend)
  const [effectActive, setEffectActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // milisecunde
  const token = localStorage.getItem("token");

  useEffect(() => {
  if (influenceActiveUntil) {
    const now = new Date();
    const remaining = new Date(influenceActiveUntil) - now;
    if (remaining > 0) {
      setEffectActive(true);
      setTimeLeft(remaining);
    }
  }
}, [influenceActiveUntil]);

  // Timer pentru countdown
  useEffect(() => {
    
    if (!effectActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          setEffectActive(false);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [effectActive]);

  const handleActivate = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API}/events/${event._id}/activate-influence`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        const end = new Date(data.effectEnd);
        const now = new Date();
        setEffectActive(true);
        setTimeLeft(end - now);
        showNotification("success", "Activated", "Double influence is now active ⚡");
      } else {
        showNotification("danger", "Failed", data.message);
      }
    } catch (err) {
      showNotification("danger", "Error", "Server error");
    }
  };

  // Formatare timp rămas
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
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
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 max-w-2xl w-full text-center p-6">
        <h2 className="text-4xl font-bold mb-4">{event.title}</h2>
        <p className="mb-8">{event.description}</p>

        {effectActive ? (
          <div className="text-xl font-semibold mb-4">
            Effect active ⏱ {formatTime(timeLeft)}
          </div>
        ) : null}

        <button
          onClick={handleActivate}
          disabled={effectActive}
          className={`px-6 py-3 rounded-xl font-semibold transition ${
            effectActive ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-500"
          }`}
        >
          {effectActive ? "Active ⚡" : "Activate x2 Influence ⚡"}
        </button>
      </div>
    </div>
  );
}

export default DoubleInfluenceEvent;
