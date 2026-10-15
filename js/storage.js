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
      inv: localStorage.getItem('td_headline_inv') || "Everything i have"
    };
  },
  saveHeadlines(team, inv) {
    localStorage.setItem('td_headline_team', team);
    localStorage.setItem('td_headline_inv', inv);
  }
};