var game;
var roomConfig = {
    width: 800,
    height: 600
}
var cursors
var keys
var background
var rocket
var enemiesInt = 10
var i
var j

window.onload = function() {
    var gameConfig = {
        type: Phaser.AUTO,
        parent: 'phaser-example',
        width: this.roomConfig.width,
        height: this.roomConfig.height,
        backgroundColor: 0xecf0f1,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        scene: [bootGame, playGame]
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    resizeGame();
    window.addEventListener("resize", resizeGame);
}
class bootGame extends Phaser.Scene{
    constructor(){
        super("BootGame");
    }
    preload(){
        this.load.image("background", "assets/space.jpg");
        this.load.image("rocket", "assets/transportation.png");
        this.load.image("bullet", "assets/security.png");
        this.load.image("enemy", "assets/signs.png");
    }
    create(){
        this.scene.start("PlayGame");
    }
}
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");

        this.enemyGroup;
        this.inputKeys;
        this.projectiles;
    }
    create(){
        //Create images
        background = this.add.image(roomConfig.width/2, roomConfig.height/2, "background").setScale(0.3).setVisible(true);
        rocket = this.physics.add.sprite(roomConfig.width/2, 500, 'rocket').body.setAllowGravity(false).setCollideWorldBounds(true)

        this.enemyGroup = new EnemyGroup(this);
        this.projectiles = this.add.group();

        this.physics.world.setFPS(30);

        for (i = 0; i <= enemiesInt; i++) {
            this.enemyStart();
        }

        this.physics.add.collider(this.projectiles, this.enemyGroup, function (projectile, enemy) {
            enemy.destroy();
            projectile.destroy();
            this.enemyStart();
        });

        cursors = this.input.keyboard.createCursorKeys();
    
        keys = this.input.keyboard.addKeys({
            right: 'd',
            left: 'a',
        });  // keys.up, keys.down, keys.left, keys.right

        // Firing bullets should also work on enter / spacebar press
		this.inputKeys = [
			this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
			this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
		];
    }

    update(){
        this.keystrokes()

        for (j = 0; j < this.projectiles.getChildren().length; j++) {
            var beam = this.projectiles.getChildren()[j];
            beam.update();
        }
    }

    keystrokes(){
        if (keys.right.isDown) {
            rocket.x += 5
        }

        if (keys.left.isDown) {
            rocket.x -= 5
        }

        // Loop over all keys
		this.inputKeys.forEach(key => {
			// Check if the key was just pressed, and if so -> fire the bullet
			if(Phaser.Input.Keyboard.JustDown(key)) {
                this.fireBullet();
			}
		});
    }

    fireBullet() {
		var beam = new Beam(this);
    }
    
    enemyStart() {
		this.enemyGroup.enemyStart(Phaser.Math.Between(50, 750), Phaser.Math.Between(0, 100));
    }
}

// 3.1 create the beam class
// 3.1 NOTE dont forget to add this file in the index.html file
class Beam extends Phaser.GameObjects.Sprite{
	constructor(scene){
  
	  var x = rocket.x + rocket.width/2;
	  var y = rocket.y;
  
	  super(scene, x, y, "bullet");
  
	  // 3.2 add to scene
	  scene.add.existing(this);
  
	  // 3.3
	  scene.physics.world.enableBody(this);
	  this.body.velocity.y = - 900;
  
  
	  // 4.2 add the beam to the projectiles group
	  scene.projectiles.add(this);
  
	}
  
  
	update(){
        // 3.4 Frustum culling
        if(this.y <= 0 ){
            this.destroy();
        }
      
	}
}

class EnemyGroup extends Phaser.Physics.Arcade.Group
{
	constructor(scene) {
		super(scene.physics.world, scene);

		this.createMultiple({
			frameQuantity: enemiesInt,
			key: 'enemy',
			active: false,
			visible: false,
			classType: Enemy
		});
    }
    
    enemyStart(x, y) {
		const enemy = this.getFirstDead(false);

		if(enemy) {
			enemy.start(x, y);
		}
	}
}

class Enemy extends Phaser.Physics.Arcade.Sprite
{
	constructor(scene, x, y) {
        super(scene, x, y, 'enemy');
        
        this.enemySpeed = 2.5;
	}

	start(x, y) {
		this.body.reset(x, y);

		this.setActive(true);
        this.setVisible(true);
        this.body.setAllowGravity(false)
        this.setCollideWorldBounds(true)
	}

	preUpdate(time, delta) {
        super.preUpdate(time, delta);

        this.x += this.enemySpeed;

		if (this.y >= 500) {
            this.destroy()
		} else {
            if (this.enemySpeed > 0 && this.x >= 777) {
                this.enemySpeed *= -1;
                this.y += 50
            }
            if (this.enemySpeed < 0 && this.x <= 23) {
                this.enemySpeed *= -1;
                this.y += 50
            }
        }
    }
}

function resizeGame(){
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}