// pages/Homepage.js
import React, { useEffect, useState } from 'react';
import '../../styles/homepage.css';
import ManIcon from '../../assets/icons/man.png';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { showNotification } from '../../utils/NotificationMan';
import { formatMoney } from '../../utils/FormatMoney.js';
import DailyCashPopup from '../../components/DailyCashPopup.js';
import BarLoader from 'react-spinners/BarLoader';
import { Link } from 'react-router-dom';

function Homepage() {
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [newThreadText, setNewThreadText] = useState('');
  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupCash, setPopupCash] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    try{
      setLoading(true);
      fetch(process.env.REACT_APP_API + '/users/check-daily-cash', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.showPopup) {
            setShowPopup(true);
            setPopupMessage(data.message || '');
            setPopupCash(data.cash || 0);
          }
        })
        .catch(err => {
          showNotification("danger", "Failed", "Eroare verificare cash zilnic");
        });

      const fetchThreads = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(process.env.REACT_APP_API+'/posts/threads', {
          headers: {
                  'x-auth-token': token  // Attach the token here
                },
        });
        const data = await res.json();
        setThreads(data);
      };

      fetchThreads();

      fetch(process.env.REACT_APP_API + '/users', {
        credentials: 'include',
        headers: {
          'x-auth-token': token,
        },
      }).then(res => res.json())
        .then(_users => {
          const sortedUsers = _users.sort((a, b) => {
            if (b.cash !== a.cash) {
              return b.cash - a.cash;
            } else {
              return b.coins - a.coins;
            }
          });
          setUsers(sortedUsers);
        })
        .catch(err => {
          showNotification("danger", "Failed", "Eroare incarcare utilizatori");
        });

      fetch(process.env.REACT_APP_API + '/bets/top3/', {
        credentials: 'include',
        headers: {
          'x-auth-token': token,
        },
      }).then(res => res.json())
        .then(_bets => setBets(_bets));
      } catch (error) {
        showNotification("danger", "Failed", "Error while fetching data");
      } finally {
        setLoading(false); 
      }
  }, [token]);


  const addThread = async () => {
    const res = await fetch(`${process.env.REACT_APP_API}/posts/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify({ text: newThreadText }),
    });

    const newThread = await res.json();
    setThreads([newThread, ...threads]);
    setNewThreadText('');
  };

  const deleteThread = async (threadId) => {
    await fetch(`${process.env.REACT_APP_API}/posts/threads/${threadId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    });

    setThreads(threads.filter(thread => thread._id !== threadId));
  };

  const addComment = async (threadId, commentText) => {
    const res = await fetch(`${process.env.REACT_APP_API}/posts/threads/${threadId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify({ text: commentText }),
    });

    const newComment = await res.json();
    setThreads(threads.map(thread =>
      thread._id === threadId
        ? { ...thread, comments: [...thread.comments, newComment] }
        : thread
    ));
  };

  const deleteComment = async (commentId, threadId) => {
    await fetch(`${process.env.REACT_APP_API}/posts/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    });

    setThreads(threads.map(thread =>
      thread._id === threadId
        ? { ...thread, comments: thread.comments.filter(comment => comment._id !== commentId) }
        : thread
    ));
  };

  const formatDate = (dateString) => {
    const utcDate = new Date(dateString);
    const timezone = 'Europe/Bucharest';
    const zonedDate = toZonedTime(utcDate, timezone);
    return format(zonedDate, 'dd-MM-yyyy HH:mm');
  };

  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);

  return (
    <div className="index-home-container">
      {loading ? (
        <div className="loader-container">
          <BarLoader color="white" loading={loading} width={340}  height={6}/>
        </div>
      ) : (
      <>
        <DailyCashPopup show={showPopup} onHide={() => setShowPopup(false)} cash={popupCash} message={popupMessage} />
        <div className="left-side">
          <div className="thread-input-container">
            <textarea
              value={newThreadText}
              onChange={(e) => setNewThreadText(e.target.value)}
              placeholder="Start a thread..."
              className="thread-input"
            />
            <button onClick={addThread} className="add-thread-button">Post</button>
          </div>
          <div className="threads-list">
            {threads.length > 0 && threads.map(thread => (
              <div key={thread._id} className="thread-item">
                <div className="thread-author-time">
                  <div className="author-info">
                    <img src={ManIcon} alt='author' className='author_avatar'/>
                    <strong>{thread.user.username}</strong> • {formatDate(thread.createdAt)}
                  </div>
                  {thread.user._id === JSON.parse(atob(token.split('.')[1])).user.id && (
                    <button onClick={() => deleteThread(thread._id)} className="delete-button">X</button>
                  )}
                </div>
                <p>{thread.text}</p>
                <div className="thread-actions">
                  <span>{thread.comments.length} 💬</span>
                </div>
                <div className="comments-section">
                  {thread.comments.length > 0 && thread.comments.map((comment) => (
                    <div key={comment._id} className="comment">
                      <div className='comment-header'>
                        <div className="author-info">
                          <strong>{comment.user.username}</strong> • {formatDate(comment.createdAt)}
                        </div>
                        {comment.user._id === JSON.parse(atob(token.split('.')[1])).user.id && (
                          <button onClick={() => deleteComment(comment._id, thread._id)} className="delete-button">X</button>
                        )}
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        addComment(thread._id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="comment-input"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-side">
          <div className="events-container">
            <h3>Evenimente</h3>
            <div className='upcoming-events'>
              <Link to='/event'>
                <div className='event-container'>
                  <div className='event-image'>
                    <img src="https://t3.ftcdn.net/jpg/02/48/65/38/360_F_248653851_lMw1RUwPLpaBsSCT31eE3ZDY8WkIFpiq.jpg" alt="Event" />
                  </div>
                  <div className='event-text'>
                    <p>Welcome to the game</p>
                  </div>
                </div>
              </Link>
              <Link to='/event'>
                <div className='event-container'>
                  <div className='event-image'>
                    <img src="https://cache.desktopnexus.com/thumbseg/2511/2511883-bigthumbnail.jpg" alt="Event" />
                  </div>
                  <div className='event-text'>
                    <p>El Clasico it s here</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="league-container">
            <h3>Top 5 jucatori</h3>
            <table className='top_players_worlwide table hover'>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Cash</th>
                  <th>Bets</th>
                </tr>
              </thead>
              {users.length > 0 && users.map((user, index) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{formatMoney(user.cash)}💵</td>
                  <td>{user.coins}⚽</td>
                </tr>
              ))}
            </table>
          </div>

          <div className="matches-container">
            <h3>Urmatoarele meciuri</h3>
            <table className='top_players_worlwide table hover'>
              <thead>
                <tr>
                  <th>Gazde</th>
                  <th>Data</th>
                  <th>Oaspeti</th>
                </tr>
              </thead>
              {bets.length > 0 && bets.map((bet, index) => (
                <tr key={bet._id}>
                  <td>{bet.hometeam.name}</td>
                  <td>{formatter.format(new Date(bet.datetime))}</td>
                  <td>{bet.awayteam.name}</td>
                </tr>
              ))}
            </table>
          </div>
        </div>
      </>
      )}
    </div>
  );
}

export default Homepage;
