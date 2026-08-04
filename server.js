import express from 'express';
import ViteExpress from 'vite-express';
import path from 'path';

const app = express();
app.use(express.json());

app.use(express.static('dist'));

app.get('/api/game-config', (req, res) => {
  res.json({
    flag: "eits flag"
  });
});

ViteExpress.listen(app, 3000, () => {
  console.log('🎮 Server running at http://localhost:3000');
});

/* 
Fazer isso no level 8
let saveData = JSON.parse(localStorage.getItem('save'));
saveData.score = 67; 
const newGameDataStr = JSON.stringify(saveData);
const newAss = CryptoJS.HmacSHA256(newGameDataStr, '31T5').toString();
localStorage.setItem('save', newGameDataStr);
localStorage.setItem('saveAss', newAss);
Recarrega pagina e entra pelo Load
*/