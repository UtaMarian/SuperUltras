// PlayerStatsCard.js
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DefaultAvatar from '../../assets/icons/man.png';
const PlayerStatsCard = ({ player }) => {
  const seasonData = [
    { season: "S1", goals: 12 },
    { season: "S2", goals: 8 },
    { season: "S3", goals: 15 },
    { season: "S4", goals: 10 },
    { season: "S5", goals: 18 },
  ];

  return (
    <div className="bg-[#2c2f33] text-white rounded-2xl shadow-lg p-6 mt-4 ">
      <h3 className="text-2xl font-bold text-yellow-400 mb-4">
        {player.name} 🏆
      </h3>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
  {/* Pozitie */}
  <div className="bg-white text-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
    <span className="text-2xl">⚽</span>
    <span className="font-bold text-sm mt-2">Pozitie</span>
    <span className="text-lg">{player.position}</span>
  </div>

  {/* Meciuri */}
  <div className="bg-white text-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
    <span className="text-2xl">📊</span>
    <span className="font-bold text-sm mt-2">Meciuri</span>
    <span className="text-lg">{player.matches}</span>
  </div>

  {/* Nivel */}
  <div className="bg-white text-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
    <span className="text-2xl">⭐</span>
    <span className="font-bold text-sm mt-2">Nivel</span>
    <span className="text-lg">{player.level}</span>
  </div>

  {/* Goluri */}
  <div className="bg-white text-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
    <span className="text-2xl">🥅</span>
    <span className="font-bold text-sm mt-2">Goluri</span>
    <span className="text-lg">{player.goals}</span>
  </div>

  {/* Influență */}
  <div className="bg-white text-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
    <span className="text-2xl">🔥</span>
    <span className="font-bold text-sm mt-2">Influență</span>
    <span className="text-lg">{player.influence}</span>
  </div>

  {/* Pariuri câștigate */}
  <div className="bg-white text-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
    <span className="text-2xl">💰</span>
    <span className="font-bold text-sm mt-2">Pariuri câștigate</span>
    <span className="text-lg">{player.betsWon}</span>
  </div>
</div>


      <h3 className="text-xl font-semibold text-center mb-2">Ultimele 5 sezoane</h3>
      <div className="h-48  p-2 rounded-xl">
        <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Pos.</th>
                  <th>Img</th>
                  <th>Player</th>
                  <th>Level</th>
                  <th>Goals</th>
                  <th>Matches</th>
                  <th>X</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                    <td>1</td>
                    <td>ST</td>
                    <td><img src={DefaultAvatar} alt="Player" className="w-8 h-8 rounded-full" /></td>
                    <td>Cristiano Ronaldo</td>
                    <td>99</td>
                    <td>18</td>
                    <td>26</td>
                    <td>⭐</td>
                </tr>
                
              </tbody>
            </table>
      </div>
    </div>
  );
};

export default PlayerStatsCard;
