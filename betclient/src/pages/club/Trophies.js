import React, { useEffect, useState } from "react";
import "../../styles/club.css";
import ReactCardFlip from 'react-card-flip';

const TrophyCard = ({ trophy }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => setIsFlipped(!isFlipped);

  return (
    <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
      {/* Front */}
      <div
        className="relative w-32 h-40 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={handleClick}
      >
        {/* Glowing lights */}
        <div className="absolute w-24 h-24 -top-6 -z-10 rounded-full bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-purple-500 blur-3xl opacity-70"></div>
        <div className="absolute w-24 h-24 -bottom-6 -z-10 rounded-full bg-gradient-to-bl from-pink-400 via-red-400 to-rose-500 blur-2xl opacity-60"></div>

        {/* Trophy icon */}
        <div
          className={`w-16 h-16 bg-contain bg-no-repeat trophy trophy-${trophy.name
            .replace(/\s+/g, "-")
            .toLowerCase()}`}
        ></div>
      </div>

      {/* Back */}
      <div
        className="relative w-32 h-40 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={handleClick}
      >
        {/* Glowing lights behind still visible */}
        <div className="absolute w-28 h-28 -top-6 -z-10 rounded-full bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-purple-500 blur-3xl opacity-70"></div>
        <div className="absolute w-20 h-20 -bottom-6 -z-10 rounded-full bg-gradient-to-bl from-pink-400 via-red-400 to-rose-500 blur-2xl opacity-60"></div>

        {/* Trophy name and year */}
        <div className="text-center text-white font-bold text-sm sm:text-base">
          {trophy.name} <span className="text-white">({trophy.year})</span>
        </div>
      </div>
    </ReactCardFlip>
  );
};





const Trophies = ({ teamid }) => {
  const [trophies, setTrophies] = useState([]);
   const token = localStorage.getItem("token");
  const [records, setRecords] = useState(null);

  useEffect(() => {
    const fetchTrophies = async () => {
      
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API}/teams/${teamid}/trophies`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch trophies: ${res.status}`);
        }

        const data = await res.json();
        setTrophies(data);
      } catch (err) {
        console.error("Error loading trophies", err);
      }
    };

     const fetchRecords = async () => {
      
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API}/teams/${teamid}/records`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch trophies: ${res.status}`);
        }

        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error("Error loading trophies", err);
      }
    };
    if (teamid) {
      fetchTrophies();
      fetchRecords();
    }
  }, [teamid]);

  return (
    <div className="trophy-cabinet-container club-content-background">
      <div className="trophies-section">
        <h3>Trofee</h3>
        <div className="trophies">
          {trophies.length === 0 ? (
            <p>Nicio cupă câștigată încă 🏳️</p>
          ) : (
            trophies.map((t, i) => (
            //   <div key={i} className="trophy-section">
            //     <div className={`trophy trophy-${t.name.replace(/\s+/g, "-").toLowerCase()}`}></div>
            //     <div className="trophy-name">
            //       {t.name} ({t.year})
            //     </div>
            //   </div>
               <TrophyCard key={i} trophy={t} />


            ))
          )}
        </div>
      </div>
       {/* Records Section */} 
   <div className="records-section">
      <h3>Recorduri</h3>
      {records ? (
      <div className="records">
         <div className="record-item">
            <span>0</span> 
            <p>Cea mai multa influenta adaugata intr-un meci</p>
         </div>
         <div className="record-item">
            <span>13-0</span> 
            <p>Cea mai mare diferenta de scor</p>
         </div>
         <div className="record-item">
            <span>273</span> 
            <p>Cele mai multe goluri intr-un sezon</p>
         </div>
         <div className="record-item">
            <span>701064</span> 
            <p>Cel mai mare numar de fani</p>
         </div>
      </div>
      ) : (
        <p >No records...</p>
      )}
   </div>
   {/* Championship Section */} 
   {/* <div className="championship-section">
      <h3>Championship</h3>
      <table className="season-table">
         <thead>
            <tr>
               <th>Championship</th>
               <th>Poz</th>
               <th>Meciuri</th>
               <th>Top Players</th>
               <th>Trofee</th>
            </tr>
         </thead>
         <tbody>
            <tr>
               <td>Season 150</td>
               <td>4</td>
               <td>9 - 0 - 2</td>
               <td>
                  <div className="top-players"></div>
               </td>
               <td>
                  <div className="trophy-icons">
                     <div className="trophy trophy-elite-cup"></div>
                     <div className="trophy trophy-champions-cup"></div>
                  </div>
               </td>
            </tr>
            <tr>
               <td>Season 149</td>
               <td>2</td>
               <td>24 - 0 - 0</td>
               <td>
                  <div className="top-players"></div>
               </td>
               <td>
                  <div className="trophy-icons">
                     <div className="trophy trophy-elite-cup"></div>
                     <div className="trophy trophy-league"></div>
                     <div className="trophy trophy-national-cup"></div>
                     <div className="trophy trophy-international-cup"></div>
                  </div>
               </td>
            </tr>
            <tr>
               <td>Season 148</td>
               <td>1</td>
               <td>26 - 0 - 0</td>
               <td>
                  <div className="top-players"></div>
               </td>
               <td>
                  <div className="trophy-icons trophy-league">
                     <div className="trophy trophy-elite-cup"></div>
                     <div className="trophy trophy-league"></div>
                     <div className="trophy trophy-national-cup"></div>
                     <div className="trophy trophy-international-cup"></div>
                     <div className="trophy trophy-champions-cup"></div>
                  </div>
               </td>
            </tr>
         </tbody>
      </table>
   </div> */}
    </div>
  );
};

export default Trophies;
