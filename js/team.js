const TeamUI = {
  slots: [],
  isVip: false,
  timer: null,

  init() {
    this.slots = StorageManager.loadSlots();
    this.isVip = StorageManager.loadVip();

    const teamHeadlineInput = document.getElementById("teamHeadline");
    const teamBannerInput = document.getElementById("teamBanner");
    const vipToggleBtn = document.getElementById("vipToggleBtn");

    const headlines = StorageManager.loadHeadlines();
    teamHeadlineInput.value = headlines.team;
    teamBannerInput.value = headlines.banner;

    this.updateVipButton();

    vipToggleBtn.onclick = () => {
      this.isVip = !this.isVip;
      StorageManager.saveVip(this.isVip);
      this.updateVipButton();
      this.renderSlots();
    };

    teamHeadlineInput.oninput = () => {
      StorageManager.saveHeadlines(teamHeadlineInput.value, undefined, teamBannerInput.value);
      this.updateUI();
    };

    teamBannerInput.oninput = () => {
      StorageManager.saveHeadlines(teamHeadlineInput.value, undefined, teamBannerInput.value);
      this.updateUI();
    };

    document.getElementById("teamCopyBtn").onclick = () => this.copyText();
    document.getElementById("teamCopyImgBtn").onclick = () => this.copyImage();
    document.getElementById("teamDownloadImgBtn").onclick = () => this.downloadImage();

    this.renderSlots();
  },

  updateVipButton() {
    const btn = document.getElementById("vipToggleBtn");
    btn.className = `status-toggle-btn ${this.isVip ? 'active' : 'inactive'}`;
    btn.textContent = this.isVip ? "⭐ VIP: 5 Slots" : "⭐ VIP: 4 Slots";
  },

  renderSlots() {
    const container = document.getElementById("slotsContainer");
    container.innerHTML = "";
    const count = this.isVip ? 5 : 4;

    const equippedItems = [];
    for (let s = 0; s < count; s++) {
      if (this.slots[s] && this.slots[s].item) {
        equippedItems.push(this.slots[s].item);
      }
    }

    for (let i = 0; i < count; i++) {
      const slot = this.slots[i] || { item: null, role: "DAMAGE", lvl: 1 };
      const currentDef = slot.item ? ITEMS.find(x => x.name === slot.item) : null;

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

      const dropdown = createCustomDropdown(i, slot.item, unavailable, (selectedItem) => {
        if (selectedItem) {
          this.slots[i].item = selectedItem.name;
          this.slots[i].role = selectedItem.role;
          this.slots[i].lvl = 1;
        } else {
          this.slots[i].item = null;
          this.slots[i].lvl = 1;
        }
        StorageManager.saveSlots(this.slots);
        this.renderSlots();
      });

      const lvlSel = document.createElement("select");
      const currentMax = currentDef ? currentDef.max : 1;
      for (let l = 1; l <= currentMax; l++) {
        const opt = document.createElement("option");
        opt.value = l;
        opt.textContent = `Lvl ${l} / ${currentMax}${l === currentMax ? ' (MAX)' : ''}`;
        if (slot.lvl === l) opt.selected = true;
        lvlSel.appendChild(opt);
      }
      lvlSel.disabled = !currentDef;
      lvlSel.onchange = () => {
        this.slots[i].lvl = parseInt(lvlSel.value, 10) || 1;
        StorageManager.saveSlots(this.slots);
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
    const banner = document.getElementById("teamBanner").value;
    const count = this.isVip ? 5 : 4;
    const limit = isNitro ? 4000 : 2000;

    const raw = buildTeamMessage(headline, banner, userIgn, this.slots, count, userColors, false, includeRoleTags);
    const html = buildTeamMessage(headline, banner, userIgn, this.slots, count, userColors, true, includeRoleTags);

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
      const banner = document.getElementById("teamBanner").value;
      const count = this.isVip ? 5 : 4;
      const imgBox = document.getElementById("teamImagePreviewBox");

      try {
        const canvas = await CanvasManager.captureCanvas(headline, banner, userIgn, this.slots, count, userColors, includeRoleTags);
        imgBox.innerHTML = `<img src="${canvas.toDataURL('image/png')}" alt="Team Setup Image Preview" style="user-select:none; pointer-events:none;">`;
      } catch {
        imgBox.innerHTML = `<div style="padding:15px; color:#ef4444;">Could not generate image preview.</div>`;
      }
    }, 60);
  },

  async copyText() {
    const headline = document.getElementById("teamHeadline").value;
    const banner = document.getElementById("teamBanner").value;
    const count = this.isVip ? 5 : 4;
    const raw = buildTeamMessage(headline, banner, userIgn, this.slots, count, userColors, false, includeRoleTags);
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
    const banner = document.getElementById("teamBanner").value;
    const count = this.isVip ? 5 : 4;
    const btn = document.getElementById("teamCopyImgBtn");

    try {
      const canvas = await CanvasManager.captureCanvas(headline, banner, userIgn, this.slots, count, userColors, includeRoleTags);
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
    const banner = document.getElementById("teamBanner").value;
    const count = this.isVip ? 5 : 4;
    try {
      const canvas = await CanvasManager.captureCanvas(headline, banner, userIgn, this.slots, count, userColors, includeRoleTags);
      CanvasManager.downloadCanvas(canvas);
    } catch {
      alert("Error downloading image.");
    }
  }
};