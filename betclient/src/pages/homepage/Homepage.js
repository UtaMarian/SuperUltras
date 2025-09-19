// pages/Homepage.js
import React, { useEffect, useState } from "react";
import "../../styles/homepage.css";
import ManIcon from "../../assets/icons/man.png";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { showNotification } from "../../utils/NotificationMan";
import DailyCashPopup from "../../components/DailyCashPopup.js";
import BarLoader from "react-spinners/BarLoader";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../styles/dailyCashPopup.css";
import { motion } from "framer-motion";
import PollModal from "../club/PollModal.js";

function Homepage() {
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [newThreadText, setNewThreadText] = useState("");
  const [games, setGames] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupCash, setPopupCash] = useState(0);
  const token = localStorage.getItem("token");
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    try {
      setLoading(true);
      fetch(process.env.REACT_APP_API + "/users/check-daily-cash", {
        method: "POST",
        credentials: "include",
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.showPopup) {
            setShowPopup(true);
            setPopupMessage(data.message || "");
            setPopupCash(data.cash || 0);
          }
        })
        .catch((err) => {
          showNotification("danger", "Failed", "Eroare verificare cash zilnic");
        });

      fetch(process.env.REACT_APP_API + "/events", {
        headers: { "x-auth-token": token },
      })
        .then((res) => res.json())
        .then((data) => setEvents(data))
        .catch((err) => {
          showNotification(
            "danger",
            "Failed",
            "Eroare la încărcarea evenimentelor"
          );
        });
      const fetchThreads = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(process.env.REACT_APP_API + "/posts/threads", {
          headers: {
            "x-auth-token": token, // Attach the token here
          },
        });
        const data = await res.json();
        setThreads(data);
      };

      fetchThreads();

      fetch(process.env.REACT_APP_API + "/matches/next3/", {
        credentials: "include",
        headers: {
          "x-auth-token": token,
        },
      })
        .then((res) => res.json())
        .then((_games) => setGames(_games));
    } catch (error) {
      showNotification("danger", "Failed", "Error while fetching data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addThread = async () => {
    const res = await fetch(`${process.env.REACT_APP_API}/posts/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({ text: newThreadText }),
    });

    const newThread = await res.json();
    setThreads([newThread, ...threads]);
    setNewThreadText("");
  };

  const deleteThread = async (threadId) => {
    await fetch(`${process.env.REACT_APP_API}/posts/threads/${threadId}`, {
      method: "DELETE",
      headers: {
        "x-auth-token": token,
      },
    });

    setThreads(threads.filter((thread) => thread._id !== threadId));
  };

  const addComment = async (threadId, commentText) => {
    const res = await fetch(
      `${process.env.REACT_APP_API}/posts/threads/${threadId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ text: commentText }),
      }
    );

    const newComment = await res.json();
    setThreads(
      threads.map((thread) =>
        thread._id === threadId
          ? { ...thread, comments: [...thread.comments, newComment] }
          : thread
      )
    );
  };

  const deleteComment = async (commentId, threadId) => {
    await fetch(`${process.env.REACT_APP_API}/posts/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        "x-auth-token": token,
      },
    });

    setThreads(
      threads.map((thread) =>
        thread._id === threadId
          ? {
              ...thread,
              comments: thread.comments.filter(
                (comment) => comment._id !== commentId
              ),
            }
          : thread
      )
    );
  };

  const formatDate = (dateString) => {
    const utcDate = new Date(dateString);
    const timezone = "Europe/Bucharest";
    const zonedDate = toZonedTime(utcDate, timezone);
    return format(zonedDate, "dd-MM-yyyy HH:mm");
  };

  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);

  return (
    <div className="index-home-container">
      {loading ? (
        <div className="loader-container">
          <BarLoader color="white" loading={loading} width={340} height={6} />
        </div>
      ) : (
        <>
          <DailyCashPopup
            show={showPopup}
            onHide={() => setShowPopup(false)}
            cash={popupCash}
            message={popupMessage}
          />
          <div className="left-side">
            <div className="thread-input-container p-4 rounded-2xl shadow-lg  backdrop-blur-md mb-6">
              <textarea
                value={newThreadText}
                onChange={(e) => setNewThreadText(e.target.value)}
                placeholder={t("post_placeholder")}
                className="thread-input h-auto w-full p-3 rounded-xl border border-gray-600 bg-rose-900/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
              <button
                onClick={addThread}
                className="add-thread-button mt-3 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg hover:shadow-indigo-400/40 transition duration-300"
              >
                {t("post_button")}
              </button>
            </div>
            ;
            <div className="space-y-6">
              {threads.length > 0 &&
                threads.map((thread, index) => (
                  <motion.div
                    key={thread._id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                    className="bg-gradient-to-br from-stone-900/50 to-gray-800/40 backdrop-blur-sm border border-white/20 p-5 rounded-2xl shadow-lg hover:shadow-pink-500/40 transition"
                  >
                    {/* Thread header */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <img
                          src={ManIcon}
                          alt="author"
                          className="author_avatar w-10 h-10 rounded-full border border-pink-400 shadow-md"
                        />
                        <strong className="text-orange-200">
                          {thread.user.username}
                        </strong>
                        <span className="text-gray-300 text-sm">
                          • {formatDate(thread.createdAt)}
                        </span>
                      </div>
                      {thread.user._id ===
                        JSON.parse(atob(token.split(".")[1])).user.id && (
                        <button
                          onClick={() => deleteThread(thread._id)}
                          className="px-2 py-1 rounded-md border border-rose-500 text-rose-400 hover:bg-rose-600 hover:text-white transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Thread text */}
                    <p className="text-gray-100 mb-3">{thread.text}</p>

                    {/* Comments section */}
                    <div className="comments-section space-y-3">
                      {thread.comments.length > 0 &&
                        thread.comments.map((comment) => (
                          <motion.div
                            key={comment._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-red-200/20 p-3 rounded-xl"
                          >
                            <div className="comment-header flex justify-between items-center mb-1">
                              <div className="text-sm text-gray-200">
                                <strong className="text-orange-200">
                                  {comment.user.username}
                                </strong>{" "}
                                • {formatDate(comment.createdAt)}
                              </div>
                              {comment.user._id ===
                                JSON.parse(atob(token.split(".")[1])).user
                                  .id && (
                                <button
                                  onClick={() =>
                                    deleteComment(comment._id, thread._id)
                                  }
                                  className="px-2 py-1 text-xs rounded-md border border-rose-500 text-rose-400 hover:bg-rose-600 hover:text-white transition"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            <p className="text-gray-100">{comment.text}</p>
                          </motion.div>
                        ))}

                      {/* Add comment input */}
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            addComment(thread._id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        className="comment-input w-full p-2 rounded-lg border border-fuchsia-500/30 bg-gray-900/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                      />
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>

          <div className="right-side">
            <div>
              <PollModal />
            </div>
            <div className="events-container relative p-6  backdrop-blur-md">
              <h3 className="text-2xl font-bold text-center mb-6 text-white drop-shadow-lg tracking-wide">
                {t("events")}
              </h3>

              <div className="upcoming-events flex gap-6 flex-wrap">
                {events.length > 0 ? (
                  events.map((event, index) => (
                    <Link to={`/event/${event._id}`} key={event._id}>
                      <div className="event-container group relative rounded-xl overflow-hidden shadow-lg border border-white/10 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] transition duration-300 ease-in-out">
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 group-hover:opacity-90 transition"></div>

                        {/* Imagine */}
                        <div className="event-image">
                          <img
                            src={
                              event.image
                                ? process.env.REACT_APP_API + "/" + event.image
                                : "https://via.placeholder.com/400x200?text=No+Image"
                            }
                            alt={event.title}
                            className="w-full h-48 object-cover transform group-hover:scale-105 transition duration-500"
                          />
                        </div>

                        {/* Titlu */}
                        <div className="event-text absolute bottom-0 left-0 w-full p-4 text-center">
                          <p className="text-white font-semibold text-lg group-hover:text-yellow-300 drop-shadow-md">
                            {event.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-400 text-center w-full">
                    {t("no_events")}
                  </p>
                )}
              </div>
            </div>

            <div className="matches-container relative p-6 ">
              {/* glowing lights */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/30 blur-3xl rounded-full" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/30 blur-3xl rounded-full" />

              <h3 className="text-2xl font-bold text-white mb-4 tracking-wide drop-shadow-md">
                {t("nextmatches")}
              </h3>

              <div className="overflow-hidden rounded-2xl shadow-lg border border-white/10  backdrop-blur-md p-4 ">
                <div className="flex flex-col divide-y divide-white/10 items-center">
                  {games.length > 0 &&
                    games.map((game, index) => (
                      <motion.div
                        key={game._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="grid grid-cols-3 items-center py-3 px-4 hover:bg-white/10 transition-colors w-[700px]"
                      >
                        {/* Stânga: Home team */}
                        <Link
                          to={`/club/${game.homeTeam?._id}`}
                          className="flex items-center space-x-2"
                        >
                          <img
                            src={
                              process.env.REACT_APP_LOGO +
                              `/${game.homeTeam?.imageUrl}`
                            }
                            alt="home_logo"
                            className="w-10 object-contain"
                          />
                          <span className="font-medium w-40">
                            {game.homeTeam?.name}
                          </span>
                        </Link>

                        {/* Mijloc: scor/data */}
                        <Link
                          to={`/match/${game._id}`}
                          className="flex justify-center"
                        >
                          <span
                            className={`w-32 text-center px-3 py-1 rounded-lg font-bold transition ${
                              game.status === "finished"
                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            }`}
                          >
                            {game.status === "finished"
                              ? `${game.score.home} - ${game.score.away}`
                              : formatter.format(new Date(game.date))}
                          </span>
                        </Link>

                        {/* Dreapta: Away team */}
                        <Link
                          to={`/club/${game.awayTeam?._id}`}
                          className="flex items-center justify-end space-x-2"
                        >
                          <span className="font-medium  w-40">
                            {game.awayTeam?.name}
                          </span>
                          <img
                            src={
                              process.env.REACT_APP_LOGO +
                              `/${game.awayTeam?.imageUrl}`
                            }
                            alt="away_logo"
                            className="w-10 object-contain"
                          />
                        </Link>
                      </motion.div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Homepage;
