// Local storage is used for scores to persist across sessions
const storedBlackScore = localStorage.getItem("blackScore");
const storedWhiteScore = localStorage.getItem("whiteScore");

// If local storage keys exist then use their values otherwise use 0
let blackScore = storedBlackScore ? parseFloat(storedBlackScore) : 0;
let whiteScore = storedWhiteScore ? parseFloat(storedWhiteScore) : 0;

// Show settings and description by default
let showSettings = true;
let showDescription = true;

// Get elements for score display
const whiteScoreElement = document.getElementById("white-score");
const blackScoreElement = document.getElementById("black-score");

// Show or hide settings
function toggleSettings() {
  const settingsMenu = document.getElementById("settings-menu");
  const settingsToggle = document.getElementById("settings-toggle");
  if (showSettings) {
    settingsMenu.style.display = "none";
    settingsToggle.textContent = "(Show Settings)";
  } else {
    settingsMenu.style.display = "block";
    settingsToggle.textContent = "(Hide Settings)";
  }

  showSettings = !showSettings;
}

// Show or hide description
function toggleDescription() {
  const descriptionSection = document.getElementById("chess-description");
  const descriptionToggle = document.getElementById("description-toggle");
  if (showDescription) {
    descriptionSection.style.display = "none";
    descriptionToggle.textContent = "(Show Description)";
  } else {
    descriptionSection.style.display = "block";
    descriptionToggle.textContent = "(Hide Description)";
  }

  showDescription = !showDescription;
}

// Add a point to white score and update local storage
function addWhiteWin() {
  whiteScore++;
  localStorage.setItem("whiteScore", whiteScore.toString());
}

// Add a point to black score and update local storage
function addBlackWin() {
  blackScore++;
  localStorage.setItem("blackScore", blackScore.toString());
}

// Add half a point to both scores and update local storage
function addDraw() {
  whiteScore += 0.5;
  blackScore += 0.5;
  localStorage.setItem("whiteScore", whiteScore.toString());
  localStorage.setItem("blackScore", blackScore.toString());
}

// Change element text to reflect scores
function updateScores() {
  whiteScoreElement.textContent = `White Score: ${whiteScore}`;
  blackScoreElement.textContent = `Black Score: ${blackScore}`;
}

// Reset scores to 0
function resetScores() {
  whiteScore = 0;
  blackScore = 0;
  localStorage.setItem("whiteScore", whiteScore.toString());
  localStorage.setItem("blackScore", blackScore.toString());
}