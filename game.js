/**
 * CodingJr Semantrix — Interactive Local Game Engine & Automation Runtime
 * Powered by Datamuse API (https://api.datamuse.com/words?ml=...)
 */

// Default Word Bank
const DEFAULT_WORDS = [
  "Apple", "Arcade", "Astronaut", "Atom", "Avocado", "Baby", "Bacon", "Banana",
  "Baseball", "Battery", "Beach", "Bear", "Bicycle", "Biology", "Bird", "Boat",
  "Book", "Brain", "Bread", "Breakfast", "Building", "Business", "Cake", "Camera",
  "Candy", "Car", "Cartoon", "Castle", "Cat", "Cell", "Chair", "Cheese", "Chemistry",
  "Chess", "Chicken", "Child", "Circus", "City", "Clock", "Cloud", "Coffee", "Color",
  "Computer", "Cooking", "Crown", "Dawn", "Day", "Dentist", "Dessert", "Dinner",
  "Dinosaur", "Doctor", "Dog", "Donut", "Dragon", "Dream", "Drink", "Earth", "Ecology",
  "Education", "Egg", "Electricity", "Elephant", "Email", "Energy", "Engine", "Falcon",
  "Family", "Farm", "Festival", "Film", "Fire", "Fireworks", "Fish", "Flower", "Food",
  "Forest", "Fruit", "Future", "Galaxy", "Game", "Garden", "Gasoline", "Ghost", "Glass",
  "Guitar", "Hamburger", "Happiness", "Heart", "Helicopter", "History", "Honey", "Horse",
  "Hospital", "Hotel", "House", "Human", "Ice", "Ice cream", "Insect", "Internet", "Island",
  "Jazz", "Jungle", "King", "Kitten", "Knight", "Lake", "Language", "Lantern", "Laptop",
  "Laser", "Leaves", "Lemon", "Liberty", "Library", "Light", "Lightning", "Lion", "Love",
  "Lunch", "Magic", "Mammal", "Map", "Mars", "Mathematics", "Medicine", "Memory", "Microscope",
  "Milk", "Mind", "Mining", "Monday", "Moon", "Mountain", "Museum", "Music", "Nature",
  "Navigation", "Night", "Novel", "Ocean", "Office", "Orange", "Orbit", "Orchestra", "Origami",
  "Painting", "Paper", "Park", "Pasta", "Peace", "Pen", "Pencil", "Pharmacy", "Philosophy",
  "Photography", "Physics", "Piano", "Pilot", "Pirate", "Planet", "Plant", "Plastic", "Poem",
  "Police", "Pond", "Potato", "Puppy", "Puzzle", "Pyramid", "Queen", "Radar", "Radio", "Rain",
  "Rainbow", "Reptile", "Rescue", "Research", "Rice", "Road", "Robot", "Rock", "Rocket", "Sailor",
  "Salt", "Sand", "Sandwich", "Satellite", "Saturn", "School", "Science", "Scissors", "Sculpture",
  "Sea", "Shark", "Ship", "Shoe", "Sky", "Sleep", "Snow", "Software", "Solar energy", "Song",
  "Space", "Speed of light", "Spider", "Sports", "Spring", "Stadium", "Star", "Star Wars",
  "Steel", "Stone", "Strawberry", "Submarine", "Summer", "Sun", "Sunshine", "Sword", "Symphony",
  "Table", "Teacher", "Technology", "Telephone", "Telescope", "Television", "Temple", "Tennis",
  "Thought", "Thunder", "Time", "Titanic", "Tomato", "Toothbrush", "Tornado", "Tower", "Train",
  "Tree", "Triangle", "Truth", "Tunnel", "Turtle", "Umbrella", "Unicorn", "Universe", "Vacation",
  "Vegetable", "Video game", "Violin", "Virus", "Volcano", "Water", "Waterfall", "Wave", "Weather",
  "Website", "Wheat", "Wheel", "Wildlife", "Wind", "Winter", "Wolf", "Wood", "World", "Writing",
  "Yellow", "Yoga", "Youth", "Zebras", "Zero", "Zombie", "Zoology"
];

// Audio FX synthesizer (Web Audio API)
class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio FX error", e);
    }
  }

  match() {
    this.playTone(587.33, 'triangle', 0.1, 0.15); // D5
    setTimeout(() => this.playTone(880, 'triangle', 0.2, 0.15), 80); // A5
  }

  clear() {
    this.playTone(523.25, 'sine', 0.08, 0.12);
    setTimeout(() => this.playTone(659.25, 'sine', 0.08, 0.12), 60);
    setTimeout(() => this.playTone(783.99, 'sine', 0.15, 0.12), 120);
    setTimeout(() => this.playTone(1046.50, 'sine', 0.25, 0.15), 180);
  }

  combo() {
    this.playTone(440, 'triangle', 0.08, 0.15);
    setTimeout(() => this.playTone(554.37, 'triangle', 0.08, 0.15), 70);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.2, 0.15), 140);
  }

  blast() {
    this.playTone(160, 'sawtooth', 0.22, 0.22);
    setTimeout(() => this.playTone(85, 'triangle', 0.3, 0.25), 30);
    setTimeout(() => this.playTone(580, 'sine', 0.12, 0.12), 60);
  }

  cascade() {
    this.playTone(392, 'sine', 0.08, 0.08); // G4
    setTimeout(() => this.playTone(523.25, 'sine', 0.08, 0.08), 50); // C5
  }

  error() {
    this.playTone(220, 'sawtooth', 0.2, 0.1);
  }
}

const sfx = new SoundFX();

// Hardware-accelerated Canvas Particle Explosion Engine
class ParticleEngine {
  constructor() {
    this.canvases = new Map();
    this.particles = [];
    this.animating = false;
    this.colorMap = {
      "block-blue": ["#60a5fa", "#3b82f6", "#93c5fd", "#2563eb", "#dbeafe"],
      "block-yellow": ["#fde047", "#facc15", "#eab308", "#ca8a04", "#fef08a"],
      "block-purple": ["#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#f3e8ff"],
      "block-teal": ["#2dd4bf", "#14b8a6", "#0d9488", "#0f766e", "#ccfbf1"],
      "block-rose": ["#fb7185", "#f43f5e", "#e11d48", "#be123c", "#ffe4e6"],
      "arcade": ["#3b82f6", "#60a5fa", "#facc15", "#f43f5e", "#10b981", "#a855f7"]
    };
    window.addEventListener("resize", () => this.resizeAll());
  }

  getCanvas(canvasId) {
    if (!this.canvases.has(canvasId)) {
      const el = document.getElementById(canvasId);
      if (el) {
        this.canvases.set(canvasId, { el, ctx: el.getContext("2d") });
      }
    }
    return this.canvases.get(canvasId);
  }

  resizeAll() {
    ["blocks-blast-canvas", "arcade-blast-canvas"].forEach(id => {
      const entry = this.getCanvas(id);
      if (entry && entry.el && entry.el.parentElement) {
        const rect = entry.el.parentElement.getBoundingClientRect();
        entry.el.width = rect.width;
        entry.el.height = rect.height;
      }
    });
  }

  spawnBlast(rect, colorClass = "arcade", count = 24, canvasId = "blocks-blast-canvas") {
    this.resizeAll();
    const entry = this.getCanvas(canvasId);
    if (!entry || !entry.ctx || !entry.el) return;

    const parentRect = entry.el.getBoundingClientRect();
    const cx = rect.left - parentRect.left + rect.width / 2;
    const cy = rect.top - parentRect.top + rect.height / 2;

    const palette = this.colorMap[colorClass] || this.colorMap["arcade"];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = Math.random() * 8 + 3.5;
      const size = Math.random() * 9 + 4;
      const color = palette[Math.floor(Math.random() * palette.length)];

      this.particles.push({
        canvasId,
        x: cx + (Math.random() - 0.5) * (rect.width * 0.4),
        y: cy + (Math.random() - 0.5) * (rect.height * 0.4),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2.5,
        size,
        color,
        alpha: 1.0,
        decay: Math.random() * 0.025 + 0.02,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.4,
        gravity: 0.32,
        drag: 0.96,
        shape: Math.random() > 0.4 ? "shard" : "rect"
      });
    }

    if (!this.animating) {
      this.animating = true;
      requestAnimationFrame(() => this.loop());
    }
  }

  loop() {
    // Clear active canvases
    ["blocks-blast-canvas", "arcade-blast-canvas"].forEach(id => {
      const entry = this.getCanvas(id);
      if (entry && entry.ctx) {
        entry.ctx.clearRect(0, 0, entry.el.width, entry.el.height);
      }
    });

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rot += p.vRot;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      const entry = this.getCanvas(p.canvasId);
      if (!entry || !entry.ctx) continue;
      const ctx = entry.ctx;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === "shard") {
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.85, p.size * 0.85);
        ctx.lineTo(-p.size * 0.85, p.size * 0.85);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      ["blocks-blast-canvas", "arcade-blast-canvas"].forEach(id => {
        const entry = this.getCanvas(id);
        if (entry && entry.ctx) {
          entry.ctx.clearRect(0, 0, entry.el.width, entry.el.height);
        }
      });
      this.animating = false;
    }
  }
}

const particleEngine = new ParticleEngine();

// Extended domain conceptual clusters for deep word association
const DOMAIN_CLUSTERS = [
  ["triangle", "trigon", "trilateral", "triangular", "equilateral", "scalene", "isosceles", "hypotenuse", "polygon", "pyramid", "delta", "angle", "geometry", "shape", "square", "rectangle", "circle", "tetrahedron", "math", "mathematics", "trio", "triplet", "triad"],
  ["space", "rocket", "astronaut", "satellite", "orbit", "planet", "galaxy", "star", "telescope", "moon", "mars", "earth", "alien", "astronomy", "cosmos", "universe", "speed of light"],
  ["sea", "ocean", "water", "waterfall", "wave", "beach", "submarine", "ship", "boat", "fish", "shark", "sailor", "pond", "island"],
  ["food", "cake", "bread", "cheese", "apple", "banana", "lemon", "orange", "breakfast", "dinner", "lunch", "sandwich", "dessert", "donut", "egg", "pasta", "potato", "rice", "strawberry", "tomato", "coffee"],
  ["animal", "bear", "bird", "cat", "chicken", "dog", "elephant", "falcon", "horse", "insect", "kitten", "lion", "mammal", "puppy", "reptile", "spider", "turtle", "wolf", "zebra", "zoology"],
  ["weather", "cloud", "rain", "rainbow", "snow", "thunder", "lightning", "storm", "wind", "winter", "summer", "sun", "sunshine", "tornado", "volcano"],
  ["tech", "computer", "laptop", "software", "internet", "website", "email", "robot", "laser", "radar", "radio", "telephone", "television", "technology", "video game"],
  ["music", "song", "guitar", "piano", "violin", "orchestra", "symphony", "jazz", "band"],
  ["circus", "clown", "acrobat", "juggler", "carnival", "tent", "magic", "show", "performance", "lion", "elephant"],
  ["navigation", "map", "compass", "gps", "direction", "travel", "journey", "pilot", "sailor", "road", "route"]
];

// Bidirectional Datamuse API Cache & Semantic Calculator
class DatamuseEngine {
  constructor() {
    this.cache = new Map();
  }

  async getSimilarWords(term) {
    const cleanTerm = term.trim().toLowerCase();
    if (this.cache.has(cleanTerm)) {
      return this.cache.get(cleanTerm);
    }

    try {
      const res = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(cleanTerm)}&max=100`);
      if (!res.ok) {
        this.cache.set(cleanTerm, []);
        return [];
      }
      const data = await res.json();
      this.cache.set(cleanTerm, data);
      return data;
    } catch (err) {
      console.warn("Datamuse fetch notice:", err);
      return [];
    }
  }

  preloadCandidates(candidates) {
    candidates.forEach(w => {
      if (w) {
        const clean = w.trim().toLowerCase();
        if (!this.cache.has(clean)) {
          this.getSimilarWords(clean);
        }
      }
    });
  }

  async scoreWords(clue, candidates) {
    const cleanClue = clue.trim().toLowerCase();
    const scoredList = [];
    
    // 1. Forward lookup: words similar to clue
    const forwardRelated = await this.getSimilarWords(cleanClue);
    const forwardMap = new Map();
    if (Array.isArray(forwardRelated)) {
      forwardRelated.forEach((item, idx) => {
        const w = item.word.toLowerCase();
        forwardMap.set(w, Math.max(0.4, 1.0 - (idx / forwardRelated.length) * 0.6));
      });
    }

    // 2. Reverse lookup for all candidates (Bidirectional)
    const reversePromises = candidates.map(c => this.getSimilarWords(c.toLowerCase()));
    const reverseResults = await Promise.all(reversePromises);

    // 3. Score each candidate
    candidates.forEach((cand, i) => {
      const cleanCand = cand.trim().toLowerCase();
      let score = 0;

      if (cleanCand === cleanClue) {
        score = 1.0;
      }

      // Check Forward: is candidate in related(clue)?
      if (forwardMap.has(cleanCand)) {
        score = Math.max(score, forwardMap.get(cleanCand));
      }

      // Check Reverse (Bidirectional): is clue in related(candidate)?
      const candRel = reverseResults[i];
      if (Array.isArray(candRel)) {
        const matchIdx = candRel.findIndex(item => item.word.toLowerCase() === cleanClue);
        if (matchIdx !== -1) {
          const revScore = Math.max(0.45, 1.0 - (matchIdx / candRel.length) * 0.55);
          score = Math.max(score, revScore);
        }
      }

      // Check substring / stem relations (e.g. triangle / triangular, space / spaceship)
      if (cleanCand.includes(cleanClue) || cleanClue.includes(cleanCand)) {
        score = Math.max(score, 0.88);
      }

      // Check Domain Conceptual Clusters
      const inSameCluster = DOMAIN_CLUSTERS.some(cluster => cluster.includes(cleanClue) && cluster.includes(cleanCand));
      if (inSameCluster) {
        score = Math.max(score, 0.82);
      }

      if (score === 0) {
        score = this.stringSimilarity(cleanClue, cleanCand);
      }

      scoredList.push({ word: cand, score });
    });

    scoredList.sort((a, b) => b.score - a.score);
    return scoredList;
  }

  stringSimilarity(s1, s2) {
    const set1 = new Set();
    const set2 = new Set();
    for (let i = 0; i < s1.length - 1; i++) set1.add(s1.slice(i, i + 2));
    for (let i = 0; i < s2.length - 1; i++) set2.add(s2.slice(i, i + 2));
    
    let intersection = 0;
    for (const bg of set1) {
      if (set2.has(bg)) intersection++;
    }
    const union = set1.size + set2.size - intersection;
    return union === 0 ? 0 : (intersection / union) * 0.4;
  }
}

const datamuse = new DatamuseEngine();

// ================= ARCADE MODE =================
class ArcadeGame {
  constructor() {
    this.state = "1"; // 1: READY, 2: PLAYING, 3: ENDED
    this.points = 0;
    this.streak = 1;
    this.level = 1;
    this.words = [];
    this.targetLines = [];
    this.spawnTimer = null;
    this.maxVisible = 10;
  }

  start() {
    this.state = "2";
    this.points = 0;
    this.streak = 1;
    this.level = 1;
    this.words = [];
    this.targetLines = [];
    this.updateStats();

    // Initial words stack (6 words)
    const shuffled = [...DEFAULT_WORDS].sort(() => 0.5 - Math.random());
    for (let i = 0; i < 6; i++) {
      this.words.push(shuffled[i]);
    }
    this.selectTargets();
    this.render();
    datamuse.preloadCandidates(this.words);

    if (this.spawnTimer) clearInterval(this.spawnTimer);
    this.spawnTimer = setInterval(() => {
      if (this.state === "2") {
        this.spawnWord();
      }
    }, Math.max(3000, 6000 - this.level * 400));
  }

  selectTargets() {
    if (this.words.length === 0) return;
    const numTargets = Math.min(2, this.words.length);
    this.targetLines = [];
    for (let i = 0; i < numTargets; i++) {
      this.targetLines.push(this.words[i]);
    }
    
    const targetLabel = document.getElementById("arcade-target-label");
    if (targetLabel) targetLabel.textContent = this.targetLines.join(", ");
  }

  spawnWord() {
    if (this.words.length >= this.maxVisible) {
      this.gameOver();
      return;
    }
    const available = DEFAULT_WORDS.filter(w => !this.words.includes(w));
    const next = available[Math.floor(Math.random() * available.length)] || "Code";
    this.words.push(next);
    this.selectTargets();
    this.render();
    datamuse.preloadCandidates(this.words);
  }

  async userSubmit(clue) {
    if (!clue || this.words.length === 0) return;

    const cleanClue = clue.trim();
    if (cleanClue.length === 0) return;

    // Score words using bidirectional Datamuse API
    const scored = await datamuse.scoreWords(cleanClue, this.words);
    const best = scored[0];

    if (best && best.score >= 0.3) {
      sfx.match();
      
      const index = this.words.indexOf(best.word);
      const isTarget = this.targetLines.includes(best.word);

      if (index !== -1) {
        // Trigger blast animation on the tile
        const container = document.getElementById("arcade-word-stack");
        if (container && container.children[index]) {
          const tileEl = container.children[index];
          tileEl.classList.add("word-blasting");
          particleEngine.spawnBlast(tileEl.getBoundingClientRect(), isTarget ? "block-rose" : "arcade", 26, "arcade-blast-canvas");
        }

        sfx.blast();
        this.showFloatingScore(index, isTarget ? 2 : 1);

        const earned = Math.round(best.score * 1000 * this.streak * (isTarget ? 2 : 1));
        this.points += earned;
        this.streak = Math.min(10, this.streak + 1);

        if (this.points > this.level * 3000) {
          this.level++;
          sfx.combo();
        }

        // Wait brief blast interval before removing from stack
        await new Promise(r => setTimeout(r, 220));

        this.words.splice(index, 1);
        
        // Auto-replenish if word count drops below 4
        if (this.words.length < 4) {
          this.spawnWord();
        }

        this.selectTargets();
        this.updateStats();
        this.render();
        sfx.clear();
      }
    } else {
      this.streak = 1;
      this.updateStats();
      sfx.error();
    }
  }

  showFloatingScore(index, multiplier) {
    const scoreContainer = document.getElementById("arcade-floating-score");
    const container = document.getElementById("arcade-word-stack");
    if (!scoreContainer || !container || !container.children[index]) return;

    const tileEl = container.children[index];
    const gridRect = scoreContainer.parentElement.getBoundingClientRect();
    const tileRect = tileEl.getBoundingClientRect();
    const x = tileRect.left - gridRect.left + tileRect.width / 2;
    const y = tileRect.top - gridRect.top + tileRect.height / 2;

    const pill = document.createElement("div");
    pill.className = "floating-score-pill";
    pill.style.left = `${x}px`;
    pill.style.top = `${y}px`;
    pill.textContent = `+${Math.round(1000 * multiplier)}`;
    scoreContainer.appendChild(pill);

    setTimeout(() => pill.remove(), 1200);
  }

  updateStats() {
    const elScore = document.getElementById("arcade-score");
    const elStreak = document.getElementById("arcade-streak");
    const elLevel = document.getElementById("arcade-level");
    if (elScore) elScore.textContent = this.points;
    if (elStreak) elStreak.textContent = `x${this.streak}`;
    if (elLevel) elLevel.textContent = this.level;
  }

  render() {
    const container = document.getElementById("arcade-word-stack");
    if (!container) return;
    container.innerHTML = "";

    this.words.forEach((word) => {
      const isTarget = this.targetLines.includes(word);
      const tile = document.createElement("div");
      tile.className = `word-tile ${isTarget ? "target-tile" : ""}`;
      tile.innerHTML = `
        <span>${word}</span>
        <span class="rank-badge ${isTarget ? "target-badge" : ""}">${isTarget ? "TARGET" : "WORD"}</span>
      `;
      container.appendChild(tile);
    });
  }

  gameOver() {
    this.state = "3";
    clearInterval(this.spawnTimer);
    sfx.error();
    alert(`Game Over! Final Score: ${this.points}`);
  }

  stop() {
    this.state = "1";
    if (this.spawnTimer) clearInterval(this.spawnTimer);
  }
}

// ================= BLOCKS MODE =================
class BlocksGame {
  constructor() {
    this.score = 0;
    this.cleared = 0;
    this.grid = [];
    this.colors = ["block-blue", "block-yellow", "block-purple", "block-teal", "block-rose"];
    this.rows = 6;
    this.cols = 5;
    this.isBlasting = false;
  }

  start() {
    this.score = 0;
    this.cleared = 0;
    this.isBlasting = false;
    this.updateStats();
    this.initGrid();
    this.render();
    particleEngine.resizeAll();
  }

  initGrid() {
    this.grid = [];
    const pool = [...DEFAULT_WORDS].sort(() => 0.5 - Math.random());
    let poolIdx = 0;
    const allWords = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        const w = pool[poolIdx % pool.length];
        allWords.push(w);
        row.push({
          word: w,
          color: this.colors[Math.floor(Math.random() * this.colors.length)]
        });
        poolIdx++;
      }
      this.grid.push(row);
    }
    datamuse.preloadCandidates(allWords);
  }

  updateStats() {
    const elScore = document.getElementById("blocks-score");
    const elCleared = document.getElementById("blocks-cleared");
    if (elScore) elScore.textContent = this.score;
    if (elCleared) elCleared.textContent = this.cleared;
  }

  // 4-Way Orthogonal Connected Group Search (BFS / Flood Fill)
  // Only connects Up, Down, Left, Right — NOT diagonal!
  getConnectedGroup(startR, startC, targetColor) {
    if (startR < 0 || startR >= this.rows || startC < 0 || startC >= this.cols) return [];
    if (!this.grid[startR][startC] || this.grid[startR][startC].color !== targetColor) return [];

    const visited = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
    const group = [];
    const queue = [[startR, startC]];
    visited[startR][startC] = true;

    while (queue.length > 0) {
      const [r, c] = queue.shift();
      group.push({ r, c });

      // 4 directions only (Up, Down, Left, Right - NO diagonal)
      const neighbors = [
        [r - 1, c], // Up
        [r + 1, c], // Down
        [r, c - 1], // Left
        [r, c + 1]  // Right
      ];

      for (const [nr, nc] of neighbors) {
        if (
          nr >= 0 && nr < this.rows &&
          nc >= 0 && nc < this.cols &&
          !visited[nr][nc] &&
          this.grid[nr][nc] &&
          this.grid[nr][nc].color === targetColor
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
    return group;
  }

  async userSubmit(clue) {
    if (!clue || this.isBlasting) return;
    const cleanClue = clue.trim();
    if (cleanClue.length === 0) return;

    const flatCells = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) {
          flatCells.push({ r, c, cell: this.grid[r][c], word: this.grid[r][c].word });
        }
      }
    }

    if (flatCells.length === 0) return;

    const scored = await datamuse.scoreWords(cleanClue, flatCells.map(fc => fc.word));
    const topScored = scored[0];

    if (topScored && topScored.score >= 0.3) {
      sfx.match();
      const matchCellObj = flatCells.find(fc => fc.word.toLowerCase() === topScored.word.toLowerCase());
      if (matchCellObj) {
        await this.explodeConnected(matchCellObj.r, matchCellObj.c);
      }
    } else {
      sfx.error();
    }
  }

  async explodeConnected(startR, startC) {
    const targetCell = this.grid[startR][startC];
    if (!targetCell) return;
    const targetColor = targetCell.color;

    // Get strictly 4-way orthogonal connected cells of the same color
    const connected = this.getConnectedGroup(startR, startC, targetColor);
    if (connected.length === 0) return;

    this.isBlasting = true;
    sfx.blast();

    // Trigger visual blast animations on DOM elements
    const gridContainer = document.getElementById("blocks-grid");
    if (gridContainer) {
      gridContainer.classList.add("grid-shake");
      setTimeout(() => gridContainer.classList.remove("grid-shake"), 360);
    }

    // Spawn canvas particles and apply blasting CSS class
    connected.forEach(({ r, c }) => {
      const idx = r * this.cols + c;
      const cellEl = gridContainer ? gridContainer.children[idx] : null;
      if (cellEl) {
        cellEl.classList.add("block-blasting");
        particleEngine.spawnBlast(cellEl.getBoundingClientRect(), targetColor, 22, "blocks-blast-canvas");
      }
    });

    // Spawn floating score indicator
    this.showFloatingScore(startR, startC, connected.length);

    // Update score
    const earned = connected.length * 250 * (connected.length > 2 ? 2 : 1);
    this.score += earned;
    this.cleared += connected.length;
    this.updateStats();

    // Wait for blast particle animation
    await new Promise(resolve => setTimeout(resolve, 240));

    // Clear matching cells from data grid
    connected.forEach(({ r, c }) => {
      this.grid[r][c] = null;
    });

    // Apply Tetris-style column gravity drop and top refill
    this.applyGravityAndRefill();
    this.render(true);
    sfx.cascade();

    if (connected.length >= 3) {
      setTimeout(() => sfx.combo(), 150);
    }

    this.isBlasting = false;
  }

  // Tetris-style Column Cascading Gravity & Refill
  applyGravityAndRefill() {
    const pool = [...DEFAULT_WORDS].sort(() => 0.5 - Math.random());
    let poolIdx = 0;
    const newWords = [];

    for (let c = 0; c < this.cols; c++) {
      // 1. Collect all non-null blocks in this column from bottom to top
      const columnBlocks = [];
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r][c]) {
          columnBlocks.push(this.grid[r][c]);
        }
      }

      // 2. Place remaining blocks starting from bottom up
      let fillIdx = 0;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (fillIdx < columnBlocks.length) {
          this.grid[r][c] = columnBlocks[fillIdx];
          fillIdx++;
        } else {
          // 3. Refill the empty top rows with fresh random blocks
          const w = pool[poolIdx % pool.length];
          newWords.push(w);
          this.grid[r][c] = {
            word: w,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            isNew: true
          };
          poolIdx++;
        }
      }
    }
    datamuse.preloadCandidates(newWords);
  }

  showFloatingScore(r, c, count) {
    const scoreContainer = document.getElementById("blocks-floating-score");
    const gridContainer = document.getElementById("blocks-grid");
    if (!scoreContainer || !gridContainer) return;

    const idx = r * this.cols + c;
    const cellEl = gridContainer.children[idx];
    if (!cellEl) return;

    const gridRect = gridContainer.getBoundingClientRect();
    const cellRect = cellEl.getBoundingClientRect();
    const x = cellRect.left - gridRect.left + cellRect.width / 2;
    const y = cellRect.top - gridRect.top + cellRect.height / 2;

    const pill = document.createElement("div");
    pill.className = "floating-score-pill";
    pill.style.left = `${x}px`;
    pill.style.top = `${y}px`;
    const bonus = count >= 3 ? ` (${count}x COMBO!)` : "";
    pill.textContent = `+${count * 250 * (count > 2 ? 2 : 1)}${bonus}`;
    scoreContainer.appendChild(pill);

    setTimeout(() => pill.remove(), 1200);
  }

  render(withDropAnimation = false) {
    const container = document.getElementById("blocks-grid");
    if (!container) return;
    container.innerHTML = "";

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        const div = document.createElement("div");
        div.className = `block-cell ${cell ? cell.color : ""}`;
        if (cell && (cell.isNew || withDropAnimation)) {
          div.classList.add("block-dropping");
          delete cell.isNew;
        }
        div.textContent = cell ? cell.word : "";
        div.dataset.row = r;
        div.dataset.col = c;

        // Visual hover highlighting of connected group
        div.addEventListener("mouseenter", () => {
          if (!cell || this.isBlasting) return;
          const group = this.getConnectedGroup(r, c, cell.color);
          this.highlightGroup(group);
        });

        div.addEventListener("mouseleave", () => {
          this.clearHighlights();
        });

        // NOTE: Direct click to clear is disabled so students must type clues!

        container.appendChild(div);
      }
    }
  }

  highlightGroup(group) {
    const container = document.getElementById("blocks-grid");
    if (!container) return;
    this.clearHighlights();
    group.forEach(({ r, c }) => {
      const idx = r * this.cols + c;
      const cellEl = container.children[idx];
      if (cellEl) cellEl.classList.add("block-highlight");
    });
  }

  clearHighlights() {
    const container = document.getElementById("blocks-grid");
    if (!container) return;
    Array.from(container.children).forEach(el => el.classList.remove("block-highlight"));
  }

  stop() {
    this.clearHighlights();
  }
}

// Global Game instances & Selenium automation hook
const arcadeGame = new ArcadeGame();
const blocksGame = new BlocksGame();

window.game = {
  currentGame: arcadeGame
};

// ================= UI NAVIGATION & EVENT HANDLERS =================
document.addEventListener("DOMContentLoaded", () => {
  const viewHome = document.getElementById("view-home");
  const viewArcade = document.getElementById("view-arcade");
  const viewBlocks = document.getElementById("view-blocks");

  function showView(view) {
    [viewHome, viewArcade, viewBlocks].forEach(v => {
      if (v) {
        v.classList.remove("active");
        v.classList.add("hidden");
      }
    });
    if (view) {
      view.classList.remove("hidden");
      view.classList.add("active");
    }
    particleEngine.resizeAll();
  }

  // Play Arcade Button
  document.getElementById("btn-start-arcade")?.addEventListener("click", () => {
    showView(viewArcade);
    window.game.currentGame = arcadeGame;
    arcadeGame.start();
    document.getElementById("arcade-input")?.focus();
  });

  // Play Blocks Button
  document.getElementById("btn-start-blocks")?.addEventListener("click", () => {
    showView(viewBlocks);
    window.game.currentGame = blocksGame;
    blocksGame.start();
    document.getElementById("blocks-input")?.focus();
  });

  // Back to Home Buttons
  document.getElementById("btn-arcade-back")?.addEventListener("click", () => {
    arcadeGame.stop();
    showView(viewHome);
  });

  document.getElementById("btn-blocks-back")?.addEventListener("click", () => {
    blocksGame.stop();
    showView(viewHome);
  });

  // Arcade Input Submit
  document.getElementById("arcade-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("arcade-input");
    if (input && input.value) {
      arcadeGame.userSubmit(input.value);
      input.value = "";
    }
  });

  // Blocks Input Submit
  document.getElementById("blocks-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("blocks-input");
    if (input && input.value) {
      blocksGame.userSubmit(input.value);
      input.value = "";
    }
  });

  // Sound Toggle
  const btnSound = document.getElementById("btn-sound-toggle");
  const iconSoundOn = document.getElementById("icon-sound-on");
  const iconSoundOff = document.getElementById("icon-sound-off");
  btnSound?.addEventListener("click", () => {
    sfx.enabled = !sfx.enabled;
    if (sfx.enabled) {
      iconSoundOn?.classList.remove("hidden");
      iconSoundOff?.classList.add("hidden");
    } else {
      iconSoundOn?.classList.add("hidden");
      iconSoundOff?.classList.remove("hidden");
    }
  });

  // Contrast / Accessibility Toggle
  document.getElementById("btn-contrast-toggle")?.addEventListener("click", () => {
    document.body.classList.toggle("high-contrast");
  });

  // Modals Logic
  const modalDict = document.getElementById("modal-dict");
  const modalInfo = document.getElementById("modal-info");
  const modalPrivacy = document.getElementById("modal-privacy");

  document.getElementById("btn-dict")?.addEventListener("click", () => {
    modalDict?.classList.remove("hidden");
    lookupDatamuse("hello");
  });
  document.getElementById("btn-close-dict")?.addEventListener("click", () => modalDict?.classList.add("hidden"));

  // Open info modal from any info button
  document.querySelectorAll("#btn-info, .btn-header-info").forEach(btn => {
    btn.addEventListener("click", () => modalInfo?.classList.remove("hidden"));
  });
  document.getElementById("btn-close-info")?.addEventListener("click", () => modalInfo?.classList.add("hidden"));

  document.getElementById("btn-privacy")?.addEventListener("click", () => modalPrivacy?.classList.remove("hidden"));
  document.getElementById("btn-close-privacy")?.addEventListener("click", () => modalPrivacy?.classList.add("hidden"));

  [modalDict, modalInfo, modalPrivacy].forEach(m => {
    m?.addEventListener("click", (e) => {
      if (e.target === m) m.classList.add("hidden");
    });
  });

  async function lookupDatamuse(word) {
    const resultsContainer = document.getElementById("dict-results");
    if (!resultsContainer) return;
    resultsContainer.innerHTML = "<p>Searching Datamuse...</p>";

    try {
      const res = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=15&md=d`);
      const data = await res.json();
      if (!data || data.length === 0) {
        resultsContainer.innerHTML = `<p style="color:#ef4444;">No semantic matches found for "<strong>${word}</strong>".</p>`;
        return;
      }

      let html = `<h4><strong>${word}</strong> - Top Associated Words</h4><div style="margin-top:10px; display:flex; flex-wrap:wrap; gap:6px;">`;
      data.forEach(item => {
        html += `<span class="synonym-chip">${item.word}</span>`;
      });
      html += `</div>`;
      resultsContainer.innerHTML = html;
    } catch (e) {
      resultsContainer.innerHTML = `<p style="color:#ef4444;">Error fetching data: ${e.message}</p>`;
    }
  }

  document.getElementById("btn-dict-search")?.addEventListener("click", () => {
    const input = document.getElementById("dict-search-input");
    if (input && input.value) lookupDatamuse(input.value);
  });

  document.getElementById("dict-search-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const input = document.getElementById("dict-search-input");
      if (input && input.value) lookupDatamuse(input.value);
    }
  });
});
