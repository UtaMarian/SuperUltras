// pages/Events.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Events() {
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(process.env.REACT_APP_API + "/events", {
      headers: { "x-auth-token": token },
    })
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error loading events", err));
  }, [token]);

  return (
    <div className="p-8">
      <h3 className="text-3xl font-bold text-white mb-6">Available Events</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-500/30 transition w-[300px]"
          >
            <img
              src={
                event.image
                  ? process.env.REACT_APP_API + "/" + event.image
                  : "https://via.placeholder.com/400x200"
              }
              alt={event.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white">
                {event.title}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2">
                {event.description}
              </p>
              <Link
                to={`/event/${event._id}`}
                className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
              >
                View
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Events;
