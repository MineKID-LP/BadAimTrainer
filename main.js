var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
let score = 0,
     Highscore = 0,
     targets = [],
     mousepos = {
          x: 0,
          y: 0
     };
const targetcount = 5;
const max_distance = 500;
const max_life_time = 5000;//ms
let tracers = false;
let hits = [];

function Update() {
     draw();
     delettooldtargets();
     setTimeout(Update, 2);
}

document.onmousemove = function(event) {
     mousepos.x = event.clientX;
     mousepos.y = event.clientY;
};

function Target(x, y, radius) {
     this.x = x;
     this.y = y;
     this.radius = radius;
     this.show = function() {
          let outercolor = `rgb(${Lerp([255, 255, 255], [0, 0, 0], (new Date() - this.creation) / max_life_time).join(',')})`
          ctx.beginPath();
          ctx.strokeStyle = outercolor;
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.lineWidth = Lerp([5], [0], (new Date() - this.creation) / max_life_time);
          ctx.stroke();
          ctx.closePath();

          let innercolor = `rgb(${Lerp([0, 255, 0], [255, 0, 0], (new Date() - this.creation) / max_life_time).join(',')})`
          ctx.beginPath();
          ctx.strokeStyle = innercolor;
          ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = innercolor;
          ctx.fill();
          ctx.closePath();
     }
     this.creation = new Date();
}

function spawntargets(){
     for (let i = 0; i < targetcount; i++) {
          let target = new Target(Math.random() * canvas.width, Math.random() * canvas.height, (Math.random() * 90) + 10)
          if(Distance(0, target.x, -500, target.y) - target.radius > 700){
               targets.push(target)
          }else{
               i--;
          }

     }
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

spawntargets();

window.onload = function() {
     loadscore();
     Update();
};
document.addEventListener("click", checkhit);

let time = draw();

function evaluate(distance, radius) {
     let points = 2000;
     points -= distance;
     points -= radius;
     points -= new Date() - time;
     if(points < 0){return 0;}
     return Math.round(points);
}

function checkhit(event) {
     let nearest, min_dist = 10000;
     targets.forEach((item, i) => {
          if (Distance(item.x, event.clientX, item.y, event.clientY) < min_dist) {
               nearest = item;
               min_dist = Distance(item.x, event.clientX, item.y, event.clientY);
          }
     });

     let dist = Distance(nearest.x, event.clientX, nearest.y, event.clientY)
     if (dist > nearest.radius) {
          hits.push(false);
          return;
     }
     if(dist < 5){
          hits.push(true);
     }
     hits.push(true);
     targets = targets.filter(item => item != nearest);

     score += evaluate(dist, nearest.radius);

     if (Highscore < score) {
          Highscore = score;
     }
     time = draw();
     showscore(score);
     savescore();
}

function showscore() {
     ctx.font = "bold 30px Arial";
     ctx.fillStyle = "#ffffff";
     ctx.fillText(`Your Score: ${score}`, 10, 50);
     ctx.fillText(`Your Highscore: ${Highscore}`, 10, 90);
}

function Distance(x1, x2, y1, y2) {
     return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function draw() {

     if (targets.length < targetcount) {
          spawntargets();
     }

     canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;

     ctx.clearRect(0, 0, canvas.width, canvas.height)
     ctx.fillstyle = "#424242";
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     let last_x = 0,
          last_y = 0;
     ctx.beginPath();
     targets.forEach((item, i) => {
          item.show();
          if (tracers) {
               if (Distance(mousepos.x, item.x, mousepos.y, item.y) < max_distance && Distance(mousepos.x, item.x, mousepos.y, item.y) > item.radius) {
                    ctx.moveTo(mousepos.x, mousepos.y)
                    ctx.strokeStyle = `rgb(${Lerp([0, 255, 0], [255, 0, 0], Distance(mousepos.x, item.x, mousepos.y, item.y) / max_distance).join(',')})`;
                    ctx.lineWidth = 2;
                    ctx.lineTo(item.x, item.y)
                    ctx.stroke();
               }
          }
     });
     ctx.closePath();

     showscore()
     return new Date();
}

function Lerp(first, second, factor) {
     if (arguments.length < 3) {
          factor = 0.5;
     }
     var result = first.slice();
     for (var i = 0; i < result.length; i++) {
          result[i] = Math.round(result[i] + factor * (second[i] - first[i]));
     }
     return result;
};

function loadscore() {
     Highscore = localStorage.getItem('Highscore');
     showscore(score)
}

function savescore() {
     localStorage.setItem('Highscore', Highscore);
}

function delettooldtargets() {
     targets.forEach((item, i) => {
          if (new Date() - item.creation >= max_life_time) {
               targets = targets.filter(target => target != item);
          }
     });

     if (targets.length < targetcount) {
          spawntargets();
     }
}

document.addEventListener("keydown", (event) => {
	if(event.keyCode == 84){
          tracers = !tracers;
     }
     if(event.keyCode == 69){
          let hit = 0;
          let miss = 0;
          hits.forEach((shot, i) => {
               if(shot){
                    hit++;
               }else{
                    miss++;
               }
          });
          console.log(hit, miss, hits.length, (hit / hits.length) * 100, hits)
          alert(`You collected ${score} points, with an accuracy of ${(hit / hits.length) * 100}%`)
     }
});
