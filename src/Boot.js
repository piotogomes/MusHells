export default class Boot extends Phaser.Scene {


    constructor() {
        super('Boot');
    }

    init() {
        const defaultSettings = {
            controls: 'WASD',
            volume: 0.5,
        };

        const savedData = localStorage.getItem('settings');
        const finalSettings = savedData ? JSON.parse(savedData) : defaultSettings;
        localStorage.setItem('settings', JSON.stringify(finalSettings));
        this.registry.set('settings', finalSettings);
        this.registry.set('timer', 0)
        this.registry.set('deaths', 0)
    }
    preload() {

        this.load.spritesheet('player_idle', 'assets/player/idle.png', { frameWidth: 34, frameHeight: 32 });
        this.load.spritesheet('player_left', 'assets/player/walking_left.png', { frameWidth: 34, frameHeight: 32 });
        this.load.spritesheet('player_right', 'assets/player/walking_right.png', { frameWidth: 34, frameHeight: 32 });
        this.load.image('startBG', 'assets/startBG.jpg');
        this.load.image('BG', 'assets/background.png');
        this.load.image('logo', 'assets/logo.png');
        this.load.image('spike', 'assets/spike.png');
        this.load.image('sideSpike', 'assets/sideSpike.png');
        this.load.image('floor1', 'assets/floor1.png');
        this.load.image('floor2', 'assets/floor2.png');
        this.load.image('floor3', 'assets/floor3.png');
        this.load.image('floor4', 'assets/floor4.png');
        this.load.image('platformBone', 'assets/platformBone.png');
        this.load.image('platform', 'assets/platform.png');
        this.load.image('coin', 'assets/coin.png');
        this.load.image('sideCoin', 'assets/sideCoin.png');
        this.load.image('door', 'assets/door.png');
        this.load.image('bone', 'assets/bone.png');
        this.load.image('portal', 'assets/portal.png');
        this.load.image('controlsWASD', 'assets/controlsWASD.png');
        this.load.image('controlsArrows', 'assets/controlsArrows.png');
        this.load.image('lava', 'assets/lava.png');
        this.load.image('volSliderHandle', 'assets/volSliderHandle.png');
        this.registry.set('score', 0);
    }

    create() {

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player_left', { coint: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: this.anims.generateFrameNumbers('player_idle', { coint: 0, end: 1 }),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player_right', { coint: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'coinSpin',
            frames: [
                { key: 'coin' },
                { key: 'sideCoin' }
            ],
            frameRate: 3,
            repeat: -1
        });

        this.scene.start('Start');
    }

}