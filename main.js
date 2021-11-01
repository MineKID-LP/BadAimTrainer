let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let score = 0,
     Highscore = 0,
     targets = [],
     mousepos = {
          x: 0,
          y: 0
     };
let messages = [];
const targetcount = 5;
const max_distance = 500;
const max_life_time = 5000; //ms
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

function Target(x, y) {
     this.x = x;
     this.y = y;
     this.radius = 100;
     this.show = function() {
          let factor = (new Date() - this.creation) / max_life_time;
          this.radius = Lerp([100], [10], factor)
          if(this.radius < 0){ return; }

          ctx.beginPath();
          ctx.strokeStyle = '#ffffff';
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.lineWidth = Lerp([5], [0], factor);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();
          ctx.closePath();

          let innercolor = `rgb(${Lerp([0, 255, 0], [255, 0, 0], factor).join(',')})`
          ctx.beginPath();
          ctx.strokeStyle = innercolor;
          ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = innercolor;
          ctx.fill();
          ctx.closePath();
     }
     this.creation = new Date() - (Math.random() * 1000);
}

function Message(text) {
     this.text = text;
     this.creation = new Date();
}

function spawntargets() {
     for (let i = 0; i < targetcount - targets.length; i++) {
          let target = new Target(Math.random() * canvas.width, Math.random() * canvas.height)
          if (target.x - target.radius < 350) {
               target.x += 350 + target.radius;
          }
          targets.push(target)
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
     points -= (new Date() - time) / max_life_time;
     if (points < 0) {
          return 0;
     }
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
          messages[messages.length] = new Message('Missed');
          return;
     }
     if (dist < 5) {
          hits.push(true);
     }
     hits.push(true);
     targets = targets.filter(item => item != nearest);

     let points = evaluate(dist, nearest.radius);
     if (points > 0) {
          score += points;
          messages[messages.length] = new Message(`+${points}points`);
     }

     if (Highscore < score) {
          Highscore = score;
     }

     time = draw();
     savescore();
}

function showscore() {
     ctx.font = "bold 30px Arial";
     ctx.fillStyle = "#ffffff";
     ctx.fillText(`Your Score: ${score}`, 10, 50);
     ctx.fillText(`Your Highscore: ${Highscore}`, 10, 90);
     let hit = 0;
     hits.forEach((shot, i) => {
          if (shot) {
               hit++;
          }
     });
     ctx.fillText(`Accuracy: ${Math.round((hit / hits.length) * 100) || 0}%`, 10, 130)
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

     showscore();
     drawmsgs();
     return new Date();
}

function drawmsgs() {
     messages.forEach((msg, i) => {
          if (new Date() - msg.creation >= 1000) {
               messages = messages.filter(item => item != msg);
          }
          let factor = (new Date() - msg.creation) / 1000;
          ctx.font = `bold ${Lerp([30], [0], factor)}px Arial`;
          ctx.fillStyle = `rgb(${Lerp([255, 255, 255], [0, 0, 0], factor).join(',')})`;
          ctx.fillText(msg.text, Lerp([10], [30], factor), Lerp([canvas.height], [canvas.height - 200], factor));
     });
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
     if (event.keyCode == 84) {
          tracers = !tracers;
     }
     if (event.keyCode == 69) {
          let hit = 0;
          hits.forEach((shot, i) => {
               if (shot) {
                    hit++;
               }
          });
          alert(`You collected ${score} points, with an accuracy of ${(hit / hits.length) * 100}%`)
     }
});
