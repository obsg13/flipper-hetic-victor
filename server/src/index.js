import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3000;

const state = {
  score: 0,
  ballsLeft: 3,
  gameState: 'idle', // 'idle' | 'playing' | 'gameover'
  dmdMessage: 'INSERT COIN'
};

const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Flipper Hetic server (socket.io)');
});

const io = new Server(httpServer, {
  cors: { origin: '*' }
});

function emitStateToAll() {
  // Tous les écrans reçoivent le même état synchronisé
  io.emit('state', state);
}

io.on('connection', (socket) => {
  // À la connexion, on envoie immédiatement l’état courant
  socket.emit('state', state);

  socket.on('game_event', (event) => {
    if (!event || typeof event.type !== 'string') return;

    switch (event.type) {
      case 'start_game': {
        if (state.gameState === 'idle' || state.gameState === 'gameover') {
          state.score = 0;
          state.ballsLeft = 3;
          state.gameState = 'playing';
          state.dmdMessage = 'READY';
        }
        break;
      }

      case 'bumper_hit': {
        const points = Number(event.points ?? 100);
        state.score += Number.isFinite(points) ? points : 100;
        state.dmdMessage = `${points} POINTS!`;
        break;
      }

      case 'hole_hit': {
        const points = Number(event.points ?? 500);
        state.score += Number.isFinite(points) ? points : 500;
        state.dmdMessage = event.message ? String(event.message) : 'HOLE!';
        break;
      }

      case 'ball_lost': {
        state.ballsLeft -= 1;

        if (state.ballsLeft <= 0) {
          state.ballsLeft = 0;
          state.gameState = 'gameover';
          state.dmdMessage = 'GAME OVER';
        } else {
          const ballNumber = 4 - state.ballsLeft;
          state.dmdMessage = `BALL ${ballNumber}`;
        }
        break;
      }

      default:
        break;
    }

    emitStateToAll();
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server socket.io on http://localhost:${PORT}`);
});