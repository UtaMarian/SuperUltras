import React, { useEffect, useState } from "react";
import { showNotification } from "../../utils/NotificationMan.js";

function EventComponent() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [type, setType] = useState("daily_reward");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cash, setCash] = useState(0);
  const [coins, setCoins] = useState(0);
  const [trainingPoints, setTrainingPoints] = useState(0);
  const [maxClaims, setMaxClaims] = useState(1);
  const [claimCooldownHours, setClaimCooldownHours] = useState(24);

  const [editMode, setEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(process.env.REACT_APP_API + "/events", {
      credentials: "include",
      headers: { "x-auth-token": token },
    })
      .then((res) => res.json())
      .then((_events) => setEvents(_events))
      .catch(() => showNotification("danger", "Failed", "Server error"));
  }, [refresh]);

  async function addOrEditEvent(ev) {
    ev.preventDefault();
    if (!(title && description && startDate && endDate)) {
      showNotification("info", "Failed", "Fill all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", type);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("cash", cash);
      formData.append("coins", coins);
      formData.append("trainingPoints", trainingPoints);
      formData.append("maxClaims", maxClaims);
      formData.append("claimCooldownHours", claimCooldownHours);
      if (image) formData.append("file", image);

      const method = editMode ? "PUT" : "POST";
      const url = editMode
        ? `${process.env.REACT_APP_API}/events/${currentEventId}`
        : `${process.env.REACT_APP_API}/events`;

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
        headers: { "x-auth-token": token },
      });

      if (res.ok) {
        resetForm();
        setRefresh((prev) => !prev);
        setEditMode(false);
        showNotification("success", "Success", "Event saved");
      }
    } catch (err) {
      showNotification("danger", "Error", "Server error");
    }
  }

  async function deleteEvent(id) {
    const res = await fetch(`${process.env.REACT_APP_API}/events/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "x-auth-token": token },
    });

    if (res.ok) {
      setRefresh((prev) => !prev);
      showNotification("success", "Deleted", "Event deleted");
    } else {
      showNotification("danger", "Failed", "Error deleting event");
    }
  }

  function handleEdit(event) {
    setTitle(event.title);
    setDescription(event.description);
    setType(event.type);
    setStartDate(event.startDate.split("T")[0]);
    setEndDate(event.endDate.split("T")[0]);
    setCash(event.rewards.cash);
    setCoins(event.rewards.coins);
    setTrainingPoints(event.rewards.trainingPoints);
    setMaxClaims(event.maxClaims);
    setClaimCooldownHours(event.claimCooldownHours);
    setCurrentEventId(event._id);
    setEditMode(true);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setType("daily_reward");
    setStartDate("");
    setEndDate("");
    setCash(0);
    setCoins(0);
    setTrainingPoints(0);
    setMaxClaims(1);
    setClaimCooldownHours(24);
    setImage(null);
  }

  return (
    <div>
      <form onSubmit={addOrEditEvent}>
        <div className="mb-3">
          <label className="form-label">Add or Edit Event</label>
          <div className="same-row-input">
            <input
              type="text"
              className="form-control"
              placeholder="Title"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
            />
            <input
              type="text"
              className="form-control ms-3"
              placeholder="Description"
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
            />
            <select
              className="form-control ms-3"
              value={type}
              onChange={(ev) => setType(ev.target.value)}
            >
              <option value="daily_reward">Daily Reward</option>
              <option value="double_influence">Double Influence</option>
              <option value="position_changer">Position Changer</option>
              <option value="custom">Custom</option>
            </select>
            <input
              type="date"
              className="form-control ms-3"
              value={startDate}
              onChange={(ev) => setStartDate(ev.target.value)}
            />
            <input
              type="date"
              className="form-control ms-3"
              value={endDate}
              onChange={(ev) => setEndDate(ev.target.value)}
            />
            <input
              type="file"
              className="form-control ms-3"
              onChange={(ev) => setImage(ev.target.files[0])}
            />
            <button type="submit" className="btn btn-primary ms-3">
              {editMode ? "Update Event" : "Add Event"}
            </button>
          </div>
        </div>
      </form>

      <label className="form-label pt-4">Existing Events</label>
      <table className="table table-hover admin-table-responsive">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Type</th>
            <th>Rewards</th>
            <th>Start</th>
            <th>End</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {events.length > 0 &&
            events.map((event, index) => (
              <tr key={event._id}>
                <th scope="row">{index + 1}</th>
                <td>{event.title}</td>
                <td>{event.type}</td>
                <td>
                  Cash: {event.rewards.cash}, Coins: {event.rewards.coins},
                  TP: {event.rewards.trainingPoints}
                </td>
                <td>{new Date(event.startDate).toLocaleDateString()}</td>
                <td>{new Date(event.endDate).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => handleEdit(event)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => deleteEvent(event._id)}
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

export default EventComponent;
