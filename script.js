window.addEventListener('load', function () {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext('2d');// we can pass 2d and webgl ,but webgl s for 3D ans we need 2D

    canvas.width = 500;
    canvas.height = 500;

    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener('keydown', e => {
                //console.log(e.key);
                //e.key has values like ArrowUp , ArrowDown,ArrowLeft,ArrowRight
                if (((e.key === 'ArrowUp') || (e.key === 'ArrowDown')) && (this.game.keys.indexOf(e.key) == -1)) {
                    this.game.keys.push(e.key);
                }
                else if (e.key === ' ')
                    this.game.player.shootTop();
                //console.log(this.game.keys);

            });
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) != (-1)) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }
    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedfordelete = false;
        }
        update() {
            this.x += this.speed;
            if (this.x > (this.game.width) * 0.8)
                this.markedfordelete = true;

        }
        draw(context) {
            context.fillStyle = 'yellow';
            context.fillRect(this.x + 80, this.y + 30, this.width, this.height);
        }
    }
    class Particle {

    }
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.maxspeed = 2;
            this.projectiles = [];
        }
        update() {
            if (this.game.keys.includes('ArrowUp'))
                this.speedY = -1.5;
            else if (this.game.keys.includes('ArrowDown'))
                this.speedY = 1.5;
            else
                this.speedY = 0;
            this.y += this.speedY;
            //For projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            })
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedfordelete);
        }
        draw(context) {
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            })
        }
        shootTop() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x, this.y));
                --this.game.ammo;
            }
        }
    }
    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markfordelete = false;
            this.live = 5;
            this.score = this.live;
        }
        update() {
            this.x += this.speedX;
            if (this.x + this.width == 0)
                this.markfordelete = true;
        }
        draw(context) {
            context.fillStyle = 'green';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'Black';
            context.font = '20px Helvetica';
            context.fillText(this.live, this.x, this.y);
        }
    }
    class Enemyt1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228 * 0.3;
            this.height = 169 * 0.3;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
        }
    }
    class Layer {

    }
    class Background {

    }
    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'orange';
        }
        draw(context) {
            context.fillStyle = this.color;
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(21 + 5 * i, 20, 3, 20);
            }
        }
    }
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.keys = [];
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammotimer = 0;
            this.ammointerval = 500;
            this.ui = new UI(this);
            this.enemies = [];
            this.etimer = 1000;
            this.gameover = false;
            this.enemytime = 0;
        }
        update(deltatime) {
            this.player.update();
            if (this.ammotimer > this.ammointerval) {
                if (this.ammo < this.maxAmmo)
                    ++this.ammo;
                this.ammotimer = 0;
            }
            else {
                this.ammotimer += deltatime;
            }
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.check_collision(enemy, this.player)) {
                    enemy.markfordelete = true;
                }

                this.player.projectiles.forEach(proj => {
                    if (this.check_collision(proj, enemy)) {


                        --enemy.live;

                        proj.markedfordelete = true;
                        if (enemy.live <= 0) {
                            enemy.markfordelete = true;
                            this.score += enemy.score;
                        }
                    }
                });
            });

            this.enemies = this.enemies.filter(enemy => !enemy.markfordelete);
            if (this.enemytime > this.etimer && !this.gameover) {
                this.addenemy();
                this.enemytime = 0;
            }
            else
                this.enemytime += deltatime;
        }
        draw(context) {
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            })
        }
        addenemy() {
            this.enemies.push(new Enemyt1(this));
        }
        check_collision(rect1, rect2) {
           return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lasttime = 0;

    //animation loop to make th mvement and draw and implement update function 60 times per second

    function animate(timeStamp) {
        const deltatime = timeStamp - lasttime;
        lasttime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltatime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});

