const PAD_TAG  = 12;
const PAD_NAME = 16;
const PAD_LVL  = 9;
const ESC = "\u001b";

function getAnsiHex(code) {
  const found = ANSI_OPTIONS.find(o => o.code === code);
  return found ? found.hex : "#ffffff";
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
    const itemColor = itemDef.hex;
    const maxHtml = isMax ? ` <span style="color:#72767d;">(MAX)</span>` : '';
    return `${rolePrefixHtml}` +
           `<span style="color:${itemColor}; font-weight:bold;">${namePadded}</span> ───  ` +
           `<span>${lvlString}</span>${maxHtml}`;
  } else {
    const maxAnsi = isMax ? ` ${ESC}[1;30m(MAX)${ESC}[0m` : '';
    return `${rolePrefixAnsi}` +
           `${ESC}[1;${itemAnsi}m${namePadded}${ESC}[0m ───  ` +
           `${ESC}[1;37m${lvlString}${ESC}[0m${maxAnsi}`;
  }
}

function buildTeamMessage(headline, slots, count, colors, isHtml = false, includeRoleTag = true) {
  let lines = [];
  if (isHtml) {
    lines.push(`<strong>${headline}</strong>`);
    lines.push(`<span style="color:#00ffff; font-weight:bold;">=== MY SETUP ===</span>\n`);
  } else {
    lines.push(`**${headline}**`);
    lines.push("```ansi");
    lines.push(`${ESC}[1;36m=== MY SETUP ===${ESC}[0m\n`);
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

function chunkInventoryMessages(headline, invData, colors, includeRoleTag = true) {
  const owned = ITEMS.filter(it => invData[it.name] && invData[it.name].owned);

  if (owned.length === 0) {
    return [{
      raw: `**${headline}**\n\`\`\`ansi\n${ESC}[1;36m=== INVENTORY ===${ESC}[0m\n\n(No items selected)\n\`\`\``,
      html: `<strong>${headline}</strong>\n<span style="color:#00ffff; font-weight:bold;">=== INVENTORY ===</span>\n\n<em>(No items selected)</em>`,
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
    const testCandidate = `**${headline}**\n\`\`\`ansi\n${ESC}[1;36m=== INVENTORY ===${ESC}[0m\n\n` + [...curRaw, lines[i].raw].join('\n') + `\n\`\`\``;
    if (testCandidate.length > 1850 && curRaw.length > 0) {
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
    const raw = `**${headline}${partLabel}**\n\`\`\`ansi\n${ESC}[1;36m=== INVENTORY${partLabel} ===${ESC}[0m\n\n` + chunk.rawLines.join('\n') + `\n\`\`\``;
    const html = `<strong>${headline}${partLabel}</strong>\n<span style="color:#00ffff; font-weight:bold;">=== INVENTORY${partLabel} ===</span>\n\n` + chunk.htmlLines.join('\n');
    return { raw, html, partNum, totalParts, charCount: raw.length };
  });
}