import React, { useEffect, useState } from 'react';
import { showNotification } from '../../utils/NotificationMan.js';
import '../../styles/leagues.css';
import { formatMoney } from '../../utils/FormatMoney.js';
import BarLoader from 'react-spinners/BarLoader';

function IndexLeague() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [userBets, setUserBets] = useState({}); // Store bets for each user
  const token = localStorage.getItem('token');

  useEffect(() => {

    try{
      setLoading(true);
      // Fetch users
      fetch(process.env.REACT_APP_API + '/users', {
        credentials: 'include',
        headers: {
          'x-auth-token': token
        }
      })
        .then(res => res.json())
        .then(_users => {
          const sortedUsers = _users.sort((a, b) => {
            if (b.cash !== a.cash) {
              return b.cash - a.cash; // Sort by cash in descending order
            } else {
              return b.coins - a.coins; // If cash is equal, sort by coins in descending order
            }
          });
          setUsers(sortedUsers);

          // Fetch last 5 ended bets for each user
          sortedUsers.forEach(user => {
            fetch(`${process.env.REACT_APP_API}/match/recent/${user._id}`, {
              credentials: 'include',
              headers: {
                'x-auth-token': token
              }
            })
              .then(res => res.json())
              .then(bets => {
                setUserBets(prevBets => ({
                  ...prevBets,
                  [user._id]: bets
                }));
              })
              .catch(err => {
                showNotification("danger", "Failed", "Error loading user bets");
              });
          });
        })
        .catch(err => {
          showNotification("danger", "Failed", "Error loading users");
        });
      } catch (error) {
        showNotification("danger", "Failed", "Error while fetching data");
      } finally {
        setLoading(false); 
      }
  }, [token]);

  return (
    <div className='index-league-container'>
       {loading ? (
        <div className="loader-container">
          <BarLoader color="white" loading={loading} width={340}  height={6}/>
        </div>
      ) : (
        <table className="table table-hover table-league">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Rank</th>
              <th scope="col">Picture</th>
              <th scope="col">Name</th>
              <th scope='col' className='responsive_hidden'>Form</th>
              <th scope="col">Bets⚽</th>
              <th scope="col">Cash💵</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 && users.map((user, index) => (
              <tr key={user._id}>
                <th scope="row">{index + 1}</th>
                <td><img src={process.env.REACT_APP_LOGO + `/${user.rank.icon}`} alt='logo' className='team_logo' title={user.rank.name} /></td>
                <td><img src={process.env.REACT_APP_LOGO + `/${user.profilePicture}`} alt='logo' className='team_logo' /></td>
                <td className='table_username'>{user.username}</td>
                <td className='responsive_hidden'>
                  <div className='user_bets_form '>
                    {userBets && userBets[user._id] ? (
                      userBets[user._id].map((bet, i) => (
                        <div key={i} className={bet === 'W' ? 'W' : 'L'}>
                          {bet}
                        </div>
                      ))
                    ) : (
                      <div>No Bets</div>
                    )}
                  </div>
                </td>
                <td>{user.coins}⚽</td>
                <td>{formatMoney(user.cash)}💵</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default IndexLeague;
