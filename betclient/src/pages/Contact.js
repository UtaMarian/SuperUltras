import React, { useState } from "react";

function Contact() {
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/users/contactus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" , "x-auth-token": token},
        body: JSON.stringify({ email, title, content }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Ticket submitted successfully!");
        setEmail("");
        setTitle("");
        setContent("");
      } else {
        setMessage(`❌ ${data.msg || "Something went wrong"}`);
      }
    } catch (err) {
      setMessage("❌ Failed to send ticket. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-fuchsia-900 to-rose-700 p-6">
       
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Contact & Support
        </h2>

        {message && (
          <div className="mb-4 text-center text-white font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Title
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Ticket title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Content
            </label>
            <textarea
              required
              rows="5"
              className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Describe your problem..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-fuchsia-600 hover:bg-pink-500 text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Ticket"}
          </button>
          <a href="/" className="text-sm text-white hover:underline flex justify-center mt-2">
            Back to Home
          </a>
        </form>
      </div>
    </div>
  );
}

export default Contact;
