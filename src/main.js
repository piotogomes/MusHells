
import Phaser from 'phaser';
import Boot from './Boot'
import Pause from './Pause'
import Start from './Start'
import { Level1, Level2, Level3, Level4, Level5, Level6, Level7 } from './Levels';
import GameOver from './GameOver'

let config = {
    type: Phaser.AUTO,
    width: 1900,
    height: 900,
    parent: 'game-container',
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 970 },
            debug: true,
            fps: 60,
            fixedStep: true
        }
    },
    scene: [Boot, Start, Level1, Level2, Level3, Level4, Level5, Level6, Level7, Pause, GameOver],

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 800,
            height: 600
        },
        max: {
            width: 1900,
            height: 1200
        },

        zoom: 1,  // Size of game canvas = game size * zoom
    }
}
const Game = new Phaser.Game(config)