const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401);
    throw new Error("You must be logged in!");
  }

  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, process.env.SECRET, (err, payload) => {
    if (err) {
      res.status(401);
      throw new Error("You must be logged in!");
    }

    const { _id } = payload;

    User.findById(_id)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  });
};
