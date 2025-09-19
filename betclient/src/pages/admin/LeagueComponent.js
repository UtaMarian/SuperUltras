import React, { useEffect, useState } from 'react'
import { showNotification } from '../../utils/NotificationMan.js';

function LeagueComponent() {
  const [leagues, setLeagues] = useState([]);
  const [name, setName] = useState('');
  const [refresh, setRefresh] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(process.env.REACT_APP_API + '/leagues', {
      credentials: 'include',
      headers: { 'x-auth-token': token },
    })
      .then(res => res.json())
      .then(_leagues => setLeagues(_leagues))
      .catch(() => {
        showNotification("danger", "Failed", "Eroare de la server");
      });
  }, [refresh]);

  async function addNewLeague(ev) {
    ev.preventDefault();
    if (!name) {
      showNotification("info", "Failed", "Trebuie sa completati toate informatiile");
      return;
    }

    try {
      const res = await fetch(process.env.REACT_APP_API + '/leagues', {
        method: 'POST',
        body: JSON.stringify({ name }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
           'x-auth-token': token 
        },
        
      });

      if (res.ok) {
        setName('');
        setRefresh(prev => !prev);
        showNotification("success", "Success", "Liga a fost adaugata");
      }
    } catch (err) {
      showNotification("danger", "EROARE", "Eroare de server");
    }
  }

  async function deleteLeague(id) {
    const delresponse = await fetch(process.env.REACT_APP_API + '/leagues/' + id, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'x-auth-token': token },
    });
    if (delresponse.ok) {
      setRefresh(prev => !prev);
      showNotification("success", "Deleted", "Liga a fost stearsa");
    } else {
      showNotification("danger", "Failed", "Eroare la stergere");
    }
  }

  async function startSeason(id) {
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/leagues/${id}/start`, {
        method: "POST",
        credentials: "include",
        headers: { 'x-auth-token': token },
      });
      if (res.ok) {
        showNotification("success", "Success", "Sezonul a fost pornit");
        setRefresh(prev => !prev);
      } else {
        const data = await res.json();
        showNotification("danger", "Error", data.message || "Eroare la pornirea sezonului");
      }
    } catch (err) {
      showNotification("danger", "EROARE", "Eroare server la pornirea sezonului");
    }
  }

  async function endSeason(id) {
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/leagues/${id}/end`, {
        method: "POST",
        credentials: "include",
        headers: { 'x-auth-token': token },
      });
      if (res.ok) {
        showNotification("success", "Success", "Sezonul a fost incheiat");
        setRefresh(prev => !prev);
      } else {
        const data = await res.json();
        showNotification("danger", "Error", data.message || "Eroare la incheierea sezonului");
      }
    } catch (err) {
      showNotification("danger", "EROARE", "Eroare server la incheierea sezonului");
    }
  }

  return (
    <div>
      <form onSubmit={addNewLeague}>
        <div className="mb-3">
          <label className="form-label">Adauga numele ligii</label>
          <div className='same-row-input'>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={ev => setName(ev.target.value)}
            />
            <button type="submit" className="btn btn-primary">Adauga</button>
          </div>
          <div className="form-text">Numele ligii trebuie sa fie unic</div>
        </div>
      </form>

      <label className="form-label pt-4">Ligi existente</label>
      <table className="table table-hover admin-table-responsive">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nume</th>
            <th scope="col">Numar echipe</th>
            <th scope="col">Activa</th>
            <th scope="col">Actiuni</th>
            <th scope="col">Sterge</th>
          </tr>
        </thead>
        <tbody>
          {leagues.length > 0 && leagues.map((league, index) => (
            <tr key={league._id}>
              <th scope="row">{index + 1}</th>
              <td>{league.name}</td>
              <td>{league.no_teams}</td>
              <td>{league.is_active ? "Da" : "Nu"}</td>
              <td>
                {!league.is_active ? (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => startSeason(league._id)}
                  >
                    Start Sezon
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => endSeason(league._id)}
                  >
                    End Sezon
                  </button>
                )}
              </td>
              <td>
                <button
                  className='btn btn-outline-danger'
                  onClick={() => deleteLeague(league._id)}
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LeagueComponent
