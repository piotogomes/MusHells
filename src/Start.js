
export default class Start extends Phaser.Scene {


    constructor() {
        super('Start');
    }

    preload() {
        this.add.image(950, 460, 'startBG').setAlpha(0.2);
        this.logo = this.add.image(950, 260, 'logo').setAlpha(2);
        const fx = this.logo.preFX.addColorMatrix();
        fx.brightness(2);

    }

    create() {

        this.newGameBtn = this.add.text(950, 500, "New Game", { fontSize: '36px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.newGameBtn.on('pointerdown', () => {
            localStorage.removeItem('save');
            this.createNewSave();
            this.scene.start('Level1');

        });
        this.optionsBtn = this.add.text(950, 600, "Options", { fontSize: '36px', fill: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.optionsBtn.on('pointerdown', () => {
            this.scene.pause()
            this.scene.launch('Pause', 'startOptions');
        });
        this.howToPlayBtn = this.add.text(950, 700, "How to Play", { fontSize: '36px', fill: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.howToPlayBtn.on('pointerdown', () => {
            this.scene.pause()
            this.scene.launch('Pause', 'startHowToPlay');
        });
        this.loadBtn = this.add.text(950, 800, "Load", { fontSize: '36px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.loadBtn.on('pointerdown', () => {
            const savedData = localStorage.getItem('save');
            if (localStorage.getItem('saveAss') === CryptoJS.HmacSHA256(localStorage.getItem('save'), 'popo').toString()) {
                this.registry.set('score', JSON.parse(savedData).score);
                this.registry.set('level', JSON.parse(savedData).level);
                this.registry.set('life', JSON.parse(savedData).life);
                this.registry.set('timer', JSON.parse(savedData).timer);
                this.scene.start(`${this.registry.get('level')}`);
            }
            else {
                this.failedLoad = this.add.text(950, 550, "No saved game", { fontSize: '22px', fill: '#f30' }).setOrigin(0.5);
            }
        });



    }
    createNewSave() {
        let gameData = {
            score: 0,
            level: 'Level1',
            life: 5,
            timer: 0
        };
        this.registry.set('score', 0);
        this.registry.set('level', 'Level1');
        this.registry.set('life', 5);
        this.registry.set('deaths', 0);
        this.registry.set('timer', 0)
        localStorage.setItem('save', JSON.stringify(gameData));
    }
}