class Game {
  constructor() {
    this.resetTitle = createElement("h1")
    this.resetButton = createImg("./assets/reset.png")
    this.resetButton.size(50,50)
    this.leaderBoardTitle = createElement("h2")
    this.leader1= createElement("h2")
    this.leader2 = createElement("h2")
    this.playerMoving = false
    this.leftKeyActive = false
    this.blast = false

  }

  getState() {
    var gameStateRef = database.ref("gameState")
    gameStateRef.on("value",function(data){
      gameState = data.val()
    })

  }

  update(state) {
    database.ref("/").update({
      gameState:state
    })
  }

  start() {
    player = new Player();
    playerCount = player.getCount()
    form = new Form();
    form.display();

    car1 = createSprite(width/2-50,height-100)
    car1.addImage("car1",carimg1)
    car1.scale = 0.07
    car1.addImage("blast",blast)

    car2 = createSprite(width/2+100,height-100)
    car2.addImage("car2",carimg2)
    car2.scale = 0.07
    car2.addImage("blast",blast)

    cars = [car1,car2]

    fuels = new Group()
    powerCoins = new Group()
    obstacles = new Group()

    var obstaclesPositions = [
      {x:width/2+250,y:height-800,image:obstacleIMG2},
      {x:width/2-150,y:height-1300,image:obstacleIMG1},
      {x:width/2+250,y:height-1800,image:obstacleIMG1},
      {x:width/2-180,y:height-2300,image:obstacleIMG2},
      {x:width/2,y:height-2800,image:obstacleIMG2},
      {x:width/2-180,y:height-3300,image:obstacleIMG1},
      {x:width/2+180,y:height-3300,image:obstacleIMG2},
      {x:width/2+250,y:height-3800,image:obstacleIMG2},
      {x:width/2-150,y:height-4300,image:obstacleIMG1},
      {x:width/2+250,y:height-4800,image:obstacleIMG2},
      {x:width/2,y:height-5300,image:obstacleIMG1},
      {x:width/2-180,y:height-5500,image:obstacleIMG2},
      
    ]

    this.addSprites(fuels,4,fuelIMG,0.02)
    this.addSprites(powerCoins,18,powerCoinIMG,0.09)
    this.addSprites(obstacles,obstaclesPositions.length,obstacleIMG1,0.04,obstaclesPositions)
  }

  addSprites (spriteGroup,numberOfSprites,SpriteImage,scale,positions = []){
    for (let i = 0; i < numberOfSprites; i++) {
    var x, y

    if (positions.length>0) {
      x = positions[i].x
      y = positions[i].y
      SpriteImage = positions[i].image
    } else {
      x = random(width/2+150,width/2-150)
      y = random(-height*4.5,height-400)
    }
      
    var sprite = createSprite(x,y)
    sprite.addImage("sprite",SpriteImage)
    sprite.scale = scale
    spriteGroup.add(sprite)
    }

  }

  handleElements () {
    form.hide()
    form.titleImg.position(40,40)
    form.titleImg.class("gameTitleAfterEffect")
    this.resetTitle.html("Reiniciar jogo")
    this.resetTitle.class("resetText")
    this.resetTitle.position(width/2+250,40)

    this.resetButton.class("resetButton")
    this.resetButton.position(width/2+320,100)

    this.leaderBoardTitle.html("placar")
    this.leaderBoardTitle.class("resetText")
    this.leaderBoardTitle.position(width/3-200,100)

    this.leader1.class("leadersText")
    this.leader1.position(width/3-220,150)

    this.leader2.class("leadersText")
    this.leader2.position(width/3-220,180)

  }

  play() {
    this.handleElements()
    this.handleResetButton()
    Player.getPlayersInfo()
    player.getCarsAtEnd()


    if (allPlayers!==undefined) {
      image(track,0,-height*5,width,height*6)

      this.showLeaderBoard()
      this.showLife()
      this.showFuel()

      var index = 0

      for (var plr in allPlayers){
        index += 1
        if (this.playerMove){
          player.positionY+=5
          player.update()

        }
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY

        var currentLife = allPlayers[plr].life
        if (currentLife<=0) {
          cars[index-1].changeImage("blast")
          cars[index-1].scale = 0.1
        }

        cars[index-1].position.x = x
        cars[index-1].position.y = y

        if (index === player.index) {
          stroke(10)
          fill("green")
          ellipse(x,y,60,60)

          this.handleFuel(index)
          this.handlePowerCoin(index)
          this.handleCarACollisionWithCarB(index)
          this.handleObstacleCollision(index)

          if (player.life<=0) {
            this.blast = true
            this.playerMoving = false
          }

          camera.position.x = cars[index - 1].position.x
          camera.position.y = cars[index - 1].position.y
        }
      }

      this.handlePlayersControls()

      const finishLine = height*6-100

      if (player.positionY>finishLine) {
        gameState = 2 
        player.rank+=1
        Player.updateCarsAtEnd(player.rank)
        player.update()
        this.showRank()
      }

      drawSprites()
    }
  }

  handleResetButton(){
    this.resetButton.mousePressed(()=>{
      database.ref("/").set({
        playerCount:0,
        gameState:0,
        players:{},
        carsAtEnd:0,
      });
      window.location.reload()
    })

  }

  handlePlayersControls(){

    if (!this.blast) {
      if (keyIsDown(UP_ARROW)){
        this.playerMoving = true
        player.positionY += 10
        player.update()
      }
      if (keyIsDown(LEFT_ARROW)&&player.positionX>width/3-50){
        this.leftKeyActive = true
        player.positionX -= 5
        player.update()
      }
      if (keyIsDown(RIGHT_ARROW)&&player.positionX<width/2+300){
        this.leftKeyActive = false
        player.positionX += 5
        player.update()
      }
      
    }
   

  }

  // CONTROL C E CONTROL V

  showLeaderBoard(){
    var leader1
    var leader2
    var players = Object.values(allPlayers)

    if ((players[0].rank === 0 && players[1].rank === 0 )||
    players[0].rank === 1) {
    
    leader1 = 
    players[0].rank+
    "&emsp;"+
    players[0].name+
    "&emsp;"+
    players[0].score;

    leader2 = 
    players[1].rank+
    "&emsp;"+
    players[1].name+
    "&emsp;"+
    players[1].score;

    }

    if (players[1].rank === 1) {
      leader2 = 
    players[0].rank+
    "&emsp;"+
    players[0].name+
    "&emsp;"+
    players[0].score;

    leader1 = 
    players[1].rank+
    "&emsp;"+
    players[1].name+
    "&emsp;"+
    players[1].score;

    }

    this.leader1.html(leader1)
    this.leader2.html(leader2)
  }

  handleFuel(index){
    cars[index-1].overlap(fuels,function(collector,collected){
      player.fuel = 185
      collected.remove()
    })

    if(player.fuel>0&&this.playerMoving) {
      player.fuel-=0.3

    }

    if (player.fuel<=0) {
      gameState = 2
      this.gameOver()

    }

  }

  showLife() {
    push()
    image(lifeImg,width/2-130,height-player.positionY-280,20,20)
    fill("white")
    rect(width/2-100,height-player.positionY-280,185,20)
    fill("red")
    rect(width/2-100,height-player.positionY-280,player.life,20)
    noStroke()
    pop()

  }

  showFuel() {
    push()
    image(fuelIMG,width/2-130,height-player.positionY-250,20,20)
    fill("white")
    rect(width/2-100,height-player.positionY-250,185,20)
    fill("yellow")
    rect(width/2-100,height-player.positionY-250,player.fuel,20)
    noStroke()
    pop()

  }

  handlePowerCoin(index){
    cars[index-1].overlap(powerCoins,function(collector,collected){
      player.score += 21
      player.update()
      collected.remove()
    })

  }

  handleObstacleCollision(index){
    if (cars[index-1].collide(obstacles)) {
      if (this.leftKeyActive) {
        player.positionX += 100
      } else {
        player.positionX -= 100
      }
      if (player.life>0) {
        player.life-=185/4
      }

      player.update()
    }

  }

  handleCarACollisionWithCarB(index){
    if (index == 1) {
      if (cars[index-1].collide(cars[1])) {
         if (this.leftKeyActive) {
          player.positionX += 100
         } else {
          player.positionX -= 100
         }
         if (player.life>0) {
          player.life -= 185/4
         }
         player.update()
    }

  }

  if (index == 2) {
    if (cars[index-1].collide(cars[0])) {
       if (this.leftKeyActive) {
        player.positionX += 100
       } else {
        player.positionX -= 100
       }
       if (player.life>0) {
        player.life -= 185/4
       }
       player.update()
  }

}
  }

  showRank() {
    swal({
      title:`Parabens${"\n"}${player.rank}ºlugar`,
      text:"Você conseguiu!",
      imageUrl: "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "ok",
    })

  }

  gameOver() {
    swal({
      title:`fim de jogo`,
      text:"Você não conseguiu :(",
      imageUrl: "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "tente denovo",
    })

  }


}
