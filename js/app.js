const WALL = "WALL";
const FLOOR = "FLOOR";
const BALL = "BALL";
const GAMER = "GAMER";
const GLUE = "GLUE";

const GAMER_IMG = '<img src="img/gamer.png">';
const BALL_IMG = '<img src="img/ball.png">';
const GLUE_IMG = '<img src="img/candy.png">';

// Model:
var gBoard;
var gGamerPos = [];
var gBallInterval;
var gGlueInterval;
var gBallCollected = 0;
var gBallsLeftCounter = 2;
var gGluePos;
var gIsGlue = false;

function initGame() {
  gGamerPos = { i: 2, j: 9 };

  gBoard = buildBoard();
  renderBoard(gBoard);
  gBallInterval = setInterval(addBall, 5000);
  gGlueInterval = setInterval(addGlue, 5000);
}

function resetGame() {
  gBallsLeftCounter = 2;
  gBallCollected = 0;
  updateBallMsg();
  var elStartBtn = document.querySelector(".start-over");
  elStartBtn.style.display = "none";
  initGame();
}

function buildBoard() {
  // Create the Matrix 10 * 12
  var board = createMat(10, 12);
  // Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < board.length; i++) {
    var row = board[i];
    for (var j = 0; j < row.length; j++) {
      var cell = { type: FLOOR, gameElement: null };
      if (
        i === 0 ||
        i === board.length - 1 ||
        j === 0 ||
        j === row.length - 1
      ) {
        cell.type = WALL;
      }
      board[i][j] = cell;
    }
  }

  //Place the passages
  var moddleI = Math.floor((board.length - 1) / 2);
  var moddleJ = Math.floor((board[0].length - 1) / 2);

  board[0][moddleJ].type = FLOOR;
  board[board.length - 1][moddleJ].type = FLOOR;
  board[moddleI][0].type = FLOOR;
  board[moddleI][board[0].length - 1].type = FLOOR;

  // Place the gamer and two balls
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

  board[3][5].gameElement = BALL;
  board[6][7].gameElement = BALL;
  return board;
}

// Render the board to an HTML table
function renderBoard(board) {
  var strHTML = "";

  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];

      var cellClass = getClassName({ i: i, j: j });

      cellClass += currCell.type === FLOOR ? " floor" : " wall";

      strHTML +=
        '\t<td class="cell ' +
        cellClass +
        '"  onclick="moveTo(' +
        i +
        "," +
        j +
        ')" >\n';

      switch (currCell.gameElement) {
        case GAMER:
          strHTML += GAMER_IMG;
          break;
        case BALL:
          strHTML += BALL_IMG;
          break;
      }

      strHTML += "\t</td>\n";
    }
    strHTML += "</tr>\n";
  }

  var elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
  var msg = "";
  if (gIsGlue) return;

  var targetCell = gBoard[i][j];
  if (targetCell.type === WALL) return;

  // Calculate distance to make sure we are moving to a neighbor cell
  var iAbsDiff = Math.abs(i - gGamerPos.i);
  var jAbsDiff = Math.abs(j - gGamerPos.j);

  // If the clicked Cell is one of the four allowed
  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0) ||
    iAbsDiff === 9 ||
    jAbsDiff === 11
  ) {
    if (targetCell.gameElement === BALL) {
      playAudio();
      updatBallsCount();
      checkVictory();
    } else if (targetCell.gameElement === GLUE) {
      gIsGlue = true;
      setTimeout(stopGlued, 3000);
    }

    // Move the gamer
    // Update the Model:
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    // Update the Dom:
    renderCell(gGamerPos, "");

    // Update the Model:
    gGamerPos.i = i;
    gGamerPos.j = j;
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    // Update the Dom:
    renderCell(gGamerPos, GAMER_IMG);
  } else console.log("TOO FAR", iAbsDiff, jAbsDiff);
}

function playAudio() {
  var sound = new Audio("audio/sound82.wav");
  sound.play();
}

function updatBallsCount() {
  gBallCollected++;
  gBallsLeftCounter--;
  updateBallMsg();
}

function updateBallMsg() {
  var elCollectedCounter = document.querySelector("h2 span");
  elCollectedCounter.innerText = gBallCollected;

  var elBallsLeftCounter = document.querySelector("h3 span");
  elBallsLeftCounter.innerText = gBallsLeftCounter;
}

function checkVictory() {
  if (gBallsLeftCounter === 0) {
    console.log("Victory");
    endGame();
  }
}

function endGame() {
  clearInterval(gBallInterval);
  gBallInterval = null;
  clearInterval(gGlueInterval);
  gAddGlueInterval = null;
  var elStartBtn = document.querySelector(".start-over");
  elStartBtn.style.display = "block";
}

// Convert a location object {i, j} to a selector and render a value in that element
// {i:2 , j:5}
function renderCell(location, value) {
  var cellSelector = "." + getClassName(location); // '.cell-2-5'
  var elCell = document.querySelector(cellSelector);
  elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
  var i = gGamerPos.i;
  var j = gGamerPos.j;

  switch (event.key) {
    case "ArrowLeft":
      if (j === 0) moveTo(i, gBoard[0].length - 1);
      else moveTo(i, j - 1);
      break;
    case "ArrowRight":
      if (j === gBoard[0].length - 1) moveTo(i, 0);
      else moveTo(i, j + 1);
      break;
    case "ArrowUp":
      if (i === 0) moveTo(gBoard.length - 1, j);
      else moveTo(i - 1, j);
      break;
    case "ArrowDown":
      if (i === gBoard.length - 1) moveTo(0, j);
      else moveTo(i + 1, j);
      break;
  }
}

// Returns the class name for a specific cell
// {i:0,j:0} = > 'cell-0-0'
function getClassName(location) {
  var cellClass = "cell-" + location.i + "-" + location.j;
  return cellClass;
}

function findEmptyCell() {
  var emptyCells = [];
  var emptyCell = {};

  for (var i = 1; i < gBoard.length - 1; i++) {
    for (var j = 1; j < gBoard.length - 1; j++) {
      if (gBoard[i][j].gameElement === null) {
        emptyCell = {
          i: i,
          j: j,
        };

        emptyCells.push(emptyCell);
      }
    }
  }
  return emptyCells;
}

function addElement(element, elementImg) {
  var emptyCells = findEmptyCell();
  if (emptyCells.length !== 0) {
    var randomCell = emptyCells[getRandomInt(0, emptyCells.length - 1)];
    gBoard[randomCell.i][randomCell.j].gameElement = element;
    renderCell(randomCell, elementImg);
    if (element === BALL) {
      updateBallMsg();
    } else {
      gGluePos = {
        i: randomCell.i,
        j: randomCell.j,
      };
    }
  } else {
    endGame();
  }
}

function addBall() {
  gBallsLeftCounter++;
  addElement(BALL, BALL_IMG);
}

function addGlue() {
  addElement(GLUE, GLUE_IMG);
  setTimeout(deleteGlue, 3000);
}

function stopGlued() {
  gIsGlue = false;
}
function deleteGlue() {
  if (gBoard[gGluePos.i][gGluePos.j].gameElement === GAMER) return;
  if (gGluePos) {
    gBoard[gGluePos.i][gGluePos.j].gameElement = null;
    renderCell(gGluePos, "");
  }
  gGluePos = {};
}
