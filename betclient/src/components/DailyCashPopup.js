// components/DailyCashPopup.js
import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { formatMoney } from '../utils/FormatMoney'; 
import { showNotification } from '../utils/NotificationMan';
import '../styles/dailyCashPopup.css';

const DailyCashPopup = ({ show, onHide, cash, message }) => {
    const [imageUrl, setImageUrl] = useState('');
    const token = localStorage.getItem('token');
    console.log(message)
    useEffect(() => {
        // Function to fetch the rank image URL
        const fetchRankImage = async () => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API}/ranks/rank-image/${message}`, {
                credentials: 'include',
                headers: {
                  'x-auth-token': token
                }
              });
            
            if (!response.ok) {
              throw new Error('Failed to fetch rank image');
            }
            
            const data = await response.json();
            setImageUrl(data.imageUrl);

          } catch (err) {
            
          }
        };
    
        if (message) {
          fetchRankImage();
          
        }
      }, [message]);
    
    return (
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Daily Rewards</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message ? (
            <div className="rank-up-container relative flex flex-col items-center justify-center p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 text-center text-white overflow-hidden">
            
              {/* Background lights */}
              <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-indigo-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              </div>
            
              {/* Content */}
              <p className="text-2xl font-bold relative z-10 drop-shadow-lg">
                🎉 Congratulations! 🎉
              </p>
              <p className="text-lg mt-2 relative z-10">
                You have ranked up to <span className="text-yellow-300 font-semibold text-xl">{message}</span>
              </p>
            
              {/* Rank Image with glowing aura */}
              <div className="relative mt-6">
                <div className="absolute inset-0 w-40 h-40 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 blur-2xl opacity-70 animate-pulse"></div>
                <img
                  src={process.env.REACT_APP_LOGO + `/${imageUrl}`}
                  alt="logo"
                  className="rank_up_logo relative z-10 w-32  drop-shadow-2xl"
                />
              </div>
            </div>
          ) : (
            <div className="reward-container relative flex flex-col items-center justify-center p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-pink-800 via-purple-600 to-pink-900 text-center text-white overflow-hidden mt-6">

            {/* Background lights */}
            <div className="absolute inset-0">
              <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-green-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-44 h-44 bg-yellow-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            </div>

            {/* Content */}
            <p className="text-xl font-bold relative z-10 drop-shadow-lg">
              💰 Daily Reward
            </p>
            <p className="text-lg mt-2 relative z-10">
              You have collected <span className="text-yellow-300 font-semibold">{formatMoney(cash)}💵</span> today!
            </p>

          </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

export default DailyCashPopup;
