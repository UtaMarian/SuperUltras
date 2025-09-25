import  { useState, useEffect } from 'react';
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

import PlayerStatsCard from './PlayerStatsCard.js';
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
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


const Profile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const currentUserId = token ? jwtDecode(token).id : null;
  const isOwnProfile = id === currentUserId;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  // const [user, setUser] = useState({
  //   username: '',
  //   email: '',
  //   cash: 0,
  //   coins: 0,
  //   favTeam: '',
  //   profilePicture: '',
  //   rank: { name: '', icon: '' },
  //   joinDate: '',
  //   lastSeen: ''
  // });

  const [teams, setTeams] = useState([]);  
  const [file, setFile] = useState(null);  
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
    async function fetchUser() {
      try {
        setLoading(true);
        const endpoint = id 
        ? `${process.env.REACT_APP_API}/users/profile/${id}` 
        : `${process.env.REACT_APP_API}/users/profile`;
        const res = await fetch(endpoint, {
          credentials: "include",
          headers: { "x-auth-token": token },
        });
        if(res.ok){
          const data = await res.json();
          setUser(data);
          setFormData( { username: data.username,
            email: data.email,
            favTeam: data.favTeam._id,
            profilePicture:data.profilePicture});
        }
      } catch (err) {
        console.error("Error loading user:", err);
       
      } finally {
        setLoading(false);
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
    fetchTeams();
    fetchUser();
  }, [id,token]);

  if (loading) 
    return <div className="loader-container">
              <BarLoader color="white" loading={loading} width={340}  height={6}/>
          </div>
  ;
  if (!user) return <div>User not found</div>;

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
  
  <div className='profile-div'>
    <div className="profile-container">
      <div className="profile-header flex flex-col md:flex-row items-center justify-between shadow-lg p-6 gap-6">
  
  {/* Profile Picture */}
  <div className="flex items-center gap-4">
    <img
      src={
        user.profilePicture
          ? process.env.REACT_APP_LOGO + `/${user.profilePicture}`
          : DefaultProfilePicture
      }
      alt="Profile"
      className="w-24 h-24 rounded-full border-4 border-pink-500/50 shadow-md object-cover"
    />
    
    {/* Main Info */}
    <div className="profile-info space-y-2">
      <h2 className="profile-username flex items-center gap-2 text-2xl font-bold text-white">
        {/* Flag */}
      
        {user.username}
        {/* Role */}
        {user.role && user.role !== "user" && (
          <span className="ml-2 px-3 py-1 text-xs font-semibold uppercase 
                           bg-gradient-to-r from-pink-600 to-fuchsia-700 
                           text-white rounded-full shadow">
            {user.role}
          </span>
          
        )
        }
         {(user._id===user.favTeam.manager) && <span className="ml-2 px-3 py-1 text-xs font-semibold uppercase 
                           bg-gradient-to-r from-pink-600 to-fuchsia-700 
                           text-white rounded-full shadow">
            manager
          </span> }
      </h2>

      {/* Rank */}
      <div className="profile-stats flex items-center gap-2 text-gray-200">
        <p className="font-semibold">Rank:</p>
        <img
          src={process.env.REACT_APP_LOGO + `/${user.rank.icon}`}
          alt={user.rank.name}
          title="Rank"
          className="w-8 h-8"
        />
        <span className='text-white'>{user.rank.name}</span>
      </div>

      {/* Meta Info */}
      <div className="profile-meta text-sm text-gray-400">
        <p>{t("profile.joined")}: {new Date(user.createdAt).toDateString()}</p>
        <p>{t("profile.seen")}: {new Date(user.lastLogin).toDateString()}</p>
      </div>

      {/* Favorite Team */}
      {user.favTeam && (
        <div className="favorite-team flex items-center gap-2 text-sm text-gray-200">
          <p className="font-semibold">{t("profile.favoriteTeam")}:</p>
          <div className="team-info flex items-center gap-2">
            <img
              src={process.env.REACT_APP_LOGO + `/${user.favTeam.imageUrl}`}
              alt={user.favTeam.name}
              className="w-10 h-10 "
            />
            <span className='text-white'>{user.favTeam.name}</span>
           
          </div>
        </div>
      )}

      {/* Position */}
      <div className="profile-meta flex items-center gap-2 text-sm text-gray-200">
        <p className="font-semibold">{t("profile.position")}:</p>
        <div className={` py-1 table-player-position p-${user.player.position} text-white  font-semibold `}>
          {user.player.position}
        </div>
      </div>
    </div>
  </div>

  {/* Actions */}
  {isOwnProfile && (
    <div className="profile-actions flex gap-3 mt-4 md:mt-0">
      <button
        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 
                   text-white font-semibold shadow transition"
        onClick={() => setShowModal(true)}
      >
        {t("profile.edit")}
      </button>
      <button
        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 
                   text-white font-semibold shadow transition"
        onClick={() => setShowResetPasswordModal(true)}
      >
        {t("profile.reset")}
      </button>
    </div>
  )}
</div>

      {/* Bootstrap Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t("profile.editprofile")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label>{t("profile.username")}:</label>
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
            <label>{t("profile.email")}:</label>
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
            <label>{t("profile.favoriteTeam")}:</label>
            <select
              name="favTeam"
              value=""
              onChange={handleChange}
              className="form-control"
            >
              {user.favTeam? <option value="0">{user.favTeam.name}</option>: <option value="0">{t("profile.select")}</option>}
             
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>{t("profile.picture")}:</label>
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
            {t("profile.cancel")}
          </Button>
          <Button variant="success" onClick={handleSaveChanges}>
            {t("profile.save")}
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
            <label>{t("profile.old")}:</label>
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
            <label>{t("profile.new")}:</label>
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
            <label>{t("profile.confirm")}:</label>
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
            {t("profile.cancel")}
          </Button>
          <Button variant="primary" onClick={handleResetPassword}>
            {t("profile.reset")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    
   
    <div className="trophy-cabinet-container">
      {/* Trophies Section */}
      <div className="trophies-section">
        <h3>{t("profile.trophies")}</h3>
        <div className="trophies">
              {!user.trophies && <p className='text-white'>No trophies yet. Play more to earn some!</p>}
              {user.trophies && user.trophies.length > 0 && user.trophies.map((trophy, index) => (
            <TrophyCard key={index} trophy={trophy} />
          ))}
          
        </div>

        {/* <div className='player-bio-stats'>
           
          <PlayerStatsCard player={{
  name: "Cristiano Ronaldo",
  position: "ST",
  matches: 850,
  level: 99,
  goals: 780,
  influence: 200,
  wonBets: 120
}} />
        </div> */}

      </div>
      </div>
    </div>
    </>
  );
};

export default Profile;
