const PAD_TAG = 11;
const PAD_NAME = 17;
const PAD_LVL = 10;
const PAD_HAVE = 16;
const PAD_NEED = 8;
const ESC = "\u001b";

const PROMO_FOOTER_RAW = "-# ⚡ Generated with [STN Showcase](https://lordjunes.github.io/STNShowcase/)";
const PROMO_FOOTER_HTML = `⚡ Generated with <a href="https://lordjunes.github.io/STNShowcase/" target="_blank" rel="noopener">STN Showcase</a>`;

function getAnsiHex(code) {
  const found = ANSI_OPTIONS.find(o => o.code === code);
  return found ? found.hex : "#ffffff";
}

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function formatSetupLine(itemDef, role, lvl, max, colors, isHtml = false, includeRoleTag = true) {
  const roleAnsi = colors[role] || "37";
  const itemAnsi = colors[itemDef.rarity] || "37";

  const namePadded = itemDef.name.padEnd(PAD_NAME, ' ');
  const lvlString = `Lvl ${lvl}/${max}`.padEnd(PAD_LVL, ' ');
  const isMax = lvl >= max;

  let rolePrefixHtml = '';
  let rolePrefixAnsi = '';

  if (includeRoleTag) {
    const roleTag = `[${role}]`.padEnd(PAD_TAG, ' ');
    if (isHtml) {
      const roleColor = getAnsiHex(roleAnsi);
      rolePrefixHtml = `<span style="color:${roleColor}; font-weight:bold;">${roleTag}</span> `;
    } else {
      rolePrefixAnsi = `${ESC}[1;${roleAnsi}m${roleTag}${ESC}[0m `;
    }
  }

  if (isHtml) {
    const itemColor = getAnsiHex(itemAnsi);
    const maxHtml = isMax ? ` <span style="color:#72767d;">(MAX)</span>` : '';
    return `${rolePrefixHtml}` +
           `<span style="color:${itemColor}; font-weight:bold;">${namePadded}</span> ` +
           `<span style="color:#ffffff;">───</span> ` +
           `<span style="color:#ffffff;">${lvlString}</span>${maxHtml}`;
  } else {
    const maxAnsi = isMax ? ` ${ESC}[1;30m(MAX)${ESC}[0m` : '';
    return `${rolePrefixAnsi}` +
           `${ESC}[1;${itemAnsi}m${namePadded}${ESC}[0m ` +
           `${ESC}[1;37m───${ESC}[0m ` +
           `${ESC}[1;37m${lvlString}${ESC}[0m${maxAnsi}`;
  }
}

function buildTeamMessage(headline, ign, loadouts, count, colors, isHtml = false, includeRoleTag = true) {
  let lines = [];
  const bannerAnsi = colors.BANNER || "36";
  const bannerHex = getAnsiHex(bannerAnsi);
  const ignAnsi = colors.IGN || "32";
  const ignHex = getAnsiHex(ignAnsi);

  if (!isHtml) {
    lines.push(`**${headline}**`);
    lines.push("```ansi");
  }

  let list = Array.isArray(loadouts) && loadouts.length > 0 && loadouts[0].slots ? loadouts : [{ banner: "=== MY FIRST SETUP ===", subtitle: "", slots: loadouts }];
  let activeSectionsCount = 0;

  list.forEach((ld, idx) => {
    const hasUnits = ld.slots.slice(0, count).some(s => s && s.item);
    if (idx > 0 && !hasUnits) return;

    if (activeSectionsCount > 0) {
      lines.push("");
    }
    activeSectionsCount++;

    const bannerText = ld.banner && ld.banner.trim() ? ld.banner.trim() : (idx === 0 ? "=== MY FIRST SETUP ===" : idx === 1 ? "=== MY SECOND SETUP ===" : "=== MY THIRD SETUP ===");
    const subText = ld.subtitle && ld.subtitle.trim() ? ld.subtitle.trim() : "";

    if (isHtml) {
      lines.push(`<span style="color:${bannerHex}; font-weight:bold;">${bannerText}</span>`);
      if (subText) {
        lines.push(`<span style="color:#94a3b8; font-weight:bold;">${subText}</span>`);
      }
      if (idx === 0 && ign && ign.trim()) {
        lines.push(`<span style="color:${ignHex}; font-weight:bold;">Ingame Name: ${ign.trim()}</span>\n`);
      } else {
        lines.push("");
      }
    } else {
      lines.push(`${ESC}[1;${bannerAnsi}m${bannerText}${ESC}[0m`);
      if (subText) {
        lines.push(`${ESC}[1;30m${subText}${ESC}[0m`);
      }
      if (idx === 0 && ign && ign.trim()) {
        lines.push(`${ESC}[1;${ignAnsi}mIngame Name: ${ign.trim()}${ESC}[0m\n`);
      } else {
        lines.push("");
      }
    }

    let activeInThisLoadout = 0;
    for (let i = 0; i < count; i++) {
      const slot = ld.slots[i];
      if (!slot || !slot.item) continue;
      const def = ITEMS.find(x => x.name === slot.item);
      if (!def) continue;

      activeInThisLoadout++;
      lines.push(formatSetupLine(def, slot.role || def.role, slot.lvl, def.max, colors, isHtml, includeRoleTag));
    }

    if (activeInThisLoadout === 0) {
      if (isHtml) {
        lines.push(`<span style="color:#72767d; font-style:italic;">(No units selected)</span>`);
      } else {
        lines.push(`${ESC}[1;30m(No units selected)${ESC}[0m`);
      }
    }
  });

  if (!isHtml) {
    lines.push("```");
    lines.push(PROMO_FOOTER_RAW);
  }
  return lines.join("\n");
}

function chunkInventoryMessages(headline, bannerText, optionalSubLine, invData, colors, includeRoleTag = true, maxChars = 2000, sortMode = "rarity") {
  const threshold = maxChars - 260;
  let owned = ITEMS.filter(it => invData[it.name] && invData[it.name].owned);

  if (sortMode === "rarity") {
    const rarityRank = { exclusive: 0, divine: 1, legendary: 2, mythic: 3, epic: 4, rare: 5, common: 6 };
    owned.sort((a, b) => rarityRank[a.rarity] - rarityRank[b.rarity]);
  }

  const bannerAnsi = colors.BANNER || "36";
  const bannerHex = getAnsiHex(bannerAnsi);
  const clanAnsi = colors.CLAN || "33";
  const clanHex = getAnsiHex(clanAnsi);

  const formatSub = (rawFormat) => {
    if (!optionalSubLine || !optionalSubLine.trim()) return "";
    const clean = optionalSubLine.trim();
    if (rawFormat) {
      return `${ESC}[1;${clanAnsi}m${clean}${ESC}[0m\n`;
    }
    return `<span style="color:${clanHex}; font-weight:bold;">${clean}</span>\n`;
  };

  if (owned.length === 0) {
    const subRaw = formatSub(true);
    const subHtml = formatSub(false);
    return [{
      raw: `**${headline}**\n\`\`\`ansi\n${ESC}[1;${bannerAnsi}m${bannerText}${ESC}[0m\n${subRaw}\n(No units selected)\n\`\`\`\n${PROMO_FOOTER_RAW}`,
      headlineHtml: headline,
      html: `<span style="color:${bannerHex}; font-weight:bold;">${bannerText}</span>\n${subHtml}\n<span style="color:#72767d; font-style:italic;">(No units selected)</span>`,
      charCount: 120 + PROMO_FOOTER_RAW.length,
      partNum: 1,
      totalParts: 1
    }];
  }

  const lines = owned.map(it => {
    const data = invData[it.name];
    return {
      raw: formatSetupLine(it, it.role, data.lvl, it.max, colors, false, includeRoleTag),
      html: formatSetupLine(it, it.role, data.lvl, it.max, colors, true, includeRoleTag)
    };
  });

  let chunks = [];
  let curRaw = [];
  let curHtml = [];

  for (let i = 0; i < lines.length; i++) {
    const subRaw = formatSub(true);
    const testCandidate = `**${headline}**\n\`\`\`ansi\n${ESC}[1;${bannerAnsi}m${bannerText}${ESC}[0m\n${subRaw}\n` + [...curRaw, lines[i].raw].join('\n') + `\n\`\`\`\n${PROMO_FOOTER_RAW}`;
    if (testCandidate.length > threshold && curRaw.length > 0) {
      chunks.push({ rawLines: curRaw, htmlLines: curHtml });
      curRaw = [lines[i].raw];
      curHtml = [lines[i].html];
    } else {
      curRaw.push(lines[i].raw);
      curHtml.push(lines[i].html);
    }
  }
  if (curRaw.length > 0) chunks.push({ rawLines: curRaw, htmlLines: curHtml });

  const totalParts = chunks.length;
  return chunks.map((chunk, idx) => {
    const partNum = idx + 1;
    const partLabel = totalParts > 1 ? ` (Part ${partNum}/${totalParts})` : '';
    const subRaw = formatSub(true);
    const subHtml = formatSub(false);

    const raw = `**${headline}${partLabel}**\n\`\`\`ansi\n${ESC}[1;${bannerAnsi}m${bannerText}${partLabel}${ESC}[0m\n${subRaw}\n` + chunk.rawLines.join('\n') + `\n\`\`\`\n${PROMO_FOOTER_RAW}`;
    const headlineHtml = `${headline}${partLabel}`;
    const html = `<span style="color:${bannerHex}; font-weight:bold;">${bannerText}${partLabel}</span>\n${subHtml}\n` + chunk.htmlLines.join('\n');
    return { raw, headlineHtml, html, partNum, totalParts, charCount: raw.length };
  });
}

function chunkClanBattleMessages(headline, bannerText, clanName, playersNeeded, cbData, colors, includeRoleTag = true, maxChars = 2000, sortMode = "rarity") {
  const threshold = maxChars - 280;
  let activeItems = ITEMS.filter(it => cbData.units[it.name] && cbData.units[it.name].needed);

  if (sortMode === "rarity") {
    const rarityRank = { exclusive: 0, divine: 1, legendary: 2, mythic: 3, epic: 4, rare: 5, common: 6 };
    activeItems.sort((a, b) => rarityRank[a.rarity] - rarityRank[b.rarity]);
  }

  const bannerAnsi = colors.BANNER || "36";
  const bannerHex = getAnsiHex(bannerAnsi);
  const clanAnsi = colors.CLAN || "33";
  const clanHex = getAnsiHex(clanAnsi);

  let extraSubLinesRaw = "";
  let extraSubLinesHtml = "";

  if (clanName && clanName.trim()) {
    extraSubLinesRaw += `${ESC}[1;${clanAnsi}mClan: ${clanName.trim()}${ESC}[0m\n`;
    extraSubLinesHtml += `<span style="color:${clanHex}; font-weight:bold;">Clan: ${clanName.trim()}</span>\n`;
  }
  if (playersNeeded && playersNeeded.trim()) {
    extraSubLinesRaw += `${ESC}[1;32mPlayers Needed: ${playersNeeded.trim()}${ESC}[0m\n`;
    extraSubLinesHtml += `<span style="color:#57f287; font-weight:bold;">Players Needed: ${playersNeeded.trim()}</span>\n`;
  }

  if (activeItems.length === 0) {
    return [{
      raw: `**${headline}**\n\`\`\`ansi\n${ESC}[1;${bannerAnsi}m${bannerText}${ESC}[0m\n${extraSubLinesRaw}\n(No specific units required)\n\`\`\`\n${PROMO_FOOTER_RAW}`,
      headlineHtml: headline,
      html: `<span style="color:${bannerHex}; font-weight:bold;">${bannerText}</span>\n${extraSubLinesHtml}\n<span style="color:#72767d; font-style:italic;">(No specific units required)</span>`,
      charCount: 120 + PROMO_FOOTER_RAW.length,
      partNum: 1,
      totalParts: 1
    }];
  }

  const lines = activeItems.map(it => {
    const u = cbData.units[it.name];
    const roleAnsi = colors[it.role] || "37";
    const itemAnsi = colors[it.rarity] || "37";

    let roleRaw = '';
    let roleHtml = '';
    if (includeRoleTag) {
      const roleTag = `[${it.role}]`.padEnd(PAD_TAG, ' ');
      roleRaw = `${ESC}[1;${roleAnsi}m${roleTag}${ESC}[0m `;
      roleHtml = `<span style="color:${getAnsiHex(roleAnsi)}; font-weight:bold;">${roleTag}</span> `;
    }

    const namePadded = it.name.padEnd(PAD_NAME, ' ');
    const haveStr = `Have ${u.haveCount} already`.padEnd(PAD_HAVE, ' ');
    const needStr = `Need ${u.needCount}`.padEnd(PAD_NEED, ' ');
    const lvlStr = `Bring Level ${u.minLvl}+`;

    return {
      raw: `${roleRaw}${ESC}[1;${itemAnsi}m${namePadded}${ESC}[0m ${ESC}[1;37m───${ESC}[0m ${ESC}[1;32m${haveStr}${ESC}[0m ${ESC}[1;37m|${ESC}[0m ${ESC}[1;33m${needStr}${ESC}[0m ${ESC}[1;37m(${lvlStr})${ESC}[0m`,
      html: `${roleHtml}<span style="color:${getAnsiHex(itemAnsi)}; font-weight:bold;">${namePadded}</span> <span style="color:#ffffff;">───</span> <span style="color:#57f287; font-weight:bold;">${haveStr}</span> <span style="color:#ffffff;">|</span> <span style="color:#fee75c; font-weight:bold;">${needStr}</span> <span style="color:#ffffff;">(${lvlStr})</span>`
    };
  });

  let chunks = [];
  let curRaw = [];
  let curHtml = [];

  for (let i = 0; i < lines.length; i++) {
    const testCandidate = `**${headline}**\n\`\`\`ansi\n${ESC}[1;${bannerAnsi}m${bannerText}${ESC}[0m\n${extraSubLinesRaw}\n` + [...curRaw, lines[i].raw].join('\n') + `\n\`\`\`\n${PROMO_FOOTER_RAW}`;
    if (testCandidate.length > threshold && curRaw.length > 0) {
      chunks.push({ rawLines: curRaw, htmlLines: curHtml });
      curRaw = [lines[i].raw];
      curHtml = [lines[i].html];
    } else {
      curRaw.push(lines[i].raw);
      curHtml.push(lines[i].html);
    }
  }
  if (curRaw.length > 0) chunks.push({ rawLines: curRaw, htmlLines: curHtml });

  const totalParts = chunks.length;
  return chunks.map((chunk, idx) => {
    const partNum = idx + 1;
    const partLabel = totalParts > 1 ? ` (Part ${partNum}/${totalParts})` : '';

    const raw = `**${headline}${partLabel}**\n\`\`\`ansi\n${ESC}[1;${bannerAnsi}m${bannerText}${partLabel}${ESC}[0m\n${extraSubLinesRaw}\n` + chunk.rawLines.join('\n') + `\n\`\`\`\n${PROMO_FOOTER_RAW}`;
    const headlineHtml = `${headline}${partLabel}`;
    const html = `<span style="color:${bannerHex}; font-weight:bold;">${bannerText}${partLabel}</span>\n${extraSubLinesHtml}\n` + chunk.htmlLines.join('\n');
    return { raw, headlineHtml, html, partNum, totalParts, charCount: raw.length };
  });
}