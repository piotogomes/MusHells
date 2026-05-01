import BaseLevel from "./BaseLevel";
import Player from "./Player";

export class Level1 extends BaseLevel {

    constructor() {
        super({ key: "Level1" });
        this.levelText;
    }

    preload() {
        this.load.tilemapTiledJSON('level1', 'assets/levelsData/layout1.json');
    }
    create() {
        super.createLayout('level1')
        super.create();
        this.levelText = this.add.text(1700, 16, 'Starter', { fontSize: '42px', fill: '#ff0' });
        this.registry.set('level', this.scene.key);
    }
    update(timer, delta) {
        super.update(timer, delta)
        this.objMovement('platform', 'plat7', 'horizontal', 0.002, 1500, delta);
    }

}

export class Level2 extends BaseLevel {

    constructor() {
        super({ key: "Level2" });
        this.levelText;
    }

    preload() {
        this.load.tilemapTiledJSON('level2', 'assets/levelsData/layout2.json');

    }
    create() {
        super.createLayout('level2')
        super.create();
        this.levelText = this.add.text(1600, 16, 'More moves', { fontSize: '42px', fill: '#ff0' });
        this.registry.set('level', this.scene.key);
        this.player.setCollideWorldBounds(false);
    }

    update(time, delta) {
        super.update(time, delta);
        this.objMovement('platform', 'plat1', 'horizontal', 0.003, 1000, delta);
        this.objMovement('platform', 'plat2', 'horizontal', 0.003, 1000, delta);
        this.objMovement('platform', 'plat3', 'vertical', 0.003, 1000, delta);
        this.objMovement('platform', 'plat4', 'horizontal', 0.003, 1000, delta);
        this.objMovement('platform', 'plat5', 'horizontal', 0.003, 1000, delta);
        this.objMovement('platform', 'plat6', 'vertical', 0.003, 1000, delta);
        this.objMovement('platform', 'plat7', 'horizontal', 0.003, 1000, delta);
        this.objMovement('platform', 'plat8', 'vertical', 0.003, 1000, delta);

    }

}

export class Level3 extends BaseLevel {

    constructor() {
        super({ key: "Level3" });
        this.levelText;
    }

    preload() {
        this.load.tilemapTiledJSON('level3', 'assets/levelsData/layout3.json');
    }
    create() {
        super.createLayout('level3')
        super.create();
        this.levelText = this.add.text(1700, 16, 'SPIKES', { fontSize: '42px', fill: '#ff0' });
        this.registry.set('level', this.scene.key);

    }
    update(time, delta) {
        super.update(time, delta)
        this.objMovement('platform', 'plat6', 'vertical', 0.003, 1000, delta);
        this.objMovement('platform', 'plat7', 'horizontal', 0.004, 1000, delta);
    }

}

export class Level4 extends BaseLevel {

    constructor() {
        super({ key: "Level4" });
        this.levelText;
    }

    preload() {
        this.load.tilemapTiledJSON('level4', 'assets/levelsData/layout1.json');
    }
    create() {
        super.createLayout('level4')
        super.create();
        this.levelText = this.add.text(1700, 16, 'Remember', { fontSize: '42px', fill: '#ff0' });
        this.registry.set('level', this.scene.key);
        this.platforms.setAlpha(0.01)
        this.floor.setAlpha(0.01)
        this.coins.setAlpha(0.2);
        this.doors.setAlpha(0.5)
        this.portals.setAlpha(0.5)

    }

}
export class Level5 extends BaseLevel {

    constructor() {
        super({ key: "Level5" });
        this.levelText;
    }

    preload() {
        this.load.tilemapTiledJSON('level5', 'assets/levelsData/layout4.json');
    }
    create() {
        super.createLayout('level5')
        super.create();
        this.levelText = this.add.text(1500, 16, 'ZOOM', { fontSize: '42px', fill: '#ff0' });
        this.registry.set('level', this.scene.key);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(3);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    }

    update(time, delta) {
        super.update(time, delta)
        this.objMovement('platform', 'plat8', 'circular', 0.001, 1500, delta);
        this.objMovement('platform', 'plat5', 'horizontal', 0.001, 1400, delta);
    }
}
export class Level6 extends BaseLevel {

    constructor() {
        super({ key: "Level6" });
        this.levelText;
    }

    preload() {
        this.load.tilemapTiledJSON('level6', 'assets/levelsData/layout5.json');
    }
    create() {
        super.createLayout('level6')
        super.create();
        this.levelText = this.add.text(1500, 16, 'Little Harder', { fontSize: '42px', fill: '#ff0' });
        this.registry.set('level', this.scene.key);

    }

    update(time, delta) {
        super.update(time, delta)
        this.objMovement('platform', 'plat5', 'vertical', 0.0015, 1000, delta);
        this.objMovement('platform', 'plat8', 'circular', 0.0015, 1200, delta);
        this.objMovement('platform', 'plat7', 'vertical', 0.001, 1600, delta);

    }
}

export class Level7 extends BaseLevel {

    constructor() {
        super({ key: "Level7" });
        this.levelText;
    }

    preload() {
        this.load.tilemapTiledJSON('level7', 'assets/levelsData/layout6.json');
    }
    create() {
        this.timerLevel = 40000
        super.createLayout('level7')
        super.create();
        this.levelText = this.add.text(1500, 16, 'FASTER', { fontSize: '42px', fill: '#ff0' });
        this.timerLevelText = this.add.text(900, 425, '', { fontSize: '64px', fill: 'rgb(255, 0, 128)' });
        this.registry.set('level', this.scene.key);
    }

    update(time, delta) {
        super.update(time, delta)
        this.timerLevel -= delta;
        const seconds = Math.max(0, this.timerLevel / 1000);
        this.timerLevelText.setText(seconds.toFixed(1))
        if (this.timerLevel <= 0) {
            this.scene.pause()
            this.scene.launch('GameOver', 'loser');
        }
        this.objMovement('platform', 'plat8', 'vertical', 0.005, 1000, delta);
        this.objMovement('platform', 'plat5', 'horizontal', 0.0015, 1800, delta);
        this.objMovement('platform', 'plat5', 'vertical', 0.0015, 1800, delta);
        this.objMovement('platform', 'plat4', 'horizontal', 0.0015, 1800, delta);
        this.objMovement('platform', 'plat4', 'vertical', 0.0015, -1800, delta);
        this.objMovement('platform', 'plat4', 'vertical', 0.0015, -1800, delta);



    }
}

export class Level8 extends BaseLevel {

    constructor() {
        super({ key: "Level8" });
        this.levelText;
    }

    preload() {
        this.load.tilemapTiledJSON('level8', 'assets/levelsData/layout7.json');
    }
    create() {
        super.createLayout('level8')
        super.create();
        this.levelText = this.add.text(1500, 16, 'Almost Over', { fontSize: '42px', fill: '#ff0' });
        this.registry.set('level', this.scene.key);
        this.platforms.getChildren().forEach(plat => {
            if (plat.getData('ID').at(-1) > 5) {
                this.physics.add.collider(this.player, plat, (player, plat) => {
                        this.time.delayedCall(200, () => {
                            plat.body.setAllowGravity(true); 
                        });
                    
                }, null, this);

            }

        })
    }

    update(time, delta) {
        super.update(time, delta)
        this.objMovement('platform', 'plat4', 'horizontal', 0.0005, -5000, delta);
        this.objMovement('platform', 'plat1', 'circular', 0.0025, 1300, delta);
        this.objMovement('spike', 'spike1', 'vertical', 0.0015, 900, delta);
        this.objMovement('spike', 'spike2', 'vertical', 0.0015, 1500, delta);
        this.objMovement('spike', 'spike3', 'vertical', 0.0015, 1500, delta);
        this.objMovement('spike', 'spike4', 'vertical', 0.0015, 900, delta);


    }
    nextLevel() {
        this.scene.start('GameOver', 'winner');
    }
}