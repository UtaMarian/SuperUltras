import React , { useEffect, useState } from 'react'
import { showNotification } from '../../utils/NotificationMan.js';

export default function UserComponent() {
    const [users,setUsers]=useState([]);
    const token = localStorage.getItem('token');
    useEffect(()=>{
        fetch(process.env.REACT_APP_API+'/users',{
            credentials:'include' ,
            headers: {
                'x-auth-token': token
              }
        }).then(res=>{
            res.json().then(_users=>{
                setUsers(_users);
            })
        }).catch(err=>{
            showNotification("danger","Failed","Eroare incarcare utilizatori");
        })
    },[]);

    
  const options = {
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
 
  return (
    <div>
        <label className="form-label pt-4">Utilizatori existenti</label>
        <table className="table  table-hover admin-table-responsive">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Nume</th>
                    <th scope="col">Email</th>
                    <th scope="col">Cash💵</th>
                    <th scope="col">Coins⚽</th>
                    <th scope="col">Data crearii</th>
                </tr>
            </thead>
            <tbody>
            {users.length>0 && users.map((user, index) =>(
                <tr  key={user._id}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.cash}💵</td>
                    <td>{user.coins}⚽</td>
                    <td>{formatter.format(new Date(user.createdAt))}</td>
                    {/* <td><button className='btn btn-outline-danger' onClick={() => deleteLeague(league._id,true)}>X</button></td> */}
                </tr>
            ))}
            </tbody>
        </table>
    </div>
  )
}

