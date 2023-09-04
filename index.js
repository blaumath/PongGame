const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const paddleWidth = 18,
    paddleHeight = 120,
    paddleSpeed = 15,
    ballRadius = 12,
    initialBallSpeed = 8,
    maxBallSpeed = 40,
    netWidth = 5,
    netColor = "WHITE";

// Desenha a rede no canvas
function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(canvas.width / 2 - netWidth / 2, i, netWidth, 10, netColor);
    }
}

// Desenha um retângulo no canvas
function drawRect(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

// Desenha um círculo no canvas
function drawCircle(x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

// Desenha texto no canvas
function drawText(text, x, y, color) {
    context.fillStyle = color;
    context.font = "bold 60px Courier New";
    context.textAlign = "center";
    context.fillText(text, x, y);
}

// Cria um objeto de raquete
function createPaddle(x, y) {
    return { x: x, y: y, width: paddleWidth, height: paddleHeight, color: "WHITE", score: 0 };
}

// Cria um objeto de bola
function createBall() {
    return { x: canvas.width / 2, y: canvas.height / 2, radius: ballRadius, velocityX: initialBallSpeed, velocityY: initialBallSpeed, color: "WHITE", speed: initialBallSpeed };
}

// Define objetos de raquete do usuário e do computador
const user = createPaddle(0, canvas.height / 2 - paddleHeight / 2);

const com = createPaddle(canvas.width - paddleWidth, canvas.height / 2 - paddleHeight / 2);

// Define objeto de bola
const ball = createBall();

// Atualiza a posição da raquete do usuário com base no movimento do mouse ou nas teclas pressionadas
canvas.addEventListener('mousemove', movePaddle);

document.addEventListener('keydown', movePaddle);

function movePaddle(event) {
    if (event.type === 'mousemove') {
        const rect = canvas.getBoundingClientRect();
        user.y = event.clientY - rect.top - user.height / 2;
    } else if (event.type === 'keydown') {
        if (event.key === 'ArrowUp') {
            user.y -= paddleSpeed;
        } else if (event.key === 'ArrowDown') {
            user.y += paddleSpeed;
        }
    }
}

// Verifica a colisão entre a bola e a raquete
function collision(b, p) {
    return (
        b.x + b.radius > p.x && b.x - b.radius < p.x + p.width && b.y + b.radius > p.y && b.y - b.radius < p.y + p.height
    );
}

// Redefine a posição e velocidade da bola
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
    ball.velocityX = -ball.velocityX;
    ball.speed = initialBallSpeed;
}

// Atualiza a lógica do jogo
function update() {
   // Verifica a pontuação e redefine a bola se necessário
   if (ball.x - ball.radius < 0) {
       com.score++;
       resetBall();
       checkScore();
   } else if (ball.x + ball.radius > canvas.width) {
       user.score++;
       resetBall();
       checkScore();
   }

   // Atualiza a posição da bola
   ball.x += ball.velocityX;
   ball.y += ball.velocityY;

   // Atualiza a posição da raquete do computador com base na posição da bola
   com.y += (ball.y - (com.y + com.height / 2)) * 0.1;

   // Paredes superior e inferior
   if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
       ball.velocityY = -ball.velocityY;
   }

   // Determina qual raquete está sendo atingida pela bola e lida com a colisão
   let player = (ball.x + ball.radius < canvas.width / 2) ? user : com;
    
if (collision(ball, player)) {
       const collidePoint = (ball.y - (player.y + player.height / 2));
       const collisionAngle = ((Math.PI / 4) * (collidePoint / (player.height / 2)));
       const direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;
       ball.velocityX = direction * ball.speed * Math.cos(collisionAngle);
       ball.velocityY = ball.speed * Math.sin(collisionAngle);

       // Aumenta a velocidade da bola e limita à velocidade máxima
       ball.speed += 0.2;
       if (ball.speed > maxBallSpeed) {
           ball.speed = maxBallSpeed;
       }
   }
}

// Verifica se algum jogador atingiu 10 pontos e exibe uma mensagem de fim de jogo
function checkScore() {
    if (user.score === 10 || com.score === 10) {
        if (confirm("Fim de jogo! Para recomeçar, aperte em OK.")) {
            user.score = 0;
            com.score = 0;
        }
    }
}

// Renderiza o jogo no canvas
function render() {
    // Limpa o canvas com tela preta
    drawRect(0, 0, canvas.width, canvas.height, "BLACK");
    drawNet();

    // Desenha as pontuações
    drawText(user.score, canvas.width / 4, canvas.height / 5, "GRAY");
    drawText(com.score, 3 * canvas.width / 4, canvas.height / 5, "GRAY");

    // Desenha as raquetes
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);

    // Desenha a bola
    drawCircle(ball.x, ball.y, ball.radius, ball.color);

    // Desenha informações sobre o jogador e o computador
    context.font = "bold 14px Courier New";
    context.fillStyle = "rgba(255,255,255,0.5)"; // Alterei a cor e a transparência dos nomes do jogador e do computador para torná-los mais suaves e discretos
    drawText("Jogador", canvas.width / 4, canvas.height - 20, "WHITE");
    drawText("Computador", 3 * canvas.width / 4, canvas.height - 20, "WHITE");
}

// Executa o loop do jogo
function gameLoop() {
    update();
    render();
}

// Define o gameLoop para ser executado a 60 quadros por segundo
const framePerSec = 60;
setInterval(gameLoop, 1000 / framePerSec);
