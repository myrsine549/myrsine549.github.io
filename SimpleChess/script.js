const boardContainer = document.getElementById("board-container");
let boardWidth = window.getComputedStyle(boardContainer).width.slice(0, -2);
let oldBoardWidth = parseFloat(boardWidth);
let selectedPiece;
let prevPieceLeft;
let prevPieceTop;

let pieceRemoveMode = false;

// Load piece sound
const pieceSound = new Audio("assets/sound/piecesound.wav");

// Initiate bitboards for starting position
const blackRooks = [0b10000001, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000];
const blackKnights = [0b01000010, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000];
const blackBishops = [0b00100100, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000];
const blackQueens = [0b00010000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000];
const blackKing = [0b00001000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000];
const blackPawns = [0b00000000, 0b11111111, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000];

const whiteRooks = [0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b10000001];
const whiteKnights = [0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b01000010];
const whiteBishops = [0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00100100];
const whiteQueens = [0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00010000];
const whiteKing = [0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00001000];
const whitePawns = [0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b11111111, 0b00000000];

// Combine bitboards into array
let fullPieceSet = [blackRooks, blackKnights, blackBishops, blackQueens, blackKing, blackPawns, whiteRooks, whiteKnights, whiteBishops, whiteQueens, whiteKing, whitePawns];

// Handle one piece capturing another
function checkCapture(anyBitMatch, section) {
  if (!anyBitMatch.match) return;

  // Update bitboard
  fullPieceSet[anyBitMatch.piece][section] ^= anyBitMatch.match;
  
  const position = getPiecePositions(anyBitMatch.match, section).flat();
  const pieces = document.getElementsByClassName("piece");

  // Find piece and remove it
  for (let i = 0; i < pieces.length; i++) {
    if (pieces[i].value === `${position[0]},${position[1]}`) {
      pieces[i].remove();
    }
  }
}

// Update bitboards when a piece is moved
function updateBitboards(piece, previousBitBoardSection, previousBitMask, currentBitBoardSection, currentBitMask, anyBitMatch, colorOffset) {
  const pieceMap = ['R', 'N', 'B', 'Q', 'K', 'P'];
  
  fullPieceSet[pieceMap.indexOf(piece.classList[2]) + colorOffset][previousBitBoardSection] ^= previousBitMask;
  fullPieceSet[pieceMap.indexOf(piece.classList[2]) + colorOffset][currentBitBoardSection] ^= currentBitMask;
  checkCapture(anyBitMatch, currentBitBoardSection);
}

// Handle promotion
function checkPromotion(isBlack) {
  const pawns = document.getElementsByClassName('P');

  // Find pawn on 1st or 8th rank
  let promotedPawn;
  for (let i = 0; i < pawns.length; i++) {
    let rank = parseInt(pawns[i].value.split(',')[1]);
    if (rank === 0 || rank === 7) {
      promotedPawn = pawns[i];
    }
  }

  // Return if no promoting pawn
  if (!promotedPawn) return;

  // Create promotion piece menu
  const pieceColor = promotedPawn.classList[1];
  const promotionSelection = document.createElement("div");
  const promotionTitle = document.createTextNode("Select Promotion Piece");

  promotionSelection.appendChild(promotionTitle);
  promotionSelection.classList.add("promotion-selection");
  
  const promotionPieces = ['Q', 'R', 'B', 'N'];
  const pieceMap = ['R', 'N', 'B', 'Q', 'K', 'P'];
  for (let i = 0; i < promotionPieces.length; i++) {
    let piece = document.createElement("img");
    piece.src = `assets/pieces/${pieceColor}${promotionPieces[i]}.svg`;
    piece.setAttribute("draggable", "false");
    piece.classList.add("promotion-piece");
    piece.classList.add(promotionPieces[i]);
    promotionSelection.appendChild(piece);

    // Handle selection of piece
    piece.onclick = () => {
      const pieceCoords = promotedPawn.value.split(',');
      const file = parseInt(pieceCoords[0]);
      const rank = parseInt(pieceCoords[1]);

      // Update bitboards
      fullPieceSet[isBlack ? 5 : 11][rank] = 0;
      fullPieceSet[pieceMap.indexOf(piece.classList[1]) + (isBlack ? 0 : 6)][rank] |= 128 >> file;

      // Update image and classes
      promotedPawn.src = `assets/pieces/${pieceColor}${piece.classList[1]}.svg`;
      promotedPawn.classList.replace('P', piece.classList[1]);

      // Update pieces with new bitboards
      setPieces();

      // Remove promotion menu
      promotionSelection.remove();
      clickCover.remove();
    }
  }

  // Prevent moving while selecting promotion piece
  const clickCover = document.createElement("div");
  clickCover.classList.add("click-cover");

  boardContainer.appendChild(clickCover);
  boardContainer.appendChild(promotionSelection);
}

// Create piece elements
function loadPieces() {
  const pieceLetters = ['R', 'R', 'N', 'N', 'B', 'B', 'Q', 'K', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'];
  
  for (let i = 0; i < pieceLetters.length; i++) {
    ['b', 'w'].forEach(color => {
      let piece = document.createElement("img");
      piece.src = `assets/pieces/${color}${pieceLetters[i]}.svg`;
      piece.classList.add("piece");
      piece.classList.add(color);
      piece.classList.add(pieceLetters[i]);
      piece.setAttribute("draggable", "false");

      piece.onmousedown = (event) => {
        // Remove piece if manual piece removal mode is on
        if (pieceRemoveMode) {
          const pieceMap = ['R', 'N', 'B', 'Q', 'K', 'P'];
          const squareSize = boardWidth / 8;
          const colorOffset = piece.classList[1] === 'b' ? 0 : 6;

          // Compute values needed to update bitboard
          const bitPos = Math.round(piece.style.top.slice(0, -2) / squareSize) * 8 + Math.round(piece.style.left.slice(0, -2) / squareSize);
          const bitBoardSection = Math.floor(bitPos / 8);
          const bitMask = 128 >> (bitPos % 8);

          // Update bitboard
          fullPieceSet[pieceMap.indexOf(piece.classList[2]) + colorOffset][bitBoardSection] ^= bitMask;

          piece.remove();
          return;
        }

        // Tell board container the selected piece
        selectedPiece = piece;

        prevPieceLeft = piece.style.left.slice(0, -2);
        prevPieceTop = piece.style.top.slice(0, -2);

        // Display on top
        selectedPiece.style.zIndex = 1;

        // Move piece with mouse
        const boardBounds = boardContainer.getBoundingClientRect();
        selectedPiece.style.left = event.clientX - boardBounds.left - boardWidth / 8 / 2 + "px";
        selectedPiece.style.top = event.clientY - boardBounds.top - boardWidth / 8 / 2 + "px";
      }

      piece.onmouseup = () => {
        // Reset sound
        pieceSound.pause();
        pieceSound.currentTime = 0;

        // Deselect piece
        selectedPiece = null;

        // No longer show on top
        piece.style.zIndex = 0;
        
        const squareSize = boardWidth / 8;
        const leftValue = piece.style.left.slice(0, -2);
        const topValue = piece.style.top.slice(0, -2);

        // Snap piece
        piece.style.left = Math.round(leftValue / squareSize) * squareSize + "px";
        piece.style.top = Math.round(topValue / squareSize) * squareSize + "px";

        // Work out values needed to update bitboards
        const previousBitPos = Math.round(prevPieceTop / squareSize) * 8 + Math.round(prevPieceLeft / squareSize);
        const currentBitPos = Math.round(piece.style.top.slice(0, -2) / squareSize) * 8 + Math.round(piece.style.left.slice(0, -2) / squareSize);

        const previousBitBoardSection = Math.floor(previousBitPos / 8);
        const currentBitBoardSection = Math.floor(currentBitPos / 8);

        const previousBitMask = 128 >> (previousBitPos % 8);
        const currentBitMask = 128 >> (currentBitPos % 8);

        let isBlack = piece.classList[1] === 'b';

        let start;
        let stop;
        if (isBlack) {
          start = 0;
          stop = fullPieceSet.length / 2;
        } else {
          start = fullPieceSet.length / 2;
          stop = fullPieceSet.length;
        }

        // Check for pieces in same square
        let anyBitMatch;
        for (let i = 0; i < fullPieceSet.length; i++) {
          anyBitMatch = {
            match: fullPieceSet[i][currentBitBoardSection] & currentBitMask,
            piece: i
          };
          
          if (anyBitMatch.match) break;
        }

        // Check if same color
        let sameColorBitMatch = anyBitMatch.piece >= start && anyBitMatch.piece < stop && anyBitMatch.match;

        // Only update if opposite color
        if (isBlack && !sameColorBitMatch) {
          updateBitboards(piece, previousBitBoardSection, previousBitMask, currentBitBoardSection, currentBitMask, anyBitMatch, 0);
        } else if (!sameColorBitMatch) {
          updateBitboards(piece, previousBitBoardSection, previousBitMask, currentBitBoardSection, currentBitMask, anyBitMatch, 6);
        }

        // Update displayed pieces
        setPieces();

        // Check for pawn promotion
        if (piece.classList[2] === 'P') {
          checkPromotion(isBlack);
        }

        // Play sound
        pieceSound.play();
      }

      boardContainer.appendChild(piece);
    });
  }
}

// Turn bitboard segment into coordinates
function getPiecePositions(segment, rank) {
  if (segment === 0) return;

  // Shift bit right to loop through every bit
  let file = 0;
  let positions = [];
  for (let i = 128; i >= 1; i >>= 1) {
    let bitMatch = segment & i;
    if (bitMatch > 0) {
      positions.push([file, rank]);
    }
    file++;
  }

  return positions;
}

// Set pieces based on bitboards
function setPieces() {
  // Get all coordinates
  let fullPositions = [];
  fullPieceSet.forEach(pieceSet => {
    for (let i = 0; i < pieceSet.length; i++) {
      let piecePositions = getPiecePositions(pieceSet[i], i);
      if (piecePositions) {
       fullPositions.push(piecePositions);
      }
    }
  });

  fullPositions = fullPositions.flat();

  const pieceSize = boardWidth / 8;

  const pieceMap = ['R', 'N', 'B', 'Q', 'K', 'P'];
  let pieces = [];

  // Make sure pieces are correctly mapped to coordinates
  ['b', 'w'].forEach(color => {
    for (let i = 0; i < pieceMap.length; i++) {
      pieces.push(Array.from(document.getElementsByClassName(`${color} ${pieceMap[i]}`)));
    }
  });

  pieces = pieces.flat();

  // Update elements with piece coordinates
  for (let i = 0; i < fullPositions.length; i++) {
    let piece = pieces[i];
    piece.style.left = fullPositions[i][0] * pieceSize + "px";
    piece.style.top = fullPositions[i][1] * pieceSize + "px";
    piece.value = `${fullPositions[i][0]},${fullPositions[i][1]}`;
  }
}

// Properly space the pieces when board is resized
function adjustPieceSpacing() {
  boardWidth = window.getComputedStyle(boardContainer).width.slice(0, -2);

  ['b', 'w'].forEach(color => {
    let pieces = document.getElementsByClassName(color);

    for (let i = 0; i < pieces.length; i++) {
      let piece = pieces[i];
      let pieceCoords = piece.value.split(',');
      piece.style.left = pieceCoords[0] * (boardWidth / 8) + "px";
      piece.style.top =  pieceCoords[1] * (boardWidth / 8) + "px";
    }
  });

  oldBoardWidth = parseFloat(boardWidth);

  // Also adjust score spacing
  const scoreSection = document.querySelector(".score-section");
  scoreSection.style.width = boardWidth + "px";
}

window.onload = () => {
  loadPieces();
  setPieces();

  // Check for changes in board dimensions
  const resizeObserver = new ResizeObserver(adjustPieceSpacing);
  resizeObserver.observe(boardContainer);

  // Enable pieces to be moved quickly
  boardContainer.onmousemove = (event) => {
    if (!selectedPiece) return;
    const boardBounds = boardContainer.getBoundingClientRect();
    selectedPiece.style.left = event.clientX - boardBounds.left - boardWidth / 8 / 2 + "px";
    selectedPiece.style.top = event.clientY - boardBounds.top - boardWidth / 8 / 2 + "px";
  }

  // Check for board flip key
  document.addEventListener("keydown", (event) => {
    if (event.key === 'f') {
      flipBoard();
    }
  });

  // Load scores
  updateScores();
}

// Enable or disable manual piece removal
function togglePieceRemoveMode() {
  const pieceRemoveToggle = document.getElementById("piece-remove-toggle");

  if (pieceRemoveMode) {
    pieceRemoveToggle.textContent = "Turn Piece Removal On";
  } else {
    pieceRemoveToggle.textContent = "Turn Piece Removal Off";
  }
  
  pieceRemoveMode = !pieceRemoveMode;
}

// Flip board around
function flipBoard() {
  for (let i = 0; i < fullPieceSet.length; i++) {
    // Reverse bitboards
    fullPieceSet[i] = fullPieceSet[i].map(section => parseInt(section.toString(2).padStart(8, '0').split('').reverse().join(''), 2)).reverse();
  }

  setPieces();
}

// Reset board by reloading page
function resetBoard() {
  window.location.reload();
}