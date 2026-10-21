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
      if (data) return JSON.parse(data);
    } catch {}

    let oldSlots = null;
    try {
      const oldData = localStorage.getItem('td_setup_slots');
      if (oldData) oldSlots = JSON.parse(oldData);
    } catch {}

    const oldBanner = localStorage.getItem('td_banner_team') || "=== MY FIRST SETUP ===";

    const initialLoadouts = [
      { 
        banner: (oldBanner === "=== MY SETUP ===" || !oldBanner) ? "=== MY FIRST SETUP ===" : oldBanner, 
        slots: oldSlots || this.defaultSlots() 
      },
      { banner: "=== MY SECOND SETUP ===", slots: this.defaultSlots() },
      { banner: "=== MY THIRD SETUP ===", slots: this.defaultSlots() }
    ];

    localStorage.setItem('td_setup_loadouts', JSON.stringify(initialLoadouts));
    return initialLoadouts;
  },

  saveLoadouts(loadouts) {
    localStorage.setItem('td_setup_loadouts', JSON.stringify(loadouts));
  },

  loadSlots() {
    return this.loadLoadouts()[0].slots;
  },
  saveSlots(slots) {
    const loadouts = this.loadLoadouts();
    loadouts[0].slots = slots;
    this.saveLoadouts(loadouts);
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

  loadRequirements() {
    let req = {};
    ITEMS.forEach(it => { req[it.name] = { owned: false, lvl: 1, max: it.max }; });
    try {
      const data = localStorage.getItem('td_setup_requirements');
      if (data) {
        const parsed = JSON.parse(data);
        Object.keys(parsed).forEach(k => {
          if (req[k]) {
            req[k].owned = !!parsed[k].owned;
            req[k].lvl = Math.min(parsed[k].lvl || 1, req[k].max);
          }
        });
        return req;
      }
    } catch {}
    return req;
  },
  saveRequirements(req) {
    localStorage.setItem('td_setup_requirements', JSON.stringify(req));
  },

  loadHeadlines() {
    return {
      team: localStorage.getItem('td_headline_team') || "Looking for a team to farm Impossible",
      banner: localStorage.getItem('td_banner_team') || "=== MY FIRST SETUP ===",
      inv: localStorage.getItem('td_headline_inv') || "Everything i have",
      reqHeadline: localStorage.getItem('td_req_headline') || "We need one more Person for Clan fight/Clan Join Requirements",
      reqBanner: localStorage.getItem('td_req_banner') || "Required Units to Join our Team/Clan to Farm/Join",
      reqClan: localStorage.getItem('td_req_clan') || ""
    };
  },
  saveHeadlines(team, inv, banner, reqHeadline, reqBanner, reqClan) {
    if (team !== undefined) localStorage.setItem('td_headline_team', team);
    if (inv !== undefined) localStorage.setItem('td_headline_inv', inv);
    if (banner !== undefined) localStorage.setItem('td_banner_team', banner);
    if (reqHeadline !== undefined) localStorage.setItem('td_req_headline', reqHeadline);
    if (reqBanner !== undefined) localStorage.setItem('td_req_banner', reqBanner);
    if (reqClan !== undefined) localStorage.setItem('td_req_clan', reqClan);
  },

  exportAllData() {
    const backup = {
      version: 4,
      timestamp: new Date().toISOString(),
      colors: this.loadColors(),
      loadouts: this.loadLoadouts(),
      vip: this.loadVip(),
      nitro: this.loadNitro(),
      ign: this.loadIgn(),
      includeRoleTags: this.loadIncludeRoleTags(),
      showUnownedInImage: this.loadShowUnownedInImage(),
      inventory: this.loadInventory(),
      requirements: this.loadRequirements(),
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
      if (data.loadouts) {
        this.saveLoadouts(data.loadouts);
      } else if (data.slots) {
        this.saveLoadouts([
          { banner: (data.headlines && data.headlines.banner) || "=== MY FIRST SETUP ===", slots: data.slots },
          { banner: "=== MY SECOND SETUP ===", slots: this.defaultSlots() },
          { banner: "=== MY THIRD SETUP ===", slots: this.defaultSlots() }
        ]);
      }
      if (typeof data.vip === 'boolean') this.saveVip(data.vip);
      if (typeof data.nitro === 'boolean') this.saveNitro(data.nitro);
      if (typeof data.ign === 'string') this.saveIgn(data.ign);
      if (typeof data.includeRoleTags === 'boolean') this.saveIncludeRoleTags(data.includeRoleTags);
      if (typeof data.showUnownedInImage === 'boolean') this.saveShowUnownedInImage(data.showUnownedInImage);
      if (data.inventory) this.saveInventory(data.inventory);
      if (data.requirements) this.saveRequirements(data.requirements);
      if (data.headlines) {
        this.saveHeadlines(
          data.headlines.team,
          data.headlines.inv,
          data.headlines.banner,
          data.headlines.reqHeadline,
          data.headlines.reqBanner,
          data.headlines.reqClan
        );
      }
      return true;
    } catch {
      return false;
    }
  }
};