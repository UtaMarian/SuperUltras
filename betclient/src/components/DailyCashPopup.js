// components/DailyCashPopup.js
import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { formatMoney } from '../utils/FormatMoney'; 
import { showNotification } from '../utils/NotificationMan';
import '../styles/dailyCashPopup.css';

const DailyCashPopup = ({ show, onHide, cash, message }) => {
    const [imageUrl, setImageUrl] = useState('');
    const token = localStorage.getItem('token');
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
          <Modal.Title>Daily Cash Collection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message ? (
            <div className='rank_up_div'>
             
              <p>Congrulations! You have rank up to {message}</p>
              <img src={process.env.REACT_APP_LOGO + `/${imageUrl}`} alt='logo' className='rank_up_logo' />
            </div>
          ) : (
            <div>
              <p>You have collected {formatMoney(cash)}💵 today!</p>
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
