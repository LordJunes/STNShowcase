const StorageManager = {
  loadColors() {
    try {
      const data = localStorage.getItem('td_setup_colors');
      return data ? JSON.parse(data) : { ...DEFAULT_COLORS };
    } catch { return { ...DEFAULT_COLORS }; }
  },
  saveColors(colors) {
    localStorage.setItem('td_setup_colors', JSON.stringify(colors));
  },

  loadSlots() {
    try {
      const data = localStorage.getItem('td_setup_slots');
      if (data) return JSON.parse(data);
    } catch {}
    return [
      { item: null, role: "DAMAGE", lvl: 1 },
      { item: null, role: "SUPPORT", lvl: 1 },
      { item: null, role: "FARM", lvl: 1 },
      { item: null, role: "PET", lvl: 1 },
      { item: null, role: "PET", lvl: 1 }
    ];
  },
  saveSlots(slots) {
    localStorage.setItem('td_setup_slots', JSON.stringify(slots));
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

  loadOutputMode() {
    return localStorage.getItem('td_setup_output_mode') || 'text';
  },
  saveOutputMode(mode) {
    localStorage.setItem('td_setup_output_mode', mode);
  },

  loadIncludeRoleTags() {
    const val = localStorage.getItem('td_include_role_tags');
    return val === null ? true : val === 'true';
  },
  saveIncludeRoleTags(includeTags) {
    localStorage.setItem('td_include_role_tags', includeTags ? 'true' : 'false');
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

  loadHeadlines() {
    return {
      team: localStorage.getItem('td_headline_team') || "Looking for a team to farm Impossible",
      banner: localStorage.getItem('td_banner_team') || "=== MY SETUP ===",
      inv: localStorage.getItem('td_headline_inv') || "Everything i have"
    };
  },
  saveHeadlines(team, inv, banner) {
    localStorage.setItem('td_headline_team', team);
    localStorage.setItem('td_headline_inv', inv);
    if (banner !== undefined) {
      localStorage.setItem('td_banner_team', banner);
    }
  },

  exportAllData() {
    const backup = {
      version: 2,
      timestamp: new Date().toISOString(),
      colors: this.loadColors(),
      slots: this.loadSlots(),
      vip: this.loadVip(),
      nitro: this.loadNitro(),
      ign: this.loadIgn(),
      outputMode: this.loadOutputMode(),
      includeRoleTags: this.loadIncludeRoleTags(),
      inventory: this.loadInventory(),
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
      if (data.colors) this.saveColors(data.colors);
      if (data.slots) this.saveSlots(data.slots);
      if (typeof data.vip === 'boolean') this.saveVip(data.vip);
      if (typeof data.nitro === 'boolean') this.saveNitro(data.nitro);
      if (typeof data.ign === 'string') this.saveIgn(data.ign);
      if (typeof data.outputMode === 'string') this.saveOutputMode(data.outputMode);
      if (typeof data.includeRoleTags === 'boolean') this.saveIncludeRoleTags(data.includeRoleTags);
      if (data.inventory) this.saveInventory(data.inventory);
      if (data.headlines) {
        this.saveHeadlines(
          data.headlines.team || "Looking for a team to farm Impossible",
          data.headlines.inv || "Everything i have",
          data.headlines.banner || "=== MY SETUP ==="
        );
      }
      return true;
    } catch {
      return false;
    }
  }
};