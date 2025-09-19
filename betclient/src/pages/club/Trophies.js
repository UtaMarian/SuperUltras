import React, { useEffect, useState } from "react";
import "../../styles/club.css";

const Trophies = ({ teamid }) => {
  const [trophies, setTrophies] = useState([]);
const token = localStorage.getItem("token");

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

    if (teamid) {
      fetchTrophies();
    }
  }, [teamid]);

  return (
    <div className="trophy-cabinet-container">
      <div className="trophies-section">
        <h3>Trofee</h3>
        <div className="trophies">
          {trophies.length === 0 ? (
            <p>Nicio cupă câștigată încă 🏳️</p>
          ) : (
            trophies.map((t, i) => (
              <div key={i} className="trophy-section">
                <div className={`trophy trophy-${t.name.replace(/\s+/g, "-").toLowerCase()}`}></div>
                <div className="trophy-name">
                  {t.name} ({t.year})
                </div>
              </div>
            ))
          )}
        </div>
      </div>
       {/* Records Section */} 
   <div className="records-section">
      <h3>Recorduri</h3>
      <div className="records">
         <div className="record-item">
            <span>20.60B</span> 
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
