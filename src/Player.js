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

    constructor(scene, x, y) {
        super(scene, x, y, 'player_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCircle(14, 2, 3);
        this.setOrigin(0.5, 0.5);
        this.setDepth(10);
        this.setCollideWorldBounds(true);
        this.dashBarBG = scene.add.rectangle(100, 0, 32, 7, 0x000000).setOrigin(0, 0.5);
        this.dashBar = scene.add.rectangle(100, 0, 32, 7, 0xffffff).setOrigin(0, 0.5);
        this.dashBar.scaleX = 1;
        this.dashBarTween = scene.tweens.add({
            targets: this.dashBar,
            scaleX: 1,            // Alvo: escala cheia (100%)
            paused: true,
            persist: true,
            duration: this.dashCooldown,
            ease: 'Linear',       // Movimento constante
            onComplete: () => {
                this.canDash = true;
            }
        });
        scene.events.on('postupdate', () => {
            this.dashBar.y = this.y - 16;
            this.dashBar.x = this.x - 17;
            this.dashBarBG.y = this.y - 16;
            this.dashBarBG.x = this.x - 17;
        })
    }

    update(controls, delta) {
        if (this.isDashing) {
            return;
        }
        this.movement(controls, delta)
        this.omniDirectionDash(controls, delta)


    }

    movement(controls, delta) {
        const onWallLeft = this.body.blocked.left;
        const onWallRight = this.body.blocked.right;
        let speed = 270;

        if (this.wallJumpTimer > 0) {
            this.wallJumpTimer -= delta;
        }

        if (onWallLeft || onWallRight) {
            if (controls.jump.isDown) {
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
            this.jumps = 2;
        }
        if (Phaser.Input.Keyboard.JustDown(controls.jump)) {
            if (this.body.onFloor()) {
                this.startJump(-speed * 1.25); // Pulo normal
            }
            else if (onWallLeft && this.jumps > 0) {
                this.startJump(-speed * 1.2);
                this.setVelocityX(speed * 0.8);
                this.wallJumpTimer = 200;
            }
            else if (onWallRight && this.jumps > 0) {
                this.startJump(-speed * 1.2);
                this.setVelocityX(-speed * 0.8);
                this.wallJumpTimer = 200;
            }
            else if (this.jumps > 0) {
                this.startJump(-speed * 0.5);
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

    startJump(speed) {
        this.jumps--;
        this.setVelocityY(speed);
        this.isJumping = true;
        this.jumpTimer = 0;
    }

    omniDirectionDash(controls, delta) {
        let speed = 800
        if (Phaser.Input.Keyboard.JustDown(controls.dash) && this.canDash) {
            this.startDash()
            let dirX = (controls.right.isDown ? 1 : 0) - (controls.left.isDown ? 1 : 0);
            let dirY = (controls.down.isDown ? 1 : 0) - (controls.up.isDown ? 1 : 0);
            let dir = new Phaser.Math.Vector2(dirX, dirY);
            if (dirX || dirY) {
                dir.normalize().scale(speed);
                this.setVelocity(dir.x, dir.y);
            }
            else {
                this.setVelocityY(0);
                this.setVelocityX(speed);
            }

        }

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
}
