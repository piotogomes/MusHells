import Player from './Player.js';
import Utils from './Utils.js';
import AIManager from './AIManager.js';
import Phaser from 'phaser';

const POP_SIZE = 50;

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
        this.aiManager = new AIManager(this, POP_SIZE);
    }


    create() {

        this.input.keyboard.on('keydown-R', () => {
            // this.registry.set('score', JSON.parse(localStorage.getItem('save')).score);
            // this.registry.set('life', JSON.parse(localStorage.getItem('save')).life);
            // this.scene.restart();
            this.nextLevel();
        });

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
        this.createFloor(this.floorData)
        this.createPortal(this.portalData)
        this.createInputs()
        // this.createPlayer();
        this.createAIPlayers(POP_SIZE);



        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('Pause', 'levels');
        });

        this.registry.events.on('changedata-settings', (parent, value) => {
            this.setControls(value.controls);
        });

        //for debug
        const combo = this.input.keyboard.createCombo(['R', 'U', 'N'], { resetOnMatch: true });

        this.input.keyboard.on('keycombomatch', (event) => {
            this.nextLevel();
            // console.log("fraco");
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
        // this.player.update(this.activeControls, delta);
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

    createAIPlayers(popSize) {
        // 1. Inicializa o AIManager (assuma que já fez import { AIManager } ...)
        this.players = [];
        this.playerGroup = this.physics.add.group(); // Agrupa todos para as colisões

        // 2. Cria os clones
        for (let i = 0; i < popSize; i++) {
            let brain = this.aiManager.population[i];
            let player = new Player(this, 150, 700, brain);
            console.log(player);
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
                player.timerReset();
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
        this.physics.add.overlap(this.player, dmgObjects, async (player, obj) => {
            // Evita múltiplos registros se o jogador já estiver em estado de dano/respawn
            if (this.player.isInvulnerable) return;

            this.player.isInvulnerable = true;
            const sessionId = this.registry.get('sessionId');

            try {
                const response = await fetch('/api/player-damage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId })
                });

                const data = await response.json();

                if (data.success) {
                    // Atualiza com os valores autoritativos do servidor
                    this.registry.set('life', data.newLife);
                    this.registry.set('deaths', data.newDeaths);

                    this.lifeText.setText('Life: ' + data.newLife);
                    this.deathCounter.setText('Deaths: ' + data.newDeaths);

                    // Animação / lógica visual de dano
                    this.player.takeDamage(obj);

                    if (data.isGameOver) {
                        this.postTheFlag(); // ou cena de Game Over
                    }
                }
            } catch (err) {
                console.error('Erro ao registrar dano:', err);
            } finally {
                // Cooldown de invulnerabilidade (ex: 1 segundo de i-frames)
                this.time.delayedCall(1000, () => {
                    this.player.isInvulnerable = false;
                });
            }
        }, null, this);

        this.player.body.allowGravity = false;
        this.cameras.main.fadeIn(900, 0, 0, 0);
        this.cameras.main.once('camerafadeincomplete', () => {
            this.player.body.allowGravity = true;
        });

        this.physics.add.overlap(this.player, this.coins, async (player, coin) => {
            coin.disableBody(true, true);

            const sessionId = this.registry.get('sessionId');
            const coinId = coin.getData('ID');

            try {
                const response = await fetch('/api/collect-coin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, coinId })
                });

                const data = await response.json();

                if (data.success) {
                    // Atualiza com a pontuação autoritativa do servidor
                    this.registry.set('score', data.newScore);
                    this.scoreText.setText('Score: ' + data.newScore);
                } else {
                    coin.enableBody(true, coin.x, coin.y, true, true);
                }
            } catch (err) {
                coin.enableBody(true, coin.x, coin.y, true, true);
            }
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
        const maxDiagonal = 1000;
        const playersAtivos = this.players.filter(p => p.isAlive);
        playersAtivos.forEach((player) => {
            if (player.timer > 3000) {
                player.die("inactivity");
                return;
            }

            let remainingCoins = this.coins.getChildren().filter(coin => !player.collectedCoinsSet.has(coin))
            let nearestCoin = Utils.nearestObj(player, remainingCoins)
            const distAtual = Phaser.Math.Distance.Between(player.x, player.y, nearestCoin.x, nearestCoin.y);
            if (distAtual < player.minDistance) {
                player.minDistance = distAtual;
            }
            const progress = 1 - Math.min(player.minDistance / maxDiagonal, 1);

            // 1. Coleta os inputs da tela (sua lógica do neural.js)
            const dx = (nearestCoin.x - player.x) / this.sys.game.config.width;
            const dy = (nearestCoin.y - player.y) / this.sys.game.config.height;
            const dash = player.canDash ? 1 : 0
            const floor = player.body.onFloor() ? 1 : 0;

            const inputs = [dx, dy, dash, floor];
            player.brain.score = (player.coinsCollected * 100) + progress * 10 - ((player.timer / 6000) * 0.1);


            console.log(player.brain.score);
            // 2. A IA decide (TensorFlow ou Carrot)
            const output = this.aiManager.think(player.brain, inputs);
            // 3. Injeta a decisão nos controles virtuais do Player
            player.applyAICommands(output);

            // 4. O PULO DO GATO: Passamos NULL no primeiro parâmetro!
            // Assim ele sabe que não deve ler o teclado humano.
            player.update(null, delta);

        });
        if (playersAtivos.length === 0) {
            this.aiManager.nextGeneration(this.players);
        }
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


