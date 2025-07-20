const { google } = require("googleapis");
require("dotenv").config();
// const decodedPrivateKey = Buffer.from(
//   process.env.GOOGLE_PRIVATE_KEY_BASE64,
//   "base64"
// ).toString("utf8");
const credentials = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  // private_key: process.env.GOOGLE_PRIVATE_KEY,
  private_key: process.env.GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join("\n"),
  // private_key: decodedPrivateKey,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
  universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
};
const { client_email, private_key } = credentials;
console.log(private_key);
const SHEET_ID = "1boHdqD4usiuX7tS0jGbPoi2aYOk4Zh8SUZkb1gqFD2Y";
const client = new google.auth.JWT(client_email, null, private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);
const sheets = google.sheets({ version: "v4", auth: client });

module.exports = { sheets, SHEET_ID, client };
