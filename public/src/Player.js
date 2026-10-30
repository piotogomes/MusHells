import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    dashTimer = 250;
    dashCooldown = 1500;
    canDash = true;
    wallJumpTimer = 0;
    isJumping;
    isDashing;
    jumpTimer;
    jumps;
    dashBarTween;
    dashBarBG;
    dashBar;
    timer = 0;
    minDist = Infinity;

    // Propriedades para a IA
    brain = null;
    isAlive = true;
    coinsCollected = 0;
    reachedDoor = false;

    // Controles virtuais simulam as teclas para a IA
    aiControls = {
        up: { isDown: false },
        left: { isDown: false },
        right: { isDown: false },
        down: { isDown: false },
        jump: { isDown: false, isUp: true, justDown: false },
        dash: { isDown: false, isUp: true, justDown: false }
    };

    constructor(scene, x, y, brain) {
        super(scene, x, y, 'player_idle');

        this.brain = brain;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(32, 32);
        this.setOrigin(0.5, 0.5);
        this.setDepth(10);
        this.setCollideWorldBounds(true);

        this.dashBarBG = scene.add.rectangle(100, 0, 32, 7, 0x000000).setOrigin(0, 0.5);
        this.dashBar = scene.add.rectangle(100, 0, 32, 7, 0xffffff).setOrigin(0, 0.5);
        this.dashBar.scaleX = 1;
        this.dashBarTween = scene.tweens.add({
            targets: this.dashBar,
            scaleX: 1,
            paused: true,
            persist: true,
            duration: this.dashCooldown,
            ease: 'Linear',
            onComplete: () => {
                this.canDash = true;
            }
        });

        scene.events.on('postupdate', () => {
            if (!this.active) return;
            this.dashBar.y = this.y - 16;
            this.dashBar.x = this.x - 17;
            this.dashBarBG.y = this.y - 16;
            this.dashBarBG.x = this.x - 17;
        });

        this.isAlive = true;
    }

    // Adaptamos o update para aceitar controles da IA se nenhum teclado for passado
    update(controls, delta) {
        this.timer += delta;
        if (!this.isAlive) return;

        // Se passar "controls" (jogador humano), usa ele; se não, usa aiControls
        const currentControls = controls || this.aiControls;

        if (this.isDashing) {
            return;
        }

        this.movement(currentControls, delta);
        this.omniDirectionDash(currentControls, delta);

        // Reseta o gatilho de "pressionado neste frame" para o próximo frame
        if (!controls) {
            this.aiControls.jump.justDown = false;
            this.aiControls.dash.justDown = false;
        }
    }

    // Sobrescrevemos o checador de JustDown para aceitar comandos da IA
    checkJustDown(key) {
        // Prevenção contra undefined
        if (!key) return false;

        // 1. Se for o controle virtual da IA, retorna o valor dele direto
        if (key.hasOwnProperty('justDown')) {
            return key.justDown;
        }

        // 2. Se for um controle humano (tecla real do Phaser)
        if (key.isDown !== undefined) {
            return Phaser.Input.Keyboard.JustDown(key);
        }

        return false;
    }
    movement(controls, delta) {
        const onWallLeft = this.body.blocked.left;
        const onWallRight = this.body.blocked.right;
        let speed = 270;

        if (this.wallJumpTimer > 0) {
            this.wallJumpTimer -= delta;
        }

        if (onWallLeft || onWallRight) {
            if (controls.up.isDown) {
                this.setVelocityY(-1);
            } else {
                this.setVelocityY(speed / 5);
            }
        }

        if (this.wallJumpTimer <= 0) {
            if (controls.left.isDown) {
                this.setVelocityX(-speed);
                this.anims.play('left', true);
            } else if (controls.right.isDown) {
                this.setVelocityX(speed);
                this.anims.play('right', true);
            } else {
                this.anims.play('turn', true);
                this.setVelocityX(0);
            }
        }

        if (this.body.onFloor()) {
            this.jumps = 1;
        }

        // Alterado para usar o helper checkJustDown
        if (this.checkJustDown(controls.jump)) {
            if (this.body.onFloor()) {
                this.startJump(-speed * 1.25);
            } else if (onWallLeft) {
                this.startJump(-speed * 1.2);
                this.setVelocityX(speed * 0.8);
                this.wallJumpTimer = 200;
            } else if (onWallRight) {
                this.startJump(-speed * 1.2);
                this.setVelocityX(-speed * 0.8);
                this.wallJumpTimer = 200;
            } else if (this.jumps > 0) {
                this.startJump(-speed * 0.5);
                this.jumps--;
            }
        }

        if (controls.jump.isDown && this.isJumping) {
            if (this.jumpTimer < 200) {
                this.body.velocity.y -= 23 * (delta / 16.66);
                this.jumpTimer += delta;
            } else {
                this.isJumping = false;
            }
        }

        if (controls.jump.isUp) {
            this.isJumping = false;
        }
    }

    omniDirectionDash(controls, delta) {
        let speed = 800;

        // Alterado para usar o helper checkJustDown
        if (this.checkJustDown(controls.dash) && this.canDash) {
            this.startDash();
            let dirX = (controls.right.isDown ? 1 : 0) - (controls.left.isDown ? 1 : 0);
            let dirY = (controls.down.isDown ? 1 : 0) - (controls.up.isDown ? 1 : 0);
            let dir = new Phaser.Math.Vector2(dirX, dirY);
            if (dirX || dirY) {
                dir.normalize().scale(speed);
                this.setVelocity(dir.x, dir.y);
            } else {
                this.setVelocityY(0);
                this.setVelocityX(speed);
            }
        }
    }

    startJump(speed) {
        this.setVelocityY(speed);
        this.isJumping = true;
        this.jumpTimer = 0;
    }

    startDash() {
        this.dashBarTween.restart();
        this.isDashing = true;
        this.canDash = false;
        this.body.allowGravity = false;
        this.dashTimer = 250;
        this.scene.time.delayedCall(this.dashTimer, () => {
            this.isDashing = false;
            this.body.allowGravity = true;
            this.setVelocity(0, 0);
        }, [], this);
        this.scene.time.delayedCall(this.dashCooldown, () => {
            this.canDash = true;
        }, [], this);
    }

    // Método para o Neural.js injetar os comandos da IA a cada frame
    applyAICommands(outputs) {
        // outputs = [Esquerda, Direita, Pular, Dash, Cima, Baixo] (Valores de 0.0 a 1.0)

        // 1. Eixo Horizontal (Evita apertar esquerda e direita juntos)
        // Só ativa se passar de 0.5 e for mais forte que a direção oposta
        this.aiControls.left.isDown = outputs[0] > 0.5 && outputs[0] > outputs[1];
        this.aiControls.right.isDown = outputs[1] > 0.5 && outputs[1] > outputs[0];

        // 2. Pulo (Simula o justDown para não voar ou pular infinito)
        const wantJump = outputs[2] > 0.5;
        this.aiControls.jump.justDown = wantJump && !this.aiControls.jump.isDown;
        this.aiControls.jump.isDown = wantJump;
        this.aiControls.jump.isUp = !wantJump;

        // 3. Dash (Mesma lógica do pulo para ativar só no instante da decisão)
        const wantDash = outputs[3] > 0.5;
        this.aiControls.dash.justDown = wantDash && !this.aiControls.dash.isDown;
        this.aiControls.dash.isDown = wantDash;

        // 4. Eixo Vertical (Cima / Baixo - Útil para mirar o dash omnidirecional)
        // Também previne mirar pra cima e pra baixo ao mesmo tempo
        this.aiControls.up.isDown = outputs[4] > 0.5 && outputs[4] > outputs[5];
        this.aiControls.down.isDown = outputs[5] > 0.5 && outputs[5] > outputs[4];
    }

    die(cause) {
        if(cause === "inactivity") {
            this.brain.score -= 2000;
        }
        else {
            this.brain.score -= 50;
        }
        this.isAlive = false;
        this.setVisible(false);
        this.body.enable = false;
        this.dashBarBG.setVisible(false);
        this.dashBar.setVisible(false);
    }

    reset(x, y, newBrain) {
        this.timerReset();
        this.setPosition(x, y);
        this.minDist = Infinity;
        this.brain = newBrain;
        if (this.brain) this.brain.score = 0;
        this.isAlive = true;
        this.setVisible(true);
        this.body.enable = true;
        this.dashBarBG.setVisible(true);
        this.dashBar.setVisible(true);
        this.coinsCollected = 0;
        this.reachedDoor = false;
    }

    timerReset() {
        this.timer = 0;
    }

    takeDamage(obj) {
        this.die(); // Em vez de só respawnar, marca como morto para a IA aprender
    }
}