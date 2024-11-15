document.getElementById("saveButton").addEventListener("click", async () => {
  const player1 = document.getElementById("player1").value.trim();
  const player2 = document.getElementById("player2").value.trim();
  const score1 = document.getElementById("score1").value.trim();
  const score2 = document.getElementById("score2").value.trim();

  if (!player1 || !player2 || !score1 || !score2) {
    alert("All fields must be filled out!");
    return;
  }

  try {
    const response = await fetch(
      "https://us-central1-more-pingis.cloudfunctions.net/registerMatch",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player1, player2, score1, score2 }),
      }
    );

    if (response.ok) {
      alert("Match registered successfully.");
      loadLeaderboard();
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (error) {
    console.error("Error registering match:", error);
    alert("Failed to register match.");
  }
});

async function loadLeaderboard() {
  try {
    const response = await fetch(
      "https://us-central1-more-pingis.cloudfunctions.net/getLeaderboard"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard.");
    }

    const leaderboard = await response.json();

    const leaderboardTable = document.getElementById("leaderboard");
    leaderboardTable.innerHTML = `
      <tr>
        <th>Placering</th>
        <th>Spelare</th>
        <th>Matcher</th>
        <th>Poäng</th>
        <th>Datum</th>
      </tr>
    `;

    leaderboard.forEach(([player, matches, points, date], index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${player}</td>
        <td>${matches}</td>
        <td>${points}</td>
        <td>${date || "Ej tillgängligt"}</td>
      `;
      leaderboardTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading leaderboard:", error);
    alert("Failed to load leaderboard.");
  }
}

// Load leaderboard on page load
document.addEventListener("DOMContentLoaded", loadLeaderboard);