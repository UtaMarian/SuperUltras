import React, { useEffect, useState } from "react";
import DefaultProfilePicture from "../../assets/icons/man.png";
import { showNotification } from "../../utils/NotificationMan";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from "recharts";
import BallIcon from '../../assets/icons/training.png';
import '../../styles/training.css';
import { useTranslation } from "react-i18next";

function Training() {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  const fetchPlayer = async () => {
    setLoading(true);
    const res = await fetch(`${process.env.REACT_APP_API}/training`, {
      credentials: "include",
      headers: { "x-auth-token": token },
    });
    const data = await res.json();
    setPlayer(data.player);
    setLoading(false);
  };

  const train = async (attribute) => {
  const res = await fetch(
    `${process.env.REACT_APP_API}/training/players/train`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      credentials: "include",
      body: JSON.stringify({ attribute }),
    }
  );

  if (res.ok) {
    const updated = await res.json();

    // doar updatezi state-ul local fără să refaci tot fetch-ul
    setPlayer((prev) => ({
      ...prev,
      [attribute]: updated.player[attribute], // noua valoare
      trainingPoints: updated.player.trainingPoints
    }));
  } else {
    showNotification("warning", "Training", "Maximum training attribute");
  }
};


  useEffect(() => {
    fetchPlayer();
  }, []);

  if (loading) return <div className="text-center text-gray-500">{t("training.loading")}</div>;
  if (!player) return <div>{t("training.noPlayer")}</div>;

  // Recomandări pe poziție
  const recommendations = {
    GK: [t("attributes.defending"), t("attributes.physicality"), t("attributes.passing")],
    ST: [t("attributes.pace"), t("attributes.shooting"), t("attributes.dribbling")],
    CM: [t("attributes.passing"), t("attributes.dribbling"), t("attributes.physicality")],
    RM: [t("attributes.passing"), t("attributes.dribbling"), t("attributes.pace")],
    LM: [t("attributes.passing"), t("attributes.dribbling"), t("attributes.pace")],
    CB: [t("attributes.defending"), t("attributes.physicality"), t("attributes.pace")],
    LB: [t("attributes.pace"), t("attributes.defending"), t("attributes.passing")],
    RB: [t("attributes.pace"), t("attributes.defending"), t("attributes.passing")],
    LW: [t("attributes.pace"), t("attributes.dribbling"), t("attributes.shooting")],
    RW: [t("attributes.pace"), t("attributes.dribbling"), t("attributes.shooting")],
  };


   
  const highlightAttrs = recommendations[player.position] || [];

  // culori diferite pentru fiecare atribut
  const attrColors = {
    pace: "bg-yellow-400",
    shooting: "bg-red-500",
    passing: "bg-blue-400",
    dribbling: "bg-purple-500",
    defending: "bg-green-600",
    physicality: "bg-orange-500",
  };

  // 📊 Pregătim datele pentru graficul radar
  const radarData = [
    { attr: t("attributes.pace"), value: player.pace },
    { attr: t("attributes.shooting"), value: player.shooting },
    { attr: t("attributes.passing"), value: player.passing },
    { attr: t("attributes.dribbling"), value: player.dribbling },
    { attr: t("attributes.defending"), value: player.defending },
    { attr: t("attributes.physicality"), value: player.physicality },
  ];

  return (
    <div className="training-container bg-gray-400">
  <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow-xl 
                flex flex-col lg:grid lg:grid-cols-12 gap-6">
    
    {/* Left: Info + Training */}
    <div className="lg:col-span-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b pb-4">
        <img
          src={DefaultProfilePicture}
          alt="player"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-300"
        />
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold">{player.name}</h2>

          <p className="text-gray-600 text-base sm:text-lg">
            {t("training.position")}:{" "}
            <span className={`table-player-position p-${player.position}`}>
              {player.position}
            </span>
          </p>

          <p className="text-gray-600 flex justify-center sm:justify-start items-center text-base sm:text-lg">
            {t("training.level")}:
            <div className="table-player-level ml-3">
              <div className="medal-content">{player.level}</div>
            </div>
          </p>

          <p className="text-gray-600 flex justify-center sm:justify-start items-center text-base sm:text-lg">
            {t("training.trainingPoints")}:
            <div className="flex items-center ml-2">
              <span className="font-semibold text-blue-600">{player.trainingPoints}</span>
              <img src={BallIcon} className="w-6 sm:w-7 ml-1" alt="train" />
            </div>
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
        <h2 className="font-semibold mb-2 text-gray-700 text-sm">
          {t("training.recommended")} {player.position}:
        </h2>
        <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
          {highlightAttrs.map((attr) => (
            <span
              key={attr}
              className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium"
            >
              {attr}
            </span>
          ))}
        </div>
      </div>

      {/* Attributes + Train Buttons */}
      {["pace", "shooting", "passing", "dribbling", "defending", "physicality"].map(
        (attr) => (
          <div key={attr} className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span
                className={`capitalize font-medium ${
                  highlightAttrs.includes(attr) ? "text-blue-600" : ""
                }`}
              >
                {attr}
              </span>
              <span className="text-sm">{player[attr]}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`${attrColors[attr]} h-4 rounded-full`}
                style={{ width: `${player[attr]}%` }}
              ></div>
            </div>
            <button
              type="button"
              onClick={() => train(attr)}
              disabled={player.trainingPoints <= 0 || player[attr] >= 100}
              className="w-full py-2 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 
                         hover:from-blue-600 hover:to-indigo-700 text-white text-sm 
                         rounded-lg disabled:bg-gray-400 transition"
            >
              {t("training.train")} {attr}
            </button>
          </div>
        )
      )}
    </div>

    {/* Right: Radar Chart */}
    <div className="hidden lg:flex lg:col-span-6 items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="attr" />
          <Radar
            name={player.name}
            dataKey="value"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

  );
}

export default Training;
