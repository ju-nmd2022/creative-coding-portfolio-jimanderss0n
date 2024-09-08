class Agent {
  constructor(x, y, maxSpeed, maxForce) {
    this.position = createVector(x, y);
    this.lastPosition = createVector(x, y);
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, 0);
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
  }

  follow(desiredDirection) {
    desiredDirection = desiredDirection.copy();
    desiredDirection.mult(this.maxSpeed);
    let steer = p5.Vector.sub(desiredDirection, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.lastPosition = this.position.copy();

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  checkBorders() {
    if (this.position.x < 0) {
      this.position.x = innerWidth;
      this.lastPosition.x = innerWidth;
    } else if (this.position.x > innerWidth) {
      this.position.x = 0;
      this.lastPosition.x = 0;
    }
    if (this.position.y < 0) {
      this.position.y = innerHeight;
      this.lastPosition.y = innerHeight;
    } else if (this.position.y > innerHeight) {
      this.position.y = 0;
      this.lastPosition.y = 0;
    }
  }

  //Gpt to get color fade
  draw() {
    // Array of colors
    const colors = [
      color(80, 80, 255),
      color(100, 100, 255),
      color(255, 30, 255),
    ];
    push();

    // Calculate the interpolation factor based on the agent's position
    let t = map(this.position.x, 0, innerWidth, 0, 1);
    let t2 = map(this.position.y, 0, innerHeight, 0, 1);

    // Interpolate between the colors based on the agent's position
    let colorX = lerpColor(colors[0], colors[2], t);
    let colorY = lerpColor(colors[0], colors[2], t2);

    // Mix the two interpolated colors
    let finalColor = lerpColor(colorX, colorY, 0.5);

    stroke(finalColor);
    strokeWeight(0.2);
    line(
      this.lastPosition.x,
      this.lastPosition.y,
      this.position.x,
      this.position.y
    );

    pop();
  }
}

function setup() {
  createCanvas(innerWidth, innerHeight);
  background(20, 20, 40);
  field = generateField();
  generateAgents();
}

const squareSize = 550;
const squareX = (innerWidth - squareSize) / 4;
const squareY = (innerHeight - squareSize) / 4;

//some gpt to get the vectors to form square
function generateField() {
  let field = [];
  noiseSeed(Math.random() * 100);
  //noiseSeed(100);

  for (let x = 0; x < maxCols; x++) {
    field.push([]);
    for (let y = 0; y < maxRows; y++) {
      let posX = x * fieldSize;
      let posY = y * fieldSize;

      let vector;

      if (
        posX > squareX &&
        posX < squareX + squareSize &&
        posY > squareY &&
        posY < squareY + squareSize
      ) {
        // Inside the square: follow the borders clockwise or counterclockwise

        // Calculate distances to the square's edges
        let distToLeft = posX - squareX;
        let distToRight = squareX + squareSize - posX;
        let distToTop = posY - squareY;
        let distToBottom = squareY + squareSize - posY;

        // Determine which edge the agent is closest to
        let minDist = Math.min(
          distToLeft,
          distToRight,
          distToTop,
          distToBottom
        );

        if (minDist === distToLeft) {
          vector = createVector(0, 1); // Move down along the left edge
        } else if (minDist === distToRight) {
          vector = createVector(0, -1); // Move up along the right edge
        } else if (minDist === distToTop) {
          vector = createVector(1, 0); // Move right along the top edge
        } else {
          vector = createVector(-1, 0); // Move left along the bottom edge
        }

        // Add a small noise-based random variation to soften the strict flow
        let noiseVal = noise(x / divider, y / divider) * Math.PI * 0.1;
        vector.rotate(noiseVal);
      } else {
        // Outside the square: use noise for a more random flow
        const value = noise(x / divider, y / divider) * Math.PI * 2;
        vector = p5.Vector.fromAngle(value);
      }

      field[x].push(vector);
    }
  }
  return field;
}

function generateAgents() {
  for (let i = 0; i < 400; i++) {
    let agent = new Agent(
      Math.random() * innerWidth,
      Math.random() * innerHeight,
      10,
      0.6
    );
    agents.push(agent);
  }
}

const fieldSize = 50;
const maxCols = Math.ceil(innerWidth / fieldSize);
const maxRows = Math.ceil(innerHeight / fieldSize);
const divider = 4;
let field;
let agents = [];

function draw() {
  for (let agent of agents) {
    const x = Math.floor(agent.position.x / fieldSize);
    const y = Math.floor(agent.position.y / fieldSize);
    const desiredDirection = field[x][y];
    agent.follow(desiredDirection);
    agent.update();
    agent.checkBorders();
    agent.draw();
  }
}
