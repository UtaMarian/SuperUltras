const jwt = require('jsonwebtoken');
const JWT_SECRET = 'yoursecretkey';
const User = require('../models/User');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    User.findOne({email:decoded.user.email}).then(userMod => {
      
      let decodedUser= decoded.user;
      decodedUser.cash=userMod.cash;
      decodedUser.coins=userMod.coins;
      req.user =decodedUser;
      
      next();
  }).catch(err => {
      console.error(err);
  });
   
   
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
