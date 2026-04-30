import Player from './Player.js';

export default class BaseLevel extends Phaser.Scene {

    constructor(config) {
        super(config.key);
    }

    init() {

        this.gameOver = false;
        this.scoreText;
        this.deathCounter;
        this.dashTimer = 0;
        this.wallJumpTimer = 0;
        this.isJumping;
        this.jumpTimer;
        this.jumps;
        this.coinsID = new Map();
        this.platformsID = new Map();
        this.lavaID = new Map();
        this.boneID = new Map();
        this.doorID = new Map();
        this.portalID = new Map();
        this.spikeID = new Map();
        this.timer = this.registry.get('timer')
        this.deaths = this.registry.get('deaths')

    }


    create() {


        this.createBG()
        this.player = new Player(this, 100, 700);
        console.log(this.player.allowGravity)
        this.player.body.allowGravity = false;
        this.cameras.main.fadeIn(900, 0, 0, 0);
        this.cameras.main.once('camerafadeincomplete', () => {
            this.player.body.allowGravity = true;
        });
        this.createLava(this.lavaData)
        this.createFloor(this.floorData)
        this.createCoins(this.coinsData)
        this.createBone(this.boneData)
        this.createPlatforms(this.platformsData)
        this.createSpike(this.spikeData)
        this.createPortal(this.portalData)
        this.createDoor(this.doorData)
        this.createInputs()
        this.scoreText = this.add.text(16, 16, `Score: ${this.registry.get('score')}`, { fontSize: '24px', fill: '#fff' });
        this.lifeText = this.add.text(16, 40, `Life: ${this.registry.get('life')}`, { fontSize: '24px', fill: '#fff' });
        this.deathCounter = this.add.text(16, 66, `Deaths: ${this.registry.get('deaths')}`, { fontSize: '24px', fill: '#b8190e' });


        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('Pause', 'levels');
        });
        this.input.keyboard.on('keydown-R', () => {
            this.registry.set('score', JSON.parse(localStorage.getItem('save')).score);
            this.registry.set('life', JSON.parse(localStorage.getItem('save')).life);
            this.scene.restart();

        });

        this.registry.events.on('changedata-settings', (parent, value) => {
            this.setControls(value.controls);
        });

        // for debug
        this.input.keyboard.on('keydown-P', () => {
            this.nextLevel()
        });


    }
    update(time, delta) {
        if (this.gameOver) {
            this.scene.pause()
            this.scene.launch('GameOver', 'loser');
        }
        this.player.update(this.activeControls, delta);
        this.registry.inc('timer', delta / 16.6 / 60);
    }





    // metodos gerais

    createLayout(map) {
        this.map = this.make.tilemap({ key: map });
        this.floorData = this.map.getObjectLayer('floor');
        this.coinsData = this.map.getObjectLayer('coin');
        this.platformsData = this.map.getObjectLayer('platform');
        this.portalData = this.map.getObjectLayer('portal');
        this.lavaData = this.map.getObjectLayer('lava');
        this.doorData = this.map.getObjectLayer('door');
        this.boneData = this.map.getObjectLayer('bone');
        this.spikeData = this.map.getObjectLayer('spike');
    }

    platformMovement(name, type, freq, range, delta) {
        const platform = this.platformsID.get(name);
        let t = platform.getData('Timer');
        t += delta;
        const velocityValue = Math.cos(t * freq) * (range * freq * 100);
        platform.setData('Timer', t);
        if (type === 'horizontal') {
            platform.body.setVelocityX(velocityValue);
        }
        if (type === 'vertical') {
            platform.body.setVelocityY(velocityValue);
        }
        if (type === 'circular') {
            const vel = Math.sin(t * freq) * (range * freq * 100);
            platform.body.setVelocityX(velocityValue);
            platform.body.setVelocityY(vel);
        }
    }
    collectBone(player, bone, obj) {
        const boneID = obj.name.at(-1);
        const doorSprite = this.doorID.get(`door${boneID}`);
        doorSprite.destroy();
        bone.destroy();
    }

    collectCoin(player, coin) {
        coin.destroy();
        this.registry.inc('score', 10);
        this.scoreText.setText('Score: ' + this.registry.get('score'));
    }

    takeDamage(player, lava) {
        this.registry.inc('life', -1);
        if (this.registry.get('life') == 0) {
            this.gameOver = true;
        }
        this.registry.inc('deaths', 1);
        this.lifeText.setText('Life: ' + this.registry.get('life'));
        this.deathCounter.setText('Deaths: ' + this.registry.get('deaths'));
        this.player.setPosition(100, 700)
    }

    // CREATE BG
    createBG() {
        this.add.image(950, 460, 'BG').setAlpha(0.5);
    }

    // CREATE INPUTS
    createInputs() {
        this.keysWASD = this.input.keyboard.addKeys('W,A,S,D,J,K');
        this.keysArrows = this.input.keyboard.addKeys('UP,LEFT,RIGHT,DOWN,Z,X');;
        this.activeControls = {
            up: null,
            left: null,
            right: null,
            jump: null,
            down: null,
            dash: null
        };
        const settings = this.registry.get('settings');
        const mapping = settings.controls;
        this.setControls(mapping);
    }

    setControls(setting) {
        if (setting === 'WASD') {
            this.activeControls.jump = this.keysWASD.J;
            this.activeControls.dash = this.keysWASD.K;
            this.activeControls.up = this.keysWASD.W;
            this.activeControls.left = this.keysWASD.A;
            this.activeControls.down = this.keysWASD.S;
            this.activeControls.right = this.keysWASD.D;
        } else if (setting === 'arrows') {
            this.activeControls.jump = this.keysArrows.Z;
            this.activeControls.dash = this.keysArrows.X;
            this.activeControls.down = this.keysArrows.DOWN;
            this.activeControls.up = this.keysArrows.UP;
            this.activeControls.left = this.keysArrows.LEFT;
            this.activeControls.right = this.keysArrows.RIGHT;

        }
    }


    // CREATE FLOOR
    createFloor(objLayer) {
        this.floor = this.physics.add.group()
        objLayer.objects.forEach(obj => {
            const img = this.floor.create(obj.x, obj.y, obj.name);
            if (obj.rotation) {
                img.setAngle(obj.rotation);
                img.body.setOffset(-img.width, img.height);
                img.refreshBody()
            }
            if (obj.flippedVertical) {
                img.setFlipY(true);
            }
            if (obj.flippedHorizontal) {
                img.setFlipX(true);
            }
            img.setDisplaySize(obj.width, obj.height);
            img.setOrigin(0, 1);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true);
        });
        this.physics.add.collider(this.player, this.floor, null, null, this);
    }

    // CREATE SPIKES
    createSpike(objLayer) {
        this.spikes = this.physics.add.group({ allowGravity: false });

        objLayer.objects.forEach(obj => {
            const img = this.add.sprite(obj.x, obj.y, obj.name);
            img.setOrigin(0, 1);
            img.setDisplaySize(obj.width, obj.height);

            if (obj.flippedVertical) img.setFlipY(true);
            if (obj.flippedHorizontal) img.setFlipX(true);

            if (obj.name === 'spikeD') {
                img.setTexture('spike');
                img.setDisplaySize(obj.width, obj.height);
            }
            this.physics.add.existing(img);
            this.spikes.add(img);

            if (obj.name === 'spikeD') {
                img.body.setAllowGravity(true);
            } else {
                img.body.setAllowGravity(false);
            }
            img.body.setSize(img.width * 0.9, img.height * 0.8);
        });
        this.physics.add.collider(this.spikes, this.platforms);
        this.physics.add.overlap(this.player, this.spikes, this.takeDamage, null, this);
    }
    // CREATE PLATFORMS
    createPlatforms(objLayer) {
        this.platforms = this.physics.add.group()
        objLayer.objects.forEach(obj => {
            let img = this.platforms.create(obj.x, obj.y, 'platform');
            img.setOrigin(0, 1);
            img.setDisplaySize(obj.width, obj.height);
            this.platformsID.set(obj.name, img);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true)
            img.body.setFriction(1, 1); // Faz o player "grudar"
            img.setData('Timer', 0);
            if (obj.flippedVertical) {
                img.setFlipY(true);
            }
            if (obj.flippedHorizontal) {
                img.setFlipX(true);
            }
        });
        this.physics.add.collider(this.player, this.platforms);
    }
    // CREATE LAVA
    createLava(objLayer) {
        this.lava = this.physics.add.group();
        objLayer.objects.forEach(obj => {
            let img = this.lava.create(obj.x, obj.y, 'lava');
            img.setOrigin(0, 1);
            img.setDisplaySize(obj.width, obj.height);
            this.lavaID.set(obj.name, img);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true)
        });
        this.physics.add.overlap(this.player, this.lava, this.takeDamage, null, this);
    }

    //CREATE DOOR
    createDoor(objLayer) {
        this.doors = this.physics.add.group();
        objLayer.objects.forEach(obj => {
            let img = this.doors.create(obj.x, obj.y, 'door');
            img.setOrigin(0, 1);
            img.setDisplaySize(obj.width, obj.height);
            this.doorID.set(obj.name, img);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true)
        });
        this.physics.add.collider(this.player, this.doors);
    }
    //CREATE COINS
    createCoins(objLayer) {
        this.coins = this.physics.add.group();
        objLayer.objects.forEach(obj => {
            let img = this.coins.create(obj.x, obj.y, 'coin');
            img.setOrigin(0, 1);
            img.setDisplaySize(obj.width, obj.height);
            this.coinsID.set(obj.name, img);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true);
            img.play('coinSpin', true);
        });
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    }


    // CREATE PORTAL

    createPortal(objLayer) {
        this.portals = this.physics.add.group();
        objLayer.objects.forEach(obj => {
            let img = this.portals.create(obj.x, obj.y, 'portal');
            img.setOrigin(0, 1);
            img.setDisplaySize(obj.width, obj.height);
            this.portalID.set(obj.name, img);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true)
        });
        this.physics.add.overlap(this.player, this.portals, this.nextLevel, null, this);
    }

    // CREATE BONE
    createBone(objLayer) {
        this.bones = this.physics.add.group();
        objLayer.objects.forEach(obj => {
            let img = this.bones.create(obj.x, obj.y, 'bone');
            img.setOrigin(0, 1);
            img.setDisplaySize(obj.width, obj.height);
            this.boneID.set(obj.name, img);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true)
            this.physics.add.overlap(this.player, this.bones, (player, bone) => { this.collectBone(player, bone, obj) }, null, this);
        });
    }

    // NEXT LEVEL
    nextLevel(highscore) {
        this.scene.start(`Level${Number(this.registry.get('level').match(/\d+/)[0]) + 1}`)
        this.createSave();
    }


    createSave() {
        let gameData = {
            score: this.registry.get('score'),
            level: `Level${Number(this.registry.get('level').match(/\d+/)[0]) + 1}`,
            life: this.registry.get('life'),
            timer: this.registry.get('timer')
        };
        const gameDataStr = JSON.stringify(gameData);
        const ass = CryptoJS.HmacSHA256(gameDataStr, 'popo').toString();
        localStorage.setItem('save', gameDataStr);
        localStorage.setItem('saveAss', ass);
    }


    pauseGame() {
        this.scene.pause(); // Congela a física e o update desta cena
        this.scene.launch('Pause'); // Roda a cena de pause por cima
    }

    resumeGame() {
        this.scene.stop(); // Congela a física e o update desta cena
        this.scene.launch(this.scene); // Roda a cena de pause por cima
    }
}


