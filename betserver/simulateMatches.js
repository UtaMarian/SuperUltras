const Match = require("./models/Match");
const Player = require("./models/Player");
const Team = require("./models/Team");
const UserBets = require("./models/UserBets");
const Choreography = require("./models/Choreography");
const Reward = require("./models/Reward");
const User = require("./models/User");

// ------------------- SIMULARE NORMALĂ (cu delay) -------------------
async function simulateMatches() {
  //finishMatch("68c584a2c9033e6413f9fa30")
  const now = new Date();
  //const now = new Date(moment.getTime() + 24 * 60 * 60 * 1000)
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

      homeScore = generateGoals(homeLevel, awayLevel, true, match.homeInfluence, match.awayInfluence);
      awayScore = generateGoals(awayLevel, homeLevel, false , match.homeInfluence, match.awayInfluence);

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

   const choreographies = await Choreography.find(
      { match: match._id },
      "moneyTicket user team"
    ).populate("user", "username");

    // 🔹 Grupăm coregrafiile după user
    const userMap = new Map();

    for (const choreo of choreographies) {
      const userId = choreo.user._id.toString();
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: choreo.user,
          totalMoneyTicket: 0
        });
      }
      userMap.get(userId).totalMoneyTicket += choreo.moneyTicket;
    }
    // 🔹 Obținem lista de utilizatori unici + totalMoneyTicket
    const uniqueUsers = Array.from(userMap.values());
    console.log(uniqueUsers);

    
    // 🔹 rewardsMap = agregăm toate recompensele aici
    const rewardsMap = new Map();

     if (uniqueUsers.length > 0) {
    //   // Recompense default pentru fiecare user cu coregrafie
       // 🔹 Default rewards pentru fiecare user cu coregrafie
        for (const u of uniqueUsers) {
          rewardsMap.set(u.user._id.toString(), {
            user: u.user,
            cash: 50,
            trainingPoints: 1
          });
        }

      // 🔹 MVP: userul cu cele mai multe moneyTicket
        const mvp = uniqueUsers.reduce((max, u) =>
          u.totalMoneyTicket > (max?.totalMoneyTicket || 0) ? u : max,
          null
        );

        if (mvp) {
          const userId = mvp.user._id;

          if (!rewardsMap.has(userId.toString())) {
            rewardsMap.set(userId.toString(), { user: mvp.user, cash: 0, trainingPoints: 0 });
          }

          // ➕ Recompense MVP
          const reward = rewardsMap.get(userId.toString());
          reward.cash += 250;
          reward.trainingPoints += 3;

          // 🏆 Trofeu MVP (verificăm și incrementăm / creăm dacă nu există)
          const user = await User.findById(userId);

          if (user) {
            const existingTrophy = user.trophies.find(t => t.name === "MVP");
            if (existingTrophy) {
              existingTrophy.numbers += 1;
            } else {
              user.trophies.push({
                name: "MVP",
                year: new Date().getFullYear().toString(),
                numbers: 1
              });
            }
            await user.save();
          }
        }



              // 🔹 Bonus pentru marcatori
              for (const goal of match.goals) {
                const scorer = await Player.findById(goal.player).populate("user");
                if (scorer?.user) {
                  const id = scorer.user._id.toString();
                  if (!rewardsMap.has(id)) {
                    rewardsMap.set(id, { user: scorer.user, cash: 0, trainingPoints: 0 });
                  }
                  rewardsMap.get(id).cash += Math.floor(Math.random() * 91) + 10; // 10–100
                  rewardsMap.get(id).trainingPoints += 1;
                }
              }
              // 🔹 Salvăm în DB doar un reward per user
                for (const reward of rewardsMap.values()) {
                  await Reward.create({
                    user: reward.user._id,
                    match: match._id,
                    cash: reward.cash,
                    trainingPoints: reward.trainingPoints
                  });
                }

                console.log("✅ Rewards generate:", Array.from(rewardsMap.values()));
          }
            console.log(`✅ Rewards generated for match ${match._id}`);
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

function generateGoals(teamLevel, opponentLevel, isHome, homeInfluence = 0, awayInfluence = 0) {
  let baseRate = 1.2;

  // raportul de putere între echipe
  let strengthRatio = teamLevel / (teamLevel + opponentLevel);
  if (isHome) strengthRatio *= 1.1;

  // factor de influență al suporterilor
  let totalInfluence = homeInfluence + awayInfluence;
  let influenceRatio = totalInfluence > 0 
    ? (isHome ? homeInfluence / totalInfluence : awayInfluence / totalInfluence) 
    : 0.5; // dacă nu există influență, considerăm egal

  // combinăm puterea echipei cu influența suporterilor
  let expectedGoals = baseRate * (0.8 + Math.random() * 0.4) * (strengthRatio * 2) * (0.8 + 0.4 * influenceRatio);

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
