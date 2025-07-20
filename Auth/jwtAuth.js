const jwt = require("jsonwebtoken");
const { User, secretKey } = require("./User");

// Middleware function to verify JWT
function authenticateToken(req, res, next) {
  // Get the token from the headers
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Assuming the token is in the format "Bearer TOKEN"

  if (token == null) {
    console.log("noToken");
    return res.sendStatus(403); // If no token, return unauthorized status
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.log("jwtError");
      console.log(err);
      return res.sendStatus(403);
    } // If token is not valid, return forbidden status
    req.user = user; // Attach user info to the request object
    next(); // Proceed to the next middleware or route handler
  });
}

module.exports = authenticateToken;
