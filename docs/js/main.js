const Background = function(groundPoint) {
    const background = {};
    background.ground = groundPoint + 15;
    background.skyColor = "rgba(221,8,144,0.25)";
    background.groundStroke = "rgba(34,34,34,0.55)";
    background.groundColor = "rgba(75,0,130,0.45)";

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
    circle.strokeColor = "rgba(34,34,34,0.25)";

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
    arrow.strokeColor = "rgba(34,34,34,0.35)";
    arrow.fillColor = "rgba(34,34,34,0.55)";
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

            ctx.beginPath();
            ctx.moveTo(this.aim.x, this.aim.y);
            ctx.lineTo(
                this.aim.x + this.headLength * Math.cos(this.angle - Math.PI / 7),
                this.aim.y + this.headLength * Math.sin(this.angle - Math.PI / 7)
            );

            ctx.lineTo(
                this.aim.x + this.headLength * Math.cos(this.angle + Math.PI / 7),
                this.aim.y + this.headLength * Math.sin(this.angle + Math.PI / 7)
            );

            ctx.lineTo(this.aim.x, this.aim.y);

            ctx.strokeStyle = this.strokeColor;
            ctx.stroke();
            ctx.fillStyle = this.fillColor;
            ctx.fill();

            ctx.font = "10px Arial";
            ctx.fillStyle = "rgba(34,34,34,0.85)";
            ctx.fillText(
                Math.round(this.angle * (180 / Math.PI))
                + "° Velocity: " + Math.round(distanceBetween(circle, mouse) / 6)
                + " X: " + circle.x
                + " Y: " + circle.y,
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
    projectile.increment = 0.1;
    projectile.strokeColor = "rgba(34,34,34,0.85)";
    projectile.fillColor = "rgba(34,34,34,0.65)";
    projectile.r = 4;
    projectile.lastX = 0;
    projectile.lastY = 0;
    projectile.headLength = 10;

    projectile.update = function(gravity, groundPoint) {

//        this.angle = this.angle * this.increment;

        if (this.y <= groundPoint) {
            this.lastX = this.x;
            this.lastY = this.y;
            // // this.angle = this.angle + this.increment;

            // let cos = Math.cos(this.angle);
            // let sin = Math.sin(this.angle);
    
            this.x = this.x + this.velX * this.increment;
            this.y = this.y + this.velY * this.increment;
            this.velY = this.velY + gravity * this.increment * 0.1;

            this.angle = angleBetween({x: this.lastX, y: this.lastY}, {x: this.x, y: this.y});

            console.log("a: " + this.angle * 180 / Math.PI)

        }

        // var cos = Math.cos(angle),
        // sin = Math.sin(angle);

        // return {
        //     x: cos -sin,
        //     y: sin + cos
        // }
    }

    projectile.draw = function(ctx) {
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        // ctx.fillStyle = this.fillColor;
        // ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 20 * Math.cos(this.angle), this.y + 20 * Math.sin(this.angle));

        ctx.strokeStyle = this.strokeColor;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x + 20 * Math.cos(this.angle), this.y + 20 * Math.sin(this.angle));
        ctx.lineTo(
            this.x + this.headLength * Math.cos(this.angle - Math.PI / 7),
            this.y + this.headLength * Math.sin(this.angle - Math.PI / 7)
        );

        ctx.lineTo(
            this.x + this.headLength * Math.cos(this.angle + Math.PI / 7),
            this.y + this.headLength * Math.sin(this.angle + Math.PI / 7)
        );

        ctx.lineTo(this.x + 20 * Math.cos(this.angle), this.y + 20 * Math.sin(this.angle));

        ctx.strokeStyle = this.strokeColor;
        ctx.stroke();
        ctx.fillStyle = this.fillColor;
        ctx.fill();


        ctx.font = "10px Arial";
        ctx.fillStyle = "rgba(34,34,34,0.85)";
        ctx.fillText("X: " + Math.round(this.x) + " Y: " + Math.round(this.y), this.x + 8, this.y - 4);
    }
    return projectile;
}

window.addEventListener('load', (e) => {
    console.log('page is fully loaded');

    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    const bgCtx = bgCanvas.getContext('2d');

    const fgCanvas = document.createElement('canvas');
    fgCanvas.width = window.innerWidth;
    fgCanvas.height = window.innerHeight;
    const fgCtx = fgCanvas.getContext('2d');

    let cWidth = bgCanvas.width;
    let cHeight = bgCanvas.height;

    let stage = document.getElementById("stage");
    stage.appendChild(bgCanvas);
    stage.appendChild(fgCanvas);

    let gravity = 10;
    let groundPoint = cHeight - (cHeight / 4);

    let bg = Background(groundPoint);

    let shootingCircle = Circle(200, groundPoint - 200, 75);
    let aimCircle = Circle(shootingCircle.x, shootingCircle.y, 10);

    // Mouse events
    let mousePos = {x: 0, y: 0};
    let savedMousePos;
    let mouseDown = false;
    let projectiles = [];
    let arrow;

    window.addEventListener('mousemove', (e) => {
        mousePos = getMousePos(e);
    });

    window.addEventListener('mousedown', (e) => {
        mousePos = getMousePos(e);
        savedMousePos = getMousePos(e);
        mouseDown = true;
    });

    window.addEventListener('mouseup', (e) => {
        mousePos = getMousePos(e);
        mouseDown = false;
    });

    // Window resize listeners    
    window.onresize = (e) => {
        bgCanvas.width  = window.innerWidth;
        bgCanvas.height = window.innerHeight;
        fgCanvas.width  = window.innerWidth;
        fgCanvas.height = window.innerHeight;

        cWidth = bgCanvas.width;
        cHeight = bgCanvas.height;
    };

    window.onscroll = (e) => {
        bgCanvas.setAttribute("style", "top: " + window.pageYOffset + "px");
        fgCanvas.setAttribute("style", "top: " + window.pageYOffset + "px");
    };

    function main() {
        fgCtx.clearRect(0, 0, cWidth, cHeight);
        // fgCtx.fillStyle = "rgba(255,255,255,0.1)";
        // fgCtx.fillRect(0, 0, cWidth, cHeight);
        bgCtx.clearRect(0, 0, cWidth, cHeight);
        bg.draw(bgCtx, cWidth, cHeight);
        shootingCircle.draw(fgCtx);
        aimCircle.draw(fgCtx);
        if (mouseDown === true && savedMousePos.y < groundPoint) {
            if (arrow === undefined) {
                arrow = Arrow();
            }
            arrow.update(mousePos, mouseDown, shootingCircle);

            arrow.drawAiming(fgCtx, mousePos, shootingCircle);

        } else if (arrow != undefined && mouseDown === false) {
            projectiles.push(
                Projectile(
                    shootingCircle.x,
                    shootingCircle.y,
                    angleBetween(mousePos, aimCircle), 
                    distanceBetween(aimCircle, mousePos) / 6
                )
            );
            if (projectiles.length > 10) {
                projectiles.shift();
            }
            arrow = undefined;
        } else {
            shootingCircle.update(mousePos.x, mousePos.y);
            aimCircle.update(mousePos.x, mousePos.y);
        }



        for (let projectile of projectiles) {
            projectile.update(gravity, groundPoint);
            projectile.draw(fgCtx);
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