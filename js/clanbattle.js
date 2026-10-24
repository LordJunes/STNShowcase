const ClanBattleUI = {
  data: {},
  nitro: false,
  includeRoleTags: true,
  sortMode: "rarity",
  imgTimer: null,

  init() {
    this.data = StorageManager.loadClanBattle();
    this.nitro = StorageManager.loadNitro();
    this.includeRoleTags = StorageManager.loadIncludeRoleTags();
    this.sortMode = StorageManager.loadCbSortMode();

    const cbHeadline = document.getElementById("cbHeadline");
    const cbBanner = document.getElementById("cbBanner");
    const cbClanName = document.getElementById("cbClanName");
    const cbPlayersNeeded = document.getElementById("cbPlayersNeeded");
    const cbSortSelect = document.getElementById("cbSortSelect");

    cbHeadline.value = this.data.headline;
    cbBanner.value = this.data.banner;
    cbClanName.value = this.data.clanName;
    cbPlayersNeeded.value = this.data.playersNeeded;
    if (cbSortSelect) cbSortSelect.value = this.sortMode;

    cbHeadline.oninput = () => {
      this.data.headline = cbHeadline.value;
      StorageManager.saveClanBattle(this.data);
      this.updateUI();
    };

    cbBanner.oninput = () => {
      this.data.banner = cbBanner.value;
      StorageManager.saveClanBattle(this.data);
      this.updateUI();
    };

    cbClanName.oninput = () => {
      this.data.clanName = cbClanName.value;
      StorageManager.saveClanBattle(this.data);
      this.updateUI();
    };

    cbPlayersNeeded.oninput = () => {
      this.data.playersNeeded = cbPlayersNeeded.value;
      StorageManager.saveClanBattle(this.data);
      this.updateUI();
    };

    if (cbSortSelect) {
      cbSortSelect.onchange = () => {
        this.sortMode = cbSortSelect.value;
        StorageManager.saveCbSortMode(this.sortMode);
        this.render();
        this.updateUI();
      };
    }

    document.getElementById("btnCbSelectAll").onclick = () => {
      ITEMS.forEach(it => { this.data.units[it.name].needed = true; });
      StorageManager.saveClanBattle(this.data);
      this.render();
    };

    document.getElementById("btnCbDeselectAll").onclick = () => {
      ITEMS.forEach(it => { this.data.units[it.name].needed = false; });
      StorageManager.saveClanBattle(this.data);
      this.render();
    };

    document.getElementById("btnCbResetQuantities").onclick = () => {
      ITEMS.forEach(it => {
        this.data.units[it.name].haveCount = 0;
        this.data.units[it.name].needCount = 1;
      });
      StorageManager.saveClanBattle(this.data);
      this.render();
    };

    const toggleTags = () => {
      this.includeRoleTags = !this.includeRoleTags;
      StorageManager.saveIncludeRoleTags(this.includeRoleTags);
      this.updateRoleTagButtons();
      this.updateUI();
      if (typeof TeamUI !== 'undefined') TeamUI.renderSlots();
      if (typeof InventoryUI !== 'undefined') InventoryUI.updateUI();
    };

    document.getElementById("cbRoleTagBtnTop").onclick = toggleTags;
    document.getElementById("cbRoleTagBtnBottom").onclick = toggleTags;

    document.getElementById("cbNitroBtn").onclick = () => {
      this.nitro = !this.nitro;
      StorageManager.saveNitro(this.nitro);
      this.updateNitroButton();
      this.updateUI();
    };

    document.getElementById("cbCopyImgBtn").onclick = () => this.copyImage();
    document.getElementById("cbDownloadImgBtn").onclick = () => this.downloadImage();

    this.updateNitroButton();
    this.updateRoleTagButtons();
    this.render();
  },

  updateNitroButton() {
    const btn = document.getElementById("cbNitroBtn");
    if (!btn) return;
    btn.className = `status-toggle-btn ${this.nitro ? 'active' : 'inactive'}`;
    btn.textContent = this.nitro ? "🚀 Discord Nitro: ON (4000)" : "🚀 Discord Nitro: OFF (2000)";
  },

  updateRoleTagButtons() {
    const text = this.includeRoleTags ? "🏷️ Role Tags: ON" : "🏷️ Role Tags: OFF";
    const cls = `status-toggle-btn ${this.includeRoleTags ? 'active' : 'inactive'}`;

    const bTop = document.getElementById("cbRoleTagBtnTop");
    const bBot = document.getElementById("cbRoleTagBtnBottom");
    if (bTop) { bTop.textContent = text; bTop.className = cls; }
    if (bBot) { bBot.textContent = text; bBot.className = cls; }
  },

  render() {
    const container = document.getElementById("clanBattleContainer");
    container.innerHTML = "";

    const renderItemCard = (it) => {
      const u = this.data.units[it.name];
      const card = document.createElement("div");
      card.className = `cb-item ${u.needed ? 'owned' : 'not-owned'}`;

      const chkBox = document.createElement("div");
      chkBox.className = `inv-status-box ${u.needed ? 'checked' : 'unchecked'}`;
      chkBox.textContent = u.needed ? "✓" : "✕";
      chkBox.onclick = () => {
        u.needed = !u.needed;
        card.className = `cb-item ${u.needed ? 'owned' : 'not-owned'}`;
        chkBox.className = `inv-status-box ${u.needed ? 'checked' : 'unchecked'}`;
        chkBox.textContent = u.needed ? "✓" : "✕";
        StorageManager.saveClanBattle(this.data);
        this.updateUI();
      };

      const thumb = document.createElement("div");
      thumb.className = "cb-thumb";
      thumb.innerHTML = `<img src="${it.img}" alt="${it.name}" onerror="this.style.display='none'">`;
      thumb.onclick = chkBox.onclick;

      const nameSpan = document.createElement("div");
      nameSpan.className = "inv-name";
      nameSpan.style.color = getAnsiHex(userColors[it.rarity] || "37");
      nameSpan.textContent = it.name;
      nameSpan.onclick = chkBox.onclick;

      const haveSel = document.createElement("select");
      haveSel.className = "cb-have-select";
      for (let h = 0; h <= 10; h++) {
        const opt = document.createElement("option");
        opt.value = h;
        opt.textContent = `Have ${h} already`;
        if (u.haveCount === h) opt.selected = true;
        haveSel.appendChild(opt);
      }
      haveSel.onchange = () => {
        u.haveCount = parseInt(haveSel.value, 10);
        StorageManager.saveClanBattle(this.data);
        this.updateUI();
      };

      const needSel = document.createElement("select");
      needSel.className = "cb-need-select";
      for (let n = 1; n <= 10; n++) {
        const opt = document.createElement("option");
        opt.value = n;
        opt.textContent = `Need ${n}`;
        if (u.needCount === n) opt.selected = true;
        needSel.appendChild(opt);
      }
      needSel.onchange = () => {
        u.needCount = parseInt(needSel.value, 10);
        StorageManager.saveClanBattle(this.data);
        this.updateUI();
      };

      const lvlSel = document.createElement("select");
      lvlSel.className = "cb-lvl-select";
      for (let l = 1; l <= it.max; l++) {
        const opt = document.createElement("option");
        opt.value = l;
        opt.textContent = `Bring Level ${l}+`;
        if (u.minLvl === l) opt.selected = true;
        lvlSel.appendChild(opt);
      }
      lvlSel.onchange = () => {
        u.minLvl = parseInt(lvlSel.value, 10);
        StorageManager.saveClanBattle(this.data);
        this.updateUI();
      };

      card.appendChild(chkBox);
      card.appendChild(thumb);
      card.appendChild(nameSpan);
      card.appendChild(haveSel);
      card.appendChild(needSel);
      card.appendChild(lvlSel);
      return card;
    };

    if (this.sortMode === "rarity") {
      RARITY_TIERS.forEach(tier => {
        const itemsInTier = ITEMS.filter(it => it.rarity === tier.key);
        if (itemsInTier.length === 0) return;

        const block = document.createElement("div");
        block.className = "inventory-category-block";

        const title = document.createElement("div");
        title.className = "inv-cat-title";
        title.style.color = getAnsiHex(userColors[tier.key] || "37");
        title.innerHTML = `<span>💎</span> <span>${tier.label}</span>`;
        block.appendChild(title);

        const grid = document.createElement("div");
        grid.className = "cb-grid";

        itemsInTier.forEach(it => grid.appendChild(renderItemCard(it)));
        block.appendChild(grid);
        container.appendChild(block);
      });
    } else {
      CATEGORIES.forEach(cat => {
        const itemsInCat = ITEMS.filter(it => it.role === cat.id);
        if (itemsInCat.length === 0) return;

        const block = document.createElement("div");
        block.className = "inventory-category-block";

        const title = document.createElement("div");
        title.className = `inv-cat-title ${cat.cssClass}`;
        title.style.color = getAnsiHex(userColors[cat.id] || "37");
        title.innerHTML = `<span>${cat.title}</span>`;
        block.appendChild(title);

        const grid = document.createElement("div");
        grid.className = "cb-grid";

        itemsInCat.forEach(it => grid.appendChild(renderItemCard(it)));
        block.appendChild(grid);
        container.appendChild(block);
      });
    }

    this.updateUI();
  },

  updateUI() {
    StorageManager.saveClanBattle(this.data);

    const maxChars = this.nitro ? 4000 : 2000;
    const parts = chunkClanBattleMessages(
      this.data.headline,
      this.data.banner,
      this.data.clanName,
      this.data.playersNeeded,
      this.data,
      userColors,
      this.includeRoleTags,
      maxChars,
      this.sortMode
    );

    const previewContainer = document.getElementById("cbPreviewContainer");
    previewContainer.innerHTML = "";

    const charBadge = document.getElementById("cbCharBadge");
    charBadge.className = "char-badge char-ok";
    charBadge.textContent = parts.length === 1 ? `1 Discord Message (${parts[0].charCount} chars)` : `${parts.length} Discord Messages generated`;

    const actionsContainer = document.getElementById("cbActionButtons");
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
      btn.textContent = parts.length > 1 ? `📋 Copy Part ${idx + 1}/${parts.length}` : "📋 Copy Clan Battle Requirements";
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
      const imgBox = document.getElementById("cbImagePreviewBox");
      if (!imgBox) return;

      try {
        const canvas = await CanvasManager.captureClanBattleCanvas(this.data, userColors, this.includeRoleTags, this.sortMode);
        imgBox.innerHTML = `<img src="${canvas.toDataURL('image/png')}" alt="Clan Battle Image Preview" style="user-select:none; pointer-events:none; max-width:100%;">`;
      } catch {
        imgBox.innerHTML = `<div style="padding:15px; color:#ef4444;">Could not generate clan battle image preview.</div>`;
      }
    }, 70);
  },

  async copyImage() {
    const btn = document.getElementById("cbCopyImgBtn");
    try {
      const canvas = await CanvasManager.captureClanBattleCanvas(this.data, userColors, this.includeRoleTags, this.sortMode);
      canvas.toBlob(blob => {
        if (!blob) {
          CanvasManager.downloadCanvas(canvas, `clanbattle_${Date.now()}.png`);
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
        }).catch(() => CanvasManager.downloadCanvas(canvas, `clanbattle_${Date.now()}.png`));
      }, "image/png");
    } catch {
      alert("Error generating image.");
    }
  },

  async downloadImage() {
    try {
      const canvas = await CanvasManager.captureClanBattleCanvas(this.data, userColors, this.includeRoleTags, this.sortMode);
      CanvasManager.downloadCanvas(canvas, `clanbattle_${Date.now()}.png`);
    } catch {
      alert("Error downloading image.");
    }
  }
};