import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import WelcomeEvent from "./WelcomeEvent";
import PositionChangerEvent from "./PositionEvent";
import DoubleInfluenceEvent from "./Influence";

function EventPage() {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_API + `/events/${id}/progress`, {
          headers: { "x-auth-token": token },
        });
        const data = await res.json();
        setEventData(data);  // data = { event, userClaims, cooldownUntil }
      } catch (err) {
        console.error("Error loading event", err);
      }
    };

    fetchEvent();
  }, [id, token]);

  if (!eventData) return <p className="text-white">Loading...</p>;

  const { event, userClaims } = eventData;

  // aici verifici tipul evenimentului
  if(event._id==="68cc1868f050e301388a93ba") {
    return <WelcomeEvent event={event} userClaims={userClaims} />;
  } else if (event.type === "position_changer") {
    return <PositionChangerEvent event={event} userClaims={userClaims} />;
  } else if (event._id === "68cc290e433cedb3d68c1bd4") {
    return <DoubleInfluenceEvent event={event}  influenceActiveUntil={eventData.cooldownUntil ? new Date(eventData.cooldownUntil) : null} />;
  } else {
    return (
      <div className="p-6 text-white">
        <h2 className="text-2xl font-bold">{event.title}</h2>
        <p>{event.description}</p>
      </div>
    );
  }
}

export default EventPage;
