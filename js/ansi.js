const PAD_TAG  = 11;
const PAD_NAME = 17;
const PAD_LVL  = 10;
const ESC = "\u001b";

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
           `<span style="color:#ffffff;">───</span>  ` +
           `<span style="color:#ffffff;">${lvlString}</span>${maxHtml}`;
  } else {
    const maxAnsi = isMax ? ` ${ESC}[1;30m(MAX)${ESC}[0m` : '';
    return `${rolePrefixAnsi}` +
           `${ESC}[1;${itemAnsi}m${namePadded}${ESC}[0m ` +
           `${ESC}[1;37m───${ESC}[0m  ` +
           `${ESC}[1;37m${lvlString}${ESC}[0m${maxAnsi}`;
  }
}

function buildTeamMessage(headline, banner, ign, slots, count, colors, isHtml = false, includeRoleTag = true) {
  let lines = [];
  const bannerText = banner && banner.trim() ? banner.trim() : "=== MY SETUP ===";
  const bannerAnsi = colors.BANNER || "36";
  const bannerHex = getAnsiHex(bannerAnsi);
  const ignAnsi = colors.IGN || "32";
  const ignHex = getAnsiHex(ignAnsi);

  if (isHtml) {
    lines.push(`<span style="color:${bannerHex}; font-weight:bold;">${bannerText}</span>`);
    if (ign && ign.trim()) {
      lines.push(`<span style="color:${ignHex}; font-weight:bold;">Ingame Name: ${ign.trim()}</span>\n`);
    } else {
      lines.push("");
    }
  } else {
    lines.push(`**${headline}**`);
    lines.push("```ansi");
    lines.push(`${ESC}[1;${bannerAnsi}m${bannerText}${ESC}[0m`);
    if (ign && ign.trim()) {
      lines.push(`${ESC}[1;${ignAnsi}mIngame Name: ${ign.trim()}${ESC}[0m\n`);
    } else {
      lines.push("");
    }
  }

  let activeCount = 0;
  for (let i = 0; i < count; i++) {
    const slot = slots[i];
    if (!slot || !slot.item) continue;
    const def = ITEMS.find(x => x.name === slot.item);
    if (!def) continue;

    activeCount++;
    lines.push(formatSetupLine(def, slot.role || def.role, slot.lvl, def.max, colors, isHtml, includeRoleTag));
  }

  if (activeCount === 0) {
    if (isHtml) {
      lines.push(`<span style="color:#72767d; font-style:italic;">(No units selected)</span>`);
    } else {
      lines.push(`${ESC}[1;30m(No units selected)${ESC}[0m`);
    }
  }

  if (!isHtml) lines.push("```");
  return lines.join("\n");
}

function chunkInventoryMessages(headline, invData, colors, includeRoleTag = true, maxChars = 2000) {
  const threshold = maxChars - 150;
  const owned = ITEMS.filter(it => invData[it.name] && invData[it.name].owned);
  const bannerAnsi = colors.BANNER || "36";
  const bannerHex = getAnsiHex(bannerAnsi);

  if (owned.length === 0) {
    return [{
      raw: `**${headline}**\n\`\`\`ansi\n${ESC}[1;${bannerAnsi}m=== INVENTORY ===${ESC}[0m\n\n(No items selected)\n\`\`\``,
      html: `<strong>${headline}</strong>\n\n<span style="color:${bannerHex}; font-weight:bold;">=== INVENTORY ===</span>\n\n<em>(No items selected)</em>`,
      charCount: 120,
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
    const testCandidate = `**${headline}**\n\`\`\`ansi\n${ESC}[1;${bannerAnsi}m=== INVENTORY ===${ESC}[0m\n\n` + [...curRaw, lines[i].raw].join('\n') + `\n\`\`\``;
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
    const raw = `**${headline}${partLabel}**\n\`\`\`ansi\n${ESC}[1;${bannerAnsi}m=== INVENTORY${partLabel} ===${ESC}[0m\n\n` + chunk.rawLines.join('\n') + `\n\`\`\``;
    const html = `<strong>${headline}${partLabel}</strong>\n\n<span style="color:${bannerHex}; font-weight:bold;">=== INVENTORY${partLabel} ===</span>\n\n` + chunk.htmlLines.join('\n');
    return { raw, html, partNum, totalParts, charCount: raw.length };
  });
}

function buildTeamImageDom(headline, banner, ign, slots, count, colors, includeRoleTag) {
  let activeSlots = [];
  for (let i = 0; i < count; i++) {
    const slot = slots[i];
    if (slot && slot.item) {
      const def = ITEMS.find(x => x.name === slot.item);
      if (def) activeSlots.push({ slot, def });
    }
  }

  const bannerText = banner && banner.trim() ? banner.trim() : "=== MY SETUP ===";
  const bannerColor = getAnsiHex(colors.BANNER || "36");
  const ignColor = getAnsiHex(colors.IGN || "32");

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

  const ignHtml = (ign && ign.trim()) ? `<div style="color:${ignColor}; font-weight:bold; font-size:1.35rem; font-family:'Consolas', monospace; margin-top:8px;">Ingame Name: ${escapeXml(ign.trim())}</div>` : '';

  return `
    <div id="teamCaptureCard" style="background:#151822; padding:32px; border-radius:12px; width:940px; box-sizing:border-box;">
      <div style="font-size:1.55rem; font-weight:bold; color:#ffffff; margin-bottom:18px;">${escapeXml(headline)}</div>
      <div style="background:#10121b; border:1px solid #262c3f; border-left:5px solid #5865f2; border-radius:10px; padding:24px;">
        <div style="color:${bannerColor}; font-weight:bold; font-size:1.4rem; font-family:'Consolas', monospace;">${escapeXml(bannerText)}</div>
        ${ignHtml}
        <div style="margin-top:22px;">
          ${rowsHtml}
        </div>
      </div>
    </div>
  `;
}