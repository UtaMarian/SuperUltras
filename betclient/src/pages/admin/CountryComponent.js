import React , { useEffect, useState } from 'react'
import { showNotification } from '../../utils/NotificationMan.js';

function CountryComponent() {
    const [countries,setCountries]=useState([]);
    const [name,setName] = useState('');
    const [abbreviation,setAbbreviation] = useState('');
    const [refresh, setRefresh] = useState(false); 

    useEffect(()=>{
        fetch(process.env.REACT_APP_API+'/countries',{
            credentials:'include'
        }).then(res=>{
            res.json().then(_countries=>{
                setCountries(_countries);
            })
        }).catch(err=>{
            showNotification("danger","Failed","Eroare de la server");
        })
    },[refresh]);

    async function addNewCountry(ev) {
        try{
            if( !(name && abbreviation)){
                showNotification("info","Failed","Trebuie sa completati toate informatii");
                ev.preventDefault();
            }else{
                ev.preventDefault();
                const res= await fetch(process.env.REACT_APP_API+'/countries',{
                    method:'POST',
                    body: JSON.stringify({ name, abbreviation }),
                    credentials:'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                if(res.ok){
                    setName('');
                    setAbbreviation('');
                    setRefresh(prev => !prev);
                    showNotification("success","Success","Tara a fost adaugata");
                }
            }
        }catch(err){
            showNotification("danger","EROARE","Eroare de server");
        }
    }
    async function deleteCountry(id){
        console.log(id);
        const delresponse = await fetch(process.env.REACT_APP_API+'/countries/'+id, {
          method: 'DELETE',
          credentials: 'include',
        });
        if(delresponse){
            setRefresh(prev => !prev);
            //const updatedCountries= posts.filter(post => post._id !== id);
            //setPosts(updatedPosts);
          showNotification("success","Deleted","Tara a fost stearsa");
        }else{
          showNotification("danger","Failed","Eroare la stergere");
        }
      }
  return (
    <div>
    <form  onSubmit={addNewCountry}>
        <div className="mb-3">
            <label  className="form-label">Adauga numele tarii</label>
            <div className='same-row-input'>
                <input type="text" className="form-control" id="name" placeholder='Nume tara' value={name} onChange={ev=> setName(ev.target.value)}/>
                <input type="text" className="form-control ms-3" id="abbreviation" placeholder='Abreviere tara' value={abbreviation} onChange={ev=> setAbbreviation(ev.target.value)}/>
                <button type="submit" className="btn btn-primary">Adauga</button>
            </div>
            <div className="form-text">Numele tarii trebuie sa fie unic</div>
           
        </div>
    </form>
    <label className="form-label pt-4">Tari existente</label>
    <table className="table  table-hover admin-table-responsive">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">Nume</th>
                <th scope="col">Numar de echipe</th>
                <th scope="col">Sterge</th>
            </tr>
        </thead>
        <tbody>
            {countries.length>0 && countries.map((country,index) =>(
                <tr key={country._id}>
                    <th scope="row">{index+1}</th>
                    <td>{country.name}</td>
                    <td>{country.abbreviation}</td>
                    <td><button className='btn btn-outline-danger' onClick={() => deleteCountry(country._id,true)}>X</button></td>
                </tr>
             ))}
        </tbody>
    </table>
</div>
  )
}

export default CountryComponent