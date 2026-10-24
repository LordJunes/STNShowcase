const StorageManager = {
  loadColors() {
    try {
      const data = localStorage.getItem('td_setup_colors');
      return data ? { ...DEFAULT_COLORS, ...JSON.parse(data) } : { ...DEFAULT_COLORS };
    } catch { return { ...DEFAULT_COLORS }; }
  },
  saveColors(colors) {
    localStorage.setItem('td_setup_colors', JSON.stringify(colors));
  },

  defaultSlots() {
    return [
      { item: null, role: "DAMAGE", lvl: 1 },
      { item: null, role: "SUPPORT", lvl: 1 },
      { item: null, role: "FARM", lvl: 1 },
      { item: null, role: "PET", lvl: 1 },
      { item: null, role: "PET", lvl: 1 }
    ];
  },

  loadLoadouts() {
    try {
      const data = localStorage.getItem('td_setup_loadouts');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((ld, i) => ({
            banner: ld.banner || (i === 0 ? "=== MY FIRST SETUP ===" : i === 1 ? "=== MY SECOND SETUP ===" : "=== MY THIRD SETUP ==="),
            subtitle: ld.subtitle || "",
            slots: Array.isArray(ld.slots) ? ld.slots : this.defaultSlots()
          }));
        }
      }
    } catch {}

    const initialLoadouts = [
      { banner: "=== MY FIRST SETUP ===", subtitle: "", slots: this.defaultSlots() },
      { banner: "=== MY SECOND SETUP ===", subtitle: "", slots: this.defaultSlots() },
      { banner: "=== MY THIRD SETUP ===", subtitle: "", slots: this.defaultSlots() }
    ];

    localStorage.setItem('td_setup_loadouts', JSON.stringify(initialLoadouts));
    return initialLoadouts;
  },

  saveLoadouts(loadouts) {
    localStorage.setItem('td_setup_loadouts', JSON.stringify(loadouts));
  },

  loadTextOutput() {
    return localStorage.getItem('td_text_output_enabled') === 'true';
  },
  saveTextOutput(val) {
    localStorage.setItem('td_text_output_enabled', val ? 'true' : 'false');
  },

  loadInvSortMode() {
    if (!localStorage.getItem('td_sort_rarity_migrated_v2')) {
      localStorage.setItem('td_inv_sort_mode', 'rarity');
      localStorage.setItem('td_cb_sort_mode', 'rarity');
      localStorage.setItem('td_sort_rarity_migrated_v2', 'true');
    }
    return localStorage.getItem('td_inv_sort_mode') || 'rarity';
  },
  saveInvSortMode(mode) {
    localStorage.setItem('td_inv_sort_mode', mode);
  },

  loadCbSortMode() {
    if (!localStorage.getItem('td_sort_rarity_migrated_v2')) {
      localStorage.setItem('td_inv_sort_mode', 'rarity');
      localStorage.setItem('td_cb_sort_mode', 'rarity');
      localStorage.setItem('td_sort_rarity_migrated_v2', 'true');
    }
    return localStorage.getItem('td_cb_sort_mode') || 'rarity';
  },
  saveCbSortMode(mode) {
    localStorage.setItem('td_cb_sort_mode', mode);
  },

  loadVip() {
    return localStorage.getItem('td_setup_vip') === 'true';
  },
  saveVip(isVip) {
    localStorage.setItem('td_setup_vip', isVip ? 'true' : 'false');
  },

  loadNitro() {
    return localStorage.getItem('td_setup_nitro') === 'true';
  },
  saveNitro(isNitro) {
    localStorage.setItem('td_setup_nitro', isNitro ? 'true' : 'false');
  },

  loadIgn() {
    return localStorage.getItem('td_setup_ign') || '';
  },
  saveIgn(ign) {
    localStorage.setItem('td_setup_ign', ign);
  },

  loadIncludeRoleTags() {
    const val = localStorage.getItem('td_include_role_tags');
    return val === null ? true : val === 'true';
  },
  saveIncludeRoleTags(includeTags) {
    localStorage.setItem('td_include_role_tags', includeTags ? 'true' : 'false');
  },

  loadShowUnownedInImage() {
    return localStorage.getItem('td_inv_show_unowned') === 'true';
  },
  saveShowUnownedInImage(val) {
    localStorage.setItem('td_inv_show_unowned', val ? 'true' : 'false');
  },

  loadInventory() {
    let inv = {};
    ITEMS.forEach(it => { inv[it.name] = { owned: false, lvl: 1, max: it.max }; });
    try {
      const data = localStorage.getItem('td_setup_inventory');
      if (data) {
        const parsed = JSON.parse(data);
        Object.keys(parsed).forEach(k => {
          if (inv[k]) {
            inv[k].owned = !!parsed[k].owned;
            inv[k].lvl = Math.min(parsed[k].lvl || 1, inv[k].max);
          }
        });
        return inv;
      }
    } catch {}
    return inv;
  },
  saveInventory(inv) {
    localStorage.setItem('td_setup_inventory', JSON.stringify(inv));
  },

  loadClanBattle() {
    let cb = {
      headline: "We need players for Clan Battle",
      banner: "=== CLAN BATTLE REQUIREMENTS ===",
      clanName: "",
      playersNeeded: "1 - 2 Players",
      units: {}
    };
    ITEMS.forEach(it => {
      cb.units[it.name] = { needed: false, haveCount: 0, needCount: 1, minLvl: 1 };
    });
    try {
      const data = localStorage.getItem('td_clan_battle');
      if (data) {
        const parsed = JSON.parse(data);
        cb.headline = parsed.headline || cb.headline;
        cb.banner = parsed.banner || cb.banner;
        cb.clanName = parsed.clanName || "";
        cb.playersNeeded = parsed.playersNeeded || cb.playersNeeded;
        if (parsed.units) {
          Object.keys(parsed.units).forEach(k => {
            if (cb.units[k]) {
              cb.units[k].needed = !!parsed.units[k].needed;
              cb.units[k].haveCount = parsed.units[k].haveCount !== undefined ? Math.max(0, Math.min(10, parsed.units[k].haveCount)) : (parsed.units[k].minCount || 0);
              cb.units[k].needCount = parsed.units[k].needCount !== undefined ? Math.max(1, Math.min(10, parsed.units[k].needCount)) : (parsed.units[k].maxCount || 1);
              cb.units[k].minLvl = parsed.units[k].minLvl || 1;
            }
          });
        }
      }
    } catch {}
    return cb;
  },
  saveClanBattle(cb) {
    localStorage.setItem('td_clan_battle', JSON.stringify(cb));
  },

  loadHeadlines() {
    return {
      team: localStorage.getItem('td_headline_team') || "Looking for a team to farm Impossible",
      banner: localStorage.getItem('td_banner_team') || "=== MY FIRST SETUP ===",
      inv: localStorage.getItem('td_headline_inv') || "Everything i have",
      invBanner: localStorage.getItem('td_banner_inv') || ""
    };
  },
  saveHeadlines(team, inv, banner, invBanner) {
    if (team !== undefined) localStorage.setItem('td_headline_team', team);
    if (inv !== undefined) localStorage.setItem('td_headline_inv', inv);
    if (banner !== undefined) localStorage.setItem('td_banner_team', banner);
    if (invBanner !== undefined) localStorage.setItem('td_banner_inv', invBanner);
  },

  exportAllData() {
    const backup = {
      version: 5,
      timestamp: new Date().toISOString(),
      textOutput: this.loadTextOutput(),
      invSortMode: this.loadInvSortMode(),
      cbSortMode: this.loadCbSortMode(),
      colors: this.loadColors(),
      loadouts: this.loadLoadouts(),
      vip: this.loadVip(),
      nitro: this.loadNitro(),
      ign: this.loadIgn(),
      includeRoleTags: this.loadIncludeRoleTags(),
      showUnownedInImage: this.loadShowUnownedInImage(),
      inventory: this.loadInventory(),
      clanBattle: this.loadClanBattle(),
      headlines: this.loadHeadlines()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `setup_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importAllData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (typeof data.textOutput === 'boolean') this.saveTextOutput(data.textOutput);
      if (typeof data.invSortMode === 'string') this.saveInvSortMode(data.invSortMode);
      if (typeof data.cbSortMode === 'string') this.saveCbSortMode(data.cbSortMode);
      if (data.colors) this.saveColors(data.colors);
      if (data.loadouts) this.saveLoadouts(data.loadouts);
      if (typeof data.vip === 'boolean') this.saveVip(data.vip);
      if (typeof data.nitro === 'boolean') this.saveNitro(data.nitro);
      if (typeof data.ign === 'string') this.saveIgn(data.ign);
      if (typeof data.includeRoleTags === 'boolean') this.saveIncludeRoleTags(data.includeRoleTags);
      if (typeof data.showUnownedInImage === 'boolean') this.saveShowUnownedInImage(data.showUnownedInImage);
      if (data.inventory) this.saveInventory(data.inventory);
      if (data.clanBattle) this.saveClanBattle(data.clanBattle);
      if (data.headlines) {
        this.saveHeadlines(
          data.headlines.team,
          data.headlines.inv,
          data.headlines.banner,
          data.headlines.invBanner
        );
      }
      return true;
    } catch {
      return false;
    }
  }
};