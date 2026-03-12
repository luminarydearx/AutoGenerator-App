import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, Plus, Trash2 } from "lucide-react";

export default function DraftDropdown({
  savedDrafts = [],
  selectedDraftId,
  setSelectedDraftId,
  setDraftName,
  loadDraft,
  applyDraftData,
  clearDraft,
  resetEditor,
  refreshDrafts,
  formatDraftTimestamp,
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (open && buttonRef.current && !isMobile) {
      const updatePosition = () => {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
        });
      };

      updatePosition();

      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [open, isMobile]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "/") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open, isMobile]);

  const handleLoad = (draft) => {
    const data = loadDraft?.(draft.id);
    if (data) {
      applyDraftData?.(data);
      setSelectedDraftId?.(draft.id);
      setDraftName?.(draft.name);
    }
    setOpen(false);
  };

  const handleNewDraft = () => {
    setSelectedDraftId?.("");
    setDraftName?.("");
    resetEditor?.();
    setOpen(false);
  };

  const handleDelete = (id) => {
    clearDraft?.(id);
    refreshDrafts?.();
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <motion.button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl text-gray-200 text-sm transition"
        title="Ctrl + / untuk toggle"
      >
        <Folder size={16} />
        Draft {savedDrafts.length > 0 && `(${savedDrafts.length})`}
      </motion.button>

      <AnimatePresence>
        {!isMobile && open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20"
            style={{
              position: "fixed",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: "380px",
              zIndex: 999999,
            }}
          >
            <Header handleNewDraft={handleNewDraft} isMobile={false} />
            <DraftList
              savedDrafts={savedDrafts}
              selectedDraftId={selectedDraftId}
              handleLoad={handleLoad}
              handleDelete={handleDelete}
              formatDraftTimestamp={formatDraftTimestamp}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobile && open && (
          <>
            {/* PERBAIKAN: Overlay dengan z-index yang sangat tinggi */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              style={{ zIndex: 9999999 }}
              onClick={() => setOpen(false)}
            />

            {/* PERBAIKAN: Modal dengan z-index lebih tinggi dari overlay dan position fixed yang benar */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(event, info) => {
                if (info.offset.y > 120) {
                  setOpen(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-t-3xl shadow-2xl border-t-4 border-blue-500 overflow-hidden"
              style={{ 
                maxHeight: "85vh", 
                touchAction: "none", 
                zIndex: 99999999,
              }}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <motion.div className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full" />
              </div>

              <Header handleNewDraft={handleNewDraft} isMobile />

              {/* PERBAIKAN: Konten dengan overflow yang tepat dan fixed positioning */}
              <div 
                className="pb-6 overflow-y-auto" 
                style={{ 
                  maxHeight: "calc(85vh - 80px)",
                  overscrollBehavior: "contain"
                }}
              >
                <DraftList
                  savedDrafts={savedDrafts}
                  selectedDraftId={selectedDraftId}
                  handleLoad={handleLoad}
                  handleDelete={handleDelete}
                  formatDraftTimestamp={formatDraftTimestamp}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Header({ handleNewDraft, isMobile }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${isMobile ? "mt-0 border-gray-300 dark:border-gray-600" : "border-white/10"}`}
    >
      <h3 className={`font-semibold text-sm ${isMobile ? "text-gray-800 dark:text-gray-200" : "text-white"}`}>
        Saved Drafts
      </h3>
      <motion.button
        onClick={handleNewDraft}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1 text-xs bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-3 py-1.5 rounded-lg text-white transition border border-blue-400/30 shadow-lg"
      >
        <Plus size={14} />
        New
      </motion.button>
    </div>
  );
}

function DraftList({
  savedDrafts,
  selectedDraftId,
  handleLoad,
  handleDelete,
  formatDraftTimestamp,
}) {
  if (!savedDrafts.length) {
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        No drafts saved.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {savedDrafts.map((draft, index) => (
        <motion.div
          key={draft.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`px-4 py-3 mx-2 my-1 rounded-md transition ${
            selectedDraftId === draft.id
              ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {selectedDraftId === draft.id && (
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
              ✓ Digunakan
            </p>
          )}
          <motion.div
            onClick={() => handleLoad(draft)}
            className="flex items-center justify-between cursor-pointer"
            whileHover={{ x: 2 }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
                {draft.name}
              </p>
              {formatDraftTimestamp && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDraftTimestamp(draft.updatedAt)}
                </p>
              )}
            </div>

            <motion.button
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(draft.id);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="ml-3 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition flex-shrink-0 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <Trash2 size={14} />
            </motion.button>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}