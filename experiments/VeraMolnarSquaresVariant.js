function setup() {
  createCanvas(600, 600);
}

const size = 100;
const layers = 9;

function getRandomValue(pos, variance) {
  return pos + map(Math.random(), 0, 1, -variance, variance);
}

function drawLayers(x, y, size, layers) {
  let varianceFactor = 1.6;
  const variance = (size / layers) * varianceFactor;
  noFill();
  strokeWeight(1);
  //rectMode(CENTER);
  for (let i = 2.8; i < layers; i++) {
    const s = (size / layers) * i;
    const half = s / 2;
    beginShape();
    vertex(
      getRandomValue(x - half, variance),
      getRandomValue(y - half, variance)
    );
    vertex(
      getRandomValue(x + half, variance),
      getRandomValue(y - half, variance)
    );
    vertex(
      getRandomValue(x + half, variance),
      getRandomValue(y + half, variance)
    );
    vertex(
      getRandomValue(x - half, variance),
      getRandomValue(y + half, variance)
    );
    endShape(CLOSE);
    //rect(x - half, y - half, s, s);
  }
}

const divider = 10;
const numCols = 60;
const numRows = 60;

function draw() {
  background(0, 0, 0);

  // Array of colors (GPT to get direction of how to implement colors to each group of squares)
  const colors = [
    color(40, 40, 40), // White
    color(200, 255, 200), // Red
  ];

  //drawLayers(100, 100, size, layers);
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      // Select a random color from the array for each group of squares (GPT)
      let randomColor = random(colors);
      stroke(randomColor); // Set the stroke color (GPT)
      drawLayers(size / 2 + x * size, size / 2 + y * size, size, layers);
    }
  }
  for (y = 0; y < numRows; y++) {
    for (x = 0; x < numCols; x++) {
      const value = noise(x / divider, y / divider) * size;
      ellipse(size / 2 + x * size, size / 2 + y * size, value);
    }
  }
  noLoop();
}
