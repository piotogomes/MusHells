export class Coins extends Phaser.Physics.Arcade.Group {


    constructor(scene, data) {

        super(scene.physics.world, scene)
        data.objects.forEach(obj => {
            let img = this.create(obj.x, obj.y, 'coin');
            img.setOrigin(0.5, 0.5);
            img.setDisplaySize(obj.width, obj.height);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true);
            img.setData('ID', obj.name);
        });
        this.scene.add.tween({
            targets: this.getChildren(),
            scaleX: -2,
            ease: 'Sine.easeInOut',
            duration: 500,
            repeat: -1,
            yoyo: true,
            onRepeat: () => {
                this.scene.time.delayedCall(250, () => {
                    this.getChildren().forEach(coin => {
                        coin.body.setOffset(coin.width, 0);
                    });
                })
                this.scene.time.delayedCall(750, () => {
                    this.getChildren().forEach(coin => {
                        coin.body.setOffset(0, 0);
                    });
                })
            },
        })
        this.scene.add.tween({
            targets: this.getChildren(),
            y: "-=40",
            ease: 'Sine.easeInOut',
            duration: 1000,
            repeat: -1,
            yoyo: true
        })

    }

    collect(coin) {
        coin.disableBody();
        coin.setVisible(false)
    }
}

export class Doors extends Phaser.Physics.Arcade.Group {


    constructor(scene, data) {
        super(scene.physics.world, scene)
        data.objects.forEach(obj => {
            let img = this.create(obj.x, obj.y, 'door');
            img.setOrigin(0, 1);
            img.setDisplaySize(obj.width, obj.height);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true);
            img.setData('ID', obj.name);
        });

    }

    open(door) {
        door.destroy();
    }
}

export class Bones extends Phaser.Physics.Arcade.Group {


    constructor(scene, data) {
        super(scene.physics.world, scene)
        data.objects.forEach(obj => {
            let img = this.create(obj.x, obj.y, 'bone');
            img.setOrigin(0, 1);
            img.setDisplaySize(obj.width, obj.height);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true);
            img.setData('ID', obj.name);
        });

    }

    collect(bone) {
        bone.destroy();
    }
}

export class Spikes extends Phaser.Physics.Arcade.Group {
    constructor(scene, data) {
        super(scene.physics.world, scene)
        data.objects.forEach(obj => {
            let img = this.create(obj.x, obj.y, 'spike');
            img.setScale((obj.width / img.width), (obj.height / img.height))
            img.setOrigin(0, 1);
            // img.body.setImmovable(true)
            if (obj.rotation === -90) {
                img.body.setSize(obj.height / ((obj.width / img.width)), obj.width / ((obj.height / img.height)));
                img.body.setOffset(-(obj.height / ((obj.width / img.width))), - ((obj.width / (obj.height / img.height)) - img.height));
            }
            if (obj.rotation === 90) {
                img.body.setSize(obj.height / ((obj.width / img.width)), obj.width / ((obj.height / img.height)));
                img.body.setOffset(0, img.height);
            }
            if (obj.rotation === 180) {
                img.body.setOffset(-img.width, img.height);
            }
            img.setAngle(obj.rotation);
            img.body.setAllowGravity(false);
            img.setData('ID', obj.name);
            img.setData('Timer', 0);

            if (obj.name === 'spikeD') {
                img.setTexture('spike');
                img.body.setFriction(1, 1);
                img.body.setGravityY(8000)
                img.body.setAllowGravity(true);
            }
        });

    }
}


export class Platforms extends Phaser.Physics.Arcade.Group {
    constructor(scene, data) {
        super(scene.physics.world, scene)
        data.objects.forEach(obj => {
            let img = this.create(obj.x, obj.y, 'platform');
            img.setScale((obj.width / img.width), (obj.height / img.height))
            img.setOrigin(0, 1);
            if (obj.rotation === -90) {
                img.body.setSize(obj.height / ((obj.width / img.width)), obj.width / ((obj.height / img.height)));
                img.body.setOffset(-(obj.height / ((obj.width / img.width))), - ((obj.width / (obj.height / img.height)) - img.height));
            }
            if (obj.rotation === 90) {
                img.body.setSize(obj.height / ((obj.width / img.width)), obj.width / ((obj.height / img.height)));
                img.body.setOffset(0, img.height);
            }
            if (obj.rotation === 180) {
                img.body.setOffset(-img.width, img.height);
            }
            img.setAngle(obj.rotation);
            img.body.setAllowGravity(false);
            img.body.setImmovable(true)
            img.body.setFriction(1, 1);
            img.setData('Timer', 0);
            img.setData('ID', obj.name)

        });
    }
}