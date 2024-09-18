import React, { useEffect, useState } from 'react';
import { showNotification } from '../../utils/NotificationMan.js';

function RankComponent() {
  const [ranks, setRanks] = useState([]);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [dailyCash, setDailyCash] = useState('');
  const [coinsNeedToRankUp, setCoinsNeedToRankUp] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentRankId, setCurrentRankId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(process.env.REACT_APP_API + '/ranks', {
      credentials: 'include',
      headers: {
          'x-auth-token': token  // Attach the token here
        },
    })
      .then((res) => res.json())
      .then((_ranks) => {
        setRanks(_ranks);
      })
      .catch((err) => {
        showNotification('danger', 'Failed', 'Server error');
      });
  }, [refresh]);

  async function addOrEditRank(ev) {
    ev.preventDefault();
    if (!(name && dailyCash && coinsNeedToRankUp)) {
      showNotification('info', 'Failed', 'Please fill in all the fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('dailyCash', dailyCash);
      formData.append('coinsNeedToRankUp', coinsNeedToRankUp);

      if (file) {
        formData.append('file', file);
      }

      const method = editMode ? 'PUT' : 'POST';
      const url = editMode
        ? `${process.env.REACT_APP_API}/ranks/${currentRankId}`
        : `${process.env.REACT_APP_API}/ranks`;

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
        headers: {
            'x-auth-token': token  // Attach the token here
          },
      });

      if (res.ok) {
        setName('');
        setFile(null);
        setDailyCash('');
        setCoinsNeedToRankUp('');
        setRefresh((prev) => !prev);
        setEditMode(false);
        showNotification('success', 'Success', 'Rank has been saved');
      }
    } catch (err) {
      showNotification('danger', 'Error', 'Server error');
    }
  }

  async function deleteRank(id) {
    const res = await fetch(`${process.env.REACT_APP_API}/ranks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
          'x-auth-token': token  // Attach the token here
        },
    });

    if (res.ok) {
      setRefresh((prev) => !prev);
      showNotification('success', 'Deleted', 'Rank has been deleted');
    } else {
      showNotification('danger', 'Failed', 'Error while deleting rank');
    }
  }

  function handleEdit(rank) {
    setName(rank.name);
    setDailyCash(rank.dailyCash);
    setCoinsNeedToRankUp(rank.coinsNeedToRankUp);
    setCurrentRankId(rank._id);
    setEditMode(true);
  }

  return (
    <div>
      <form onSubmit={addOrEditRank}>
        <div className="mb-3">
          <label className="form-label">Add or Edit Rank</label>
          <div className="same-row-input">
            <input
              type="text"
              className="form-control"
              placeholder="Rank Name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
            <input
              type="number"
              className="form-control ms-3"
              placeholder="Daily Cash"
              value={dailyCash}
              onChange={(ev) => setDailyCash(ev.target.value)}
            />
            <input
              type="number"
              className="form-control ms-3"
              placeholder="Coins to Rank Up"
              value={coinsNeedToRankUp}
              onChange={(ev) => setCoinsNeedToRankUp(ev.target.value)}
            />
            <input
              type="file"
              className="form-control ms-3"
              onChange={(ev) => setFile(ev.target.files[0])}
            />
            <button type="submit" className="btn btn-primary ms-3">
              {editMode ? 'Update Rank' : 'Add Rank'}
            </button>
          </div>
          <div className="form-text">All fields are required</div>
        </div>
      </form>

      <label className="form-label pt-4">Existing Ranks</label>
      <table className="table table-hover admin-table-responsive">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Icon</th>
            <th scope="col">Daily Cash</th>
            <th scope="col">Coins to Rank Up</th>
            <th scope="col">Edit</th>
            <th scope="col">Delete</th>
          </tr>
        </thead>
        <tbody>
          {ranks.length > 0 &&
            ranks.map((rank, index) => (
              <tr key={rank._id}>
                <th scope="row">{index + 1}</th>
                <td>{rank.name}</td>
                <td>
                
                  {rank.icon && <img src={process.env.REACT_APP_LOGO + `/${rank.icon}`} alt={rank.name} width="40px" />}
                </td>
                <td>{rank.dailyCash}</td>
                <td>{rank.coinsNeedToRankUp}</td>
                <td>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => handleEdit(rank)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => deleteRank(rank._id)}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default RankComponent;
