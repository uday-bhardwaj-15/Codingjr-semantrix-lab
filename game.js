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

  error() {
    this.playTone(220, 'sawtooth', 0.2, 0.1);
  }
}

const sfx = new SoundFX();

// Datamuse API Cache & Semantic Calculator
class DatamuseEngine {
  constructor() {
    this.cache = new Map();
  }

  async getSimilarWords(clue) {
    const cleanClue = clue.trim().toLowerCase();
    if (this.cache.has(cleanClue)) {
      return this.cache.get(cleanClue);
    }

    try {
      const res = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(cleanClue)}&max=60`);
      if (!res.ok) {
        this.cache.set(cleanClue, []);
        return [];
      }
      const data = await res.json();
      this.cache.set(cleanClue, data);
      return data;
    } catch (err) {
      console.warn("Datamuse API fetch notice:", err);
      return [];
    }
  }

  async scoreWords(clue, candidates) {
    const cleanClue = clue.trim().toLowerCase();
    const scoredList = [];
    const related = await this.getSimilarWords(cleanClue);
    
    // Map related words by score
    const scoreMap = new Map();
    if (Array.isArray(related)) {
      related.forEach((item, idx) => {
        const w = item.word.toLowerCase();
        // Higher rank gets higher normalized score (1.0 down to 0.4)
        const sim = Math.max(0.4, 1.0 - (idx / related.length) * 0.6);
        scoreMap.set(w, sim);
      });
    }

    candidates.forEach(word => {
      const cleanWord = word.trim().toLowerCase();
      if (cleanWord === cleanClue) {
        scoredList.push({ word, score: 1.0 });
      } else if (scoreMap.has(cleanWord)) {
        scoredList.push({ word, score: scoreMap.get(cleanWord) });
      } else if (cleanWord.includes(cleanClue) || cleanClue.includes(cleanWord)) {
        scoredList.push({ word, score: 0.85 });
      } else {
        // Fallback string similarity
        scoredList.push({ word, score: this.stringSimilarity(cleanClue, cleanWord) });
      }
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
    this.words = ["Mind", "Atom", "Email", "Dinner", "Day", "Pond", "Magic", "Song", "Book"];
    this.targetLines = ["Mind", "Atom"];
    this.bannedPrefixes = [{ prefix: "min" }, { prefix: "ato" }];
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

    // Initial words stack
    const shuffled = [...DEFAULT_WORDS].sort(() => 0.5 - Math.random());
    for (let i = 0; i < 6; i++) {
      this.words.push(shuffled[i]);
    }
    this.selectTargets();
    this.render();

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
    this.bannedPrefixes = this.targetLines.map(t => ({ prefix: t.slice(0, 3).toLowerCase() }));
    
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
  }

  async userSubmit(clue, orig) {
    if (!clue || this.words.length === 0) return;

    const cleanClue = clue.trim();
    if (cleanClue.length === 0) return;

    // Check banned prefix
    for (const b of this.bannedPrefixes) {
      if (cleanClue.toLowerCase().startsWith(b.prefix)) {
        sfx.error();
        return;
      }
    }

    // Score words using Datamuse API
    const scored = await datamuse.scoreWords(cleanClue, this.words);
    const best = scored[0];

    if (best && best.score >= 0.3) {
      sfx.match();
      
      const index = this.words.indexOf(best.word);
      const isTarget = this.targetLines.includes(best.word);

      if (index !== -1) {
        this.words.splice(index, 1);
        const earned = Math.round(best.score * 1000 * this.streak * (isTarget ? 2 : 1));
        this.points += earned;
        this.streak = Math.min(10, this.streak + 1);

        if (this.points > this.level * 3000) {
          this.level++;
          sfx.combo();
        }

        sfx.clear();
        this.selectTargets();
        this.updateStats();
        this.render();
      }
    } else {
      this.streak = 1;
      this.updateStats();
      sfx.error();
    }
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
  }

  start() {
    this.score = 0;
    this.cleared = 0;
    this.updateStats();
    this.initGrid();
    this.render();
  }

  initGrid() {
    this.grid = [];
    const pool = [...DEFAULT_WORDS].sort(() => 0.5 - Math.random());
    let poolIdx = 0;
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        row.push({
          word: pool[poolIdx % pool.length],
          color: this.colors[Math.floor(Math.random() * this.colors.length)]
        });
        poolIdx++;
      }
      this.grid.push(row);
    }
  }

  updateStats() {
    const elScore = document.getElementById("blocks-score");
    const elCleared = document.getElementById("blocks-cleared");
    if (elScore) elScore.textContent = this.score;
    if (elCleared) elCleared.textContent = this.cleared;
  }

  async userSubmit(clue) {
    if (!clue) return;
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

    const scored = await datamuse.scoreWords(cleanClue, flatCells.map(fc => fc.word));
    const topScored = scored[0];

    if (topScored && topScored.score >= 0.3) {
      sfx.match();
      const matchCellObj = flatCells.find(fc => fc.word === topScored.word);
      if (matchCellObj) {
        const targetColor = matchCellObj.cell.color;
        let count = 0;

        for (let r = 0; r < this.rows; r++) {
          for (let c = 0; c < this.cols; c++) {
            if (this.grid[r][c] && this.grid[r][c].color === targetColor) {
              this.grid[r][c] = null;
              count++;
            }
          }
        }

        this.score += count * 250;
        this.cleared += count;
        this.refillGrid();
        this.updateStats();
        this.render();
        sfx.clear();
      }
    } else {
      sfx.error();
    }
  }

  refillGrid() {
    const pool = [...DEFAULT_WORDS].sort(() => 0.5 - Math.random());
    let poolIdx = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r][c]) {
          this.grid[r][c] = {
            word: pool[poolIdx % pool.length],
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
          };
          poolIdx++;
        }
      }
    }
  }

  render() {
    const container = document.getElementById("blocks-grid");
    if (!container) return;
    container.innerHTML = "";

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        const div = document.createElement("div");
        div.className = `block-cell ${cell ? cell.color : ""}`;
        div.textContent = cell ? cell.word : "";
        container.appendChild(div);
      }
    }
  }

  stop() {}
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
      arcadeGame.userSubmit(input.value, input.value);
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

  document.getElementById("btn-info")?.addEventListener("click", () => modalInfo?.classList.remove("hidden"));
  document.getElementById("btn-close-info")?.addEventListener("click", () => modalInfo?.classList.add("hidden"));

  document.getElementById("btn-privacy")?.addEventListener("click", () => modalPrivacy?.classList.remove("hidden"));
  document.getElementById("btn-close-privacy")?.addEventListener("click", () => modalPrivacy?.classList.add("hidden"));

  document.getElementById("btn-scroll-info")?.addEventListener("click", () => modalInfo?.classList.remove("hidden"));

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
