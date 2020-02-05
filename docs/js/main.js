const Background = function(groundPoint) {
    const background = {};
    background.ground = groundPoint + 15;
    background.skyColor = "rgba(0,0,200,0.2)";
    background.groundStroke = "rgba(0,100,50,0.6)"
    background.groundColor = "rgba(0,200,100,0.6)";

    background.draw = function(ctx, cWidth, cHeight) {
        ctx.fillStyle = this.skyColor;
        ctx.fillRect(0, 0, cWidth, this.ground);
        ctx.beginPath();
        ctx.moveTo(0, this.ground);
        ctx.lineTo(cWidth, this.ground);
        ctx.strokeStyle = this.groundStroke;
        ctx.stroke();
        ctx.fillStyle = this.groundColor;
        ctx.fillRect(0, this.ground, cWidth, cHeight);
    }
    return background;
}

const Circle = function(x, y, r) {
    const circle = {}
    circle.x = x;
    circle. y = y;
    circle.r = r;
    circle.strokeColor = "rgba(0,0,0,0.5)";

    circle.update = function(x, y) {
        this.x = x;
        this.y = y;
    }

    circle.draw = function(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.strokeStyle = this.strokeColor;
        ctx.stroke();
    }
    return circle;
}

const Arrow = function() {
    const arrow = {};
    arrow.drawn = false;
    arrow.fired = false;
    arrow.aim = {x: 0, y: 0};
    arrow.strokeColor = "rgba(0,0,0,0.2)";
    arrow.fillColor = "rgba(0,0,0,0.6)";
    arrow.headLength = 8;
    arrow.angle = 0;

    arrow.update = function(mouse, mouseDown, circle) {
        if (this.fired === false) {
            if (isInCircle(mouse, circle)) {
                if (mouseDown === true)
                    this.drawn = true;
                else
                    this.drawn = false;
            }
    
            if (mouseDown === false) {
                this.drawn = false;
                this.fired = true;
            }
        }
    }

    arrow.updateAim = function(mouse, circle) {
        this.aim = getAimCoords(mouse, circle);
        this.angle = angleBetween(this.aim, circle);
    }

    arrow.drawAiming = function(ctx, mouse, circle) {
        if (this.drawn === true) {
            this.updateAim(mouse, circle);
            ctx.beginPath();
            ctx.moveTo(this.aim.x, this.aim.y);
            ctx.lineTo(circle.x, circle.y);

            ctx.strokeStyle = this.strokeColor;
            ctx.stroke();

            //starting a new path from the head of the arrow to one of the sides of the point
            ctx.beginPath();
            ctx.moveTo(this.aim.x, this.aim.y);
            ctx.lineTo(
                this.aim.x + this.headLength * Math.cos(this.angle - Math.PI / 7),
                this.aim.y + this.headLength * Math.sin(this.angle - Math.PI / 7)
            );

            //path from the side point of the arrow, to the other side point
            ctx.lineTo(
                this.aim.x + this.headLength * Math.cos(this.angle + Math.PI / 7),
                this.aim.y + this.headLength * Math.sin(this.angle + Math.PI / 7)
            );

            //path from the side point back to the tip of the arrow, and then again to the opposite side point
            ctx.lineTo(this.aim.x, this.aim.y);
            // ctx.lineTo(
            //     this.aim.x - this.headLength * Math.cos(this.angle - Math.PI / 7),
            //     this.aim.y - this.headLength * Math.sin(this.angle - Math.PI / 7)
            // );

            ctx.strokeStyle = this.strokeColor;
            ctx.stroke();
            ctx.fillStyle = this.fillColor;
            ctx.fill();

            ctx.font = "10px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(
                Math.round(this.angle * (180 / Math.PI))
                + "°, Vel: " + Math.round(distanceBetween(circle, mouse) / 10)
                + ", x: " + circle.x
                + ", y: " + circle.y,
                circle.x + 80, circle.y - 40
            );
        }
    }
    return arrow;
}

const Projectile = function(x, y, angle, velocity) {
    const projectile = {};
    projectile.x = x;
    projectile.y = y;
    projectile.angle = angle;
    projectile.velocity = velocity;
    projectile.velX = velocity * Math.cos(angle);
    projectile.velY = velocity * Math.sin(angle);
    projectile.increment = 0.5;
    projectile.fillColor = "rgba(0,0,0,0.6)";
    projectile.r = 4;

    projectile.update = function(gravity, groundPoint) {
        if (this.y < groundPoint) {
            // this.time += this.inc;
            this.x = this.x + this.velX * this.increment;
            this.y = this.y + this.velY * this.increment;
            // this.velX = this.velX + this.gravity * this.increment * 0.1;
            this.velY = this.velY + gravity * this.increment * 0.1;
        }
    }

    projectile.draw = function(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fillStyle = this.fillColor;
        ctx.fill();

        ctx.font = "10px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("x: " + Math.round(this.x) + ", y: " + Math.round(this.y), this.x, this.y);
    }
    return projectile;
}

window.addEventListener('load', (e) => {
    console.log('page is fully loaded');

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    let cWidth = canvas.width;
    let cHeight = canvas.height;

    document.body.appendChild(canvas);

    let gravity = 10;
    let groundPoint = cHeight - (cHeight / 4);

    let bg = Background(groundPoint);

    let shootingCircle = Circle(200, groundPoint - 200, 75);
    let aimCircle = Circle(shootingCircle.x, shootingCircle.y, 10);

    // Mouse events
    let mousePos = {x: 0, y: 0};
    let mouseDown = false;
    let projectiles = [];
    let arrow;

    window.addEventListener('mousemove', (e) => {
        mousePos = getMousePos(e);
    });

    window.addEventListener('mousedown', (e) => {
        mousePos = getMousePos(e);
        mouseDown = true;
    });

    window.addEventListener('mouseup', (e) => {
        mousePos = getMousePos(e);
        mouseDown = false;
    });

    // Window resize listeners    
    window.onresize = (e) => {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;

        cWidth = canvas.width;
        cHeight = canvas.height;
    };

    window.onscroll = (e) => {
        canvas.setAttribute("style", "top: " + window.pageYOffset + "px");
    };

    function main() {
        ctx.clearRect(0, 0, cWidth, cHeight);
        bg.draw(ctx, cWidth, cHeight);
        // ctx.fillStyle = "rgba(255,255,255,0.2)";
        // ctx.fillRect(0,0,cWidth,cHeight);
        shootingCircle.draw(ctx);
        aimCircle.draw(ctx);
        if (mouseDown === true) {
            if (arrow === undefined) {
                arrow = Arrow();
            }
            arrow.update(mousePos, mouseDown, shootingCircle);

            arrow.drawAiming(ctx, mousePos, shootingCircle);

        } else if (arrow != undefined && mouseDown === false) {
            projectiles.push(
                Projectile(
                    shootingCircle.x,
                    shootingCircle.y,
                    angleBetween(mousePos, aimCircle), 
                    distanceBetween(aimCircle, mousePos) / 10
                )
            );
            // console.log(projectiles[projectiles.length -1])
            arrow = undefined;
        } else {
            shootingCircle.update(mousePos.x, mousePos.y);
            aimCircle.update(mousePos.x, mousePos.y);
        }



        for (let projectile of projectiles) {
            projectile.update(gravity, groundPoint);
            projectile.draw(ctx);
        }

        window.requestAnimationFrame(main);
    }

    window.requestAnimationFrame(main);
});

function getMousePos(e) {
    return {
        x: e.clientX,
        y: e.clientY
    };
}

function distanceBetween(p1, p2) {
    // p1 is circle centre, p2 is mouse pos
    return Math.sqrt( Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2) );
}

function angleBetween(p1, p2) {
    // p1 is mouse pos, p2 is center of circle
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function getAimCoords(mouse, circle) {
    const angle = Math.PI / 2 - angleBetween(mouse, circle);
    const distance = Math.min(distanceBetween(circle, mouse), circle.r);
    return {
        x: circle.x + distance * Math.sin(angle),
        y: circle.y + distance * Math.cos(angle)
    };
}

function isInCircle(mouse, circle) {
    const distanceFromCenter = distanceBetween(circle, mouse);
    if (distanceFromCenter < circle.r)
        return true;
    return false;
}