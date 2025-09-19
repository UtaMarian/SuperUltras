const Poll = require("./models/Poll");
const Team = require("./models/Team");

async function endPolls() {
  try {
    // Find polls that have expired but are still active
    const polls = await Poll.find({
      isActive: true,
      endAt: { $lte: new Date() }
    });

    for (const poll of polls) {
      const yesVotes = poll.votesYes.length;
      const noVotes = poll.votesNo.length;

      // ✅ If yes > no, update club manager
      if (yesVotes > noVotes) {
        await Team.findByIdAndUpdate(poll.club, {
          manager: poll.manager
        });
      }

      // ❌ End the poll (mark as inactive)
      poll.isActive = false;
      await poll.save();
    }

    console.log(`${polls.length} poll(s) ended and updated.`);
  } catch (err) {
    console.error("Error ending polls:", err.message);
  }
}

module.exports = {
  endPolls
};
