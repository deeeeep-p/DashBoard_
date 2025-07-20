const { User, secretKey } = require("../Auth/User");
const jwt = require("jsonwebtoken");
const Login = (req, res) => {
  const { username, password } = req.body;
  if (username === User.userName && password === User.password) {
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1hr" });
    return res.status(200).json({ token });
  }
  return res.status(401).json({ message: "Invalid credentials" });
};

module.exports = { Login };
