import Phaser from 'phaser';


export default class GameOver extends Phaser.Scene {


    constructor() {
        super('GameOver');
    }

    preload() {

    }

    async create(data) {
        if (data === 'winner') {
            await this.postTheFlag();
            this.winnerScreen()
        }
        else if (data === 'loser') {
            this.gameOverScreen()
        }
        data = undefined;

    }

    async winnerScreen() {
        this.add.text(950, 300, "YOU PASSED!!", { fontSize: '82px', fill: '#25dd15' }).setOrigin(0.5);
        this.add.text(950, 350, 'for now....', { fontSize: '16px', fill: '#b80e0e' }).setOrigin(0.5);
        this.add.text(950, 420, `Highscore: ${this.registry.get('score') + this.registry.get('life') * 5}`, { fontSize: '36px', fill: '#5bb80e' }).setOrigin(0.5);
        this.add.text(950, 480, `Time: ${this.registry.get('timer').toFixed(1)}`, { fontSize: '36px', fill: '#5bb80e' }).setOrigin(0.5);
        this.add.text(950, 580, `Deaths: ${this.registry.get('deaths')}`, { fontSize: '36px', fill: '#b8190e' }).setOrigin(0.5);
        if (this.registry.get('deaths') === 0) {
            this.add.text(950, 650, 'OMG DEATHLESS!!! now do it blindfold', { fontSize: '42px', fill: '#fcf807' }).setOrigin(0.5);
        }


        this.exitBtn = this.add.text(950, 790, "Return", { fontSize: '42px', fill: '#ccbbbb' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.exitBtn.on('pointerdown', () => {
            this.scene.start('Start');
            this.scene.stop(this.registry.get('level'))
        });


    }
    gameOverScreen() {
        const bg = this.add.rectangle(0, 0, 1900, 900, 0x000000, 0.7);
        bg.setOrigin(0);
        this.mainMenu = this.add.container(0, 0);
        this.gameOverText = this.add.text(950, 300, "GAME OVER", { fontSize: '82px', fill: '#b80e0e' }).setOrigin(0.5);


        this.exitBtn = this.add.text(950, 830, "Give up :(", { fontSize: '42px', fill: '#ccbbbb' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.exitBtn.on('pointerdown', () => {
            this.scene.start('Start');
            this.scene.stop(this.registry.get('level'))
        });


        this.retryBtn = this.add.text(950, 630, "GO AGAIN :D", { fontSize: '42px', fill: '#25dd15' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.retryBtn.on('pointerdown', () => {
            this.scene.stop(this.registry.get('level'))
            this.registry.set('score', JSON.parse(localStorage.getItem('save')).score);
            this.registry.set('life', JSON.parse(localStorage.getItem('save')).life);
            this.scene.start(this.registry.get('level'));
        });
        this.input.keyboard.on('keydown-R', () => {
            this.retryBtn.emit('pointerdown');
        });

        this.mainMenu.add([this.gameOverText, this.exitBtn, this.retryBtn]);
    }
    async postTheFlag() {
        const sessionId = this.registry.get('sessionId');

        try {
            const res = await fetch('/api/game-over', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });

            const data = await res.json();

            if (data.success && data.flag) {
                this.add.text(950, 200, data.flag, {
                    fontSize: '48px',
                    color: '#00ff00'
                }).setOrigin(0.5);
            }
        } catch (err) {
            console.error('Erro ao finalizar o jogo:', err);
        }
    }
}