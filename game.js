let game;

let gameOptions = {
  gravity: 1,
  maxItemsPerLevel: 30,
  maxIterations: 10,
  minItemsDistance: 160
}

const HERO = 0;
const COIN = 1;
const SKULL = 2;
var score = 0;
var info;
var hero;

window.onload = function() {
  let gameConfig = {
    
    type: Phaser.AUTO,

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: "thegame",
      width: 1680,
      height: 988,
    },
    
    scene: playGame,
    
    physics: {
      default: "matter",
      matter: {
        gravity: {
          y: gameOptions.gravity
        }
      }
    }
  }
  
  game = new Phaser.Game(gameConfig);
  window.focus();
  
}

class playGame extends Phaser.Scene{
    
  constructor() {
    super("PlayGame");
  }
  
  preload() {
    this.load.spritesheet("items", "Art/items2.png", {
      frameWidth: 128,
      frameHeight: 128
    });
    this.load.image("Background","Art/CaveBack.jpg", {
      frameWidth: 1680,
      frameHeight: 988
    });
    this.load.image("Block","Art/Block2.png", {
      frameWidth: 1747,
      frameHeight: 1920
    });
  }
  
  create() {
    this.canSummonHero = true;
    this.matter.world.update30Hz();
    this.matter.world.setBounds(0, -400, game.config.width, game.config.height + 800);
    
    this.createLevel();
    
    this.input.on("pointerdown", this.releaseHero, this);
    info = this.add.text(10, 10, '', { font: '48px Arial', fill: '#b9f2ff' });
    this.matter.world.on("collisionstart", function(e, b1, b2) {
    
      switch (b1.label) {
          
        case COIN:
          b1.gameObject.visible = false;
          this.matter.world.remove(b1);
          score++
          break;
          
        case SKULL:
          if (b1.gameObject.y > b2.gameObject.y) {
            b1.gameObject.visible = false;
            this.matter.world.remove(b1);
          } else {
            this.cameras.main.flash(0, 0, 255, 0);
          }
          break;
          
        default:
          if (b2.gameObject.y > game.config.height) {
            this.scene.start("PlayGame");
          } else {
            if (b2.gameObject.y > 0) {
              this.cameras.main.flash(50, 255, 0, 0);
            }
          }
          
      }
    }, this);
  }
  
  createLevel() {
    var bg = this.add.image(960,509, 'Background');  

    this.gameItems = this.add.group();
    let spawnRectangle = new Phaser.Geom.Rectangle(80, 250, game.config.width - 160, game.config.height - 350);
  

    
    for (let i = 0; i < gameOptions.maxItemsPerLevel; i++) {
      let iterations = 0;
      let point;
      do {
        point = Phaser.Geom.Rectangle.Random(spawnRectangle);
        iterations ++;
      } while (iterations < gameOptions.maxIterations && this.itemsOverlap(point));
      
      if (iterations == gameOptions.maxIterations) {
        break;
      } else {
        let item = this.matter.add.image(point.x, point.y, "items");
        item.setCircle();
        item.setStatic(true);
        this.gameItems.add(item);
        
        if (Phaser.Math.Between(0, 99) > 50) {
          item.setFrame(1);
          item.body.label = COIN;
        } else {
          item.setFrame(2);
          item.body.label = SKULL;
        }
      }
    }
  }
  
  itemsOverlap(p) {
    let overlap = false;
    this.gameItems.getChildren().forEach(function(item) {
      if (item.getCenter().distance(p) < gameOptions.minItemsDistance) {
        overlap = true;
      }
    })
    return overlap;
  }

  releaseHero(e) {
    if (this.canSummonHero) {
      this.canSummonHero = false;
      var particles = this.add.particles('Block');
      var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
    });

    
      hero = this.matter.add.image(e.x, -200, "items");
      hero.setCircle();
      hero.setBounce(1);
      hero.body.label = HERO;
      emitter.startFollow(hero);
    }
  }
update () {
    info.setText('All Time Score: ' + score);
}
};
