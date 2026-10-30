import Player from './Player.js';
import AIManager from './AIManager.js';
import Phaser from 'phaser';

import { Coins, Doors, Bones, Spikes, Platforms, Fireballs } from './GameObjects.js';
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
        this.platformMap = new Map();
        this.spikeMap = new Map();
        this.timer = this.registry.get('timer')
        this.deaths = this.registry.get('deaths')
        this.aiManager = new AIManager(this, 50);
    }


    create() {
        this.createBG()

        this.scoreText = this.add.text(16, 16, `Score: ${this.registry.get('score')}`, { fontSize: '24px', fill: '#fff' });
        this.lifeText = this.add.text(16, 40, `Life: ${this.registry.get('life')}`, { fontSize: '24px', fill: '#fff' });
        this.deathCounter = this.add.text(16, 66, `Deaths: ${this.registry.get('deaths')}`, { fontSize: '24px', fill: '#b8190e' });



        this.coins = new Coins(this, this.coinsData)
        this.doors = new Doors(this, this.doorsData)
        this.bones = new Bones(this, this.bonesData)



        this.platforms = new Platforms(this, this.platformsData);
        this.platforms.getChildren().forEach((plat) => {
            this.platformMap.set(plat.getData('ID'), plat);
        })


        this.spikes = new Spikes(this, this.spikeData)
        this.spikes.getChildren().forEach((spike) => {
            this.spikeMap.set(spike.getData('ID'), spike);
        })

        this.physics.add.collider(this.spikes, this.platforms, null, null, this);
        this.createLava(this.lavaData)



        // this.createPlayer();
        this.createFloor(this.floorData)
        this.createPortal(this.portalData)
        this.createInputs()
        this.createAIPlayers();



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

        //for debug
        const combo = this.input.keyboard.createCombo(['S', 'P', 'E', 'E', 'D'], { resetOnMatch: true });

        this.input.keyboard.on('keycombomatch', (event) => {
            this.nextLevel();
            console.log("fraco");
        });


    }
    update(time, delta) {
        if (this.registry.get('life') == 0) {
            this.gameOver = true;
        }
        if (this.gameOver) {
            this.scene.pause()
            this.scene.launch('GameOver', 'loser');
        }
        //this.player.update(this.activeControls, delta);
        this.updateAIPlayers(delta);
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
        this.doorsData = this.map.getObjectLayer('door');
        this.bonesData = this.map.getObjectLayer('bone');
        this.spikeData = this.map.getObjectLayer('spike');
    }

    objMovement(objType, ID, type, freq, range, delta) {
        let obj;
        if (objType === 'spike') {
            obj = this.spikeMap.get(ID);
        }

        if (objType === 'platform') {
            obj = this.platformMap.get(ID);
        }

        let t = obj.getData('Timer');
        t += delta;
        const velocityValue = Math.cos(t * freq) * (range * freq * 100);
        obj.setData('Timer', t);
        if (type === 'horizontal') {
            obj.body.setVelocityX(velocityValue);
        }
        if (type === 'vertical') {
            obj.body.setVelocityY(velocityValue);
        }
        if (type === 'circular') {
            obj.body.setVelocityX(velocityValue);
            obj.body.setVelocityY(Math.sin(t * freq) * (range * freq * 100));
        }
    }

    collectBone(player, bone) {
        const boneID = this.boneID.get()
        const doorSprite = this.doorID.get(`door${boneID}`);
        if (doorSprite) {
            doorSprite.destroy();
        }
        bone.destroy();
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
            img.setData('ID', obj.name);
            img.setDisplaySize(obj.width, obj.height);
            img.setOrigin(0, 1);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true);
        });
    }


    // CREATE LAVA
    createLava(objLayer) {
        this.lava = this.physics.add.group();
        objLayer.objects.forEach(obj => {
            let img = this.lava.create(obj.x, obj.y, 'lava');
            img.setOrigin(0, 1);
            img.setDisplaySize(obj.width, obj.height);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true)
        });
    }

    // CREATE PORTAL

    createPortal(objLayer) {
        this.portals = this.physics.add.group();
        objLayer.objects.forEach(obj => {
            let img = this.portals.create(obj.x, obj.y, 'portal');
            img.setOrigin(0, 1);
            img.setDisplaySize(obj.width, obj.height);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true)
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
        const ass = CryptoJS.HmacSHA256(gameDataStr, '31T5').toString();
        localStorage.setItem('save', gameDataStr);
        localStorage.setItem('saveAss', ass);
    }

    createAIPlayers(popSize = 50) {
        // 1. Inicializa o AIManager (assuma que já fez import { AIManager } ...)
        this.players = [];
        this.playerGroup = this.physics.add.group(); // Agrupa todos para as colisões

        // 2. Cria os clones
        for (let i = 0; i < popSize; i++) {
            let brain = this.aiManager.population[i];
            let player = new Player(this, 150, 700, brain);
            player.setAlpha(0.3);

            // Simula o efeito inicial do seu código (gravidade desligada no fade-in)
            player.body.allowGravity = false;

            // Arrays internos da IA para não pegarem o mesmo item 2 vezes
            player.collectedCoinsSet = new Set();
            player.collectedBonesSet = new Set();

            this.players.push(player);
            this.playerGroup.add(player);
        }

        // Restaura a gravidade após o fade-in para toda a população
        this.cameras.main.once('camerafadeincomplete', () => {
            this.players.forEach(p => {
                if (p.active) p.body.allowGravity = true;
            });
        });

        // 3. Colisões Sólidas (Eles batem nas paredes normalmente)
        this.physics.add.collider(this.playerGroup, this.platforms);
        this.physics.add.collider(this.playerGroup, this.doors);
        this.physics.add.collider(this.playerGroup, this.floor, null, null, this);

        // 4. Coletar Moedas (Sem destruir a moeda do cenário)
        this.physics.add.overlap(this.playerGroup, this.coins, (player, coin) => {
            if (!player.isAlive) return;

            // Checa se ESTE player específico já pegou ESTA moeda
            if (!player.collectedCoinsSet.has(coin)) {
                player.collectedCoinsSet.add(coin);
                player.coinsCollected++;
            }
        });

        // 5. Coletar Ossos
        this.physics.add.overlap(this.playerGroup, this.bones, (player, bone) => {
            if (!player.isAlive) return;

            if (!player.collectedBonesSet.has(bone)) {
                player.collectedBonesSet.add(bone);
                // Você pode usar isso depois para dar pontos extras de inteligência para a IA
                player.brain.score += 1000;
            }
        });

        // 6. Receber Dano (Lava e Espinhos)
        const dmgObjects = [this.lava, this.spikes];
        this.physics.add.overlap(this.playerGroup, dmgObjects, (player, obj) => {
            if (!player.isAlive) return;

            // Apenas mata o clone específico, em vez de diminuir o "this.registry.life" global
            player.die();
        });

        // 7. Chegar no Portal / Final da Fase
        this.physics.add.overlap(this.playerGroup, this.portals, (player, portal) => {
            if (!player.isAlive) return;

            // player.reachedDoor = true;
            player.die(); // Mata a IA para ela parar de se mover (ela zera a fase)
        });
    }

    createPlayer() {
        this.player = new Player(this, 150, 700, null);
        this.physics.add.collider(this.player, this.platforms, null, null, this);
        this.physics.add.collider(this.player, this.doors, null, null, this);
        this.physics.add.collider(this.player, this.floor, null, null, this);

        const dmgObjects = [this.lava, this.spikes]

        this.physics.add.overlap(this.player, this.portals, this.nextLevel, null, this);
        this.physics.add.overlap(this.player, dmgObjects, (player, obj) => {
            this.registry.inc('life', -1);
            this.registry.inc('deaths', 1);
            this.player.takeDamage(obj);
            this.lifeText.setText('Life: ' + this.registry.get('life'));
            this.deathCounter.setText('Deaths: ' + this.registry.get('deaths'));
        }, null, this);

        this.player.body.allowGravity = false;
        this.cameras.main.fadeIn(900, 0, 0, 0);
        this.cameras.main.once('camerafadeincomplete', () => {
            this.player.body.allowGravity = true;
        });

        this.physics.add.overlap(this.player, this.coins, (player, coin) => {
            this.coins.collect(coin);
            player.coinsCollected++;
            this.registry.inc('score', 10);
            this.scoreText.setText('Score: ' + this.registry.get('score'));
        }, null, this);
        this.physics.add.overlap(this.player, this.bones, (player, bone) => {
            this.doors.getChildren().forEach(door => {
                if (door.getData('ID') === bone.getData('ID')) {
                    this.doors.open(door)
                }
            });
            this.bones.collect(bone)

        }, null, this);
    }

    updateAIPlayers(delta) {


        
        this.players.forEach((player) => {
            if (!player.isAlive) return;

            // 1. Coleta os inputs da tela (sua lógica do neural.js)
            const inputs = [];

            // 2. A IA decide (TensorFlow ou Carrot)
            const output = this.aiManager.think(player.brain, inputs);
            // 3. Injeta a decisão nos controles virtuais do Player
            player.applyAICommands(output);

            // 4. O PULO DO GATO: Passamos NULL no primeiro parâmetro!
            // Assim ele sabe que não deve ler o teclado humano.
            player.update(null, delta);
        });
    }

    pauseGame() {
        this.scene.pause(); // Congela a física e o update desta cena
        this.scene.launch('Pause'); // Roda a cena de pause por cima
    }

    resumeGame() {
        this.scene.stop(); // Congela a física e o update desta cena
        this.scene.launch(this.scene);
    }
}


