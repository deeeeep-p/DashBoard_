const express = require("express");
const cors = require("cors");
const sheetClient = require("./Routes/sheetClient");
const port = 4000;
const app = express();
const Login = require("./Routes/Login");
app.use(cors()); // CORS middleware
app.use(express.json());
app.use("/api/test", sheetClient);
app.use("/api/login", Login);

const selectSite = require("./Routes/sheetClient");
app.use("/api/selectSite", selectSite);
// app.use(cors()); // CORS middleware
app.get("/", (req, res) => {
  res.status(200).send("hi");
});
const start = () => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

start();
