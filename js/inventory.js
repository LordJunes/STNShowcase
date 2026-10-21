const InventoryUI = {
  inv: {},
  nitro: false,
  includeRoleTags: true,
  showUnowned: false,
  imgTimer: null,

  init() {
    this.inv = StorageManager.loadInventory();
    this.nitro = StorageManager.loadNitro();
    this.includeRoleTags = StorageManager.loadIncludeRoleTags();
    this.showUnowned = StorageManager.loadShowUnownedInImage();

    const invHeadlineInput = document.getElementById("invHeadline");
    invHeadlineInput.value = StorageManager.loadHeadlines().inv;
    invHeadlineInput.oninput = () => {
      StorageManager.saveHeadlines(undefined, invHeadlineInput.value, undefined);
      this.updateUI();
    };

    this.updateNitroButton();
    this.updateRoleTagButtons();
    this.updateUnownedButton();
    this.bindTools();

    document.getElementById("invNitroBtn").onclick = () => {
      this.nitro = !this.nitro;
      StorageManager.saveNitro(this.nitro);
      this.updateNitroButton();
      this.updateUI();
    };

    const toggleTags = () => {
      this.includeRoleTags = !this.includeRoleTags;
      StorageManager.saveIncludeRoleTags(this.includeRoleTags);
      this.updateRoleTagButtons();
      this.updateUI();
      if (typeof TeamUI !== 'undefined') TeamUI.renderSlots();
      if (typeof RequirementsUI !== 'undefined') RequirementsUI.updateUI();
    };

    document.getElementById("invRoleTagBtnTop").onclick = toggleTags;
    document.getElementById("invRoleTagBtnBottom").onclick = toggleTags;

    document.getElementById("btnInvToggleUnowned").onclick = () => {
      this.showUnowned = !this.showUnowned;
      StorageManager.saveShowUnownedInImage(this.showUnowned);
      this.updateUnownedButton();
      this.renderImagePreview();
    };

    document.getElementById("invCopyImgBtn").onclick = () => this.copyImage();
    document.getElementById("invDownloadImgBtn").onclick = () => this.downloadImage();

    this.renderItems();
    this.updateUI();
  },

  updateNitroButton() {
    const btn = document.getElementById("invNitroBtn");
    btn.className = `status-toggle-btn ${this.nitro ? 'active' : 'inactive'}`;
    btn.textContent = this.nitro ? "🚀 Discord Nitro: ON (4000)" : "🚀 Discord Nitro: OFF (2000)";
  },

  updateRoleTagButtons() {
    const text = this.includeRoleTags ? "🏷️ Role Tags: ON" : "🏷️ Role Tags: OFF";
    const cls = `status-toggle-btn ${this.includeRoleTags ? 'active' : 'inactive'}`;

    const bTop = document.getElementById("invRoleTagBtnTop");
    const bBot = document.getElementById("invRoleTagBtnBottom");
    if (bTop) { bTop.textContent = text; bTop.className = cls; }
    if (bBot) { bBot.textContent = text; bBot.className = cls; }
  },

  updateUnownedButton() {
    const btn = document.getElementById("btnInvToggleUnowned");
    if (btn) {
      btn.className = `status-toggle-btn ${this.showUnowned ? 'active' : 'inactive'}`;
      btn.textContent = this.showUnowned ? "👁️ Show Unowned: ON" : "👁️ Show Unowned: OFF";
    }
  },

  bindTools() {
    document.getElementById("btnInvSelectAll").onclick = () => {
      ITEMS.forEach(it => { this.inv[it.name].owned = true; });
      this.renderItems();
      this.updateUI();
    };
    document.getElementById("btnInvDeselectAll").onclick = () => {
      ITEMS.forEach(it => { this.inv[it.name].owned = false; });
      this.renderItems();
      this.updateUI();
    };
    document.getElementById("btnInvMaxAll").onclick = () => {
      ITEMS.forEach(it => {
        this.inv[it.name].owned = true;
        this.inv[it.name].lvl = it.max;
      });
      this.renderItems();
      this.updateUI();
    };

    const btnScan = document.getElementById("btnOpenScanner");
    if (btnScan) {
      btnScan.onclick = () => ScannerUI.open();
    }
  },

  renderItems() {
    const container = document.getElementById("inventoryContainer");
    container.innerHTML = "";

    const categories = [
      { role: "DAMAGE", label: "DAMAGE UNITS", icon: "⚔️", color: "#ed4245" },
      { role: "SUPPORT", label: "SUPPORT UNITS", icon: "🛡️", color: "#57f287" },
      { role: "FARM", label: "FARM UNITS", icon: "🌾", color: "#fee75c" },
      { role: "PET", label: "PET UNITS", icon: "🐾", color: "#5865f2" }
    ];

    categories.forEach(cat => {
      const itemsInCat = ITEMS.filter(it => it.role === cat.role);
      if (itemsInCat.length === 0) return;

      const block = document.createElement("div");
      block.className = "inventory-category-block";

      const title = document.createElement("div");
      title.className = "inv-cat-title";
      title.style.color = cat.color;
      title.innerHTML = `<span>${cat.icon}</span> <span>${cat.label}</span>`;
      block.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "inventory-grid";

      itemsInCat.forEach(it => {
        const itemState = this.inv[it.name];
        const card = document.createElement("div");
        card.className = `inv-item ${itemState.owned ? 'owned' : 'not-owned'}`;

        const chkBox = document.createElement("div");
        chkBox.className = `inv-status-box ${itemState.owned ? 'checked' : 'unchecked'}`;
        chkBox.textContent = itemState.owned ? "✓" : "✕";
        chkBox.onclick = () => {
          itemState.owned = !itemState.owned;
          card.className = `inv-item ${itemState.owned ? 'owned' : 'not-owned'}`;
          chkBox.className = `inv-status-box ${itemState.owned ? 'checked' : 'unchecked'}`;
          chkBox.textContent = itemState.owned ? "✓" : "✕";
          this.updateUI();
        };

        const thumb = document.createElement("div");
        thumb.className = "inv-thumb";
        thumb.innerHTML = `<img src="${it.img}" alt="${it.name}" onerror="this.style.display='none'">`;
        thumb.onclick = chkBox.onclick;

        const nameSpan = document.createElement("div");
        nameSpan.className = "inv-name";
        const rarityHex = getAnsiHex(userColors[it.rarity]);
        nameSpan.style.color = rarityHex;
        nameSpan.textContent = it.name;
        nameSpan.onclick = chkBox.onclick;

        const sel = document.createElement("select");
        for (let l = 1; l <= it.max; l++) {
          const opt = document.createElement("option");
          opt.value = l;
          opt.textContent = `Lvl ${l}/${it.max}${l === it.max ? ' (MAX)' : ''}`;
          if (itemState.lvl === l) opt.selected = true;
          sel.appendChild(opt);
        }
        sel.onchange = () => {
          itemState.lvl = parseInt(sel.value, 10);
          this.updateUI();
        };

        card.appendChild(chkBox);
        card.appendChild(thumb);
        card.appendChild(nameSpan);
        card.appendChild(sel);
        grid.appendChild(card);
      });

      block.appendChild(grid);
      container.appendChild(block);
    });
  },

  updateUI() {
    StorageManager.saveInventory(this.inv);

    const headline = document.getElementById("invHeadline").value;
    const maxChars = this.nitro ? 4000 : 2000;
    const parts = chunkInventoryMessages(headline, "=== INVENTORY ===", "", this.inv, userColors, this.includeRoleTags, maxChars);

    const previewContainer = document.getElementById("invPreviewContainer");
    previewContainer.innerHTML = "";

    const charBadge = document.getElementById("invCharBadge");
    charBadge.className = "char-badge char-ok";
    charBadge.textContent = parts.length === 1 ? `1 Discord Message (${parts[0].charCount} chars)` : `${parts.length} Discord Messages generated`;

    const actionsContainer = document.getElementById("invActionButtons");
    actionsContainer.innerHTML = "";
    actionsContainer.style.display = "flex";
    actionsContainer.style.gap = "10px";
    actionsContainer.style.flexWrap = "wrap";

    parts.forEach((p, idx) => {
      const partCard = document.createElement("div");
      partCard.className = "part-card";

      const hl = document.createElement("div");
      hl.className = "preview-headline";
      hl.textContent = p.headlineHtml;

      const pre = document.createElement("pre");
      pre.className = "preview-box";
      pre.innerHTML = p.html;

      const sub = document.createElement("div");
      sub.className = "preview-subtext";
      sub.innerHTML = PROMO_FOOTER_HTML;

      partCard.appendChild(hl);
      partCard.appendChild(pre);
      partCard.appendChild(sub);
      previewContainer.appendChild(partCard);

      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = parts.length > 1 ? `📋 Copy Part ${idx + 1}/${parts.length}` : "📋 Copy Inventory for Discord";
      btn.onclick = async () => {
        await navigator.clipboard.writeText(p.raw);
        const orig = btn.textContent;
        btn.textContent = `✅ Part ${idx + 1} Copied!`;
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove("copied");
        }, 2000);
      };
      actionsContainer.appendChild(btn);
    });

    this.renderImagePreview();
  },

  renderImagePreview() {
    clearTimeout(this.imgTimer);
    this.imgTimer = setTimeout(async () => {
      const headline = document.getElementById("invHeadline").value;
      const imgBox = document.getElementById("invImagePreviewBox");
      if (!imgBox) return;

      try {
        const canvas = await CanvasManager.captureInventoryCanvas(headline, userIgn, this.inv, userColors, this.showUnowned);
        imgBox.innerHTML = `<img src="${canvas.toDataURL('image/png')}" alt="Inventory Image Preview" style="user-select:none; pointer-events:none; max-width:100%;">`;
      } catch {
        imgBox.innerHTML = `<div style="padding:15px; color:#ef4444;">Could not generate inventory image preview.</div>`;
      }
    }, 70);
  },

  async copyImage() {
    const headline = document.getElementById("invHeadline").value;
    const btn = document.getElementById("invCopyImgBtn");

    try {
      const canvas = await CanvasManager.captureInventoryCanvas(headline, userIgn, this.inv, userColors, this.showUnowned);
      canvas.toBlob(blob => {
        if (!blob) {
          CanvasManager.downloadCanvas(canvas, `inventory_${Date.now()}.png`);
          return;
        }
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
          const orig = btn.textContent;
          btn.textContent = "✅ Inventory Image Copied!";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = orig;
            btn.classList.remove("copied");
          }, 2000);
        }).catch(() => CanvasManager.downloadCanvas(canvas, `inventory_${Date.now()}.png`));
      }, "image/png");
    } catch {
      alert("Error generating image.");
    }
  },

  async downloadImage() {
    const headline = document.getElementById("invHeadline").value;
    try {
      const canvas = await CanvasManager.captureInventoryCanvas(headline, userIgn, this.inv, userColors, this.showUnowned);
      CanvasManager.downloadCanvas(canvas, `inventory_${Date.now()}.png`);
    } catch {
      alert("Error downloading image.");
    }
  }
};