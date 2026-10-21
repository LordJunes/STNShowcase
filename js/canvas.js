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

  buildInventoryImageDom(headline, ign, invData, colors, showUnowned) {
    const TIERS = [
      { key: "mythic", label: "MYTHIC (WHITE)", color: "#ffffff", border: "#f8fafc", bg: "rgba(255,255,255,0.08)" },
      { key: "legendary", label: "LEGENDARY (ORANGE)", color: "#f59e0b", border: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
      { key: "uncommon", label: "UNCOMMON (RED)", color: "#ef4444", border: "#ef4444", bg: "rgba(239,68,68,0.08)" },
      { key: "rare", label: "RARE (PURPLE)", color: "#a855f7", border: "#a855f7", bg: "rgba(168,85,247,0.08)" },
      { key: "common", label: "COMMON (BLUE)", color: "#38bdf8", border: "#38bdf8", bg: "rgba(56,189,248,0.08)" }
    ];

    let totalOwned = 0;
    let totalMaxed = 0;
    ITEMS.forEach(it => {
      const data = invData[it.name];
      if (data && data.owned) {
        totalOwned++;
        if (data.lvl >= it.max) totalMaxed++;
      }
    });

    let tierSectionsHtml = '';

    TIERS.forEach(tier => {
      const tierItems = ITEMS.filter(it => it.rarity === tier.key);
      const displayItems = showUnowned ? tierItems : tierItems.filter(it => invData[it.name] && invData[it.name].owned);

      if (displayItems.length === 0) return;

      let cardsHtml = '';
      displayItems.forEach(item => {
        const data = invData[item.name];
        const isOwned = data && data.owned;
        const currentLvl = isOwned ? data.lvl : 0;
        const isMax = isOwned && currentLvl >= item.max;

        const roleColor = getAnsiHex(colors[item.role] || "37");

        let levelBadgeHtml = '';
        if (isOwned) {
          if (isMax) {
            levelBadgeHtml = `<div style="background:#15803d; color:#ffffff; font-weight:900; font-size:0.75rem; padding:3px 6px; border-radius:6px; text-align:center; font-family:'Consolas', monospace; box-shadow:0 0 8px rgba(34,197,94,0.45);">MAX (${currentLvl}/${item.max})</div>`;
          } else {
            levelBadgeHtml = `<div style="background:#1e2436; color:#e2e8f0; font-weight:800; font-size:0.75rem; padding:3px 6px; border-radius:6px; text-align:center; font-family:'Consolas', monospace; border:1px solid #333a4d;">Lvl ${currentLvl}/${item.max}</div>`;
          }
        } else {
          levelBadgeHtml = `<div style="background:#181b26; color:#64748b; font-weight:700; font-size:0.75rem; padding:3px 6px; border-radius:6px; text-align:center; font-family:'Consolas', monospace;">Not Owned</div>`;
        }

        cardsHtml += `
          <div style="width:130px; background:#10121b; border:1.5px solid ${isOwned ? tier.border : '#262c3f'}; border-radius:10px; padding:10px 8px; box-sizing:border-box; opacity:${isOwned ? '1' : '0.35'}; filter:${isOwned ? 'none' : 'grayscale(1)'}; box-shadow:${isOwned ? '0 0 10px ' + tier.bg : 'none'}; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="font-size:0.68rem; font-weight:800; color:${roleColor}; text-align:center; margin-bottom:4px; font-family:'Consolas', monospace;">[${item.role}]</div>
            <div style="width:68px; height:68px; margin:0 auto 8px auto; display:flex; align-items:center; justify-content:center;">
              <img src="${item.img}" alt="${escapeXml(item.name)}" style="width:100%; height:100%; object-fit:contain; display:block;">
            </div>
            <div style="font-size:0.82rem; font-weight:bold; color:#ffffff; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:6px; font-family:'Consolas', monospace;">${escapeXml(item.name)}</div>
            ${levelBadgeHtml}
          </div>
        `;
      });

      tierSectionsHtml += `
        <div style="margin-bottom:24px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; border-bottom:1px solid #262c3f; padding-bottom:6px;">
            <span style="font-size:0.95rem; font-weight:900; color:${tier.color}; font-family:'Consolas', monospace; letter-spacing:1px;">${tier.label}</span>
            <span style="font-size:0.8rem; color:#94a3b8; font-weight:700;">(${displayItems.length} Units)</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:12px;">
            ${cardsHtml}
          </div>
        </div>
      `;
    });

    return `
      <div id="invCaptureCard" style="background:#151822; padding:32px; border-radius:12px; width:940px; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #262c3f; padding-bottom:16px; margin-bottom:22px;">
          <div>
            <div style="font-size:1.65rem; font-weight:800; color:#ffffff; font-family:'Segoe UI', sans-serif;">${escapeXml(headline)}</div>
            ${ign && ign.trim() ? `<div style="font-size:1.05rem; font-weight:700; color:#57f287; margin-top:5px; font-family:'Consolas', monospace;">Ingame Name: ${escapeXml(ign.trim())}</div>` : ''}
          </div>
          <div style="display:flex; gap:14px;">
            <div style="background:#10121b; border:1px solid #262c3f; border-radius:8px; padding:8px 16px; text-align:center;">
              <div style="font-size:0.72rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">Owned Units</div>
              <div style="font-size:1.15rem; font-weight:800; color:#38bdf8; font-family:'Consolas', monospace;">${totalOwned} / ${ITEMS.length}</div>
            </div>
            <div style="background:#10121b; border:1px solid #262c3f; border-radius:8px; padding:8px 16px; text-align:center;">
              <div style="font-size:0.72rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">Max Level</div>
              <div style="font-size:1.15rem; font-weight:800; color:#4ade80; font-family:'Consolas', monospace;">${totalMaxed}</div>
            </div>
          </div>
        </div>

        ${tierSectionsHtml}

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:22px; padding-top:14px; border-top:1px solid #262c3f; font-size:0.85rem; color:#64748b; font-family:'Segoe UI', sans-serif;">
          <span>⚡ Generated with STN Showcase</span>
          <span>lordjunes.github.io/STNShowcase</span>
        </div>
      </div>
    `;
  },

  async captureCanvas(headline, ign, loadouts, count, colors, includeRoleTag) {
    const captureContainer = document.getElementById("teamCaptureContainer");
    captureContainer.innerHTML = this.buildTeamImageDom(headline, ign, loadouts, count, colors, includeRoleTag);
    const element = document.getElementById("teamCaptureCard");
    return await html2canvas(element, { backgroundColor: "#151822", scale: 2 });
  },

  async captureInventoryCanvas(headline, ign, invData, colors, showUnowned) {
    const captureContainer = document.getElementById("invCaptureContainer");
    captureContainer.innerHTML = this.buildInventoryImageDom(headline, ign, invData, colors, showUnowned);
    const element = document.getElementById("invCaptureCard");
    return await html2canvas(element, { backgroundColor: "#151822", scale: 2 });
  },

  downloadCanvas(canvas, filename = `showcase_${Date.now()}.png`) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
};