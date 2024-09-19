function setup() {
  createCanvas(600, 600);
}

const size = 100;
const layers = 30;

function getRandomValue(pos, variance) {
  return pos + map(Math.random(), 0, 1, -variance, variance);
}

function drawLayers(x, y, size, layers) {
  const variance = size / 2.6;
  noFill();

  //Gpt to get random direction of vertexes
  beginShape();
  for (let i = 0; i < layers; i++) {
    if (Math.random() > 1) {
      continue;
    }
    const x1 = getRandomValue(x, variance);
    const y1 = getRandomValue(y, variance);

    vertex(x1, y1);
  }
  endShape();
}

function draw() {
  background(0, 0, 0);

  // Array of colors (GPT to get direction of how to implement colors to each group of squares)
  const colors = [
    color(150, 20, 0),
    color(255, 0, 0),
    color(255, 255, 0),
    color(255, 150, 0),
    color(255, 50, 0),
  ];

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      // Select a random color from the array for each group of squares (GPT)
      let randomColor = random(colors);
      stroke(randomColor); // Set the stroke color (GPT)
      drawLayers(size / 2 + x * size, size / 2 + y * size, size, layers);
    }
  }
  noLoop();
}
