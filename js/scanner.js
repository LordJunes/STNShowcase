const Scanner = {
  worker: null,
  isScanning: false,
  CONFIDENCE_THRESHOLD: 85,

  async initWorker(onProgress) {
    if (!this.worker) {
      if (typeof Tesseract === "undefined") {
        throw new Error("Tesseract.js library not loaded.");
      }
      this.worker = await Tesseract.createWorker("eng", 1, {
        logger: m => {
          if (m.status === "recognizing text" && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        }
      });
      await this.worker.setParameters({
        tessedit_char_whitelist: "0123456789LVLMAXlvlmax ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
      });
    }
  },

  preprocessImage(img) {
    const canvas = document.createElement("canvas");
    const cropW = img.width;
    const cropH = Math.round(img.height * 0.88);
    const scale = 2.5;

    canvas.width = cropW * scale;
    canvas.height = cropH * scale;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, cropW, cropH, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const contrast = 1.35;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      const adjusted = Math.min(255, Math.max(0, factor * (v - 128) + 128));
      d[i] = adjusted;
      d[i + 1] = adjusted;
      d[i + 2] = adjusted;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  },

  cleanText(str) {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  },

  levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  },

  matchToken(candidate, target) {
    const c = this.cleanText(candidate);
    const t = this.cleanText(target);
    if (!c || !t) return { matched: false, exact: false };

    if (c === t) return { matched: true, exact: true };
    if (c.includes(t)) return { matched: true, exact: true };

    const maxDist = t.length <= 4 ? 1 : 2;
    if (Math.abs(c.length - t.length) <= maxDist) {
      if (this.levenshtein(c, t) <= maxDist) {
        return { matched: true, exact: false };
      }
    }

    return { matched: false, exact: false };
  },

  findLevelInCorridor(words, itemBox, itemDef, exactNameMatch) {
    const corridorLeft = itemBox.x0 - 45;
    const corridorRight = itemBox.x1 + 45;
    const corridorTop = itemBox.y1 - 10;
    const corridorBottom = itemBox.y1 + 110;

    const candidates = words.filter(w => {
      const isBelow = w.bbox.y0 >= corridorTop && w.bbox.y0 <= corridorBottom;
      const isInsideCorridor = w.bbox.x0 >= corridorLeft && w.bbox.x1 <= corridorRight;
      return isBelow && isInsideCorridor;
    });

    candidates.sort((a, b) => a.bbox.y0 - b.bbox.y0);

    for (const w of candidates) {
      const raw = w.text.toUpperCase().trim();

      if (raw.includes("MAX")) {
        const conf = Math.round(w.confidence);
        if (conf >= this.CONFIDENCE_THRESHOLD) {
          return { level: itemDef.max, isSure: true, confText: `I'm ${conf}% sure`, valid: true };
        }
        return { level: itemDef.max, isSure: false, confText: `Hard to read (${conf}%)`, valid: true };
      }

      const match = raw.match(/(?:LVL|LVI|IVL|LEVEL|L)?\s*([1-9]|10)\b/);
      if (match) {
        const parsed = Math.min(Math.max(parseInt(match[1], 10), 1), itemDef.max);
        const conf = Math.round(w.confidence);
        if (conf >= this.CONFIDENCE_THRESHOLD) {
          return { level: parsed, isSure: true, confText: `I'm ${conf}% sure`, valid: true };
        }
        return { level: parsed, isSure: false, confText: `Hard to read (${conf}%)`, valid: true };
      }
    }

    if (!exactNameMatch) {
      return { level: 1, isSure: false, confText: "Hard to read", valid: false };
    }

    return { level: 1, isSure: false, confText: "Hard to read", valid: true };
  },

  parseResults(data) {
    const words = data.words || [];
    const found = [];
    const matchedItems = new Set();

    const sortedItems = [...ITEMS].sort((a, b) => b.name.length - a.name.length);

    sortedItems.forEach(it => {
      const targetParts = it.name.split(" ");
      let itemBox = null;
      let exactNameMatch = false;

      if (targetParts.length > 1) {
        for (let i = 0; i < words.length - (targetParts.length - 1); i++) {
          const sliceText = words.slice(i, i + targetParts.length).map(w => w.text).join(" ");
          const matchRes = this.matchToken(sliceText, it.name);
          if (matchRes.matched) {
            const matchedSlice = words.slice(i, i + targetParts.length);
            itemBox = {
              x0: Math.min(...matchedSlice.map(w => w.bbox.x0)),
              y0: Math.min(...matchedSlice.map(w => w.bbox.y0)),
              x1: Math.max(...matchedSlice.map(w => w.bbox.x1)),
              y1: Math.max(...matchedSlice.map(w => w.bbox.y1))
            };
            exactNameMatch = matchRes.exact;
            break;
          }
        }
      }

      if (!itemBox) {
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          const matchRes = this.matchToken(w.text, it.name);
          if (matchRes.matched) {
            itemBox = { ...w.bbox };
            exactNameMatch = matchRes.exact;
            break;
          }
        }
      }

      if (itemBox && !matchedItems.has(it.name)) {
        const levelData = this.findLevelInCorridor(words, itemBox, it, exactNameMatch);

        if (levelData.valid) {
          matchedItems.add(it.name);
          found.push({
            item: it,
            level: levelData.level,
            isSure: levelData.isSure,
            confText: levelData.confText,
            selected: true
          });
        }
      }
    });

    return found;
  },

  async scanImageElement(imgElement, onProgress) {
    await this.initWorker(onProgress);
    const processedCanvas = this.preprocessImage(imgElement);
    const { data } = await this.worker.recognize(processedCanvas);
    return this.parseResults(data);
  }
};

const ScannerUI = {
  currentResults: [],

  init() {
    this.modal = document.getElementById("scannerModal");
    this.dropZone = document.getElementById("scannerDropZone");
    this.fileInput = document.getElementById("scannerFileInput");
    this.progressBox = document.getElementById("scannerProgress");
    this.resultsBox = document.getElementById("scannerResults");
    this.resultsList = document.getElementById("scannerResultsList");

    if (!this.modal) return;

    document.getElementById("btnOpenScanner").onclick = () => this.open();
    document.getElementById("btnCloseScanner").onclick = () => this.close();
    document.getElementById("btnApplyScan").onclick = () => this.applyResults();

    this.dropZone.onclick = () => this.fileInput.click();
    this.fileInput.onchange = e => {
      if (e.target.files[0]) this.handleFile(e.target.files[0]);
    };

    this.dropZone.ondragover = e => { e.preventDefault(); this.dropZone.classList.add("dragover"); };
    this.dropZone.ondragleave = () => this.dropZone.classList.remove("dragover");
    this.dropZone.ondrop = e => {
      e.preventDefault();
      this.dropZone.classList.remove("dragover");
      if (e.dataTransfer.files[0]) this.handleFile(e.dataTransfer.files[0]);
    };

    window.addEventListener("paste", e => {
      const activeTab = document.querySelector(".tab-btn.active")?.dataset.tab;
      if (activeTab !== "inventoryTab") return;

      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let item of items) {
        if (item.type.indexOf("image") !== -1) {
          this.open();
          this.handleFile(item.getAsFile());
          break;
        }
      }
    });

    const btnPc = document.getElementById("btnExamplePc");
    if (btnPc) btnPc.onclick = () => this.loadExampleImage("images/example_pc.png");

    const btnMobile = document.getElementById("btnExampleMobile");
    if (btnMobile) btnMobile.onclick = () => this.loadExampleImage("images/example_mobile.png");
  },

  open() {
    this.modal.style.display = "flex";
    this.resetState();
  },

  close() {
    this.modal.style.display = "none";
  },

  resetState() {
    this.progressBox.style.display = "none";
    this.resultsBox.style.display = "none";
    this.dropZone.style.display = "block";
    this.fileInput.value = "";
    this.currentResults = [];
  },

  loadExampleImage(src) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => this.processImage(img);
    img.onerror = () => alert(`Could not load ${src}. Make sure it is placed inside your images/ folder!`);
    img.src = src;
  },

  handleFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => this.processImage(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  async processImage(img) {
    this.dropZone.style.display = "none";
    this.progressBox.style.display = "block";
    this.resultsBox.style.display = "none";

    const progressBar = document.getElementById("scannerProgressBar");
    const progressText = document.getElementById("scannerProgressText");
    progressBar.style.width = "10%";
    progressText.textContent = "Preprocessing image & auto-cropping...";

    try {
      const results = await Scanner.scanImageElement(img, pct => {
        progressBar.style.width = `${Math.max(pct, 15)}%`;
        progressText.textContent = `Analyzing text with OCR... ${pct}%`;
      });

      this.currentResults = results;
      this.displayResults();
    } catch (err) {
      alert("Error scanning image: " + err.message);
      this.resetState();
    }
  },

  displayResults() {
    this.progressBox.style.display = "none";
    this.resultsBox.style.display = "block";
    this.resultsList.innerHTML = "";

    const countHeader = document.getElementById("scannerFoundCount");
    countHeader.textContent = `${this.currentResults.length} unit(s) detected`;

    if (this.currentResults.length === 0) {
      this.resultsList.innerHTML = `
        <div style="text-align:center; padding:30px; color:#94a3b8;">
          No in-game units recognized. Make sure your inventory is open and clearly visible.
        </div>
      `;
      document.getElementById("btnApplyScan").disabled = true;
      return;
    }

    document.getElementById("btnApplyScan").disabled = false;

    this.currentResults.forEach(res => {
      const row = document.createElement("div");
      row.className = "scan-row";

      let lvlOptions = "";
      for (let l = 1; l <= res.item.max; l++) {
        lvlOptions += `<option value="${l}" ${res.level === l ? 'selected' : ''}>Lvl ${l} / ${res.item.max}${l === res.item.max ? ' (MAX)' : ''}</option>`;
      }

      row.innerHTML = `
        <input type="checkbox" class="scan-checkbox" ${res.selected ? 'checked' : ''}>
        <div class="scan-thumb">
          <img src="${res.item.img}" alt="" onerror="this.style.display='none'">
        </div>
        <div class="scan-info">
          <span class="scan-name" style="color:${res.item.hex};">${res.item.name}</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="scan-role">[${res.item.role}]</span>
            <span class="scan-conf ${res.isSure ? 'conf-sure' : 'conf-warn'}">${res.confText}</span>
          </div>
        </div>
        <select class="scan-lvl-select">${lvlOptions}</select>
      `;

      row.querySelector(".scan-checkbox").onchange = e => {
        res.selected = e.target.checked;
      };

      row.querySelector(".scan-lvl-select").onchange = e => {
        res.level = parseInt(e.target.value, 10);
      };

      this.resultsList.appendChild(row);
    });
  },

  applyResults() {
    let appliedCount = 0;
    this.currentResults.forEach(res => {
      if (res.selected) {
        userInventory[res.item.name].owned = true;
        userInventory[res.item.name].lvl = res.level;
        appliedCount++;
      }
    });

    StorageManager.saveInventory(userInventory);
    InventoryUI.render();
    this.close();

    const banner = document.getElementById("invCharBadge");
    if (banner) {
      banner.innerHTML = `<span class="char-badge char-ok">Successfully updated ${appliedCount} unit(s) from screenshot!</span>`;
      setTimeout(() => InventoryUI.updateUI(), 4000);
    }
  }
};