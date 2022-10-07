var canvas;
var backgroundImage;
var database, gameState;
var form, player, playerCount;
var allPlayers;
var car1,car2,carimg1,carimg2;
var track;
var cars = [];
var fuels, powerCoins, obstacles
var fuelIMG, powerCoinIMG, obstacleIMG1, obstacleIMG2
var lifeImg
var blast

function preload() {
  backgroundImage = loadImage("./assets/planodefundo.png");
  carimg1 = loadImage("./assets/car1.png")
  carimg2 = loadImage("./assets/car2.png")
  track = loadImage("./assets/track.jpg")
  fuelIMG = loadImage("./assets/fuel.png")
  powerCoinIMG = loadImage("./assets/goldCoin.png")
  obstacleIMG1 = loadImage("./assets/obstacle1.png")
  obstacleIMG2 = loadImage("./assets/obstacle2.png")
  lifeImg = loadImage("./assets/life.png")
  blast = loadImage("./assets/blast.png")

}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();

  game.getState()

  game.start();
}

function draw() {
  background(backgroundImage);
  
  if (playerCount===2) {
    game.update(1)
  }

  if (gameState === 1) {
    game.play()

  }

  if (gameState === 2) {
    game.showLeaderboard()

  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
