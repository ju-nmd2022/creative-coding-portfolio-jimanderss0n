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
    stroke(0, 0, 200);
    strokeWeight(2);
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
let filter;

// Define the chords in C minor scale (as triads)
const chordProgression = {
  Eb4_major: [311.13, 392.0, 466.16], // Eb4, G4, Bb4
  F4_minor: [349.23, 415.3, 466.16], // F4, Ab4, C5
  G4_minor: [392.0, 466.16, 523.25], // G4, Bb4, D5
  Ab4_major: [415.3, 523.25, 587.33], // Ab4, C5, Eb5
  Bb4_major: [466.16, 587.33, 698.46], // Bb4, D5, F5
  C4_minor: [261.63, 311.13, 392.0], // C4, Eb4, G4
};

function setup() {
  createCanvas(innerWidth, innerHeight);
  background(255);
  field = generateField();
  generateAgents();
  generateSmallAgents(); // Generate small agents

  // Initialize the poly synth with an envelope, Some help with gpt to get the right code for effects I wanted.
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "triangle",
    },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.2,
      release: 0.4,
    },
  }).toDestination();

  // Initialize the low-pass filter
  filter = new Tone.Filter({
    type: "lowpass", // Low-pass filter type
    frequency: 5000, // Default frequency
    rolloff: -48, // Steepness of the filter
    Q: 10, // Resonance
  });

  // Initialize reverb
  reverb = new Tone.Reverb({
    decay: 0, // The length of the reverb tail
    wet: 0.9, // The mix level (how much reverb is added)
  });

  // Initialize chorus effect
  chorus = new Tone.Chorus({
    frequency: 1, // Frequency of the LFO modulation
    delayTime: 3.5, // Delay time between voices
    depth: 2, // Depth of the modulation
    spread: 180, // Stereo spread of the effect
    wet: 0.6, // Mix level for the chorus
  });

  // Chain effects: synth -> chorus -> feedbackDelay -> reverb -> destination (speakers)
  synth.chain(filter, chorus, reverb, Tone.Destination);
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

//some gpt to help with a visual flowfield following the main one
let smallAgents = [];
let smallAgentCount = 340;

function generateSmallAgents() {
  for (let i = 0; i < smallAgentCount; i++) {
    let smallAgent = new Agent(
      Math.random() * innerWidth,
      Math.random() * innerHeight,
      2, // slower speed
      0.05 // less force
    );
    smallAgents.push(smallAgent);
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

    // Some Gpt to map agent's X position to a low-pass filter cutoff frequency
    let mappedFrequency = map(agent.position.x, 0, innerWidth, 200, 20000); // 200 Hz to 20kHz
    filter.frequency.value = mappedFrequency;

    // Some gpt help to check time for sound interval
    let currentTime = Tone.now();
    if (currentTime - lastSoundTime >= 0.6) {
      lastSoundTime = currentTime;
      playChord(agent.position.y);
    }
  }

  // Small agents logic (Some gpt to help)
  for (let smallAgent of smallAgents) {
    const x = Math.floor(smallAgent.position.x / fieldSize);
    const y = Math.floor(smallAgent.position.y / fieldSize);
    const desiredDirection = field[x][y];
    smallAgent.follow(desiredDirection);
    smallAgent.update();
    smallAgent.checkBorders();

    // Draw smaller agents with a thinner stroke weight
    push();
    stroke(0, 200, 255, 30); // Lighter stroke
    strokeWeight(1); // Smaller stroke weight for small agents
    line(
      smallAgent.lastPosition.x,
      smallAgent.lastPosition.y,
      smallAgent.position.x,
      smallAgent.position.y
    );
    pop();
  }
}

// Gpt to get function to map Y position to a chord and play its notes sequentially
function playChord(y) {
  // Map Y position to a specific chord
  let chord;
  if (y < innerHeight / 7) {
    chord = chordProgression["C4_minor"];
  } else if (y < (2 * innerHeight) / 7) {
    chord = chordProgression["Bb4_major"];
  } else if (y < (3 * innerHeight) / 7) {
    chord = chordProgression["Ab4_major"];
  } else if (y < (4 * innerHeight) / 7) {
    chord = chordProgression["G4_minor"];
  } else if (y < (5 * innerHeight) / 7) {
    chord = chordProgression["F4_minor"];
  } else if (y < (6 * innerHeight) / 7) {
    chord = chordProgression["G4_minor"];
  } else {
    chord = chordProgression["Eb4_major"];
  }

  // Play each note of the chord sequentially with a small delay
  chord.forEach((note, index) => {
    synth.triggerAttackRelease(note, 0.4, `+${index * 0.2}`);
  });
}

// Handle key press to start the sound for browsers that require user interaction
function keyPressed() {
  if (Tone.context.state !== "running") {
    Tone.context.resume(); // Resume the audio context
  }
}
