const CanvasManager = {
  buildTeamImageDom(headline, ign, loadouts, count, colors, includeRoleTag) {
    const bannerColor = getAnsiHex(colors.BANNER || "36");
    const ignColor = getAnsiHex(colors.IGN || "32");

    let totalSelectedSlots = 0;
    loadouts.forEach(ld => {
      totalSelectedSlots += ld.slots.slice(0, count).filter(s => s && s.item).length;
    });

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
      const subText = ld.subtitle && ld.subtitle.trim() ? ld.subtitle.trim() : "";

      let itemsGridHtml = '';
      if (activeSlots.length === 0) {
        itemsGridHtml = `<div style="color:#72767d; font-style:italic; padding:18px 0; font-family:'Consolas', monospace;">(No units selected)</div>`;
      } else {
        let cardsList = '';
        activeSlots.forEach(({ slot, def }) => {
          const roleColor = getAnsiHex(colors[slot.role || def.role] || "37");
          const itemColor = getAnsiHex(colors[def.rarity] || "37");
          const isMax = slot.lvl >= def.max;
          const roleHtml = includeRoleTag ? `<div style="font-size:0.68rem; font-weight:800; color:${roleColor}; text-align:center; margin-bottom:4px; font-family:'Consolas', monospace;">[${slot.role || def.role}]</div>` : '';

          let badgeHtml = isMax
            ? `<div style="background:#15803d; color:#ffffff; font-weight:900; font-size:0.75rem; padding:3px 6px; border-radius:6px; text-align:center; font-family:'Consolas', monospace; box-shadow:0 0 8px rgba(34,197,94,0.45);">MAX (${slot.lvl}/${def.max})</div>`
            : `<div style="background:#1e2436; color:#e2e8f0; font-weight:800; font-size:0.75rem; padding:3px 6px; border-radius:6px; text-align:center; font-family:'Consolas', monospace; border:1px solid #333a4d;">Lvl ${slot.lvl}/${def.max}</div>`;

          cardsList += `
            <div style="width:130px; background:#10121b; border:5px solid ${itemColor}; border-radius:10px; padding:10px 8px; box-sizing:border-box; box-shadow:0 0 10px ${itemColor}33; display:flex; flex-direction:column; justify-content:space-between;">
              ${roleHtml}
              <div style="width:68px; height:68px; margin:0 auto 8px auto; display:flex; align-items:center; justify-content:center;">
                <img src="${def.img}" alt="${escapeXml(def.name)}" style="width:100%; height:100%; object-fit:contain; display:block;">
              </div>
              <div style="font-size:0.82rem; font-weight:bold; color:${itemColor}; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:6px; font-family:'Consolas', monospace;">${escapeXml(def.name)}</div>
              ${badgeHtml}
            </div>
          `;
        });

        itemsGridHtml = `<div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:14px;">${cardsList}</div>`;
      }

      loadoutCardsHtml += `
        <div style="background:#10121b; border:1px solid #262c3f; border-left:5px solid #5865f2; border-radius:10px; padding:20px 24px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:8px;">
            <div style="color:${bannerColor}; font-weight:bold; font-size:1.35rem; font-family:'Consolas', monospace;">${escapeXml(bannerText)}</div>
            ${subText ? `<div style="color:#94a3b8; font-weight:700; font-size:1.05rem; font-family:'Consolas', monospace;">${escapeXml(subText)}</div>` : ''}
          </div>
          ${itemsGridHtml}
        </div>
      `;
    });

    return `
      <div id="teamCaptureCard" style="background:#151822; padding:32px; border-radius:12px; width:940px; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #262c3f; padding-bottom:16px; margin-bottom:22px;">
          <div>
            <div style="font-size:1.65rem; font-weight:800; color:#ffffff; font-family:'Segoe UI', sans-serif;">${escapeXml(headline)}</div>
            ${ign && ign.trim() ? `<div style="font-size:1.05rem; font-weight:700; color:${ignColor}; margin-top:5px; font-family:'Consolas', monospace;">Ingame Name: ${escapeXml(ign.trim())}</div>` : ''}
          </div>
          <div style="display:flex; gap:14px;">
            <div style="background:#10121b; border:1px solid #262c3f; border-radius:8px; padding:8px 16px; text-align:center;">
              <div style="font-size:0.72rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">Slots / Deck</div>
              <div style="font-size:1.15rem; font-weight:800; color:#38bdf8; font-family:'Consolas', monospace;">${count} Slots</div>
            </div>
            <div style="background:#10121b; border:1px solid #262c3f; border-radius:8px; padding:8px 16px; text-align:center;">
              <div style="font-size:0.72rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">Equipped</div>
              <div style="font-size:1.15rem; font-weight:800; color:#4ade80; font-family:'Consolas', monospace;">${totalSelectedSlots} Units</div>
            </div>
          </div>
        </div>

        ${loadoutCardsHtml}

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:22px; padding-top:14px; border-top:1px solid #262c3f; font-size:0.85rem; color:#64748b; font-family:'Segoe UI', sans-serif;">
          <span>⚡ Generated with STN Showcase</span>
          <span>lordjunes.github.io/STNShowcase</span>
        </div>
      </div>
    `;
  },

  buildInventoryImageDom(headline, bannerSubtitle, ign, invData, colors, showUnowned, sortMode = "category", includeRoleTag = true) {
    let totalOwned = 0;
    let totalMaxed = 0;
    ITEMS.forEach(it => {
      const data = invData[it.name];
      if (data && data.owned) {
        totalOwned++;
        if (data.lvl >= it.max) totalMaxed++;
      }
    });

    let renderedSectionsHtml = '';

    const renderCard = (item, isOwned, data, tier) => {
      const currentLvl = isOwned ? data.lvl : 0;
      const isMax = isOwned && currentLvl >= item.max;
      const roleColor = getAnsiHex(colors[item.role] || "37");
      const itemColor = getAnsiHex(colors[item.rarity] || "37");
      const roleHtml = includeRoleTag ? `<div style="font-size:0.68rem; font-weight:800; color:${roleColor}; text-align:center; margin-bottom:4px; font-family:'Consolas', monospace;">[${item.role}]</div>` : '';

      let levelBadgeHtml = isOwned
        ? (isMax
            ? `<div style="background:#15803d; color:#ffffff; font-weight:900; font-size:0.75rem; padding:3px 6px; border-radius:6px; text-align:center; font-family:'Consolas', monospace; box-shadow:0 0 8px rgba(34,197,94,0.45);">MAX (${currentLvl}/${item.max})</div>`
            : `<div style="background:#1e2436; color:#e2e8f0; font-weight:800; font-size:0.75rem; padding:3px 6px; border-radius:6px; text-align:center; font-family:'Consolas', monospace; border:1px solid #333a4d;">Lvl ${currentLvl}/${item.max}</div>`)
        : `<div style="background:#181b26; color:#64748b; font-weight:700; font-size:0.75rem; padding:3px 6px; border-radius:6px; text-align:center; font-family:'Consolas', monospace;">Not Owned</div>`;

      return `
        <div style="width:130px; background:#10121b; border:5px solid ${isOwned ? itemColor : '#262c3f'}; border-radius:10px; padding:10px 8px; box-sizing:border-box; opacity:${isOwned ? '1' : '0.35'}; filter:${isOwned ? 'none' : 'grayscale(1)'}; box-shadow:${isOwned ? '0 0 10px ' + itemColor + '33' : 'none'}; display:flex; flex-direction:column; justify-content:space-between;">
          ${roleHtml}
          <div style="width:68px; height:68px; margin:0 auto 8px auto; display:flex; align-items:center; justify-content:center;">
            <img src="${item.img}" alt="${escapeXml(item.name)}" style="width:100%; height:100%; object-fit:contain; display:block;">
          </div>
          <div style="font-size:0.82rem; font-weight:bold; color:${isOwned ? itemColor : '#64748b'}; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:6px; font-family:'Consolas', monospace;">${escapeXml(item.name)}</div>
          ${levelBadgeHtml}
        </div>
      `;
    };

    if (sortMode === "rarity") {
      RARITY_TIERS.forEach(tier => {
        const tierItems = ITEMS.filter(it => it.rarity === tier.key);
        const displayItems = showUnowned ? tierItems : tierItems.filter(it => invData[it.name] && invData[it.name].owned);
        if (displayItems.length === 0) return;

        let cardsHtml = '';
        displayItems.forEach(item => {
          const data = invData[item.name];
          const isOwned = data && data.owned;
          cardsHtml += renderCard(item, isOwned, data, tier);
        });

        const tierColor = getAnsiHex(colors[tier.key] || "37");

        renderedSectionsHtml += `
          <div style="margin-bottom:24px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; border-bottom:1px solid #262c3f; padding-bottom:6px;">
              <span style="font-size:0.95rem; font-weight:900; color:${tierColor}; font-family:'Consolas', monospace; letter-spacing:1px;">${tier.label}</span>
              <span style="font-size:0.8rem; color:#94a3b8; font-weight:700;">(${displayItems.length} Units)</span>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:12px;">
              ${cardsHtml}
            </div>
          </div>
        `;
      });
    } else {
      CATEGORIES.forEach(cat => {
        const catItems = ITEMS.filter(it => it.role === cat.id);
        const displayItems = showUnowned ? catItems : catItems.filter(it => invData[it.name] && invData[it.name].owned);
        if (displayItems.length === 0) return;

        let cardsHtml = '';
        displayItems.forEach(item => {
          const data = invData[item.name];
          const isOwned = data && data.owned;
          const tier = RARITY_TIERS.find(t => t.key === item.rarity) || RARITY_TIERS[4];
          cardsHtml += renderCard(item, isOwned, data, tier);
        });

        const catColor = getAnsiHex(colors[cat.id] || "37");

        renderedSectionsHtml += `
          <div style="margin-bottom:24px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; border-bottom:1px solid #262c3f; padding-bottom:6px;">
              <span style="font-size:0.95rem; font-weight:900; color:${catColor}; font-family:'Consolas', monospace; letter-spacing:1px;">${cat.title}</span>
              <span style="font-size:0.8rem; color:#94a3b8; font-weight:700;">(${displayItems.length} Units)</span>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:12px;">
              ${cardsHtml}
            </div>
          </div>
        `;
      });
    }

    const bannerColor = getAnsiHex(colors.BANNER || "36");

    return `
      <div id="invCaptureCard" style="background:#151822; padding:32px; border-radius:12px; width:940px; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #262c3f; padding-bottom:16px; margin-bottom:22px;">
          <div>
            <div style="font-size:1.65rem; font-weight:800; color:#ffffff; font-family:'Segoe UI', sans-serif;">${escapeXml(headline)}</div>
            ${bannerSubtitle && bannerSubtitle.trim() ? `<div style="font-size:1.15rem; font-weight:700; color:${bannerColor}; margin-top:4px; font-family:'Consolas', monospace;">${escapeXml(bannerSubtitle.trim())}</div>` : ''}
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

        ${renderedSectionsHtml}

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:22px; padding-top:14px; border-top:1px solid #262c3f; font-size:0.85rem; color:#64748b; font-family:'Segoe UI', sans-serif;">
          <span>⚡ Generated with STN Showcase</span>
          <span>lordjunes.github.io/STNShowcase</span>
        </div>
      </div>
    `;
  },

  buildClanBattleImageDom(cbData, colors, includeRoleTag = true, sortMode = "category") {
    let activeUnits = ITEMS.filter(it => cbData.units[it.name] && cbData.units[it.name].needed);

    if (sortMode === "rarity") {
      const rarityRank = { exclusive: 0, divine: 1, legendary: 2, mythic: 3, epic: 4, rare: 5, common: 6 };
      activeUnits.sort((a, b) => rarityRank[a.rarity] - rarityRank[b.rarity]);
    }

    const bannerColor = getAnsiHex(colors.BANNER || "36");
    const clanColor = getAnsiHex(colors.CLAN || "33");

    let cardsList = '';
    activeUnits.forEach(item => {
      const u = cbData.units[item.name];
      const roleColor = getAnsiHex(colors[item.role] || "37");
      const itemColor = getAnsiHex(colors[item.rarity] || "37");
      const roleHtml = includeRoleTag ? `<div style="font-size:0.68rem; font-weight:800; color:${roleColor}; text-align:center; margin-bottom:4px; font-family:'Consolas', monospace;">[${item.role}]</div>` : '';

      cardsList += `
        <div style="width:130px; background:#10121b; border:5px solid ${itemColor}; border-radius:10px; padding:10px 8px; box-sizing:border-box; box-shadow:0 0 10px ${itemColor}33; display:flex; flex-direction:column; justify-content:space-between;">
          ${roleHtml}
          <div style="width:68px; height:68px; margin:0 auto 8px auto; display:flex; align-items:center; justify-content:center;">
            <img src="${item.img}" alt="${escapeXml(item.name)}" style="width:100%; height:100%; object-fit:contain; display:block;">
          </div>
          <div style="font-size:0.82rem; font-weight:bold; color:${itemColor}; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px; font-family:'Consolas', monospace;">${escapeXml(item.name)}</div>
          <div style="background:#15803d; color:#ffffff; font-weight:800; font-size:0.72rem; padding:2px 4px; border-radius:4px; text-align:center; font-family:'Consolas', monospace; margin-bottom:3px;">Have ${u.haveCount} already</div>
          <div style="background:#854d0e; color:#fef08a; font-weight:800; font-size:0.72rem; padding:2px 4px; border-radius:4px; text-align:center; font-family:'Consolas', monospace; margin-bottom:3px;">Need ${u.needCount}</div>
          <div style="background:#1e2436; color:#94a3b8; font-weight:700; font-size:0.7rem; padding:2px 4px; border-radius:4px; text-align:center; font-family:'Consolas', monospace;">Bring Level ${u.minLvl}+</div>
        </div>
      `;
    });

    if (activeUnits.length === 0) {
      cardsList = `<div style="color:#72767d; font-style:italic; padding:20px; font-family:'Consolas', monospace;">(No specific units requested)</div>`;
    }

    return `
      <div id="cbCaptureCard" style="background:#151822; padding:32px; border-radius:12px; width:940px; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #262c3f; padding-bottom:16px; margin-bottom:22px;">
          <div>
            <div style="font-size:1.65rem; font-weight:800; color:#ffffff; font-family:'Segoe UI', sans-serif;">${escapeXml(cbData.headline)}</div>
            ${cbData.banner && cbData.banner.trim() ? `<div style="font-size:1.15rem; font-weight:700; color:${bannerColor}; margin-top:4px; font-family:'Consolas', monospace;">${escapeXml(cbData.banner.trim())}</div>` : ''}
            ${cbData.clanName && cbData.clanName.trim() ? `<div style="font-size:1.05rem; font-weight:700; color:${clanColor}; margin-top:5px; font-family:'Consolas', monospace;">Clan: ${escapeXml(cbData.clanName.trim())}</div>` : ''}
          </div>
          <div style="display:flex; gap:14px;">
            <div style="background:#10121b; border:1px solid #262c3f; border-radius:8px; padding:8px 16px; text-align:center;">
              <div style="font-size:0.72rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">Looking For</div>
              <div style="font-size:1.15rem; font-weight:800; color:#57f287; font-family:'Consolas', monospace;">${escapeXml(cbData.playersNeeded || "Players")}</div>
            </div>
            <div style="background:#10121b; border:1px solid #262c3f; border-radius:8px; padding:8px 16px; text-align:center;">
              <div style="font-size:0.72rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">Target Units</div>
              <div style="font-size:1.15rem; font-weight:800; color:#38bdf8; font-family:'Consolas', monospace;">${activeUnits.length} Units</div>
            </div>
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
          ${cardsList}
        </div>

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

  async captureInventoryCanvas(headline, bannerSubtitle, ign, invData, colors, showUnowned, sortMode, includeRoleTag) {
    const captureContainer = document.getElementById("invCaptureContainer");
    captureContainer.innerHTML = this.buildInventoryImageDom(headline, bannerSubtitle, ign, invData, colors, showUnowned, sortMode, includeRoleTag);
    const element = document.getElementById("invCaptureCard");
    return await html2canvas(element, { backgroundColor: "#151822", scale: 2 });
  },

  async captureClanBattleCanvas(cbData, colors, includeRoleTag, sortMode) {
    const captureContainer = document.getElementById("cbCaptureContainer");
    captureContainer.innerHTML = this.buildClanBattleImageDom(cbData, colors, includeRoleTag, sortMode);
    const element = document.getElementById("cbCaptureCard");
    return await html2canvas(element, { backgroundColor: "#151822", scale: 2 });
  },

  downloadCanvas(canvas, filename = `showcase_${Date.now()}.png`) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
};