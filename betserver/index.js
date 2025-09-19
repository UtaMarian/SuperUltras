// server.js
const express = require('express');
const mongoose = require("mongoose");
const dotenv =require("dotenv");
const cors = require('cors');
const bodyParser = require('body-parser');
const {simulateMatches,simulateAllMatchesNow} = require("./simulateMatches"); 
const  { endPolls } = require("./task"); 
const generateBotsForTeam = require("./generateBotsForTeam");
const cron = require("node-cron");

const countryRoutes = require("./routes/countryRoutes.js");
const teamRoutes = require("./routes/teamRoutes.js");
const leagueRoutes = require("./routes/leagueRoutes.js");
const betRoutes =require("./routes/betRoutes.js");
const authRoutes =require("./routes/authRoutes.js");
const userRoutes =require("./routes/userRoutes.js");
const gamesPlayedRoutes =require("./routes/gamesPlayedRoutes.js");
const userBetsRoutes =require("./routes/userBetsRoutes.js");
const clubRoutes =require("./routes/clubRoutes.js");
const threadRoutes =require("./routes/threadRoutes.js");
const rankRoutes =require("./routes/rankRoutes.js");
const ultrasLeagueRoutes =require("./routes/ultrasLeagueRoutes.js");
const auth = require('./middleware/auth'); 
const playersRoutes = require('./routes/playersRoutes');
const matchRoutes = require('./routes/matchRoutes');
const choreographiesRoutes = require('./routes/choreographies');
const predictionsRoute = require('./routes/predictionsRoute');
const adminRoutes =require ('./routes/adminRoutes.js')
const trainingRoutes=require ('./routes/trainingRoutes.js')
const eventsRoutes=require ('./routes/eventsRoutes.js')
const pollRoutes=require ('./routes/pollRoutes.js')
const updateMatchStatus = require('./services/updateMatchStatus'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI;
const FRONTEND_URI=process.env.FRONTEND_URI;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use('/api/teamslogo', express.static(__dirname + '/teamslogo'));
app.use('/api/rankicons', express.static(__dirname + '/rankicons'));
app.use('/api/userspicture', express.static(__dirname + '/userspicture'));
app.use('/api/eventsimg', express.static(__dirname + '/eventsimg'));


//app.use(cors({credentials:true,origin:["http://localhost:3000", "http://192.168.1.130:3000", "http://192.168.1.128"]}));

app.use(cors({credentials:true,origin:[FRONTEND_URI, "*"]}));



// MongoDB connection
mongoose
  .connect(DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Sample route
app.get('/', (req, res) => {
  res.send('Hello, MERN Stack!');
});

app.use('/api/teams', teamRoutes);
app.use('/api/leagues',auth, leagueRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users',auth, userRoutes);
app.use('/api/match',auth, userBetsRoutes);
app.use('/api/games-played',auth, gamesPlayedRoutes);
app.use('/api/posts',auth, threadRoutes);
app.use('/api/ranks',auth, rankRoutes);
app.use('/api/ultrasleague', ultrasLeagueRoutes);
app.use('/api/club',auth, clubRoutes);
app.use('/api/players',auth, playersRoutes);
app.use('/api/matches',auth, matchRoutes);
app.use('/api/choreographies',auth, choreographiesRoutes);
app.use('/api/predictions',auth, predictionsRoute);
app.use('/api/admin',auth,adminRoutes);
app.use('/api/training',auth,trainingRoutes);
app.use('/api/events',auth,eventsRoutes);
app.use('/api/poll',auth,pollRoutes);
//updateMatchStatus();
 //generateBotsForTeam("Pandurii");



cron.schedule("* * * * *", async () => {
  await simulateMatches();
  await endPolls();
});
//simulateAllMatchesNow();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);


});

