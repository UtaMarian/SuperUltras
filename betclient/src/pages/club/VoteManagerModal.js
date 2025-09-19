import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../AuthContext";
import { showNotification } from "../../utils/NotificationMan";

function VoteManagerModal({ isOpen, onClose, clubId }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!isOpen) return;

    const fetchClubUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.REACT_APP_API}/poll/getusers`, {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClubUsers();
  }, [isOpen, clubId]);

  const handleVote = async () => {
    if (!selectedUser) return alert("Select a user first");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/poll/vote-manager`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          clubId,
          managerId: selectedUser._id,
        }),
      });
      if (res.ok) {
        showNotification("success","Created","Poll was created. See in homepage");
        onClose();
      }else{
        showNotification("danger","Error","There is already a live poll for this club.");
      }
    } catch (err) {
      console.error(err);
      showNotification("danger","Error",err.msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Vote Manager</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {users.map((u) => (
            <div key={u._id} className="flex items-center space-x-2">
              <input
                type="radio"
                name="manager"
                value={u._id}
                onChange={() => setSelectedUser(u)}
              />
              <span>{u.username}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleVote}
          >
            Vote
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoteManagerModal;
