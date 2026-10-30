import Phaser from 'phaser';



export default class Utils {

    static nearestObj(player, objects) {
        const playerX = player.body.x;
        const playerY = player.body.y;
        
        let nearestObj = null;
        let minDist = Infinity;
    
        objects.forEach(obj => {
            // Calcula a distância entre o player e a obj atual
            const dist = Phaser.Math.Distance.Between(playerX, playerY, obj.x, obj.y);
    
            // Se a distância atual for menor que a menor registrada, atualiza a referência
            if (dist < minDist) {
                minDist = dist;
                nearestObj = obj;
            }
        });
        return nearestObj;
    }
}