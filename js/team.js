const TeamUI = {
  loadouts: [],
  activeLoadoutIdx: 0,
  isVip: false,
  timer: null,

  init() {
    this.loadouts = StorageManager.loadLoadouts();
    this.isVip = StorageManager.loadVip();

    const teamHeadlineInput = document.getElementById("teamHeadline");
    const teamBannerInput = document.getElementById("teamBanner");
    const teamSubtitleInput = document.getElementById("teamSubtitle");
    const vipToggleBtn = document.getElementById("vipToggleBtn");

    const headlines = StorageManager.loadHeadlines();
    teamHeadlineInput.value = headlines.team;
    teamBannerInput.value = this.loadouts[this.activeLoadoutIdx].banner || "=== MY FIRST SETUP ===";
    teamSubtitleInput.value = this.loadouts[this.activeLoadoutIdx].subtitle || "";

    this.updateVipButton();
    this.initLoadoutButtons();

    vipToggleBtn.onclick = () => {
      this.isVip = !this.isVip;
      StorageManager.saveVip(this.isVip);
      this.updateVipButton();
      this.renderSlots();
    };

    teamHeadlineInput.oninput = () => {
      StorageManager.saveHeadlines(teamHeadlineInput.value, undefined, undefined, undefined);
      this.updateUI();
    };

    teamBannerInput.oninput = () => {
      this.loadouts[this.activeLoadoutIdx].banner = teamBannerInput.value;
      StorageManager.saveLoadouts(this.loadouts);
      this.updateUI();
    };

    teamSubtitleInput.oninput = () => {
      this.loadouts[this.activeLoadoutIdx].subtitle = teamSubtitleInput.value;
      StorageManager.saveLoadouts(this.loadouts);
      this.updateUI();
    };

    document.getElementById("teamCopyBtn").onclick = () => this.copyText();
    document.getElementById("teamCopyImgBtn").onclick = () => this.copyImage();
    document.getElementById("teamDownloadImgBtn").onclick = () => this.downloadImage();

    this.renderSlots();
  },

  initLoadoutButtons() {
    const btns = document.querySelectorAll(".loadout-tab-btn");
    btns.forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.loadout, 10);
        if (this.activeLoadoutIdx === idx) return;

        this.activeLoadoutIdx = idx;
        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.getElementById("teamBanner").value = this.loadouts[this.activeLoadoutIdx].banner || "";
        document.getElementById("teamSubtitle").value = this.loadouts[this.activeLoadoutIdx].subtitle || "";
        this.renderSlots();
      };
    });
  },

  updateVipButton() {
    const btn = document.getElementById("vipToggleBtn");
    btn.className = `status-toggle-btn ${this.isVip ? 'active' : 'inactive'}`;
    btn.textContent = this.isVip ? "⭐ VIP: 5 Slots" : "⭐ VIP: 4 Slots";
  },

  getCurrentSlots() {
    return this.loadouts[this.activeLoadoutIdx].slots;
  },

  renderSlots() {
    const container = document.getElementById("slotsContainer");
    container.innerHTML = "";
    const count = this.isVip ? 5 : 4;
    const currentSlots = this.getCurrentSlots();
    const inv = StorageManager.loadInventory();

    const equippedItems = [];
    for (let s = 0; s < count; s++) {
      if (currentSlots[s] && currentSlots[s].item) {
        equippedItems.push(currentSlots[s].item);
      }
    }

    for (let i = 0; i < count; i++) {
      const slot = currentSlots[i] || { item: null, role: "DAMAGE", lvl: 1 };
      const currentDef = slot.item ? ITEMS.find(x => x.name === slot.item) : null;
      const invState = currentDef ? inv[currentDef.name] : null;
      const isOwnedInInv = invState && invState.owned;
      const invMaxLvl = isOwnedInInv ? invState.lvl : 1;

      if (slot.item && isOwnedInInv && slot.lvl > invMaxLvl) {
        slot.lvl = invMaxLvl;
        StorageManager.saveLoadouts(this.loadouts);
      }

      const div = document.createElement("div");
      div.className = "slot-card";

      const label = document.createElement("span");
      label.className = "slot-label";
      label.textContent = `Slot ${i + 1}`;

      const slotThumb = document.createElement("div");
      slotThumb.className = "slot-thumb";
      if (currentDef) {
        slotThumb.innerHTML = `<img src="${currentDef.img}" alt="${currentDef.name}" onerror="this.style.display='none'">`;
      } else {
        slotThumb.innerHTML = `<span class="slot-thumb-empty">+</span>`;
      }

      const roleBadge = document.createElement("div");
      roleBadge.className = "slot-role-badge";
      const roleColor = currentDef ? getAnsiHex(userColors[currentDef.role]) : "#64748b";
      roleBadge.style.color = roleColor;
      roleBadge.textContent = currentDef ? `[${currentDef.role}]` : `[-]`;

      const unavailable = equippedItems.filter(name => name !== slot.item);

      const dropdown = createCustomDropdown(i, slot.item, unavailable, inv, (selectedItem) => {
        if (selectedItem) {
          const itemInv = inv[selectedItem.name];
          currentSlots[i].item = selectedItem.name;
          currentSlots[i].role = selectedItem.role;
          currentSlots[i].lvl = itemInv ? Math.min(itemInv.lvl, selectedItem.max) : 1;
        } else {
          currentSlots[i].item = null;
          currentSlots[i].lvl = 1;
        }
        StorageManager.saveLoadouts(this.loadouts);
        this.renderSlots();
      });

      const lvlSel = document.createElement("select");
      if (currentDef && isOwnedInInv) {
        for (let l = 1; l <= currentDef.max; l++) {
          const opt = document.createElement("option");
          opt.value = l;
          if (l <= invMaxLvl) {
            opt.textContent = `Lvl ${l} / ${currentDef.max}${l === currentDef.max ? ' (MAX)' : ''}`;
          } else {
            opt.textContent = `Lvl ${l} (Not reached in Inv - Max Lvl ${invMaxLvl})`;
            opt.disabled = true;
          }
          if (slot.lvl === l) opt.selected = true;
          lvlSel.appendChild(opt);
        }
        lvlSel.disabled = false;
      } else if (currentDef && !isOwnedInInv) {
        const opt = document.createElement("option");
        opt.value = 1;
        opt.textContent = "Not in Inventory";
        lvlSel.appendChild(opt);
        lvlSel.disabled = true;
      } else {
        const opt = document.createElement("option");
        opt.value = 1;
        opt.textContent = "Lvl 1";
        lvlSel.appendChild(opt);
        lvlSel.disabled = true;
      }

      lvlSel.onchange = () => {
        currentSlots[i].lvl = parseInt(lvlSel.value, 10) || 1;
        StorageManager.saveLoadouts(this.loadouts);
        this.updateUI();
      };

      div.appendChild(label);
      div.appendChild(slotThumb);
      div.appendChild(dropdown);
      div.appendChild(roleBadge);
      div.appendChild(lvlSel);
      container.appendChild(div);
    }
    this.updateUI();
  },

  updateUI() {
    const headline = document.getElementById("teamHeadline").value;
    const count = this.isVip ? 5 : 4;
    const limit = isNitro ? 4000 : 2000;

    const raw = buildTeamMessage(headline, userIgn, this.loadouts, count, userColors, false, includeRoleTags);
    const html = buildTeamMessage(headline, userIgn, this.loadouts, count, userColors, true, includeRoleTags);

    document.getElementById("teamPreviewHeadline").textContent = headline;
    document.getElementById("teamPreview").innerHTML = html;

    const subtextEl = document.getElementById("teamPreviewSubtext");
    if (subtextEl) subtextEl.innerHTML = PROMO_FOOTER_HTML;

    const charBadge = document.getElementById("teamCharCount");
    charBadge.textContent = `Characters: ${raw.length} / ${limit.toLocaleString()}`;
    charBadge.className = `char-badge ${raw.length > limit ? 'char-warn' : 'char-ok'}`;

    this.renderImagePreview();
  },

  renderImagePreview() {
    clearTimeout(this.timer);
    this.timer = setTimeout(async () => {
      const headline = document.getElementById("teamHeadline").value;
      const count = this.isVip ? 5 : 4;
      const imgBox = document.getElementById("teamImagePreviewBox");

      try {
        const canvas = await CanvasManager.captureCanvas(headline, userIgn, this.loadouts, count, userColors, includeRoleTags);
        imgBox.innerHTML = `<img src="${canvas.toDataURL('image/png')}" alt="Team Setup Image Preview" style="user-select:none; pointer-events:none;">`;
      } catch {
        imgBox.innerHTML = `<div style="padding:15px; color:#ef4444;">Could not generate image preview.</div>`;
      }
    }, 60);
  },

  async copyText() {
    const headline = document.getElementById("teamHeadline").value;
    const count = this.isVip ? 5 : 4;
    const raw = buildTeamMessage(headline, userIgn, this.loadouts, count, userColors, false, includeRoleTags);
    const btn = document.getElementById("teamCopyBtn");

    await navigator.clipboard.writeText(raw);
    const orig = btn.textContent;
    btn.textContent = "✅ Copied to Clipboard!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove("copied");
    }, 2000);
  },

  async copyImage() {
    const headline = document.getElementById("teamHeadline").value;
    const count = this.isVip ? 5 : 4;
    const btn = document.getElementById("teamCopyImgBtn");

    try {
      const canvas = await CanvasManager.captureCanvas(headline, userIgn, this.loadouts, count, userColors, includeRoleTags);
      canvas.toBlob(blob => {
        if (!blob) {
          CanvasManager.downloadCanvas(canvas);
          return;
        }
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
          const orig = btn.textContent;
          btn.textContent = "✅ Image Copied!";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = orig;
            btn.classList.remove("copied");
          }, 2000);
        }).catch(() => CanvasManager.downloadCanvas(canvas));
      }, "image/png");
    } catch {
      alert("Error generating image.");
    }
  },

  async downloadImage() {
    const headline = document.getElementById("teamHeadline").value;
    const count = this.isVip ? 5 : 4;
    try {
      const canvas = await CanvasManager.captureCanvas(headline, userIgn, this.loadouts, count, userColors, includeRoleTags);
      CanvasManager.downloadCanvas(canvas);
    } catch {
      alert("Error downloading image.");
    }
  }
};