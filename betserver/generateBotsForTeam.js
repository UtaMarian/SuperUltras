// generateBots.js
const Player = require("./models/Player");
const Team = require("./models/Team");
const mongoose = require("mongoose");

// Poziții standard pentru 4-3-3
const POSITIONS = ["GK", "RB", "CB1", "CB2", "LB", "CM", "RM", "LM", "RW", "LW", "ST"];

// Nume random pentru boti
function randomName() {
    const firstNames = ["Alex", "Chris", "Sam", "Jordan", "Taylor", "Jamie", "Robin", "Casey", "Charlie", "Drew","Leo","Max","Riley","Cameron","Avery","Quinn","Parker","Hayden","Dakota","Skyler","Jesse","Morgan","Reese","Rowan","Sage","Tatum","Emerson","Finley","Harper","Kendall","Logan","Payton","Rory","Sawyer","Spencer","Sydney","Teagan","Cristiano","Lionel","Neymar","Kylian","Zlatan","Eden","Luka","Sergio","Paul","Kevin","Toni","Robert","David","Andres","Xavi","Thiago","Philippe","Gareth","Raheem","Mason","Jadon","Bukayo","Heung-min","Son","Erling","Haaland","Jude","Bellingham","Vinicius","Rodrygo","Federico","Chiesa","Dusan","Vlahovic","Pedri","Gavi","Ansu","Fati","Jamal","Musiala","Jamal","Sancho","Marcus","Rashford","Bruno","Fernandes","Christian","Pulisic","Mason","Mount","Declan","Rice","Kalvin","Phillips","Marian"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Garcia","Martinez","Robinson","Clark","Rodriguez","Lewis","Lee","Walker","Hall","Allen","Young","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Gomez","Phillips","Evans","Turner","Diaz","Peterson","Lucescu","Iordanescu","Hagi","Popescu","Dica","Radoi","Mutu"];
  return (
    firstNames[Math.floor(Math.random() * firstNames.length)] +
    " " +
    lastNames[Math.floor(Math.random() * lastNames.length)]
  );
}

// Funcția care generează boti
async function generateBotsForTeam(teamName) {
  try {
    const team = await Team.findOne({ name: teamName });
    if (!team) {
      console.log(`❌ Team "${teamName}" not found!`);
      return;
    }

    let formation = {};
    let createdPlayers = [];

    for (let pos of POSITIONS) {
      const player = new Player({
        name: randomName(),
        position: pos,
        level: Math.floor(Math.random() * 80) + 20, // nivel 20-100
        goals: 0,
        team: team._id
      });

      await player.save();
      createdPlayers.push(player);
      formation[pos] = player._id;
    }

    team.savedFormation = formation;
    await team.save();

    console.log(`✅ Generated 11 bots for ${teamName}`);
    console.log("⚽ Players:", createdPlayers.map(p => `${p.position}: ${p.name} (${p.level})`));
  } catch (err) {
    console.error("❌ Error generating bots:", err);
  }
}

// Dacă vrei să testezi direct din terminal
if (require.main === module) {
  mongoose.connect("mongodb://127.0.0.1:27017/betapp").then(async () => {
    await generateBotsForTeam("Rapid"); // 🟢 Schimbă aici numele echipei
    mongoose.disconnect();
  });
}

module.exports = generateBotsForTeam;
