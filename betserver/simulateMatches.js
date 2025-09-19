const Match = require("./models/Match");
const Player = require("./models/Player");
const Team = require("./models/Team");
const UserBets = require("./models/UserBets");

// ------------------- SIMULARE NORMALĂ (cu delay) -------------------
async function simulateMatches() {
  const now = new Date();
  console.log("🔄 Simulating matches at", now);

  const scheduledMatches = await Match.find({
    status: { $in: ["scheduled", "in_progress"] },
    date: { $lte: now }
  })
    .populate("homeTeam")
    .populate("awayTeam");

  console.log("📌 Found matches to simulate:", scheduledMatches.length);

  for (const match of scheduledMatches) {
    console.log(`⚽ Preparing match: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
    match.status = "in_progress";
    await match.save();
    console.log(`🚀 Match ${match._id} started!`);

    // ⏳ cu delay (test: 10 secunde)
    setTimeout(() => finishMatch(match._id), 10 * 1000);
  }
}

// ------------------- SIMULARE INSTANT (fără delay) -------------------
async function simulateAllMatchesNow() {
  const now = new Date();
  console.log("⚡ Simulating ALL matches instantly at", now);

  const scheduledMatches = await Match.find({
    status: { $in: ["scheduled", "in_progress"] }
  })
    .populate("homeTeam")
    .populate("awayTeam");

  console.log("📌 Found matches to simulate instantly:", scheduledMatches.length);

  for (const match of scheduledMatches) {
    await finishMatch(match._id);
  }
}

// ------------------- Funcție comună: finalizează un meci -------------------
async function finishMatch(matchId) {
  try {
    const match = await Match.findById(matchId).populate("homeTeam").populate("awayTeam");

    const homeTeam = await Team.findById(match.homeTeam._id).lean();
    const awayTeam = await Team.findById(match.awayTeam._id).lean();

    const homePlayerIds = Object.values(homeTeam.savedFormation || {});
    const awayPlayerIds = Object.values(awayTeam.savedFormation || {});

    const homePlayers = await Player.find({ _id: { $in: homePlayerIds } });
    const awayPlayers = await Player.find({ _id: { $in: awayPlayerIds } });

    console.log(`🎮 Finalizing: ${match.homeTeam.name} vs ${match.awayTeam.name}`);

    let homeScore = 0, awayScore = 0, homeScorers = [], awayScorers = [];

    // Dacă una din echipe nu are formație
    if (homePlayers.length === 0 || awayPlayers.length === 0) {
      if (homePlayers.length === 0 && awayPlayers.length > 0) {
        const awayLevel = awayPlayers.reduce((s, p) => s + p.level, 0) + match.awayInfluence;
        awayScore = generateGoals(awayLevel, 1, false);
        awayScorers = await assignGoals(awayPlayers, awayScore, match.awayTeam._id);
      } else if (awayPlayers.length === 0 && homePlayers.length > 0) {
        const homeLevel = homePlayers.reduce((s, p) => s + p.level, 0) + match.homeInfluence;
        homeScore = generateGoals(homeLevel, 1, true);
        homeScorers = await assignGoals(homePlayers, homeScore, match.homeTeam._id);
      }
    } else {
      const homeLevel = homePlayers.reduce((s, p) => s + p.level, 0) + match.homeInfluence;
      const awayLevel = awayPlayers.reduce((s, p) => s + p.level, 0) + match.awayInfluence;

      homeScore = generateGoals(homeLevel, awayLevel, true);
      awayScore = generateGoals(awayLevel, homeLevel, false);

      homeScorers = await assignGoals(homePlayers, homeScore, match.homeTeam._id);
      awayScorers = await assignGoals(awayPlayers, awayScore, match.awayTeam._id);
    }

    match.score = { home: homeScore, away: awayScore };
    match.goals = [...homeScorers, ...awayScorers];
    match.status = "finished";
    match.played = true;
    await match.save();

    const winnerId = match.score.home > match.score.away ? match.homeTeam : match.awayTeam;
    if(match.nextMatchId) {
        const nextMatch = await Match.findById(match.nextMatchId);
        if(!nextMatch.homeTeam) nextMatch.homeTeam = winnerId;
        else nextMatch.awayTeam = winnerId;
        await nextMatch.save();
    }
    console.log(`✅ Match ${match._id} finished: ${homeScore}-${awayScore}`);

    // 🔹 Actualizăm pariurile
    const userBets = await UserBets.find({ matchId: match._id });
    for (const bet of userBets) {
      if (
        (bet.betOption === "X" && homeScore === awayScore) ||
        (bet.betOption === "1" && homeScore > awayScore) ||
        (bet.betOption === "2" && homeScore < awayScore)
      ) {
        bet.status = "colect";
      } else {
        bet.status = "ended";
        bet.winCash = 0;
      }
      await bet.save();
    }

    console.log(`💰 Bets updated for match ${match._id}`);
  } catch (err) {
    console.error("❌ Error finishing match:", err);
  }
}

// ------------------- Helpers -------------------
async function assignGoals(players, goals, teamId) {
  let scorers = [];
  for (let i = 0; i < goals; i++) {
    const totalLevel = players.reduce((sum, p) => sum + p.level, 0);
    let rand = Math.random() * totalLevel;
    let chosen = players[0];

    for (let p of players) {
      rand -= p.level;
      if (rand <= 0) {
        chosen = p;
        break;
      }
    }

    chosen.goals += 1;
    await chosen.save();

    scorers.push({
      player: chosen._id,
      team: teamId,
      minute: randomMinute()
    });
  }
  return scorers;
}

function randomMinute() {
  return Math.floor(Math.random() * 90) + 1;
}

function generateGoals(teamLevel, opponentLevel, isHome) {
  let baseRate = 1.2;
  let strengthRatio = teamLevel / (teamLevel + opponentLevel);
  if (isHome) strengthRatio *= 1.1;

  let expectedGoals = baseRate * (0.8 + Math.random() * 0.4) * (strengthRatio * 2);
  return poisson(expectedGoals);
}

function poisson(lambda) {
  let L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

// ------------------- Export -------------------
module.exports = {
  simulateMatches,
  simulateAllMatchesNow
};
