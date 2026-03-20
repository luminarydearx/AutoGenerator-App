const STORAGE_KEY  = 'autogen_drafts_v2';
const SATURN_URL   = import.meta?.env?.VITE_SATURN_URL   || '';
const DRAFT_SECRET = import.meta?.env?.VITE_DRAFT_SECRET || 'saturn-autogen-drafts-2025';

function genId() {
  return 'draft_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
}

function getSession() {
  let sid = localStorage.getItem('autogen_session_id');
  if (!sid) { sid = 'anon_' + Math.random().toString(36).slice(2,12); localStorage.setItem('autogen_session_id', sid); }
  return sid;
}

const DraftSync = {
  async save({ type, title, content, id }) {
    const now   = new Date().toISOString();
    const draft = {
      id:        id || genId(),
      type:      type || 'unknown',
      title:     title || 'Draft',
      content:   typeof content === 'string' ? content : JSON.stringify(content),
      userId:    getSession(),
      createdAt: now, updatedAt: now,
    };
    const existing = this.getAll();
    const idx = existing.findIndex(d => d.id === draft.id);
    if (idx >= 0) existing[idx] = { ...existing[idx], ...draft, updatedAt: now };
    else existing.unshift(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0,200)));
    if (SATURN_URL && DRAFT_SECRET) {
      fetch(SATURN_URL + '/api/autogen/drafts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: DRAFT_SECRET, draft }),
      }).catch(() => {});
    }
    return draft;
  },
  getAll() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } },
  getByType(type) { return this.getAll().filter(d => d.type === type); },
  delete(id) { const u = this.getAll().filter(d => d.id !== id); localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); },
  async syncAll() {
    if (!SATURN_URL || !DRAFT_SECRET) return;
    const drafts = this.getAll();
    if (!drafts.length) return;
    await fetch(SATURN_URL + '/api/autogen/drafts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: DRAFT_SECRET, drafts }),
    }).catch(() => {});
  },
};

export default DraftSync;
