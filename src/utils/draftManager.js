const DRAFT_KEY = "autogen_cv_drafts";
const LEGACY_DRAFT_KEY = "autogen_cv_draft";
const ACHIEVEMENT_KEY = "autogen_achievements";
const APP_VERSION = "1.3.0";
const EXPORT_FORMAT_VERSION = "autogen_export_v1";

const DEFAULT_STORE = {
  version: APP_VERSION,
  drafts: [],
};

const createDraftId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const sanitizeDraftName = (name) => {
  if (typeof name !== "string") return "Draft Tanpa Nama";
  const trimmed = name.trim();
  return trimmed || "Draft Tanpa Nama";
};

const sortByRecent = (drafts) =>
  [...drafts].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

const writeStore = (store) => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(store));
};

const readStore = () => {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return { ...DEFAULT_STORE };

    const parsed = JSON.parse(saved);
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.drafts)
    ) {
      return {
        version: APP_VERSION,
        drafts: parsed.drafts,
      };
    }
  } catch (e) {
    console.warn("Gagal memuat draft:", e);
  }
  return { ...DEFAULT_STORE };
};

const migrateLegacyDraft = (store) => {
  try {
    const legacySaved = localStorage.getItem(LEGACY_DRAFT_KEY);
    if (!legacySaved || store.drafts.length > 0) return store;

    const parsedLegacy = JSON.parse(legacySaved);
    const legacyData = parsedLegacy?.data || parsedLegacy;
    if (!legacyData || typeof legacyData !== "object") return store;

    const legacyTimestamp = parsedLegacy?.timestamp || Date.now();
    const migratedDraft = {
      id: createDraftId(),
      name: "Draft Lama",
      createdAt: legacyTimestamp,
      updatedAt: legacyTimestamp,
      data: legacyData,
    };

    const migratedStore = {
      version: APP_VERSION,
      drafts: [migratedDraft],
    };

    writeStore(migratedStore);
    localStorage.removeItem(LEGACY_DRAFT_KEY);
    return migratedStore;
  } catch (e) {
    console.warn("Gagal migrasi draft lama:", e);
    return store;
  }
};

const getStore = () => {
  const store = readStore();
  return migrateLegacyDraft(store);
};

// ─────────────────────────────────────────────
// CRUD OPERATIONS
// ─────────────────────────────────────────────

export const listDrafts = () => {
  try {
    const store = getStore();
    return sortByRecent(store.drafts).map((draft) => ({
      id: draft.id,
      name: draft.name,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    }));
  } catch (e) {
    console.warn("Gagal mengambil daftar draft:", e);
    return [];
  }
};

export const saveDraft = (data, options = {}) => {
  try {
    const store = getStore();
    const now = Date.now();
    const selectedId = options?.id;
    const name = sanitizeDraftName(options?.name);
    const draftIndex = selectedId
      ? store.drafts.findIndex((draft) => draft.id === selectedId)
      : -1;

    let savedDraft;

    if (draftIndex >= 0) {
      savedDraft = {
        ...store.drafts[draftIndex],
        name,
        data,
        updatedAt: now,
      };
      store.drafts[draftIndex] = savedDraft;
    } else {
      savedDraft = {
        id: createDraftId(),
        name,
        data,
        createdAt: now,
        updatedAt: now,
      };
      store.drafts.push(savedDraft);
    }

    writeStore({
      version: APP_VERSION,
      drafts: store.drafts,
    });

    return {
      id: savedDraft.id,
      name: savedDraft.name,
      createdAt: savedDraft.createdAt,
      updatedAt: savedDraft.updatedAt,
    };
  } catch (e) {
    console.warn("Gagal menyimpan draft:", e);
    return null;
  }
};

export const loadDraft = (draftId) => {
  try {
    const store = getStore();
    if (store.drafts.length === 0) return null;

    const draft = draftId
      ? store.drafts.find((item) => item.id === draftId)
      : sortByRecent(store.drafts)[0];

    return draft?.data || null;
  } catch (e) {
    console.warn("Gagal memuat draft:", e);
    return null;
  }
};

export const clearDraft = (draftId) => {
  try {
    if (!draftId) {
      localStorage.removeItem(DRAFT_KEY);
      return;
    }

    const store = getStore();
    const filteredDrafts = store.drafts.filter((draft) => draft.id !== draftId);

    writeStore({
      version: APP_VERSION,
      drafts: filteredDrafts,
    });
  } catch (e) {
    console.warn("Gagal menghapus draft:", e);
  }
};

// ─────────────────────────────────────────────
// 📦 EXPORT — Ekspor semua draft jadi file .json
// ─────────────────────────────────────────────

/**
 * Export semua draft ke file autogen_drafts_backup.json
 * User bisa simpan file ini dan import di device/app lain.
 * @returns {{ success: boolean, count: number, error?: string }}
 */
export const exportDrafts = () => {
  try {
    const store = getStore();

    if (store.drafts.length === 0) {
      return { success: false, count: 0, error: "Tidak ada draft untuk diekspor." };
    }

    const exportPayload = {
      __format: EXPORT_FORMAT_VERSION,
      exportedAt: Date.now(),
      exportedAtReadable: new Date().toLocaleString("id-ID"),
      appVersion: APP_VERSION,
      count: store.drafts.length,
      drafts: store.drafts, // Ekspor data draft lengkap termasuk isinya
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date()
      .toLocaleDateString("id-ID", { year: "numeric", month: "2-digit", day: "2-digit" })
      .replace(/\//g, "-");

    const link = document.createElement("a");
    link.href = url;
    link.download = `autogen_drafts_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Bersihkan object URL setelah download
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return { success: true, count: store.drafts.length };
  } catch (e) {
    console.warn("Gagal mengekspor draft:", e);
    return { success: false, count: 0, error: e.message };
  }
};

// ─────────────────────────────────────────────
// 📥 IMPORT — Import draft dari file .json
// ─────────────────────────────────────────────

/**
 * Import draft dari file JSON yang sebelumnya diekspor.
 * Mode "merge": draft baru ditambahkan, draft dengan nama sama dilewati.
 * Mode "replace": semua draft lama dihapus, diganti dengan yang diimport.
 *
 * @param {File} file - File JSON yang dipilih user
 * @param {"merge"|"replace"} mode - Mode import
 * @returns {Promise<{ success: boolean, imported: number, skipped: number, error?: string }>}
 */
export const importDrafts = (file, mode = "merge") => {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ success: false, imported: 0, skipped: 0, error: "File tidak ditemukan." });
      return;
    }

    // Validasi tipe file
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      resolve({
        success: false,
        imported: 0,
        skipped: 0,
        error: "File harus berformat .json",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);

        // Validasi format file
        if (parsed.__format !== EXPORT_FORMAT_VERSION) {
          resolve({
            success: false,
            imported: 0,
            skipped: 0,
            error: "Format file tidak valid. Pastikan file berasal dari AutoGen.",
          });
          return;
        }

        if (!Array.isArray(parsed.drafts) || parsed.drafts.length === 0) {
          resolve({
            success: false,
            imported: 0,
            skipped: 0,
            error: "File tidak berisi draft apapun.",
          });
          return;
        }

        const incomingDrafts = parsed.drafts;

        if (mode === "replace") {
          // Hapus semua draft lama, ganti dengan yang baru
          // Beri ID baru untuk menghindari konflik
          const freshDrafts = incomingDrafts.map((d) => ({
            ...d,
            id: createDraftId(), // ID baru agar tidak konflik
          }));

          writeStore({ version: APP_VERSION, drafts: freshDrafts });

          resolve({
            success: true,
            imported: freshDrafts.length,
            skipped: 0,
          });
          return;
        }

        // Mode "merge" — tambahkan draft baru, skip yang namanya sama
        const currentStore = getStore();
        const existingNames = new Set(
          currentStore.drafts.map((d) => d.name.toLowerCase().trim())
        );

        let imported = 0;
        let skipped = 0;

        for (const incomingDraft of incomingDrafts) {
          const incomingName = (incomingDraft.name || "Draft Tanpa Nama")
            .toLowerCase()
            .trim();

          if (existingNames.has(incomingName)) {
            skipped++;
            continue;
          }

          // Tambahkan draft dengan ID baru
          currentStore.drafts.push({
            ...incomingDraft,
            id: createDraftId(),
          });
          existingNames.add(incomingName);
          imported++;
        }

        writeStore({ version: APP_VERSION, drafts: currentStore.drafts });

        resolve({ success: true, imported, skipped });
      } catch (parseError) {
        console.warn("Gagal parse file import:", parseError);
        resolve({
          success: false,
          imported: 0,
          skipped: 0,
          error: "File rusak atau tidak bisa dibaca.",
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        imported: 0,
        skipped: 0,
        error: "Gagal membaca file.",
      });
    };

    reader.readAsText(file);
  });
};

// ─────────────────────────────────────────────
// ACHIEVEMENTS
// ─────────────────────────────────────────────

export const unlockAchievement = (achievement) => {
  try {
    const achievements = JSON.parse(
      localStorage.getItem(ACHIEVEMENT_KEY) || "[]"
    );
    if (!achievements.includes(achievement)) {
      achievements.push(achievement);
      localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(achievements));
      return true;
    }
    return false;
  } catch (e) {
    console.warn("Gagal unlock achievement:", e);
    return false;
  }
};

export const hasAchievement = (achievement) => {
  try {
    const achievements = JSON.parse(
      localStorage.getItem(ACHIEVEMENT_KEY) || "[]"
    );
    return achievements.includes(achievement);
  } catch {
    return false;
  }
};