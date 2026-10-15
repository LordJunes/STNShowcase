let userColors = StorageManager.loadColors();
let userSlots = StorageManager.loadSlots();
let userInventory = StorageManager.loadInventory();
let headlines = StorageManager.loadHeadlines();
let isVip = StorageManager.loadVip();
let isNitro = StorageManager.loadNitro();
let userIgn = StorageManager.loadIgn();
let outputMode = StorageManager.loadOutputMode();
let includeRoleTags = StorageManager.loadIncludeRoleTags();

const teamHeadlineInput = document.getElementById("teamHeadline");
const teamBannerInput = document.getElementById("teamBanner");
const invHeadlineInput = document.getElementById("invHeadline");
const vipToggleBtn = document.getElementById("vipToggleBtn");
const nitroBtn = document.getElementById("invNitroBtn");
const ignInput = document.getElementById("ignInput");
const ignLinePreview = document.getElementById("ignLinePreview");
const btnToggleOutputMode = document.getElementById("btnToggleOutputMode");
const teamDownloadImgBtn = document.getElementById("teamDownloadImgBtn");

teamHeadlineInput.value = headlines.team;
teamBannerInput.value = headlines.banner;
invHeadlineInput.value = headlines.inv;
ignInput.value = userIgn;

updateIgnPreview();
updateVipButton();
updateNitroButton();
updateOutputModeButton();

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
      `<option value="${opt.code}" ${opt.code === (userColors[key] || DEFAULT_COLORS[key] || "37") ? 'selected' : ''}>${opt.name}</option>`
    ).join('');

    sel.addEventListener("change", () => {
      userColors[key] = sel.value;
      StorageManager.saveColors(userColors);
      updateSettingsLabels();
      updateIgnPreview();
      updateTeamUI();
      updateInventoryUI();
    });
  });
  updateSettingsLabels();
}

function updateSettingsLabels() {
  Object.keys(DEFAULT_COLORS).forEach(k => {
    const lbl = document.getElementById(`lbl_${k}`);
    if (lbl) lbl.style.color = getAnsiHex(userColors[k] || DEFAULT_COLORS[k]);
  });
}

function updateIgnPreview() {
  const ignColor = getAnsiHex(userColors.IGN || "32");
  ignLinePreview.style.color = ignColor;
  ignLinePreview.textContent = userIgn && userIgn.trim() ? `Ingame Name: ${userIgn.trim()}` : `Ingame Name: (none)`;
}

function updateVipButton() {
  vipToggleBtn.className = `status-toggle-btn ${isVip ? 'active' : 'inactive'}`;
  vipToggleBtn.textContent = isVip ? "⭐ VIP: 5 Slots" : "⭐ VIP: 4 Slots";
}

function updateNitroButton() {
  nitroBtn.className = `status-toggle-btn ${isNitro ? 'active' : 'inactive'}`;
  nitroBtn.textContent = isNitro ? "🚀 Discord Nitro: ON (4000)" : "🚀 Discord Nitro: OFF (2000)";
}

function updateOutputModeButton() {
  btnToggleOutputMode.className = `status-toggle-btn ${outputMode === 'image' ? 'active' : 'inactive'}`;
  btnToggleOutputMode.textContent = outputMode === 'image' ? "Output Mode: Image (PNG)" : "Output Mode: Text (ANSI)";
  teamDownloadImgBtn.style.display = outputMode === 'image' ? "flex" : "none";
}

vipToggleBtn.addEventListener("click", () => {
  isVip = !isVip;
  StorageManager.saveVip(isVip);
  updateVipButton();
  renderSlots();
});

nitroBtn.addEventListener("click", () => {
  isNitro = !isNitro;
  StorageManager.saveNitro(isNitro);
  updateNitroButton();
  updateTeamUI();
  updateInventoryUI();
});

btnToggleOutputMode.addEventListener("click", () => {
  outputMode = outputMode === 'text' ? 'image' : 'text';
  StorageManager.saveOutputMode(outputMode);
  updateOutputModeButton();
  updateTeamUI();
});

ignInput.addEventListener("input", () => {
  userIgn = ignInput.value;
  StorageManager.saveIgn(userIgn);
  updateIgnPreview();
  updateTeamUI();
});

document.getElementById("btnExportData").addEventListener("click", () => {
  StorageManager.exportAllData();
});

const importFileInput = document.getElementById("importFileInput");
document.getElementById("btnImportData").addEventListener("click", () => {
  importFileInput.click();
});

importFileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const ok = StorageManager.importAllData(ev.target.result);
    if (ok) {
      alert("All data imported successfully!");
      location.reload();
    } else {
      alert("Failed to parse JSON backup file.");
    }
  };
  reader.readAsText(file);
});

document.getElementById("btnResetColors").addEventListener("click", () => {
  userColors = { ...DEFAULT_COLORS };
  StorageManager.saveColors(userColors);
  initSettings();
  updateIgnPreview();
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
    btn.className = `status-toggle-btn ${includeRoleTags ? 'active' : 'inactive'}`;
    btn.textContent = includeRoleTags ? "🏷️ Role Tags: ON" : "🚫 Role Tags: OFF";
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
  const count = isVip ? 5 : 4;

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

let renderDebounceTimer = null;

function renderCanvasImageAsync() {
  clearTimeout(renderDebounceTimer);
  renderDebounceTimer = setTimeout(async () => {
    const captureContainer = document.getElementById("teamCaptureContainer");
    const imgBox = document.getElementById("teamImagePreviewBox");
    const count = isVip ? 5 : 4;
    
    captureContainer.innerHTML = buildTeamImageDom(teamHeadlineInput.value, teamBannerInput.value, userIgn, userSlots, count, userColors, includeRoleTags);
    const element = document.getElementById("teamCaptureCard");
    if (!element) return;

    if (typeof html2canvas !== "undefined") {
      try {
        const canvas = await html2canvas(element, { backgroundColor: "#151822", scale: 2 });
        imgBox.innerHTML = `<img src="${canvas.toDataURL('image/png')}" alt="Team Setup Image Preview" style="user-select:none; pointer-events:none;">`;
      } catch {
        imgBox.innerHTML = `<div style="padding:15px; color:#ef4444;">Could not generate preview image.</div>`;
      }
    }
  }, 50);
}

function updateTeamUI() {
  const count = isVip ? 5 : 4;
  const limit = isNitro ? 4000 : 2000;
  const raw = buildTeamMessage(teamHeadlineInput.value, teamBannerInput.value, userIgn, userSlots, count, userColors, false, includeRoleTags);
  const html = buildTeamMessage(teamHeadlineInput.value, teamBannerInput.value, userIgn, userSlots, count, userColors, true, includeRoleTags);

  const headlineElem = document.getElementById("teamPreviewHeadline");
  headlineElem.textContent = teamHeadlineInput.value;

  const pre = document.getElementById("teamPreview");
  const imgBox = document.getElementById("teamImagePreviewBox");

  if (outputMode === 'image') {
    headlineElem.style.display = "none";
    pre.style.display = "none";
    imgBox.style.display = "flex";
    renderCanvasImageAsync();
    document.getElementById("teamCopyBtn").textContent = "📷 Copy Setup Image for Discord";
  } else {
    headlineElem.style.display = "block";
    pre.style.display = "block";
    imgBox.style.display = "none";
    pre.innerHTML = html;
    document.getElementById("teamCopyBtn").textContent = "📋 Copy Team Setup for Discord";
  }

  const charBadge = document.getElementById("teamCharCount");
  charBadge.textContent = outputMode === 'image' ? `Mode: PNG Image Export` : `Characters: ${raw.length} / ${limit.toLocaleString()}`;
  charBadge.className = `char-badge ${raw.length > limit && outputMode !== 'image' ? 'char-warn' : 'char-ok'}`;
}

async function getCapturedCanvas() {
  const captureContainer = document.getElementById("teamCaptureContainer");
  const count = isVip ? 5 : 4;
  captureContainer.innerHTML = buildTeamImageDom(teamHeadlineInput.value, teamBannerInput.value, userIgn, userSlots, count, userColors, includeRoleTags);
  const element = document.getElementById("teamCaptureCard");
  return await html2canvas(element, { backgroundColor: "#151822", scale: 2 });
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
  const charLimit = isNitro ? 4000 : 2000;
  const chunks = chunkInventoryMessages(invHeadlineInput.value, userInventory, userColors, includeRoleTags, charLimit);
  const previewContainer = document.getElementById("invPreviewContainer");
  const actionsContainer = document.getElementById("invActionButtons");
  const charBadge = document.getElementById("invCharBadge");

  previewContainer.innerHTML = "";
  actionsContainer.innerHTML = "";

  if (chunks.length === 1) {
    const c = chunks[0];
    charBadge.innerHTML = `<span class="char-badge ${c.charCount > charLimit ? 'char-warn' : 'char-ok'}">Characters: ${c.charCount} / ${charLimit.toLocaleString()}</span>`;
    actionsContainer.innerHTML = `
      <div class="footer-btn-row">
        <button class="btn" onclick="copyChunk(0, this)">📋 Copy Inventory for Discord</button>
      </div>
    `;

    const pre = document.createElement("pre");
    pre.className = "preview-box";
    pre.innerHTML = c.html;
    previewContainer.appendChild(pre);
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
        <button class="btn" style="margin-bottom:12px;" onclick="copyChunk(${idx}, this)">📋 Copy Part ${c.partNum} for Discord</button>
        <pre class="preview-box">${c.html}</pre>
      `;
      partsWrapper.appendChild(partCard);
    });
    previewContainer.appendChild(partsWrapper);
  }
}

window.copyChunk = function(idx, btn) {
  const charLimit = isNitro ? 4000 : 2000;
  const chunks = chunkInventoryMessages(invHeadlineInput.value, userInventory, userColors, includeRoleTags, charLimit);
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
  StorageManager.saveHeadlines(teamHeadlineInput.value, invHeadlineInput.value, teamBannerInput.value);
  updateTeamUI();
});
teamBannerInput.addEventListener("input", () => {
  StorageManager.saveHeadlines(teamHeadlineInput.value, invHeadlineInput.value, teamBannerInput.value);
  updateTeamUI();
});
invHeadlineInput.addEventListener("input", () => {
  StorageManager.saveHeadlines(teamHeadlineInput.value, invHeadlineInput.value, teamBannerInput.value);
  updateInventoryUI();
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

document.getElementById("teamCopyBtn").addEventListener("click", async () => {
  const count = isVip ? 5 : 4;
  const btn = document.getElementById("teamCopyBtn");

  if (outputMode === 'image') {
    try {
      const canvas = await getCapturedCanvas();
      canvas.toBlob(blob => {
        if (!blob) {
          downloadCanvasDirect(canvas);
          return;
        }
        try {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
            const orig = btn.textContent;
            btn.textContent = "✅ Image Copied to Clipboard!";
            btn.classList.add("copied");
            setTimeout(() => {
              btn.textContent = orig;
              btn.classList.remove("copied");
            }, 2000);
          }).catch(() => {
            downloadCanvasDirect(canvas);
          });
        } catch {
          downloadCanvasDirect(canvas);
        }
      }, "image/png");
    } catch {
      alert("Error copying image.");
    }
  } else {
    const raw = buildTeamMessage(teamHeadlineInput.value, teamBannerInput.value, userIgn, userSlots, count, userColors, false, includeRoleTags);
    navigator.clipboard.writeText(raw).then(() => {
      const orig = btn.textContent;
      btn.textContent = "✅ Copied to Clipboard!";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove("copied");
      }, 2000);
    });
  }
});

function downloadCanvasDirect(canvas) {
  const link = document.createElement("a");
  link.download = `team_setup_${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

teamDownloadImgBtn.addEventListener("click", async () => {
  try {
    const canvas = await getCapturedCanvas();
    downloadCanvasDirect(canvas);
  } catch (err) {
    alert("Could not download image: " + err.message);
  }
});

document.getElementById("teamRoleTagBtn").onclick = toggleRoleTags;
document.getElementById("invRoleTagBtnTop").onclick = toggleRoleTags;
document.getElementById("invRoleTagBtnBottom").onclick = toggleRoleTags;

initSettings();
updateRoleTagButtons();
renderSlots();
renderInventory();

if (typeof ScannerUI !== "undefined") {
  ScannerUI.init();
}