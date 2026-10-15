const RequirementsUI = {
  data: {},

  init() {
    this.data = StorageManager.loadRequirements();
    const headlines = StorageManager.loadHeadlines();

    const reqHeadline = document.getElementById("reqHeadline");
    const reqBanner = document.getElementById("reqBanner");
    const reqClan = document.getElementById("reqClanName");

    reqHeadline.value = headlines.reqHeadline;
    reqBanner.value = headlines.reqBanner;
    reqClan.value = headlines.reqClan;

    reqHeadline.oninput = () => {
      StorageManager.saveHeadlines(undefined, undefined, undefined, reqHeadline.value, reqBanner.value, reqClan.value);
      this.updateUI();
    };

    reqBanner.oninput = () => {
      StorageManager.saveHeadlines(undefined, undefined, undefined, reqHeadline.value, reqBanner.value, reqClan.value);
      this.updateUI();
    };

    reqClan.oninput = () => {
      StorageManager.saveHeadlines(undefined, undefined, undefined, reqHeadline.value, reqBanner.value, reqClan.value);
      this.updateUI();
    };

    document.getElementById("btnReqSelectAll").onclick = () => {
      ITEMS.forEach(it => { this.data[it.name].owned = true; });
      StorageManager.saveRequirements(this.data);
      this.render();
    };

    document.getElementById("btnReqDeselectAll").onclick = () => {
      ITEMS.forEach(it => { this.data[it.name].owned = false; });
      StorageManager.saveRequirements(this.data);
      this.render();
    };

    document.getElementById("btnReqMaxAll").onclick = () => {
      ITEMS.forEach(it => { this.data[it.name].lvl = it.max; });
      StorageManager.saveRequirements(this.data);
      this.render();
    };

    this.render();
  },

  render() {
    const container = document.getElementById("requirementsContainer");
    container.innerHTML = "";

    CATEGORIES.forEach(cat => {
      const block = document.createElement("div");
      block.className = "inventory-category-block";

      const title = document.createElement("div");
      title.className = `inv-cat-title ${cat.cssClass}`;
      title.textContent = cat.title;
      block.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "inventory-grid";

      const itemsInCat = ITEMS.filter(it => it.role === cat.id);
      itemsInCat.forEach(it => {
        const itemData = this.data[it.name];
        const div = document.createElement("div");
        div.className = `inv-item ${itemData.owned ? 'owned' : 'not-owned'}`;

        let lvlOptions = "";
        for (let l = 1; l <= it.max; l++) {
          lvlOptions += `<option value="${l}" ${itemData.lvl === l ? 'selected' : ''}>Min Lvl ${l} / ${it.max}${l === it.max ? ' (MAX)' : ''}</option>`;
        }

        div.innerHTML = `
          <div class="inv-status-box ${itemData.owned ? 'checked' : 'unchecked'}" title="Click to toggle required unit">
            ${itemData.owned ? '✓' : '✕'}
          </div>
          <div class="inv-thumb">
            <img src="${it.img}" alt="${it.name}" onerror="this.style.display='none'">
          </div>
          <span class="inv-name" style="color: ${it.hex};">${it.name}</span>
          <select class="inp-lvl">${lvlOptions}</select>
        `;

        const statusBox = div.querySelector('.inv-status-box');
        statusBox.onclick = () => {
          itemData.owned = !itemData.owned;
          div.className = `inv-item ${itemData.owned ? 'owned' : 'not-owned'}`;
          statusBox.className = `inv-status-box ${itemData.owned ? 'checked' : 'unchecked'}`;
          statusBox.textContent = itemData.owned ? '✓' : '✕';
          StorageManager.saveRequirements(this.data);
          this.updateUI();
        };

        div.querySelector('.inp-lvl').onchange = (e) => {
          this.data[it.name].lvl = parseInt(e.target.value, 10) || 1;
          StorageManager.saveRequirements(this.data);
          this.updateUI();
        };

        grid.appendChild(div);
      });

      block.appendChild(grid);
      container.appendChild(block);
    });

    this.updateUI();
  },

  updateUI() {
    const charLimit = isNitro ? 4000 : 2000;
    const headline = document.getElementById("reqHeadline").value;
    const banner = document.getElementById("reqBanner").value;
    const clanName = document.getElementById("reqClanName").value;

    const chunks = chunkInventoryMessages(headline, banner, clanName, this.data, userColors, includeRoleTags, charLimit);

    const previewContainer = document.getElementById("reqPreviewContainer");
    const actionsContainer = document.getElementById("reqActionButtons");
    const charBadge = document.getElementById("reqCharBadge");

    previewContainer.innerHTML = "";
    actionsContainer.innerHTML = "";

    if (chunks.length === 1) {
      const c = chunks[0];
      charBadge.innerHTML = `<span class="char-badge ${c.charCount > charLimit ? 'char-warn' : 'char-ok'}">Characters: ${c.charCount} / ${charLimit.toLocaleString()}</span>`;
      actionsContainer.innerHTML = `
        <div class="footer-btn-row">
          <button class="btn" onclick="RequirementsUI.copyPart(0, this)">📋 Copy Requirements for Discord</button>
        </div>
      `;

      const headlineEl = document.createElement("div");
      headlineEl.className = "preview-headline";
      headlineEl.textContent = c.headlineHtml;

      const pre = document.createElement("pre");
      pre.className = "preview-box";
      pre.innerHTML = c.html;

      const subtextEl = document.createElement("div");
      subtextEl.className = "preview-subtext";
      subtextEl.innerHTML = PROMO_FOOTER_HTML;

      previewContainer.appendChild(headlineEl);
      previewContainer.appendChild(pre);
      previewContainer.appendChild(subtextEl);
    } else {
      charBadge.innerHTML = `<span class="char-badge char-warn">⚠️ Exceeds ${charLimit.toLocaleString()} characters! Split into ${chunks.length} parts:</span>`;
      const partsWrapper = document.createElement("div");
      partsWrapper.className = "parts-container";

      chunks.forEach((c, idx) => {
        const partCard = document.createElement("div");
        partCard.className = "part-card";
        partCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <strong style="font-size:1.1rem;">Part ${c.partNum} of ${c.totalParts}</strong>
            <span class="char-badge char-ok" style="margin:0;">${c.charCount} / ${charLimit.toLocaleString()} chars</span>
          </div>
          <button class="btn" style="margin-bottom:12px;" onclick="RequirementsUI.copyPart(${idx}, this)">📋 Copy Part ${c.partNum} for Discord</button>
          <div class="preview-headline">${escapeXml(c.headlineHtml)}</div>
          <pre class="preview-box">${c.html}</pre>
          <div class="preview-subtext">${PROMO_FOOTER_HTML}</div>
        `;
        partsWrapper.appendChild(partCard);
      });
      previewContainer.appendChild(partsWrapper);
    }
  },

  copyPart(idx, btn) {
    const charLimit = isNitro ? 4000 : 2000;
    const headline = document.getElementById("reqHeadline").value;
    const banner = document.getElementById("reqBanner").value;
    const clanName = document.getElementById("reqClanName").value;
    const chunks = chunkInventoryMessages(headline, banner, clanName, this.data, userColors, includeRoleTags, charLimit);
    if (chunks[idx]) {
      navigator.clipboard.writeText(chunks[idx].raw).then(() => {
        const orig = btn.textContent;
        btn.textContent = "✅ Copied to Clipboard!";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove("copied");
        }, 2000);
      });
    }
  }
};