import React, { useEffect, useState } from "react";
import { Commet } from "react-loading-indicators";
import MVPMedal from '../../assets/icons/mvp.png';

function Supporters({ matchid }) {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalInfluence, setTotalInfluence] = useState(0);

  const fetchSupporters = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API}/choreographies/supporters/${matchid}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );
      const data = await res.json();

      // 🔥 grupare după user._id
      const grouped = Object.values(
        data.reduce((acc, item) => {
          const uid = item.user._id;
          if (!acc[uid]) {
            acc[uid] = {
              _id: uid,
              user: item.user,
              moneyTicket: 0,
              team: item.team,
            };
          }
          acc[uid].moneyTicket += item.moneyTicket || 0;
          return acc;
        }, {})
      );

      // sortare descrescătoare după influență
      grouped.sort((a, b) => b.moneyTicket - a.moneyTicket);

      setSupporters(grouped);

      // total influence
      const total = grouped.reduce((sum, s) => sum + (s.moneyTicket || 0), 0);
      setTotalInfluence(total);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupporters();
  }, [matchid]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Commet color={["#4c106a", "#6b1697", "#8b1dc3", "#a632e1"]} />
      </div>
    );

  return (
    <div className="supporters-container p-4">
      <h3 className="text-lg font-bold mb-4 text-white">
        Supporters Influence (Total: {totalInfluence})
      </h3>

      {supporters.length === 0 ? (
        <p className="text-gray-300">No supporters yet.</p>
      ) : (
        <ul className="space-y-3">
          {supporters.map((s, index) => (
            <li
              key={s._id}
              className="flex items-center justify-between bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/20"
            >
              <div className="flex items-center gap-3">
                <img
                  src={process.env.REACT_APP_LOGO + `/${s.user.profilePicture}`}
                  alt={s.user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-white">{s.user.username}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-pink-400 font-bold">
                  +{s.moneyTicket}
                </span>
                

                {/* 🏆 MVP pentru primul supporter */}
                {index === 0 ? (
                  <img className="ml-2 text-yellow-400 font-bold w-10" src={MVPMedal} alt="mvp"/>
                ) : (
                  <span className="ml-2 text-gray-300">
                    #{index + 1}
                  </span>
                )}
                <img
                  src={process.env.REACT_APP_LOGO + `/${s.team.imageUrl}`}
                  alt={s.user.username}
                  className="w-8 h-8 object-cover"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Supporters;