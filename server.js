import express from 'express';
import ViteExpress from 'vite-express';

const app = express();
app.use(express.json());

app.use(express.static('dist'));

// Defina a sua senha secreta de admin aqui
const ADMIN_SECRET = 'aqui é eits bro';

// Middleware simples: confere se a senha foi enviada no Header
function protegerAdmin(req, res, next) {
  const chaveEnviada = req.headers['adminkey'];

  if (chaveEnviada === ADMIN_SECRET) {
    return next(); // Senha correta! Libera o acesso
  }

  return res.status(403).json({ error: 'Acesso negado.' });
}

// Segredo guardado apenas no servidor (ex: variável de ambiente)
const SECRET_FLAG = process.env.FLAG || 'FLAG{esit}';

app.post('/api/claim-flag', (req, res) => {
    const { score } = req.body;

    // Validação no servidor
    if (score === 67) {
        return res.json({ 
            success: true, 
            flag: SECRET_FLAG 
        });
    }

    return res.status(400).json({ 
        success: false, 
        error: 'Pontuação inválida' 
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