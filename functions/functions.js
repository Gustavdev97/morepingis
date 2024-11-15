const functions = require("firebase-functions");
const { google } = require("googleapis");

const SHEET_ID = "1TiCwln3OYg_DUYK9v1rMt2TUjmZPyRvR6ce3q_I7QZ4";
const LEADERBOARD_TAB = "Leaderboard";
const MATCHES_TAB = "Matches";
const serviceAccount = require("./service-account.json");

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Add match to Google Sheets
exports.registerMatch = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { player1, player2, score1, score2 } = req.body;

  if (!player1 || !player2 || !score1 || !score2) {
    return res.status(400).send("All fields are required");
  }

  try {
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });

        // Få dagens datum i formatet YYYY-MM-DD
const today = new Date().toISOString().split("T")[0];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${MATCHES_TAB}!A:D`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[player1, player2, score1, score2, today]],
      },
    });

    res.status(200).send("Match registered successfully.");
  } catch (error) {
    console.error("Error registering match:", error);
    res.status(500).send("Failed to register match.");
  }
});

// Get leaderboard from Google Sheets
exports.getLeaderboard = functions.https.onRequest(async (req, res) => {
  try {
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${LEADERBOARD_TAB}!A:C`,
    });

    const rows = response.data.values || [];
    const leaderboard = rows.slice(1).map((row) => ({
      name: row[0],
      matches: row[1],
      points: row[2],
    }));

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).send("Failed to load leaderboard.");
  }
});
