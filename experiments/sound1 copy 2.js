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

  draw() {
    push();
    stroke(0, 0, 0, 40);
    strokeWeight(20);
    line(
      this.lastPosition.x,
      this.lastPosition.y,
      this.position.x,
      this.position.y
    );
    pop();
  }
}

let synth;
let lastSoundTime = 0;

// Define the C minor scale (frequencies for C, D, Eb, F, G, Ab, Bb)
const cMinorScale = [
  261.63, // C4
  293.66, // D4
  311.13, // Eb4
  349.23, // F4
  392.0, // G4
  415.3, // Ab4
  466.16, // Bb4
];

function setup() {
  createCanvas(innerWidth, innerHeight);
  background(255);
  field = generateField();
  generateAgents();

  // Initialize the poly synth with an envelope
  synth = new Tone.PolySynth(Tone.Synth, {
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.8,
      release: 1,
    },
  }).toDestination();
}

const fieldSize = 50;
const maxCols = Math.ceil(innerWidth / fieldSize);
const maxRows = Math.ceil(innerHeight / fieldSize);
const divider = 10;
let field;
let agents = [];

function generateField() {
  let field = [];
  noiseSeed(Math.random() * 100);
  for (let x = 0; x < maxCols; x++) {
    field.push([]);
    for (let y = 0; y < maxRows; y++) {
      const value = noise(x / divider, y / divider) * Math.PI * 2;
      field[x].push(p5.Vector.fromAngle(value));
    }
  }
  return field;
}

function generateAgents() {
  for (let i = 0; i < 1; i++) {
    let agent = new Agent(
      Math.random() * innerWidth,
      Math.random() * innerHeight,
      4,
      0.1
    );
    agents.push(agent);
  }
}

function draw() {
  for (let agent of agents) {
    const x = Math.floor(agent.position.x / fieldSize);
    const y = Math.floor(agent.position.y / fieldSize);
    const desiredDirection = field[x][y];
    agent.follow(desiredDirection);
    agent.update();
    agent.checkBorders();
    agent.draw();

    // Check time for sound interval
    let currentTime = Tone.now();
    if (currentTime - lastSoundTime >= 0.6) {
      lastSoundTime = currentTime;
      playRandomNoteInScale(agent.position.y);
    }
  }
}

// Function to play a random note from the C minor scale
function playRandomNoteInScale(y) {
  // Map Y position to scale index (0 to 6)
  const scaleIndex = Math.floor(map(y, 0, innerHeight, 0, cMinorScale.length));
  const pitch = cMinorScale[scaleIndex]; // Select the note based on the Y position
  synth.triggerAttackRelease(pitch, 0.5); // Play the note for 0.5 seconds
}

// Handle key press to start the sound for browsers that require user interaction
function keyPressed() {
  if (Tone.context.state !== "running") {
    Tone.context.resume(); // Resume the audio context
  }
}
