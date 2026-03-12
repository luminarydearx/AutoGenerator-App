import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Briefcase,
  Download,
  Plus,
  Trash2,
  Save,
  FolderOpen,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Palette,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  User,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { toast } from "react-hot-toast";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
} from "docx";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  saveDraft,
  loadDraft,
  listDrafts,
  clearDraft,
  unlockAchievement,
} from "../utils/draftManager";
import { showBadgeNotification } from "../components/ui/BadgeNotification";
import DraftDropdown from "../components/ui/DraftDropdown";
import SessionRecoveryModal from "../components/ui/SessionRecoveryModal";
import DraftPortabilityPanel from "../components/ui/DraftPortabilityPanel";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";

const COUNTRY_CODES = {
  7: "RU",
  1: "US",
  44: "GB",
  33: "FR",
  49: "DE",
  39: "IT",
  34: "ES",
  61: "AU",
  81: "JP",
  82: "KR",
  86: "CN",
  91: "IN",
  62: "ID",
};

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const digitsOnly = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) {
    try {
      const phoneNumber = parsePhoneNumberFromString(phone);
      if (phoneNumber && phoneNumber.isValid()) {
        return phoneNumber.formatInternational();
      }
    } catch (error) {
      console.warn("Error parsing international number:", error);
    }
    return phone;
  }
  if (
    digitsOnly.length >= 10 &&
    digitsOnly.length <= 13 &&
    digitsOnly.startsWith("0") &&
    (digitsOnly.startsWith("08") ||
      digitsOnly.startsWith("021") ||
      digitsOnly.startsWith("022") ||
      digitsOnly.startsWith("031") ||
      digitsOnly.startsWith("0411") ||
      digitsOnly.startsWith("061") ||
      digitsOnly.startsWith("0711") ||
      digitsOnly.startsWith("0911"))
  ) {
    try {
      const localNumber = digitsOnly.substring(1);
      const phoneNumber = parsePhoneNumberFromString(`+62${localNumber}`);
      if (phoneNumber && phoneNumber.isValid()) {
        return phoneNumber.formatInternational();
      }
    } catch (error) {
      console.warn("Error formatting Indonesian number:", error);
    }
  }
  if (digitsOnly.length >= 8) {
    const countryPrefixes = [
      "1",
      "44",
      "33",
      "49",
      "39",
      "34",
      "61",
      "81",
      "82",
      "86",
      "91",
      "62",
    ];
    for (let prefix of countryPrefixes) {
      if (digitsOnly.startsWith(prefix)) {
        try {
          const phoneNumber = parsePhoneNumberFromString(`+${digitsOnly}`);
          if (phoneNumber && phoneNumber.isValid()) {
            return phoneNumber.formatInternational();
          }
        } catch {
          const countryMap = {
            1: "US",
            44: "GB",
            33: "FR",
            49: "DE",
            39: "IT",
            34: "ES",
            61: "AU",
            81: "JP",
            82: "KR",
            86: "CN",
            91: "IN",
            62: "ID",
          };
          try {
            const phoneNumber = parsePhoneNumberFromString(
              `+${digitsOnly}`,
              countryMap[prefix],
            );
            if (phoneNumber && phoneNumber.isValid()) {
              return phoneNumber.formatInternational();
            }
          } catch (fallbackError) {
            console.warn("Error formatting fallback number:", fallbackError);
          }
        }
      }
    }
  }
  return phone;
};

const DEFAULT_PERSONAL_INFO = {
  nama: "",
  email: "",
  telepon: "",
  alamat: "",
  kota: "",
  link: "",
};

const createDefaultSections = () => [
  {
    id: 1,
    type: "custom",
    title: "PENDIDIKAN",
    items: [{ id: 1, judul: "", subjudul: "", tahun: "", deskripsi: "" }],
  },
  {
    id: 2,
    type: "custom",
    title: "PENGALAMAN KERJA",
    items: [{ id: 1, judul: "", subjudul: "", tahun: "", deskripsi: "" }],
  },
];

const AutoSaveIndicator = ({ status }) => {
  const icons = {
    saved: <Check size={16} className="text-emerald-500" />,
    saving: (
      <div className="flex items-center">
        <Clock size={16} className="text-blue-500 animate-pulse" />
        <div className="ml-1 flex space-x-0.5">
          <div
            className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    ),
    idle: null,
  };

  const messages = {
    saved: "Tersimpan",
    saving: "Menyimpan",
    idle: "",
  };

  if (status === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-700/80 dark:to-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 shadow-lg"
    >
      {icons[status]}
      <span
        className={`text-xs font-semibold ${status === "saved" ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}`}
      >
        {messages[status]}
      </span>
    </motion.div>
  );
};

const SortableSection = ({
  section,
  index,
  sectionsLength,
  onRemove,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  isCollapsed,
  toggleCollapse,
  onMoveUp,
  onMoveDown,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    activationConstraint: {
      distance: 8,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [showActions, setShowActions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };
    if (showActions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showActions]);

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        zIndex: showActions ? 999 : isDragging ? 1000 : "auto",
      }}
      className="mb-6 relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex justify-between items-center p-3 md:p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
          {!isMobile && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 flex-shrink-0 transition-colors rounded-md hover:bg-white/50 dark:hover:bg-gray-600/50"
              style={{ touchAction: "none" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
          )}
          <input
            type="text"
            value={section.title}
            onChange={(e) => {
              e.stopPropagation();
              onUpdateItem(section.id, null, "title", e.target.value);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onFocus={(e) => {
              setShowActions(false);
              e.target.select();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 pb-1 border-b-2 border-purple-600 dark:border-purple-500 bg-transparent focus:outline-none focus:border-purple-700 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-600 flex-1 min-w-0 transition-colors cursor-text"
            placeholder="JUDUL SECTION"
            style={{
              textTransform: "uppercase",
              caretColor: "#7c3aed",
              color: "transparent",
            }}
          />
        </div>

        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 ml-2">
          <div className="relative" ref={actionsRef}>
            <button
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-white/70 dark:hover:bg-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              aria-label="Aksi section"
            >
              <MoreVertical size={18} />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-lg"
                  style={{
                    zIndex: 9999,
                    pointerEvents: "auto",
                  }}
                >
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(index);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all"
                    >
                      <ArrowUp
                        size={16}
                        className="text-purple-600 dark:text-purple-400"
                      />
                      <span className="font-medium">Pindah Ke Atas</span>
                    </button>
                  )}

                  {index < sectionsLength - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown(index);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all"
                    >
                      <ArrowDown
                        size={16}
                        className="text-purple-600 dark:text-purple-400"
                      />
                      <span className="font-medium">Pindah Ke Bawah</span>
                    </button>
                  )}

                  {(index > 0 || index < sectionsLength - 1) && (
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(section.id);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm flex items-center space-x-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 size={16} />
                    <span className="font-medium">Hapus Section</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-white/70 dark:hover:bg-gray-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
            aria-label={isCollapsed ? "Buka section" : "Tutup section"}
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-2"
          >
            {section.items.map((item) => (
              <div
                key={item.id}
                className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100">
                    Item
                  </h4>
                  {section.items.length > 1 && (
                    <button
                      onClick={() => onRemoveItem(section.id, item.id)}
                      className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                      aria-label="Hapus item"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={item.judul}
                    onChange={(e) =>
                      onUpdateItem(section.id, item.id, "judul", e.target.value)
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Judul (mis. Nama Institusi / Posisi)"
                  />
                  <input
                    type="text"
                    value={item.subjudul}
                    onChange={(e) =>
                      onUpdateItem(
                        section.id,
                        item.id,
                        "subjudul",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Sub-judul (mis. Jurusan / Perusahaan)"
                  />
                  <input
                    type="text"
                    value={item.tahun}
                    onChange={(e) =>
                      onUpdateItem(section.id, item.id, "tahun", e.target.value)
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Tahun / Periode"
                  />
                  <textarea
                    value={item.deskripsi}
                    onChange={(e) =>
                      onUpdateItem(
                        section.id,
                        item.id,
                        "deskripsi",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500"
                    rows="3"
                    placeholder="Deskripsi / Detail"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => onAddItem(section.id)}
              className="w-full py-2.5 border-2 border-dashed border-purple-300 dark:border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-400 dark:hover:border-purple-400 transition-all flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <Plus size={14} />
              <span>Tambah Item</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CVGenerator = () => {
  const [personalInfo, setPersonalInfo] = useState(DEFAULT_PERSONAL_INFO);
  const [profileSummary, setProfileSummary] = useState("");
  const [sections, setSections] = useState(() => createDefaultSections());
  const [foto, setFoto] = useState(null);
  const [template, setTemplate] = useState("minimal");
  const [draftName, setDraftName] = useState("");
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [activeId, setActiveId] = useState(null);
  const fileInputRef = useRef(null);
  const cvRef = useRef(null);
  const generatorRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [previewHeight, setPreviewHeight] = useState("auto");

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);

  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);

  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isDraftOpen, setIsDraftOpen] = useState(false);

  const [isPersonalInfoCollapsed, setIsPersonalInfoCollapsed] = useState(() => {
    const saved = localStorage.getItem("cv_personal_info_collapsed");
    return saved === "true";
  });

  const [collapsedSections, setCollapsedSections] = useState(() => {
    const saved = localStorage.getItem("cv_collapsed_sections");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Invalid collapsed sections in localStorage");
      }
    }
    return createDefaultSections().reduce((acc, sec) => {
      acc[sec.id] = false;
      return acc;
    }, {});
  });

  const toggleCollapse = (sectionId) => {
    setCollapsedSections((prev) => {
      const newState = {
        ...prev,
        [sectionId]: !prev[sectionId],
      };
      localStorage.setItem("cv_collapsed_sections", JSON.stringify(newState));
      return newState;
    });
  };

  const togglePersonalInfo = () => {
    const newState = !isPersonalInfoCollapsed;
    setIsPersonalInfoCollapsed(newState);
    localStorage.setItem("cv_personal_info_collapsed", String(newState));
  };

  const getCurrentDraftData = () => ({
    personalInfo,
    profileSummary,
    sections,
    template,
    foto,
  });

  const resetEditor = () => {
    setPersonalInfo(DEFAULT_PERSONAL_INFO);
    setProfileSummary("");
    setSections(createDefaultSections());
    setTemplate("minimal");
    setFoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    localStorage.removeItem("cv_session_recovery");
  };

  const applyDraftData = (draft) => {
    if (!draft) return;
    setPersonalInfo({
      ...DEFAULT_PERSONAL_INFO,
      ...(draft.personalInfo || {}),
    });
    setProfileSummary(draft.profileSummary || "");
    setSections(
      Array.isArray(draft.sections) && draft.sections.length > 0
        ? draft.sections
        : createDefaultSections(),
    );
    setTemplate(draft.template || "minimal");
    setFoto(draft.foto || null);
    if (!draft.foto && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const refreshDrafts = () => {
    const drafts = listDrafts();
    setSavedDrafts(drafts);
    return drafts;
  };

  const updateSelectedDraft = (draftId) => {
    setSelectedDraftId(draftId);
    if (draftId) {
      localStorage.setItem("cv_last_selected_draft", draftId);
    } else {
      localStorage.removeItem("cv_last_selected_draft");
    }
  };

  const handleRestoreSession = () => {
    if (recoveryData) {
      applyDraftData(recoveryData);
      if (recoveryData.draftName) {
        setDraftName(recoveryData.draftName);
      }
      toast.success("Data berhasil dipulihkan!", { duration: 3000 });
    }
    setShowRecoveryModal(false);
  };

  const handleDiscardSession = () => {
    localStorage.removeItem("cv_session_recovery");
    setShowRecoveryModal(false);
    setDraftName("Draft 1");
  };

  useEffect(() => {
    if (isInitialLoad) return;

    const sessionTimeout = setTimeout(() => {
      const sessionData = getCurrentDraftData();
      localStorage.setItem(
        "cv_session_recovery",
        JSON.stringify({
          ...sessionData,
          timestamp: Date.now(),
          draftName: draftName,
          selectedDraftId: selectedDraftId,
        }),
      );
    }, 1000);

    return () => clearTimeout(sessionTimeout);
  }, [
    personalInfo,
    profileSummary,
    sections,
    template,
    foto,
    draftName,
    selectedDraftId,
    isInitialLoad,
  ]);

  const updateHeightTimeoutRef = useRef(null);

  // PERBAIKAN: Update height synchronization dengan debouncing lebih cepat
  const updateHeight = useCallback(() => {
    if (!generatorRef.current) return;

    if (updateHeightTimeoutRef.current) {
      clearTimeout(updateHeightTimeoutRef.current);
    }

    // Gunakan debounce yang lebih pendek untuk responsivitas lebih baik
    updateHeightTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        const generatorHeight = generatorRef.current?.offsetHeight;
        if (generatorHeight) {
          setPreviewHeight(`${generatorHeight}px`);
        }
      });
    }, 10); // Dikurangi dari 50ms ke 10ms untuk lebih responsif
  }, []);

  useEffect(() => {
    updateHeight();
  }, [
    sections,
    collapsedSections,
    isPersonalInfoCollapsed,
    isTemplateOpen,
    isDraftOpen,
    profileSummary,
    personalInfo,
    foto,
    template,
    updateHeight,
  ]);

  useEffect(() => {
    if (!generatorRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(generatorRef.current);
    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
      if (updateHeightTimeoutRef.current) {
        clearTimeout(updateHeightTimeoutRef.current);
      }
    };
  }, [updateHeight]);

  useEffect(() => {
    if (isInitialLoad || !selectedDraftId) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setAutoSaveStatus("saving");

    autoSaveTimeoutRef.current = setTimeout(() => {
      const currentData = getCurrentDraftData();
      const currentDataString = JSON.stringify(currentData);

      if (lastSavedDataRef.current === currentDataString) {
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 1000);
        return;
      }

      let currentDraft = savedDrafts.find((d) => d.id === selectedDraftId);

      if (!currentDraft) {
        const refreshedDrafts = listDrafts();
        setSavedDrafts(refreshedDrafts);
        currentDraft = refreshedDrafts.find((d) => d.id === selectedDraftId);
      }

      if (currentDraft) {
        const saved = saveDraft(currentData, {
          id: selectedDraftId,
          name: currentDraft.name,
        });

        if (saved) {
          lastSavedDataRef.current = currentDataString;
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 1000);
        } else {
          setAutoSaveStatus("idle");
        }
      } else {
        setAutoSaveStatus("idle");
      }
    }, 300);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [
    personalInfo,
    profileSummary,
    sections,
    template,
    foto,
    selectedDraftId,
    isInitialLoad,
    savedDrafts,
  ]);

  useEffect(() => {
    const drafts = listDrafts();
    setSavedDrafts(drafts);

    const sessionRecovery = localStorage.getItem("cv_session_recovery");
    const lastSelectedDraftId = localStorage.getItem("cv_last_selected_draft");

    const checkSessionRecovery = (sessionRecovery) => {
      try {
        const recoveryDataParsed = JSON.parse(sessionRecovery);
        const recoveryAge = Date.now() - (recoveryDataParsed.timestamp || 0);

        if (recoveryAge < 86400000) {
          if (recoveryDataParsed.selectedDraftId) {
            const draftData = loadDraft(recoveryDataParsed.selectedDraftId);
            if (draftData) {
              applyDraftData(draftData);
              setSelectedDraftId(recoveryDataParsed.selectedDraftId);
              setDraftName(recoveryDataParsed.draftName || "Draft");
              localStorage.removeItem("cv_session_recovery");
              return;
            }
          }

          setRecoveryData(recoveryDataParsed);
          setShowRecoveryModal(true);
        } else {
          localStorage.removeItem("cv_session_recovery");
          setDraftName("Draft 1");
        }
      } catch (error) {
        localStorage.removeItem("cv_session_recovery");
        setDraftName("Draft 1");
      }
    };

    if (lastSelectedDraftId && drafts.length > 0) {
      const draftExists = drafts.find((d) => d.id === lastSelectedDraftId);

      if (draftExists) {
        const draftData = loadDraft(lastSelectedDraftId);
        if (draftData) {
          applyDraftData(draftData);
          setSelectedDraftId(lastSelectedDraftId);
          setDraftName(draftExists.name);
          localStorage.removeItem("cv_session_recovery");
        }
      } else {
        localStorage.removeItem("cv_last_selected_draft");
        checkSessionRecovery(sessionRecovery);
      }
    } else if (sessionRecovery) {
      checkSessionRecovery(sessionRecovery);
    } else {
      setDraftName("Draft 1");
    }

    setTimeout(() => setIsInitialLoad(false), 500);

    const handleEsc = (e) => {
      if (e.key === "Escape" && showRecoveryModal) {
        handleDiscardSession();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const toggleTemplate = () => {
    setIsTemplateOpen((prev) => !prev);
  };

  const toggleDraft = () => {
    setIsDraftOpen((prev) => !prev);
  };

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      type: "custom",
      title: "",
      items: [{ id: 1, judul: "", subjudul: "", tahun: "", deskripsi: "" }],
    };
    setSections([...sections, newSection]);
    setCollapsedSections((prev) => {
      const newState = {
        ...prev,
        [newSection.id]: false,
      };
      localStorage.setItem("cv_collapsed_sections", JSON.stringify(newState));
      return newState;
    });
  };

  const removeSection = (sectionId) => {
    setSections(sections.filter((section) => section.id !== sectionId));
    setCollapsedSections((prev) => {
      const newState = { ...prev };
      delete newState[sectionId];
      localStorage.setItem("cv_collapsed_sections", JSON.stringify(newState));
      return newState;
    });
  };

  const updateSection = (sectionId, field, value) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section,
      ),
    );
  };

  const addItem = (sectionId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const newItem = {
            id: Date.now(),
            judul: "",
            subjudul: "",
            tahun: "",
            deskripsi: "",
          };
          return { ...section, items: [...section.items, newItem] };
        }
        return section;
      }),
    );
  };

  const removeItem = (sectionId, itemId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.filter((item) => item.id !== itemId),
          };
        }
        return section;
      }),
    );
  };

  const updateItem = (sectionId, itemId, field, value) => {
    if (itemId === null) {
      updateSection(sectionId, field, value);
      return;
    }
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item,
            ),
          };
        }
        return section;
      }),
    );
  };

  const moveSectionUp = (index) => {
    if (index > 0) {
      const newSections = [...sections];
      [newSections[index - 1], newSections[index]] = [
        newSections[index],
        newSections[index - 1],
      ];
      setSections(newSections);
      toast.success("Section dipindahkan ke atas", { duration: 2000 });
    }
  };

  const moveSectionDown = (index) => {
    if (index < sections.length - 1) {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];
      setSections(newSections);
      toast.success("Section dipindahkan ke bawah", { duration: 2000 });
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHapusFoto = () => {
    setFoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDraftTimestamp = (timestamp) => {
    if (!timestamp) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(timestamp));
    } catch {
      return "-";
    }
  };

  const handleSaveDraft = () => {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      toast.error("Nama draft wajib diisi!", { duration: 3000 });
      return;
    }

    const currentData = getCurrentDraftData();
    const existingDraft = savedDrafts.find(
      (draft) => draft.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    let draftIdToUse = null;
    if (existingDraft) {
      draftIdToUse = existingDraft.id;
    } else {
      draftIdToUse = `draft_${Date.now()}`;
    }

    const saved = saveDraft(currentData, {
      id: draftIdToUse,
      name: trimmedName,
    });

    if (!saved) {
      toast.error("Gagal menyimpan draft!", { duration: 3000 });
      return;
    }

    const updatedDrafts = listDrafts();
    setSavedDrafts(updatedDrafts);
    updateSelectedDraft(draftIdToUse);
    setDraftName(trimmedName);
    lastSavedDataRef.current = JSON.stringify(currentData);
    setAutoSaveStatus("saved");
    setTimeout(() => setAutoSaveStatus("idle"), 2000);

    toast.success(
      existingDraft
        ? "Draft berhasil diperbarui!"
        : "Draft baru berhasil disimpan!",
      { duration: 3000 },
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDownloadDOCX = () => {
    const requiredFields = [
      { value: personalInfo.nama, label: "Nama Lengkap" },
      { value: personalInfo.email, label: "Email" },
      { value: personalInfo.telepon, label: "Nomor Telepon" },
      { value: personalInfo.alamat, label: "Alamat" },
      { value: personalInfo.kota, label: "Kota / Provinsi" },
    ];
    const missingFields = requiredFields.filter((field) => !field.value.trim());
    if (missingFields.length > 0) {
      toast.error(
        `Harap isi semua field wajib:\n${missingFields.map((f) => f.label).join(", ")}`,
        {
          duration: 5000,
          style: {
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "14px",
            lineHeight: "1.4",
          },
        },
      );
      return;
    }
    const formattedPhone = formatPhoneNumber(personalInfo.telepon);
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: personalInfo.nama.toUpperCase(),
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `${personalInfo.email} | ${formattedPhone}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `${personalInfo.alamat}${personalInfo.kota ? `, ${personalInfo.kota}` : ""}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({}),
            ...(profileSummary
              ? [
                  new Paragraph({
                    text: "RINGKASAN PROFIL",
                    heading: HeadingLevel.HEADING_1,
                  }),
                  new Paragraph(profileSummary),
                ]
              : []),
            ...sections.flatMap((section) => [
              new Paragraph({
                text: section.title,
                heading: HeadingLevel.HEADING_1,
              }),
              ...section.items.map((item) => {
                const children = [];
                if (item.judul)
                  children.push(new TextRun({ text: item.judul, bold: true }));
                if (item.subjudul) {
                  if (children.length > 0)
                    children.push(new TextRun({ text: " • ", bold: false }));
                  children.push(new TextRun(item.subjudul));
                }
                if (item.tahun) {
                  if (children.length > 0)
                    children.push(new TextRun({ text: " • ", bold: false }));
                  children.push(new TextRun(item.tahun));
                }
                if (item.deskripsi) {
                  if (children.length > 0)
                    children.push(new TextRun({ text: "\n", bold: false }));
                  children.push(new TextRun(item.deskripsi));
                }
                return new Paragraph({ children });
              }),
            ]),
          ],
        },
      ],
    });
    Packer.toBlob(doc).then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `CV ATS ${personalInfo.nama.replace(/\s+/g, " ").toUpperCase()}.docx`;
      link.click();
      const unlocked = unlockAchievement("word_export");
      if (unlocked) {
        showBadgeNotification(
          "Dokumen Master!",
          "Kamu telah mengekspor CV ke format Word!",
        );
      }
    });
  };

  const handleDownloadCV = () => {
    const requiredFields = [
      { value: personalInfo.nama, label: "Nama Lengkap" },
      { value: personalInfo.email, label: "Email" },
      { value: personalInfo.telepon, label: "Nomor Telepon" },
      { value: personalInfo.alamat, label: "Alamat" },
      { value: personalInfo.kota, label: "Kota / Provinsi" },
    ];
    const missingFields = requiredFields.filter((field) => !field.value.trim());
    if (missingFields.length > 0) {
      toast.error(
        `Harap isi semua field wajib:\n${missingFields.map((f) => f.label).join(", ")}`,
        {
          duration: 5000,
          style: {
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "14px",
            lineHeight: "1.4",
          },
        },
      );
      return;
    }
    if (!cvRef.current) return;
    const clone = cvRef.current.cloneNode(true);
    const allElements = clone.querySelectorAll("*");
    allElements.forEach((el) => {
      if (el.classList) {
        const classesToRemove = Array.from(el.classList).filter(
          (cls) => cls.startsWith("dark:") || cls.includes("dark"),
        );
        classesToRemove.forEach((cls) => el.classList.remove(cls));
      }
      const tagName = el.tagName.toLowerCase();
      if (
        ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div"].includes(
          tagName,
        )
      ) {
        el.style.color = "#000000";
      }
      if (el.style.borderColor || el.className.includes("border")) {
        el.style.borderColor = "#000000";
      }
      if (tagName === "img") {
        el.style.backgroundColor = "#ffffff";
        el.style.border = "none";
      }
    });
    clone.style.backgroundColor = "#ffffff";
    clone.style.color = "#000000";
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.backgroundColor = "#ffffff";
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `CV ATS ${personalInfo.nama.replace(/\s+/g, " ").toUpperCase() || "SAYA"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };
    html2pdf()
      .set(opt)
      .from(clone)
      .save()
      .then(() => {
        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-2xl rounded-2xl pointer-events-auto flex p-4`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold">CV ATS berhasil diunduh!</p>
                  <p className="text-xs opacity-90 mt-0.5">
                    {personalInfo.nama.replace(/\s+/g, "_").toUpperCase()}.pdf
                  </p>
                </div>
              </div>
            </div>
          ),
          { duration: 5000 },
        );
        const unlocked = unlockAchievement("pdf_export");
        if (unlocked) {
          showBadgeNotification(
            "PDF Pro!",
            "Kamu telah mengunduh CV dalam format PDF!",
          );
        }
        const exports = JSON.parse(localStorage.getItem("cv_exports") || "0");
        localStorage.setItem("cv_exports", JSON.stringify(exports + 1));
        if (exports + 1 === 5) {
          unlockAchievement("cv_master") &&
            showBadgeNotification(
              "CV Master!",
              "Kamu telah membuat 5 CV! Luar biasa!",
            );
        }
      })
      .finally(() => {
        document.body.removeChild(tempContainer);
      });
  };

  const getTemplateClass = () => {
    switch (template) {
      case "corporate":
        return "border-l-4 border-blue-600 pl-4";
      default:
        return "";
    }
  };

  const formattedPhonePreview = formatPhoneNumber(personalInfo.telepon);

  return (
    <>
      <SessionRecoveryModal
        isOpen={showRecoveryModal}
        onRestore={handleRestoreSession}
        onDiscard={handleDiscardSession}
        timestamp={recoveryData?.timestamp}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2 md:px-0">
        <div ref={generatorRef} className="space-y-6">
          <div className="relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 border border-purple-200/50 dark:border-purple-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl -z-0"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/10 to-cyan-400/10 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl -z-0"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
                    <Briefcase className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
                      CV Generator
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                      <Sparkles size={12} className="mr-1" />
                      Buat CV ATS Professional
                    </p>
                  </div>
                </div>
                {selectedDraftId && (
                  <AutoSaveIndicator status={autoSaveStatus} />
                )}
              </div>

              <div className="mb-6 border border-purple-200 dark:border-purple-500/30 rounded-2xl overflow-hidden bg-white/50 dark:bg-gray-700/30 backdrop-blur-sm shadow-sm">
                <button
                  onClick={toggleTemplate}
                  className="w-full px-4 py-3.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700/50 dark:to-gray-800/50 flex items-center justify-between hover:from-purple-100 hover:to-pink-100 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Palette
                      className="text-purple-600 dark:text-purple-400"
                      size={20}
                    />
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      Pilih Template CV
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isTemplateOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown
                      className="text-gray-600 dark:text-gray-400"
                      size={20}
                    />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isTemplateOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 grid grid-cols-1 gap-3 bg-white/30 dark:bg-gray-800/30">
                        {[
                          {
                            id: "minimal",
                            name: "Minimalis",
                            desc: "Bersih & profesional",
                            icon: "✨",
                          },
                          {
                            id: "corporate",
                            name: "Korporat",
                            desc: "Formal & terstruktur",
                            icon: "💼",
                          },
                        ].map((tpl) => (
                          <button
                            key={tpl.id}
                            onClick={() => {
                              setTemplate(tpl.id);
                              toast.success(`Template ${tpl.name} dipilih!`, {
                                duration: 2000,
                              });
                            }}
                            className={`p-4 rounded-xl border-2 transition-all text-left transform hover:scale-[1.02] ${
                              template === tpl.id
                                ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg"
                                : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-500"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{tpl.icon}</span>
                              <div>
                                <div className="font-bold text-gray-800 dark:text-white">
                                  {tpl.name}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                  {tpl.desc}
                                </div>
                              </div>
                              {template === tpl.id && (
                                <Check
                                  size={18}
                                  className="ml-auto text-purple-600 dark:text-purple-400"
                                />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mb-4 md:mb-6 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                <button
                  onClick={toggleDraft}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <FolderOpen
                      className="text-blue-600 dark:text-blue-400"
                      size={18}
                    />
                    <span className="font-bold text-sm md:text-base text-gray-700 dark:text-gray-200">
                      Kelola Draft
                    </span>
                  </div>
                  <ChevronDown
                    className={`text-gray-500 transition-transform duration-300 ${isDraftOpen ? "rotate-180" : ""}`}
                    size={18}
                  />
                </button>

                <div
                  className="transition-all duration-500 ease-in-out"
                  style={{
                    maxHeight: isDraftOpen ? "1200px" : "0px", // Ditambah agar aman saat dialog konfirmasi muncul
                    opacity: isDraftOpen ? 1 : 0,
                    overflow: isDraftOpen ? "visible" : "hidden",
                  }}
                >
                  <div className="p-4 bg-white dark:bg-transparent">
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Nama Draft
                      </label>
                      <input
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        className="w-full px-3 md:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 transition-all text-sm md:text-base"
                        placeholder="Contoh: CV Dearly Febriano"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
                      <div className="flex-1">
                        <DraftDropdown
                          savedDrafts={savedDrafts}
                          selectedDraftId={selectedDraftId}
                          setSelectedDraftId={updateSelectedDraft}
                          setDraftName={setDraftName}
                          loadDraft={loadDraft}
                          applyDraftData={applyDraftData}
                          clearDraft={clearDraft}
                          resetEditor={resetEditor}
                          refreshDrafts={refreshDrafts}
                          formatDraftTimestamp={formatDraftTimestamp}
                        />
                      </div>

                      <button
                        onClick={handleSaveDraft}
                        className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm transition-all"
                      >
                        <Save size={16} />
                        <span>Simpan</span>
                      </button>
                    </div>

                    {/* Komponen Portability */}
                    <DraftPortabilityPanel
                      draftCount={savedDrafts.length}
                      onImportComplete={() => {
                        const updated = refreshDrafts();
                        if (!selectedDraftId && updated.length > 0) {
                          updateSelectedDraft(updated[0].id);
                          setDraftName(updated[0].name);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 cursor-pointer shadow-sm hover:shadow-md transition-all"
                  onClick={togglePersonalInfo}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <User className="text-white" size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                      Informasi Pribadi
                    </h3>
                  </div>
                  <motion.button
                    animate={{ rotate: isPersonalInfoCollapsed ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                    className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePersonalInfo();
                    }}
                  >
                    <ChevronDown size={20} />
                  </motion.button>
                </div>
                <AnimatePresence>
                  {!isPersonalInfoCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden pt-4"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Foto Profil (Opsional)
                          </label>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFotoChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:border-purple-400 dark:hover:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
                          />
                          {foto && (
                            <div className="mt-3 relative inline-block">
                              <img
                                src={foto}
                                alt="Preview Foto"
                                className="w-24 h-24 object-cover rounded-xl border-4 border-white dark:border-gray-600 shadow-lg"
                              />
                              <button
                                onClick={handleHapusFoto}
                                className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-1.5 shadow-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-110"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <input
                            type="text"
                            value={personalInfo.nama}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                nama: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 rounded-xl border-2 ${
                              !personalInfo.nama.trim()
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                            } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-500 font-medium`}
                            placeholder="Nama Lengkap *"
                            style={{ textTransform: "uppercase" }}
                          />
                          <input
                            type="email"
                            value={personalInfo.email}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                email: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 rounded-xl border-2 ${
                              !personalInfo.email.trim()
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                            } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-500`}
                            placeholder="Email *"
                          />
                          <input
                            type="url"
                            value={personalInfo.link}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                link: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Link Portfolio / LinkedIn / GitHub"
                          />
                          <input
                            type="tel"
                            value={personalInfo.telepon}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                telepon: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 rounded-xl border-2 ${
                              !personalInfo.telepon.trim()
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                            } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-500`}
                            placeholder="Nomor Telepon *"
                          />
                          <input
                            type="text"
                            value={personalInfo.alamat}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                alamat: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 rounded-xl border-2 ${
                              !personalInfo.alamat.trim()
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                            } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-500`}
                            placeholder="Alamat *"
                          />
                          <input
                            type="text"
                            value={personalInfo.kota}
                            onChange={(e) =>
                              setPersonalInfo({
                                ...personalInfo,
                                kota: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 rounded-xl border-2 ${
                              !personalInfo.kota.trim()
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                            } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-500`}
                            placeholder="Kota, Provinsi *"
                          />

                          <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                            <h4 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-3">
                              Deskripsi Diri (Ringkasan Profil)
                            </h4>
                            <textarea
                              value={profileSummary}
                              onChange={(e) =>
                                setProfileSummary(e.target.value)
                              }
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[120px] transition-all placeholder-gray-400 dark:placeholder-gray-500"
                              placeholder="Contoh: Lulusan S1 Teknik Informatika dengan pengalaman 3 tahun di bidang web development..."
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
              >
                <SortableContext
                  items={sections.map((section) => section.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((section, index) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      index={index}
                      sectionsLength={sections.length}
                      onRemove={removeSection}
                      onUpdateItem={updateItem}
                      onRemoveItem={removeItem}
                      onAddItem={addItem}
                      isCollapsed={collapsedSections[section.id] || false}
                      toggleCollapse={() => toggleCollapse(section.id)}
                      onMoveUp={moveSectionUp}
                      onMoveDown={moveSectionDown}
                    />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl border-2 border-purple-500">
                      <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        Sedang Dipindahkan...
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              <button
                onClick={addSection}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all flex items-center justify-center space-x-2 transform hover:scale-[1.02] shadow-lg"
              >
                <Plus size={20} />
                <span>Tambah Section Baru</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <motion.div
            className="relative bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden border border-blue-200/50 dark:border-blue-500/20 flex flex-col"
            style={{ height: previewHeight }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/10 to-cyan-400/10 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl -z-0"></div>

            <div className="relative flex flex-col h-full">
              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div>
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                    Preview CV
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Hasil akhir CV Anda
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleDownloadCV}
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadDOCX}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
                  >
                    <FileText size={16} />
                    <span className="hidden sm:inline">Word</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-inner p-6">
                <div
                  ref={cvRef}
                  className={
                    template === "elegant" ? "p-8" : `p-8 ${getTemplateClass()}`
                  }
                  style={{ fontFamily: "'Times New Roman', Times, serif" }}
                >
                  <div className="text-center mb-6 pb-6">
                    {foto ? (
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="flex-shrink-0 relative">
                          <img
                            src={foto}
                            alt="Foto Profil"
                            className="w-24 h-24 object-cover rounded border-2 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {personalInfo.nama.toUpperCase() || "NAMA LENGKAP"}
                          </h1>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap justify-center sm:justify-start gap-1">
                            {(() => {
                              const contactItems = [];
                              if (personalInfo.email)
                                contactItems.push(personalInfo.email);
                              if (personalInfo.link) {
                                contactItems.push(
                                  <a
                                    key="link"
                                    href={personalInfo.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 break-all"
                                  >
                                    {personalInfo.link}
                                  </a>,
                                );
                              }
                              if (formattedPhonePreview)
                                contactItems.push(formattedPhonePreview);
                              return contactItems.map((item, index) => (
                                <React.Fragment key={index}>
                                  {item}
                                  {index < contactItems.length - 1 && (
                                    <span>|</span>
                                  )}
                                </React.Fragment>
                              ));
                            })()}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {personalInfo.alamat || "Alamat"}
                            {personalInfo.kota && `, ${personalInfo.kota}`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {personalInfo.nama.toUpperCase() || "NAMA LENGKAP"}
                        </h1>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap justify-center gap-1">
                          {(() => {
                            const contactItems = [];
                            if (personalInfo.email)
                              contactItems.push(personalInfo.email);
                            if (personalInfo.link) {
                              contactItems.push(
                                <a
                                  key="link"
                                  href={personalInfo.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 break-all"
                                >
                                  {personalInfo.link}
                                </a>,
                              );
                            }
                            if (formattedPhonePreview)
                              contactItems.push(formattedPhonePreview);
                            return contactItems.map((item, index) => (
                              <React.Fragment key={index}>
                                {item}
                                {index < contactItems.length - 1 && (
                                  <span>|</span>
                                )}
                              </React.Fragment>
                            ));
                          })()}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {personalInfo.alamat || "Alamat"}
                          {personalInfo.kota && `, ${personalInfo.kota}`}
                        </p>
                      </>
                    )}
                  </div>
                  {profileSummary && (
                    <div className="mb-4 text-justify">
                      <p className="leading-6 text-base text-gray-800 dark:text-gray-300">
                        {profileSummary}
                      </p>
                    </div>
                  )}
                  {sections.map((section) => (
                    <div key={section.id} className="mb-6">
                      <div className="border-t-2 border-gray-800 dark:border-gray-400 pt-3 mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                          {section.title.toUpperCase() || "SECTION TITLE"}
                        </h2>
                      </div>
                      {section.items.map((item) => (
                        <div key={item.id} className="mb-4">
                          {item.judul && (
                            <h3 className="font-bold text-base text-gray-900 dark:text-white">
                              {item.judul}
                            </h3>
                          )}
                          {item.subjudul && (
                            <p className="text-sm text-gray-700 dark:text-gray-400">
                              {item.subjudul}
                            </p>
                          )}
                          {item.tahun && (
                            <p className="text-sm text-gray-600 dark:text-gray-500 italic">
                              {item.tahun}
                            </p>
                          )}
                          {item.deskripsi && (
                            <p className="text-sm text-gray-700 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                              {item.deskripsi}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CVGenerator;
