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
        this.platformMovement('plat1', 'horizontal', 0.003, 1000, delta);
        this.platformMovement('plat2', 'horizontal', 0.003, 1000, delta);
        this.platformMovement('plat3', 'vertical', 0.003, 1000, delta);
        this.platformMovement('plat4', 'horizontal', 0.003, 1000, delta);
        this.platformMovement('plat5', 'horizontal', 0.003, 1000, delta);
        this.platformMovement('plat6', 'vertical', 0.003, 1000, delta);
        this.platformMovement('plat7', 'horizontal', 0.003, 1000, delta);
        this.platformMovement('plat8', 'vertical', 0.003, 1000, delta);

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
        this.platformMovement('plat6', 'vertical', 0.003, 1000, delta);
        this.platformMovement('plat7', 'horizontal', 0.004, 1000, delta);
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
        this.levelText = this.add.text(1500, 16, 'Little Harder', { fontSize: '42px', fill: '#ff0' });
        this.registry.set('level', this.scene.key);

    }

    update(time, delta) {
        super.update(time, delta)
        this.platformMovement('plat5', 'vertical', 0.0015, 1000, delta);
        this.platformMovement('plat8', 'circular', 0.0015, 1200, delta);
        this.platformMovement('plat7', 'vertical', 0.001, 1600, delta);

    }
}

export class Level6 extends BaseLevel {

    constructor() {
        super({ key: "Level6" });
        this.levelText;
    }

    preload() {
        this.load.tilemapTiledJSON('level6', 'assets/levelsData/layout4.json');
    }
    create() {
        super.createLayout('level6')
        super.create();
        this.levelText = this.add.text(1500, 16, 'ZOOM', { fontSize: '42px', fill: '#ff0' });
        this.registry.set('level', this.scene.key);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(3);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        console.log()
        this.boneID.get('bone1').setPosition(900, 850)
        this.coinsID.get('coin5').setPosition(1750, 100)

    }

    update(time, delta) {
        super.update(time, delta)
        this.platformMovement('plat8', 'circular', 0.001, 1500, delta);
        this.platformMovement('plat5', 'horizontal', 0.001, 1400, delta);
    }
}

export class Level7 extends BaseLevel {

    constructor() {
        super({ key: "Level7" });
        this.levelText;
    }

    preload() {
        this.load.tilemapTiledJSON('level6', 'assets/levelsData/layout4.json');
    }
    create() {
        super.createLayout('level6')
        super.create();
        this.levelText = this.add.text(1500, 16, 'ZOOM', { fontSize: '42px', fill: '#ff0' });
        this.registry.set('level', this.scene.key);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(3);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        console.log()
        this.boneID.get('bone1').setPosition(900, 850)
        this.coinsID.get('coin5').setPosition(1750, 100)



    }

    update(time, delta) {
        super.update(time, delta)
        this.platformMovement('plat8', 'circular', 0.001, 1500, delta);
        this.platformMovement('plat5', 'horizontal', 0.001, 1400, delta);
    }
    nextLevel() {
        this.scene.start('GameOver', 'winner');
    }
}