let userColors = StorageManager.loadColors();
let userInventory = StorageManager.loadInventory();
let userIgn = StorageManager.loadIgn();
let isNitro = StorageManager.loadNitro();
let includeRoleTags = StorageManager.loadIncludeRoleTags();

const ignInput = document.getElementById("ignInput");
const ignLinePreview = document.getElementById("ignLinePreview");
ignInput.value = userIgn;

updateIgnPreview();
updateNitroButtons();
updateRoleTagButtons();

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    if (btn.dataset.tab === "teamTab") TeamUI.updateUI();
    if (btn.dataset.tab === "inventoryTab") InventoryUI.updateUI();
    if (btn.dataset.tab === "requirementsTab") RequirementsUI.updateUI();
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
      TeamUI.updateUI();
      InventoryUI.updateUI();
      RequirementsUI.updateUI();
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

function updateNitroButtons() {
  const nitroBtns = [document.getElementById("invNitroBtn"), document.getElementById("reqNitroBtn")];
  nitroBtns.forEach(b => {
    if (!b) return;
    b.className = `status-toggle-btn ${isNitro ? 'active' : 'inactive'}`;
    b.textContent = isNitro ? "🚀 Discord Nitro: ON (4000)" : "🚀 Discord Nitro: OFF (2000)";
  });
}

function toggleNitro() {
  isNitro = !isNitro;
  StorageManager.saveNitro(isNitro);
  updateNitroButtons();
  TeamUI.updateUI();
  InventoryUI.updateUI();
  RequirementsUI.updateUI();
}

document.getElementById("invNitroBtn").onclick = toggleNitro;
document.getElementById("reqNitroBtn").onclick = toggleNitro;

ignInput.addEventListener("input", () => {
  userIgn = ignInput.value;
  StorageManager.saveIgn(userIgn);
  updateIgnPreview();
  TeamUI.updateUI();
});

document.getElementById("btnExportData").onclick = () => StorageManager.exportAllData();

const importFileInput = document.getElementById("importFileInput");
document.getElementById("btnImportData").onclick = () => importFileInput.click();
importFileInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    if (StorageManager.importAllData(ev.target.result)) {
      alert("All data imported successfully!");
      location.reload();
    } else {
      alert("Failed to parse JSON backup file.");
    }
  };
  reader.readAsText(file);
};

document.getElementById("btnResetColors").onclick = () => {
  userColors = { ...DEFAULT_COLORS };
  StorageManager.saveColors(userColors);
  initSettings();
  updateIgnPreview();
  TeamUI.updateUI();
  InventoryUI.updateUI();
  RequirementsUI.updateUI();
};

document.getElementById("btnResetAllData").onclick = () => {
  if (confirm("Are you sure you want to reset all data and settings? This will restore the default fresh view.")) {
    localStorage.clear();
    location.reload();
  }
};

function updateRoleTagButtons() {
  const buttons = [
    document.getElementById("teamRoleTagBtn"), 
    document.getElementById("invRoleTagBtnTop"), 
    document.getElementById("invRoleTagBtnBottom"),
    document.getElementById("reqRoleTagBtnTop"), 
    document.getElementById("reqRoleTagBtnBottom")
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
  TeamUI.updateUI();
  InventoryUI.updateUI();
  RequirementsUI.updateUI();
}

document.getElementById("teamRoleTagBtn").onclick = toggleRoleTags;
document.getElementById("invRoleTagBtnTop").onclick = toggleRoleTags;
document.getElementById("invRoleTagBtnBottom").onclick = toggleRoleTags;
document.getElementById("reqRoleTagBtnTop").onclick = toggleRoleTags;
document.getElementById("reqRoleTagBtnBottom").onclick = toggleRoleTags;

initSettings();
TeamUI.init();
InventoryUI.init();
RequirementsUI.init();

if (typeof ScannerUI !== "undefined") {
  ScannerUI.init();
}