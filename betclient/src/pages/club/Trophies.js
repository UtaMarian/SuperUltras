import React from 'react';
import '../../styles/club.css';

const Trophies = () => {
  return (
    <div className="trophy-cabinet-container">
      {/* Trophies Section */}
      <div className="trophies-section">
        <h3>Trofee</h3>
        <div className="trophies">
            <div className='trophy-section'>
                <div className="trophy trophy-league"></div>
                <div className='trophy-name'>Champions League</div>
            </div>
            <div className='trophy-section'>
                <div className="trophy trophy-national-cup"></div>
                <div className='trophy-name'>Europa League</div>
            </div>
            <div className='trophy-section'>
                <div className="trophy trophy-champions-cup"></div>
                <div className='trophy-name'>Campionat</div>
            </div>
            <div className='trophy-section'>
                <div className="trophy trophy-international-cup"></div>
                <div className='trophy-name'>Cupa Nationala</div>
            </div>
            <div className='trophy-section'>
                <div className="trophy trophy-elite-cup"></div>
                <div className='trophy-name'>Supercupa</div>
            </div>
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
      <div className="championship-section">
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
              <td><div className="top-players"></div></td>
              <td><div className="trophy-icons">
              <div className="trophy trophy-elite-cup"></div>
                    <div className="trophy trophy-champions-cup"></div></div></td>
            </tr>
            <tr>
              <td>Season 149</td>
              <td>2</td>
              <td>24 - 0 - 0</td>
              <td><div className="top-players"></div></td>
              <td><div className="trophy-icons">
              <div className="trophy trophy-elite-cup"></div>
                    <div className="trophy trophy-league"></div>
                    <div className="trophy trophy-national-cup"></div>
                    <div className="trophy trophy-international-cup"></div>
               </div></td>
            </tr>
            <tr>
              <td>Season 148</td>
              <td>1</td>
              <td>26 - 0 - 0</td>
              <td><div className="top-players"></div></td>
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
      </div>
    </div>
  );
};

export default Trophies;
