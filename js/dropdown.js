function createCustomDropdown(slotIndex, selectedItemName, unavailableItems, userInventory, onSelectCallback) {
  const wrapper = document.createElement("div");
  wrapper.className = "custom-select-wrapper";

  const currentDef = ITEMS.find(x => x.name === selectedItemName);
  const colors = (typeof userColors !== 'undefined') ? userColors : DEFAULT_COLORS;

  const trigger = document.createElement("div");
  trigger.className = "custom-select-trigger";
  
  if (currentDef) {
    const isOwned = userInventory && userInventory[currentDef.name] && userInventory[currentDef.name].owned;
    const itemColor = getAnsiHex(colors[currentDef.rarity] || "37");
    if (isOwned) {
      trigger.innerHTML = `<span class="trigger-name" style="color: ${itemColor};">${currentDef.name}</span>`;
    } else {
      trigger.innerHTML = `<span class="trigger-name" style="color: #ef4444;">${currentDef.name} (Not in Inventory)</span>`;
    }
  } else {
    trigger.innerHTML = `<span class="trigger-placeholder" style="color:#94a3b8;">+ Select Unit...</span>`;
  }

  const panel = document.createElement("div");
  panel.className = "custom-options-panel";

  const clearOption = document.createElement("div");
  clearOption.className = "custom-option-item";
  clearOption.style.color = "#ef4444";
  clearOption.innerHTML = `<span>🚫 Clear Slot</span>`;
  clearOption.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.remove("open");
    onSelectCallback(null);
  });
  panel.appendChild(clearOption);

  CATEGORIES.forEach(cat => {
    const catHeader = document.createElement("div");
    catHeader.className = `custom-category-header ${cat.cssClass}`;
    catHeader.textContent = cat.title;
    panel.appendChild(catHeader);

    const itemsInCat = ITEMS.filter(it => it.role === cat.id);
    itemsInCat.forEach(it => {
      const isTaken = unavailableItems && unavailableItems.includes(it.name);
      const isOwned = userInventory && userInventory[it.name] && userInventory[it.name].owned;
      const isDisabled = isTaken || !isOwned;
      const itemColor = getAnsiHex(colors[it.rarity] || "37");

      const option = document.createElement("div");
      option.className = `custom-option-item ${isDisabled ? 'disabled' : ''}`;
      
      let badgeNote = '';
      if (!isOwned) {
        badgeNote = `<small style="margin-left:auto; font-size:0.75rem; color:#ef4444; font-weight:bold;">Not in Inventory</small>`;
      } else if (isTaken) {
        badgeNote = `<small style="margin-left:auto; font-size:0.75rem; color:#64748b;">(Equipped)</small>`;
      }

      option.innerHTML = `
        <img src="${it.img}" class="option-icon" alt="" onerror="this.style.display='none'">
        <span style="color: ${isDisabled ? '#64748b' : itemColor};">${it.name}</span>
        ${badgeNote}
      `;

      if (!isDisabled) {
        option.addEventListener("click", (e) => {
          e.stopPropagation();
          panel.classList.remove("open");
          onSelectCallback(it);
        });
      }
      panel.appendChild(option);
    });
  });

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".custom-options-panel").forEach(p => {
      if (p !== panel) p.classList.remove("open");
    });
    panel.classList.toggle("open");
  });

  wrapper.appendChild(trigger);
  wrapper.appendChild(panel);
  return wrapper;
}

document.addEventListener("click", () => {
  document.querySelectorAll(".custom-options-panel").forEach(p => p.classList.remove("open"));
});