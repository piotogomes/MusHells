import ViteExpress from 'vite-express';
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());
app.use(express.static('dist'));

const SECRET_FLAG = process.env.FLAG || 'FLAG{EITS}';
const sessions = new Map();

// 1. Inicia o jogo
app.post('/api/start-game', (req, res) => {
  const sessionId = crypto.randomUUID();

  sessions.set(sessionId, {
    startTime: Date.now(),
    score: 0,
    life: 5,           // Vida inicial
    deaths: 0,         // Contador de mortes
    lastDamageTime: 0, // Proteção contra spam de requisições de dano
    collectedCoins: new Set(),
    lastActionTime: 0
  });

  res.json({ sessionId });
});

app.post('/api/collect-coin', (req, res) => {
  const { sessionId, coinId } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(401).json({ success: false, error: 'Sessão inválida' });
  }

  // Valida duplicidade
  if (session.collectedCoins.has(coinId)) {
    return res.status(400).json({ success: false, error: 'Moeda já coletada' });
  }

  // Anti-bot básico por tempo
  const now = Date.now();
  if (now - session.lastActionTime < 50) {
    return res.status(429).json({ success: false, error: 'Ação rápida demais' });
  }

  // Atualiza no servidor
  session.collectedCoins.add(coinId);
  session.score += 10;
  session.lastActionTime = now;

  return res.json({ success: true, newScore: session.score });
});

app.post('/api/player-damage', (req, res) => {
  const { sessionId } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(401).json({ success: false, error: 'Sessão inválida' });
  }

  const now = Date.now();

  if (now - session.lastDamageTime < 800) {
    return res.status(429).json({ success: false, error: 'Jogador ainda em estado invulnerável' });
  }

  session.lastDamageTime = now;
  session.life -= 1;
  session.deaths += 1;

  const isGameOver = session.life <= 0;

  return res.json({
    success: true,
    newLife: session.life,
    newDeaths: session.deaths,
    isGameOver
  });
});

app.post('/api/game-over', (req, res) => {
  const { sessionId } = req.body; 

  if (!sessions.has(sessionId)) {
    return res.status(400).json({ success: false, error: 'Sessão inválida ou expirada.' });
  }

  const session = sessions.get(sessionId);
  const durationSeconds = (Date.now() - session.startTime) / 1000;
  const finalScore = session.score + session.life * 5; 

  // Destrói a sessão para impedir repetição
  sessions.delete(sessionId);

  const TIME_SECONDS = 67;
  const TARGET_SCORE = 95;

  const timeValid = durationSeconds >= (TIME_SECONDS - 1) && durationSeconds <= (TIME_SECONDS + 1);
  const scoreValid = finalScore === TARGET_SCORE;

  if (timeValid && scoreValid) {
    return res.json({
      success: true,
      flag: SECRET_FLAG,
      time: `${durationSeconds.toFixed(2)}s`
    });
  }

  return res.json({
    success: false,
    message: 'portal.png',
    time: `${durationSeconds.toFixed(2)}s`,
    score: finalScore
  });
});

ViteExpress.listen(app, 3000, () => {
  console.log('🎮 Server running at http://localhost:3000');
});

/* 
Mudar o codigo localmente para tirar o restart, ou passar o nextlevel no restart
"errar" pelo menos uma vez para ver que a dica esta no portal.png atraves da response do gameover
fazer a conta e coletar 8 moedas e morrer 2x para dar o score certo e terminar o jogo no tempo proximo de 67
*/