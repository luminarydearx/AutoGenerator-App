const STORAGE_KEY  = 'autogen_drafts_v2';
const SATURN_URL   = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SATURN_URL)
  || (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SATURN_URL)
  || '';
const DRAFT_SECRET = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_DRAFT_SECRET)
  || 'saturn-autogen-drafts';

function genId() {
  return 'draft_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function getSession() {
  try {
    let sid = localStorage.getItem('autogen_session_id');
    if (!sid) {
      sid = 'anon_' + Math.random().toString(36).slice(2, 12);
      localStorage.setItem('autogen_session_id', sid);
    }
    return sid;
  } catch { return 'unknown'; }
}

function getAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

async function pushToSaturn(body) {
  if (!SATURN_URL) {
    console.warn('[DraftSync] VITE_SATURN_URL not set. Drafts only saved locally.');
    return;
  }
  try {
    const res = await fetch(SATURN_URL.replace(/\/$/, '') + '/api/autogen/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: DRAFT_SECRET, ...body }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[DraftSync] Server error:', err.error || res.status);
    }
  } catch (e) {
    console.warn('[DraftSync] Network error:', e.message);
  }
}

const DraftSync = {
  async save({ type, title, content, id } = {}) {
    const now   = new Date().toISOString();
    const draft = {
      id:        id || genId(),
      type:      type || 'unknown',
      title:     title || 'Draft',
      content:   typeof content === 'string' ? content : JSON.stringify(content),
      userId:    getSession(),
      createdAt: now,
      updatedAt: now,
    };
    const existing = getAll();
    const idx = existing.findIndex(d => d.id === draft.id);
    if (idx >= 0) existing[idx] = { ...existing[idx], ...draft, updatedAt: now };
    else existing.unshift(draft);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 200))); } catch (e) {
      console.warn('[DraftSync] Error occurred while saving draft:', e.message);
    }
    // Send to Saturn (non-blocking)
    pushToSaturn({ draft });
    return draft;
  },

  getAll,

  getByType(type) { return getAll().filter(d => d.type === type); },

  delete(id) {
    try {
      const updated = getAll().filter(d => d.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[DraftSync] Error occurred while deleting draft:', e.message);
    }
  },

  async syncAll() {
    const drafts = getAll();
    if (drafts.length) await pushToSaturn({ drafts });
  },
};

export default DraftSync;
