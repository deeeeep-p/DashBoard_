require("dotenv").config();
User = {
  userName: process.env.USER_NAME,
  password: process.env.USER_PASSWORD,
};

secretKey = process.env.secretKey;
module.exports = { User, secretKey };
