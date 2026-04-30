
export default class Pause extends Phaser.Scene {


    constructor() {
        super('Pause');
    }

    preload() {
        this.load.image('pauseMenu', 'assets/pauseMenu.png');
    }

    create(from) {
        const bg = this.add.rectangle(0, 0, 1900, 900, 0x000000, 0.7);
        bg.setOrigin(0);
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeGame(from)
        });
        this.add.image(950, 450, 'pauseMenu').setScale(1.1);
        this.setWASDText = this.add.text(0, 0, "J: Jump K: Dash", { fontSize: '20px', fill: '#0f0' }).setOrigin(0.5).setAlpha(0)
        this.setArrowsText = this.add.text(0, 0, "Z: Jump X: Dash", { fontSize: '20px', fill: '#0f0' }).setOrigin(0.5).setAlpha(0)
        this.optionsText = [
            this.add.text(950, 500, "Volume", { fontSize: '42px', fill: '#000' }).setOrigin(0.5),
            this.add.text(950, 380, "<< Choose Controls >>", { fontSize: '16px', fill: '#291006' }).setOrigin(0.5)
        ];
        this.howToPlayText = [
            this.add.text(950, 350, "R to restart the level", { fontSize: '26px', fill: 'rgb(30, 60, 30)' }).setOrigin(0.5),
            this.add.text(950, 400, "For WASD ==> J: Jump K: Dash", { fontSize: '26px', fill: '#0f0' }).setOrigin(0.5),
            this.add.text(950, 450, "For Arrows ==> Z: Jump X: Dash", { fontSize: '26px', fill: '#0f0' }).setOrigin(0.5),
            this.add.text(950, 500, "Collect the coins and be rich,", { fontSize: '16px', fill: '#b4b10a' }).setOrigin(0.5),
            this.add.text(950, 520, "Get the bone to open the door", { fontSize: '16px', fill: '#1d1f25c7' }).setOrigin(0.5),
            this.add.text(950, 550, "Good Luck and Have Fun", { fontSize: '26px', fill: '#df423dc7' }).setOrigin(0.5)

        ]
        this.mainMenu = this.add.container(0, 0);
        this.options = this.add.container(0, 0).setVisible(false);
        this.howToPlay = this.add.container(0, 0).setVisible(false);


        if (from == 'startOptions') {
            this.mainMenu.setVisible(false);
            this.options.setVisible(true)
        }
        if (from == 'startHowToPlay') {
            this.mainMenu.setVisible(false);
            this.howToPlay.setVisible(true)
        }


        this.resumeBtn = this.add.text(950, 250, "Resume", { fontSize: '42px', fill: '#000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.resumeBtn.on('pointerdown', () => {
            this.resumeGame(from);
        });

        this.optionsBtn = this.add.text(950, 350, "Options", { fontSize: '42px', fill: '#000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.optionsBtn.on('pointerdown', () => {
            this.mainMenu.setVisible(false);
            this.options.setVisible(true)
        });
        this.howToPlayBtn = this.add.text(950, 450, "How to Play", { fontSize: '42px', fill: '#000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.howToPlayBtn.on('pointerdown', () => {
            this.mainMenu.setVisible(false);
            this.howToPlay.setVisible(true)

        });
        this.exitBtn = this.add.text(950, 550, "Exit Game", { fontSize: '42px', fill: '#000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.exitBtn.on('pointerdown', () => {
            this.scene.stop(this.registry.get('level'));
            this.scene.start('Start');
        });

        this.controlsWASD = this.add.image(780, 400, "controlsWASD").setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.controlsWASD.on('pointerdown', () => {
            let s = this.registry.get('settings');
            this.setWASDText.setPosition(780, 460).setAlpha(1)
            this.setArrowsText.setAlpha(0)
            s.controls = 'WASD';
            this.registry.set('settings', s);
            localStorage.setItem('settings', JSON.stringify(s));


        });

        this.controlsArrows = this.add.image(1120, 402, "controlsArrows").setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.controlsArrows.on('pointerdown', () => {
            let s = this.registry.get('settings');
            this.setArrowsText.setPosition(1120, 462).setAlpha(1)
            this.setWASDText.setAlpha(0)
            s.controls = 'arrows';
            this.registry.set('settings', s);
            localStorage.setItem('settings', JSON.stringify(s));

        });


        // VOLUME 

        let initialSet = this.registry.get('settings');
        this.fillBar = this.add.graphics();
        const sliderLeft = 750;
        const sliderRight = 1150;
        const sliderWidth = 400;
        const barHeight = 20;
        const sliderY = 540;
        const updateFill = (width) => {
            this.fillBar.clear();
            this.fillBar.fillStyle(0x808080, 1);
            this.fillBar.fillRect(sliderLeft, sliderY, width, barHeight);
        };
        const handle = this.add.image(sliderLeft + sliderWidth * initialSet.volume, 550, 'volSliderHandle').setInteractive().setScale(1.5);
        this.input.setDraggable(handle);
        updateFill(sliderWidth * initialSet.volume)


        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {

            gameObject.x = Phaser.Math.Clamp(dragX, sliderLeft, sliderRight);
            const percentage = (gameObject.x - sliderLeft) / sliderWidth;
            gameObject.x = Phaser.Math.Clamp(dragX, sliderLeft, sliderRight);

            // Redraw the bar based on handle position
            const currentWidth = gameObject.x - sliderLeft;
            updateFill(currentWidth);
            handle.x = sliderLeft + (this.sound.volume * sliderWidth);
            this.sound.volume = percentage;
        });

        this.input.on('dragend', () => {
            let s = this.registry.get('settings');
            s.volume = this.sound.volume;
            this.registry.set('settings', s);
            localStorage.setItem('settings', JSON.stringify(s));
        });




        this.mainMenu.add([this.optionsBtn, this.exitBtn, this.howToPlayBtn]);
        this.howToPlay.add(this.howToPlayText);
        this.options.add([this.fillBar, handle, this.controlsWASD, this.controlsArrows, this.setArrowsText, this.setWASDText]);
        this.options.add(this.optionsText);


    }

    resumeGame(from) {
        if (from == "startOptions" || from == "startHowToPlay") {
            this.scene.start('Start');
        }
        else if (from == 'levels') {
            const currentLevel = this.registry.get('level');
            this.scene.resume(currentLevel);
            this.scene.stop();
        }

    }
}