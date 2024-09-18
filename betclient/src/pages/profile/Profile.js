import React, { useState, useEffect } from 'react';
import '../../styles/profile.css';
import CashIcon from '../../assets/icons/money.png';
import CoinIcon from '../../assets/icons/soccer-ball.png';
import CountryIcon from '../../assets/icons/romania.png';
import { Modal, Button, Badge } from 'react-bootstrap';
import DefaultProfilePicture from '../../assets/icons/man.png';
import { showNotification } from '../../utils/NotificationMan.js';
import '../../styles/header.css';
import '../../styles/bets.css';
import BarLoader from 'react-spinners/BarLoader';

const Profile = () => {

  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    username: '',
    email: '',
    cash: 0,
    coins: 0,
    favTeam: '',
    profilePicture: '',
    rank: { name: '', icon: '' },
    joinDate: '',
    lastSeen: ''
  });

  const [teams, setTeams] = useState([]);  // For storing teams list
  const [file, setFile] = useState(null);  // For storing selected file
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    favTeam: '',
    profilePicture: ''
  });
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  // Fetch user data and teams data when component mounts
  useEffect(() => {
    try{
      setLoading(true);
    async function fetchUserData() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(process.env.REACT_APP_API + '/users/profile', {
          credentials: 'include',
          headers: {
            'x-auth-token': token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUser(data);
        setFormData({
          username: data.username,
          email: data.email,
          favTeam: data.favTeam._id,
          profilePicture: data.profilePicture
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    async function fetchTeams() {
      try {
        const response = await fetch(process.env.REACT_APP_API + '/teams', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }

        const teamsData = await response.json();
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    }

    async function fetchUserBets() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(process.env.REACT_APP_API + '/match/user-finish-bets', {
          credentials: 'include',
          headers: {
            'x-auth-token': token
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch user bets');
        }
  
        const betsData = await response.json();
     
        setBets(betsData);
      } catch (error) {
        console.error('Error fetching user bets:', error);
      }
    }
    fetchUserData();
    fetchTeams();
    fetchUserBets();
  } catch (error) {
    showNotification("danger", "Failed", "Error while fetching data");
  } finally {
    setLoading(false); 
  }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('favTeam', formData.favTeam);
      
      if (file) {
        formDataToSend.append('file', file);
      }

      const response = await fetch(process.env.REACT_APP_API + '/users/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'x-auth-token': token
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setShowModal(false);
      showNotification("SUCCESS",'Yee!',"Informatiile utilizatorului au fost modificate")
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification("DANGER","Eroare",`Error updating profile ${error}`);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        showNotification("DANGER","Eroare","New passwords do not match");
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(process.env.REACT_APP_API + '/users/resetpassword', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      showNotification("SUCCESS",'Yee!',"Parola a fost resetata")

      setShowResetPasswordModal(false);
    } catch (error) {
      showNotification("DANGER","Eroare",`Failed to reset password ${error}`)

    }
  };


  return (
    <>
     {loading ? (
        <div className="loader-container">
          <BarLoader color="white" loading={loading} width={340}  height={6}/>
        </div>
      ) : (
  <div className='profile-div'>
    <div className="profile-container">
      <div className="profile-header">
        {user.profilePicture?<img src={process.env.REACT_APP_LOGO + `/${user.profilePicture}` } alt="Profile" className="profile-picture" /> :<img src={DefaultProfilePicture} alt="Profile" className="profile-picture" />}
        
        <div className="profile-info">
          <h2 className="profile-username">
            <span className="country-flag">
              <img src={CountryIcon} alt="Flag" />
            </span>
            {user.username}
            {user.role && user.role!=="user"?  
            <div className="role-info">
                <span className="user-role-name">{user.role.toUpperCase()}</span>
            </div>:<></>}
           
          </h2>
          <div className="profile-stats">
            <span className="profile-rank">
              <img src={process.env.REACT_APP_LOGO + `/${user.rank.icon}`} alt={user.rank.name} title="Rank" className="rank-icon"/>
              {user.rank.name}
            </span>
            <span className="profile-points">
              <img src={CashIcon} alt="Points" className='money-icons' title="Money" />
              {user.cash}
            </span>
            <span className="profile-coins">
              <img src={CoinIcon} alt="Coins" className='money-icons' title="Coins" />
              {user.coins}
            </span>
          </div>
          <div className="profile-meta">
            <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
            <p>Last seen: {user.lastSeen}</p>
          </div>
          {user.favTeam && (
            <div className="favorite-team">
              <p>Echipa favorita:</p>
              <div className="team-info">
                <img src={process.env.REACT_APP_LOGO + `/${user.favTeam.imageUrl}`} alt={user.favTeam.name} className="favorite-team-logo" />
                <span className="favorite-team-name">{user.favTeam.name}</span>
              </div>
            </div>
          )}
        </div>
        <div className="profile-actions">
          <button className="action-button" onClick={() => setShowModal(true)}>Editeaza</button>
          <button className="action-button" onClick={() => setShowResetPasswordModal(true)}>Reseteaza parola</button>
        </div>
      </div>
      {/* Bootstrap Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div>
            <label>Favorite Team:</label>
            <select
              name="favTeam"
              value=""
              onChange={handleChange}
              className="form-control"
            >
              {user.favTeam? <option value="0">{user.favTeam.name}</option>: <option value="0">Select your favorite team</option>}
             
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Profile Picture:</label>
            <input
              type="file"
              name="profilePicture"
              onChange={handleFileChange}
              className="form-control"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Reset Password Modal */}
      <Modal show={showResetPasswordModal} onHide={() => setShowResetPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label>Old Password:</label>
            <input
              type="password"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              className="form-control"
              required
            />
          </div>
          <div>
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="form-control"
              required
            />
          </div>
          <div>
            <label>Confirm New Password:</label>
            <input
              type="password"
              name="confirmNewPassword"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
              className="form-control"
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetPasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleResetPassword}>
            Reset Password
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    
    <div className='bets_history'>
      Istoric predictii
    </div>
    <div className='match-container match-container-header'>
      
          <div>STATUS</div>
          <div className='responsive_trash'></div>
          <div>ACASA</div>
          <div>SCOR</div>
          <div>DEPLASARE</div>
          <div className='responsive_trash'></div> 
          <div>BET</div>
          <div>OPTION</div>
          <div>POTENTIAL</div>
        </div>
        {bets.length>0 && bets.map((bet, index) =>(
          <div className='match-container'>
            <div className='responsive_trash'></div>
            <div>{bet.matchId.status==='in_progress'? <Badge bg='success'>LIVE</Badge>: (bet.matchId.status==='finished'?  <Badge bg='danger'>Finished</Badge>: <Badge bg='warning'>Upcoming</Badge>)}</div>
            <div className='responsive_trash'></div>
            <div className='team-match-div'>
              <div> <img src={process.env.REACT_APP_LOGO +`/${bet.matchId.hometeam.imageUrl}`} alt='logo' className='team_logo_modal'/></div> 
              <div className='hometeam_modal'>{bet.matchId.hometeam.name}  </div> 
            </div>
            <div className='score-div'>
              <div className='score_bet_final'>
                <div className='score_home'>{bet.game.homeScore}</div>
                <div className='score_delim'>-</div>
                <div className='score_away'>{bet.game.awayScore}</div>
              </div> 
            </div>
            <div className='team-match-div'>
              <div > <img src={process.env.REACT_APP_LOGO +`/${bet.matchId.awayteam.imageUrl}`} alt='logo' className='team_logo_modal'/></div> 
              <div className='awayteam_modal'>{bet.matchId.awayteam.name}  </div> 
            </div>
            <div>
              <input disabled type='text' className='form-control'  value={bet.betCash+'💵'}  />  
            </div>
            <div className='bet_option'>{bet.betOption}</div>
            <div>{bet.winCash} 💵</div>
          </div>
        ))}
    </div>
    )}</>
  );
};

export default Profile;
