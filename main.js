var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
let x, y, radius, score = 0, Highscore = 0;

window.onload = loadscore;
document.addEventListener("click", printMousePos);

let time = draw();

function evaluate(distance, start_time){
     let totaltime = new Date() - start_time;
     if(distance <= 5){
          return Math.round(Math.abs(1000 - totaltime));
     }
     if(distance > radius){
          return 0
     }
     return Math.round(Math.abs(distance - totaltime + 0.5));
}

function printMousePos(event) {
     let dist = Distance(x, event.clientX, y, event.clientY)
     time = draw();
     score += evaluate(dist, time);
     if(Highscore < score){
          Highscore = score;
     }
     showscore(score);
     savescore();
}

function showscore(score){
     ctx.font = "bold 30px Arial";
     ctx.fillStyle = "#ffffff";
     ctx.fillText(`Your Score: ${score}`, 10, 50);
     ctx.fillText(`Your Highscore: ${Highscore}`, 10, 90);
}

function Distance(x1, x2, y1, y2) {
     return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function draw() {

     canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;

     x = Math.random() * canvas.width;
     y = Math.random() * canvas.height;
     radius = (Math.random() * 90) + 10;

     ctx.clearRect(0, 0, canvas.width, canvas.height)
     ctx.fillstyle = "#424242";
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.beginPath();
     ctx.strokeStyle = "#ffffff";
     ctx.arc(x, y, radius, 0, Math.PI * 2);
     ctx.lineWidth = 3;
     ctx.stroke();
     ctx.closePath();

     ctx.beginPath();
     ctx.strokeStyle = "#ff0000";
     ctx.arc(x, y, 5, 0, Math.PI * 2);
     ctx.lineWidth = 1;
     ctx.stroke();
     ctx.fillStyle = "#ff0000";
     ctx.fill();
     ctx.closePath();
     return new Date();
}

function loadscore(){
     Highscore = localStorage.getItem('Highscore');
     showscore(score)
}

function savescore(){
     localStorage.setItem('Highscore', Highscore);
}
