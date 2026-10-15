let userColors = StorageManager.loadColors();
let userSlots = StorageManager.loadSlots();
let userInventory = StorageManager.loadInventory();
let headlines = StorageManager.loadHeadlines();
let isVip = StorageManager.loadVip();
let includeRoleTags = StorageManager.loadIncludeRoleTags();

const teamHeadlineInput = document.getElementById("teamHeadline");
const invHeadlineInput = document.getElementById("invHeadline");
const vipCheckbox = document.getElementById("vipToggle");

teamHeadlineInput.value = headlines.team;
invHeadlineInput.value = headlines.inv;
vipCheckbox.checked = isVip;

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    if (btn.dataset.tab === "teamTab") updateTeamUI();
    if (btn.dataset.tab === "inventoryTab") updateInventoryUI();
  });
});

function initSettings() {
  document.querySelectorAll(".setting-select").forEach(sel => {
    const key = sel.dataset.key;
    sel.innerHTML = ANSI_OPTIONS.map(opt => 
      `<option value="${opt.code}" ${opt.code === userColors[key] ? 'selected' : ''}>${opt.name}</option>`
    ).join('');

    sel.addEventListener("change", () => {
      userColors[key] = sel.value;
      StorageManager.saveColors(userColors);
      updateSettingsLabels();
      updateTeamUI();
      updateInventoryUI();
    });
  });
  updateSettingsLabels();
}

function updateSettingsLabels() {
  Object.keys(userColors).forEach(k => {
    const lbl = document.getElementById(`lbl_${k}`);
    if (lbl) lbl.style.color = getAnsiHex(userColors[k]);
  });
}

document.getElementById("btnResetColors").addEventListener("click", () => {
  userColors = { ...DEFAULT_COLORS };
  StorageManager.saveColors(userColors);
  initSettings();
  updateTeamUI();
  updateInventoryUI();
});

document.getElementById("btnResetAllData").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all data and settings? This will restore the default fresh view.")) {
    localStorage.clear();
    location.reload();
  }
});

function updateRoleTagButtons() {
  const buttons = [
    document.getElementById("teamRoleTagBtn"), 
    document.getElementById("invRoleTagBtnTop"), 
    document.getElementById("invRoleTagBtnBottom")
  ];
  buttons.forEach(btn => {
    if (!btn) return;
    btn.className = `role-tag-toggle ${includeRoleTags ? 'active' : 'inactive'}`;
    btn.innerHTML = includeRoleTags ? `🏷️ Role Tags: ON` : `🚫 Role Tags: OFF`;
  });
}

function toggleRoleTags() {
  includeRoleTags = !includeRoleTags;
  StorageManager.saveIncludeRoleTags(includeRoleTags);
  updateRoleTagButtons();
  updateTeamUI();
  updateInventoryUI();
}

function renderSlots() {
  const container = document.getElementById("slotsContainer");
  container.innerHTML = "";
  const count = vipCheckbox.checked ? 5 : 4;

  const equippedItems = [];
  for (let s = 0; s < count; s++) {
    if (userSlots[s] && userSlots[s].item) {
      equippedItems.push(userSlots[s].item);
    }
  }

  for (let i = 0; i < count; i++) {
    const slot = userSlots[i] || { item: null, role: "DAMAGE", lvl: 1 };
    const currentDef = slot.item ? ITEMS.find(x => x.name === slot.item) : null;

    const div = document.createElement("div");
    div.className = "slot-card";

    const label = document.createElement("span");
    label.className = "slot-label";
    label.textContent = `Slot ${i + 1}`;

    const slotThumb = document.createElement("div");
    slotThumb.className = "slot-thumb";
    if (currentDef) {
      slotThumb.innerHTML = `<img src="${currentDef.img}" alt="" onerror="this.style.display='none'">`;
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
        userSlots[i].item = selectedItem.name;
        userSlots[i].role = selectedItem.role;
        userSlots[i].lvl = 1;
      } else {
        userSlots[i].item = null;
        userSlots[i].lvl = 1;
      }
      StorageManager.saveSlots(userSlots);
      renderSlots();
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
    lvlSel.addEventListener("change", () => {
      userSlots[i].lvl = parseInt(lvlSel.value) || 1;
      StorageManager.saveSlots(userSlots);
      updateTeamUI();
    });

    div.appendChild(label);
    div.appendChild(slotThumb);
    div.appendChild(dropdown);
    div.appendChild(roleBadge);
    div.appendChild(lvlSel);
    container.appendChild(div);
  }
  updateTeamUI();
}

function updateTeamUI() {
  const count = vipCheckbox.checked ? 5 : 4;
  const raw = buildTeamMessage(teamHeadlineInput.value, userSlots, count, userColors, false, includeRoleTags);
  const html = buildTeamMessage(teamHeadlineInput.value, userSlots, count, userColors, true, includeRoleTags);

  document.getElementById("teamPreview").innerHTML = html;
  const charBadge = document.getElementById("teamCharCount");
  charBadge.textContent = `Characters: ${raw.length} / 2,000`;
  charBadge.className = `char-badge ${raw.length > 2000 ? 'char-warn' : 'char-ok'}`;
}

function renderInventory() {
  const container = document.getElementById("inventoryContainer");
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
      const data = userInventory[it.name];
      const div = document.createElement("div");
      div.className = `inv-item ${data.owned ? 'owned' : 'not-owned'}`;

      let lvlOptions = "";
      for (let l = 1; l <= it.max; l++) {
        lvlOptions += `<option value="${l}" ${data.lvl === l ? 'selected' : ''}>Lvl ${l} / ${it.max}${l === it.max ? ' (MAX)' : ''}</option>`;
      }

      div.innerHTML = `
        <div class="inv-status-box ${data.owned ? 'checked' : 'unchecked'}" title="Click to toggle">
          ${data.owned ? '✓' : '✕'}
        </div>
        <div class="inv-thumb">
          <img src="${it.img}" alt="${it.name}" onerror="this.style.display='none'">
        </div>
        <span class="inv-name" style="color: ${it.hex};">${it.name}</span>
        <select class="inp-lvl">${lvlOptions}</select>
      `;

      const statusBox = div.querySelector('.inv-status-box');
      statusBox.addEventListener("click", () => {
        data.owned = !data.owned;
        div.className = `inv-item ${data.owned ? 'owned' : 'not-owned'}`;
        statusBox.className = `inv-status-box ${data.owned ? 'checked' : 'unchecked'}`;
        statusBox.textContent = data.owned ? '✓' : '✕';
        StorageManager.saveInventory(userInventory);
        updateInventoryUI();
      });

      div.querySelector('.inp-lvl').addEventListener("change", (e) => {
        userInventory[it.name].lvl = parseInt(e.target.value) || 1;
        StorageManager.saveInventory(userInventory);
        updateInventoryUI();
      });

      grid.appendChild(div);
    });

    block.appendChild(grid);
    container.appendChild(block);
  });
  updateInventoryUI();
}

function updateInventoryUI() {
  const chunks = chunkInventoryMessages(invHeadlineInput.value, userInventory, userColors, includeRoleTags);
  const previewContainer = document.getElementById("invPreviewContainer");
  const actionsContainer = document.getElementById("invActionButtons");
  const charBadge = document.getElementById("invCharBadge");

  previewContainer.innerHTML = "";
  actionsContainer.innerHTML = "";

  if (chunks.length === 1) {
    const c = chunks[0];
    charBadge.innerHTML = `<span class="char-badge ${c.charCount > 2000 ? 'char-warn' : 'char-ok'}">Characters: ${c.charCount} / 2,000</span>`;
    actionsContainer.innerHTML = `
      <div class="footer-btn-row">
        <button id="invRoleTagBtnBottom" class="role-tag-toggle ${includeRoleTags ? 'active' : 'inactive'}">
          ${includeRoleTags ? '🏷️ Role Tags: ON' : '🚫 Role Tags: OFF'}
        </button>
        <button class="btn" onclick="copyChunk(0, this)">📋 Copy Inventory for Discord</button>
      </div>
    `;
    document.getElementById("invRoleTagBtnBottom").onclick = toggleRoleTags;

    const pre = document.createElement("pre");
    pre.className = "preview-box";
    pre.innerHTML = c.html;
    previewContainer.appendChild(pre);
  } else {
    charBadge.innerHTML = `<span class="char-badge char-warn">⚠️ Exceeds 2,000 characters! Split into ${chunks.length} parts:</span>`;
    const partsWrapper = document.createElement("div");
    partsWrapper.className = "parts-container";

    chunks.forEach((c, idx) => {
      const partCard = document.createElement("div");
      partCard.className = "part-card";
      partCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <strong style="font-size:1.1rem;">Part ${c.partNum} of ${c.totalParts}</strong>
          <span class="char-badge char-ok" style="margin:0;">${c.charCount} / 2,000 chars</span>
        </div>
        <button class="btn" style="margin-bottom:12px;" onclick="copyChunk(${idx}, this)">📋 Copy Part ${c.partNum} for Discord</button>
        <pre class="preview-box">${c.html}</pre>
      `;
      partsWrapper.appendChild(partCard);
    });
    previewContainer.appendChild(partsWrapper);
  }
}

window.copyChunk = function(idx, btn) {
  const chunks = chunkInventoryMessages(invHeadlineInput.value, userInventory, userColors, includeRoleTags);
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
};

teamHeadlineInput.addEventListener("input", () => {
  StorageManager.saveHeadlines(teamHeadlineInput.value, invHeadlineInput.value);
  updateTeamUI();
});
invHeadlineInput.addEventListener("input", () => {
  StorageManager.saveHeadlines(teamHeadlineInput.value, invHeadlineInput.value);
  updateInventoryUI();
});
vipCheckbox.addEventListener("change", () => {
  StorageManager.saveVip(vipCheckbox.checked);
  renderSlots();
});

document.getElementById("btnInvSelectAll").addEventListener("click", () => {
  ITEMS.forEach(it => { userInventory[it.name].owned = true; });
  StorageManager.saveInventory(userInventory);
  renderInventory();
});
document.getElementById("btnInvDeselectAll").addEventListener("click", () => {
  ITEMS.forEach(it => { userInventory[it.name].owned = false; });
  StorageManager.saveInventory(userInventory);
  renderInventory();
});
document.getElementById("btnInvMaxAll").addEventListener("click", () => {
  ITEMS.forEach(it => { userInventory[it.name].lvl = it.max; });
  StorageManager.saveInventory(userInventory);
  renderInventory();
});

document.getElementById("teamCopyBtn").addEventListener("click", () => {
  const count = vipCheckbox.checked ? 5 : 4;
  const raw = buildTeamMessage(teamHeadlineInput.value, userSlots, count, userColors, false, includeRoleTags);
  navigator.clipboard.writeText(raw).then(() => {
    const btn = document.getElementById("teamCopyBtn");
    btn.textContent = "✅ Copied to Clipboard!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "📋 Copy Team Setup for Discord";
      btn.classList.remove("copied");
    }, 2000);
  });
});

document.getElementById("teamRoleTagBtn").onclick = toggleRoleTags;
document.getElementById("invRoleTagBtnTop").onclick = toggleRoleTags;

initSettings();
updateRoleTagButtons();
renderSlots();
renderInventory();

if (typeof ScannerUI !== "undefined") {
  ScannerUI.init();
}