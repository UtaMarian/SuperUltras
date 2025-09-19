import React from "react";

function PositionChangerEvent({ event }) {
  return (
    <div className="p-6 text-white">
      <h2 className="text-3xl font-bold mb-4">{event.title}</h2>
      <p className="mb-4">{event.description}</p>
      <button className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">
        Change Player Position 🔄
      </button>
    </div>
  );
}

export default PositionChangerEvent;
