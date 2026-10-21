const CanvasManager = {
  buildTeamImageDom(headline, ign, loadouts, count, colors, includeRoleTag) {
    const bannerColor = getAnsiHex(colors.BANNER || "36");
    const ignColor = getAnsiHex(colors.IGN || "32");

    let loadoutCardsHtml = '';

    loadouts.forEach((ld, idx) => {
      const hasUnits = ld.slots.slice(0, count).some(s => s && s.item);
      if (idx > 0 && !hasUnits) return;

      let activeSlots = [];
      for (let i = 0; i < count; i++) {
        const slot = ld.slots[i];
        if (slot && slot.item) {
          const def = ITEMS.find(x => x.name === slot.item);
          if (def) activeSlots.push({ slot, def });
        }
      }

      const bannerText = ld.banner && ld.banner.trim() ? ld.banner.trim() : (idx === 0 ? "=== MY FIRST SETUP ===" : idx === 1 ? "=== MY SECOND SETUP ===" : "=== MY THIRD SETUP ===");

      let rowsHtml = '';
      if (activeSlots.length === 0) {
        rowsHtml = `<div style="color:#72767d; font-style:italic; padding:15px 0;">(No units selected)</div>`;
      } else {
        activeSlots.forEach(({ slot, def }) => {
          const roleColor = getAnsiHex(colors[slot.role || def.role] || "37");
          const itemColor = getAnsiHex(colors[def.rarity] || "37");
          const roleHtml = includeRoleTag ? `<span style="color:${roleColor}; font-weight:bold; min-width:140px; display:inline-block;">[${slot.role || def.role}]</span>` : '';
          const maxHtml = slot.lvl >= def.max ? `<span style="color:#72767d; font-weight:bold; margin-left:16px;">(MAX)</span>` : '';

          rowsHtml += `
            <div style="display:flex; align-items:center; gap:20px; margin-bottom:14px;">
              <div style="width:75px; height:75px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <img src="${def.img}" alt="" style="width:100%; height:100%; object-fit:contain; display:block;">
              </div>
              <div style="display:flex; align-items:center; font-family:'Consolas', monospace; font-size:1.35rem; white-space:pre;">
                ${roleHtml}
                <span style="color:${itemColor}; font-weight:bold; min-width:230px; display:inline-block;">${def.name}</span>
                <span style="color:#ffffff; font-weight:bold; margin-right:16px;">───</span>
                <span style="color:#ffffff; font-weight:bold;">Lvl ${slot.lvl}/${def.max}</span>
                ${maxHtml}
              </div>
            </div>
          `;
        });
      }

      const ignHtml = (idx === 0 && ign && ign.trim()) ? `<div style="color:${ignColor}; font-weight:bold; font-size:1.35rem; font-family:'Consolas', monospace; margin-top:8px;">Ingame Name: ${escapeXml(ign.trim())}</div>` : '';

      loadoutCardsHtml += `
        <div style="background:#10121b; border:1px solid #262c3f; border-left:5px solid #5865f2; border-radius:10px; padding:24px; margin-bottom:20px;">
          <div style="color:${bannerColor}; font-weight:bold; font-size:1.4rem; font-family:'Consolas', monospace;">${escapeXml(bannerText)}</div>
          ${ignHtml}
          <div style="margin-top:22px;">
            ${rowsHtml}
          </div>
        </div>
      `;
    });

    return `
      <div id="teamCaptureCard" style="background:#151822; padding:32px; border-radius:12px; width:940px; box-sizing:border-box;">
        <div style="font-size:1.55rem; font-weight:bold; color:#ffffff; margin-bottom:18px;">${escapeXml(headline)}</div>
        ${loadoutCardsHtml}
      </div>
    `;
  },

  async captureCanvas(headline, ign, loadouts, count, colors, includeRoleTag) {
    const captureContainer = document.getElementById("teamCaptureContainer");
    captureContainer.innerHTML = this.buildTeamImageDom(headline, ign, loadouts, count, colors, includeRoleTag);
    const element = document.getElementById("teamCaptureCard");
    return await html2canvas(element, { backgroundColor: "#151822", scale: 2 });
  },

  downloadCanvas(canvas) {
    const link = document.createElement("a");
    link.download = `team_setup_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
};