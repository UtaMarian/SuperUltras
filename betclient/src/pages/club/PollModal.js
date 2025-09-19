import React, { useEffect, useState } from "react";
import { showNotification } from "../../utils/NotificationMan";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

function PollModal() {
  const [poll, setPoll] = useState(null);
  const token = localStorage.getItem("token");
  const [hasVoted, setHasVoted] = useState(false);
  const [votesYes, setVotesYes] = useState(0);
  const [votesNo, setVotesNo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    try {
      const checkIfVoted = async (pollId) => {
        const res = await fetch(`${process.env.REACT_APP_API}/poll/${pollId}/has-voted`, {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          credentials: "include",
        });
        const data = await res.json();
        setHasVoted(data.hasVoted);
      };

      const getPolls = async () => {
        const res = await fetch(`${process.env.REACT_APP_API}/poll/myclub`, {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          credentials: "include",
        });
        const data = await res.json();
        setPoll(data.polls);
        if (data.polls) {
          setVotesNo(data.polls?.votesNo?.length || 0);
          setVotesYes(data.polls?.votesYes?.length || 0);
          checkIfVoted(data.polls?._id);

          // Setup countdown timer
          const endDate = new Date(data.polls.endAt).getTime();
          const interval = setInterval(() => {
            const now = Date.now();
            const diff = endDate - now;
            if (diff <= 0) {
              clearInterval(interval);
              setTimeLeft("Poll ended");
            } else {
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diff % (1000 * 60)) / 1000);
              setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
          }, 1000);
          return () => clearInterval(interval);
        }
      };

      getPolls();
    } catch (err) {
      showNotification("danger", "Failed", err.message);
    }
  }, [token]);

  if (!poll) return <></>;

  const handleVote = async (vote) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/poll/${poll._id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ vote }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        if (vote === "yes") setVotesYes((v) => v + 1);
        else setVotesNo((v) => v + 1);

        setHasVoted(true);
        Cookies.set(`poll_voted_${poll._id}`, "true", { expires: 1 });
      } else {
        alert(data.msg || "Error voting");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalVotes = votesYes + votesNo;
  const yesPercent = totalVotes ? ((votesYes / totalVotes) * 100).toFixed(1) : 0;
  const noPercent = totalVotes ? ((votesNo / totalVotes) * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className=""
    >
    <div className="flex justify-center items-center p-6">
      <div className="relative w-[100%] backdrop-blur-md px-8 py-5 rounded-xl overflow-hidden shadow-lg border border-white/10 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] transition duration-300 ease-in-out">
        <h3 className="text-2xl font-bold text-white text-center mb-4 drop-shadow">
          🗳 Vote New Manager
        </h3>

        <div className="flex items-center mb-4">
          <img
            src={`${process.env.REACT_APP_LOGO}/${poll.manager.profilePicture}`}
            alt="manager"
            className="w-14 h-14  border-2 border-white shadow-md mr-3"
          />
          <div>
            <p className="font-semibold text-lg text-white">Manager: {poll.manager.username}</p>
            <p className="text-gray-200 text-sm">Created by: {poll.creator.username}</p>
            <p className="text-gray-300 text-xs">
              Started: {new Date(poll.createdAt).toLocaleString()}
            </p>
            <p className="text-yellow-200 font-semibold mt-1">
              ⏳ Time Left: {timeLeft || "Loading..."}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-semibold mb-2 text-white">Votes</p>
          <div className="flex items-center justify-between mb-1 text-white">
            <span>Yes: {votesYes}</span>
            <span>{yesPercent}%</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full mb-2">
            <div
              className="h-3 bg-green-400 rounded-full"
              style={{ width: `${yesPercent}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mb-1 text-white">
            <span>No: {votesNo}</span>
            <span>{noPercent}%</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full">
            <div
              className="h-3 bg-red-400 rounded-full"
              style={{ width: `${noPercent}%` }}
            ></div>
          </div>
        </div>

        {!hasVoted && poll.isActive && (
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleVote("yes")}
              className="flex-1 px-4 py-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 shadow-md transition"
            >
              ✅ Vote Yes
            </button>
            <button
              onClick={() => handleVote("no")}
              className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-md transition"
            >
              ❌ Vote No
            </button>
          </div>
        )}

        {hasVoted && (
          <p className="text-gray-200 mt-4 text-center italic">
            You have already voted in this poll.
          </p>
        )}
      </div>
    </div></motion.div>
  );
}

export default PollModal;
