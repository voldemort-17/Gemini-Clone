import React, { useContext, useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdd,
  faBars,
  faClockRotateLeft,
  faGear,
  faXmark,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { faMessage, faCircleQuestion } from "@fortawesome/free-regular-svg-icons";
import "./Sidebar.css";
import { Context } from "../context/Context";

/* --------------------------- Tailwind Settings Modal --------------------------- */
function SettingsModal({ open, onClose }) {
  const { theme, toggleTheme, setMessages } = useContext(Context);
  const panelRef = useRef(null);
  const lastFocused = useRef(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus management
  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement;
      setTimeout(() => {
        const auto = panelRef.current?.querySelector("[data-autofocus]");
        auto?.focus();
      }, 0);
    } else {
      lastFocused.current?.focus?.();
    }
  }, [open]);

  if (!open) return null;

  const isLight = theme === "light";

  const handleClear = () => {
    const ok = window.confirm(
      "This will delete the saved conversation history on this device. Continue?"
    );
    if (!ok) return;
    localStorage.removeItem("chatMessages");
    setMessages([]);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className={`w-full max-w-xl rounded-2xl shadow-xl ring-1 animate-[pop_.12s_ease-out] ${isLight ? "bg-white ring-black/5" : "bg-neutral-900 ring-white/10"
          }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${isLight ? "border-neutral-200" : "border-white/10"
            }`}
        >
          <h2
            id="settings-title"
            className={`text-lg font-semibold ${isLight ? "text-neutral-900" : "text-neutral-100"}`}
          >
            Settings
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition ${isLight ? "hover:bg-neutral-100 text-neutral-700" : "hover:bg-white/10 text-neutral-200"
              }`}
            data-autofocus
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-6">
          {/* Appearance */}
          <section className="space-y-2">
            <h3 className={`text-sm font-medium ${isLight ? "text-neutral-900" : "text-neutral-100"}`}>
              Appearance
            </h3>
            <div
              className={`flex items-center justify-between rounded-xl p-3 ring-1 ${isLight ? "ring-neutral-200" : "ring-white/10"
                }`}
            >
              <div>
                <p className={isLight ? "text-sm text-neutral-900" : "text-sm text-neutral-100"}>Theme</p>
                <p className={isLight ? "text-xs text-neutral-600" : "text-xs text-neutral-300"}>
                  Current: <strong>{isLight ? "Light" : "Dark"}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`px-3 py-2 text-sm rounded-lg transition ${isLight ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "bg-white text-neutral-900 hover:bg-neutral-100"
                  }`}
              >
                Toggle
              </button>
            </div>
          </section>

          {/* Conversations */}
          <section className="space-y-2">
            <h3 className={`text-sm font-medium ${isLight ? "text-neutral-900" : "text-neutral-100"}`}>
              Conversations
            </h3>
            <div
              className={`flex flex-wrap gap-3 rounded-xl p-3 ring-1 ${isLight ? "ring-neutral-200" : "ring-white/10"
                }`}
            >
              <button
                type="button"
                onClick={handleClear}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition ${isLight ? "bg-red-600 text-white hover:bg-red-500"
                    : "bg-red-500 text-white hover:bg-red-400"
                  }`}
                title="Delete saved conversation history from this browser"
              >
                <FontAwesomeIcon icon={faTrash} />
                Clear conversation history
              </button>
            </div>
          </section>

          {/* About */}
          <section>
            <h3 className={`text-sm font-medium ${isLight ? "text-neutral-900" : "text-neutral-100"}`}>
              About
            </h3>
            <p className={isLight ? "text-sm text-neutral-600" : "text-sm text-neutral-300"}>
              App version 1.0.0
            </p>
          </section>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-2 px-5 py-4 border-t ${isLight ? "border-neutral-200" : "border-white/10"
            }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-sm rounded-lg transition ${isLight ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "bg-white text-neutral-900 hover:bg-neutral-100"
              }`}
          >
            Close
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

/* --------------------------- Sidebar Content --------------------------- */
function SidebarContent() {
  const {
    onSent,
    newChat,
    theme,
    openTab,
    setOpenTab,
    messages,
    historyMessages,
  } = useContext(Context);

  const [showSettings, setShowSettings] = useState(false);

  // Build "Recent" list
  const recentUserPrompts = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role !== "user") continue;
      const text = (m.content || "").trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      result.push(text);
      if (result.length >= 20) break;
    }
    return result;
  }, [messages]);

  const loadPrompt = (prompt) => {
    if (!prompt || !prompt.trim()) return;
    onSent(prompt.trim());
  };

  return (
    <>
      <div className="absolute">
        <FontAwesomeIcon
          icon={faBars}
          className={`block px-3 cursor-pointer transition-colors duration-200 ${theme === "light" ? "text-[#e3e3e3] hover:text-gray-300" : "hover:text-gray-600"
            }`}
          onClick={() => setOpenTab(!openTab)}
        />

        {/* New Chat */}
        <div
          className={`inline-flex mt-9 items-center gap-3 px-3 py-2 rounded-[50px] text-[14px] text-gray-400 cursor-pointer transition-colors duration-200 ${theme === "light" ? "bg-[#131314] hover:bg-[#1f1f20]" : "bg-[#e6eaf1] hover:bg-[#dce1e9]"
            }`}
          onClick={newChat}
        >
          <FontAwesomeIcon
            icon={faAdd}
            className={`${theme === "light" ? "text-[#686868]" : "text-gray-500"}`}
          />
          <p
            className={`font-medium ${openTab ? "" : "hidden"} ${theme === "light" ? "text-[#686868]" : "text-gray-500"
              }`}
          >
            New chat
          </p>
        </div>

        {/* Recent Prompts */}
        <div className="mt-5">
          <p
            className={`${openTab ? "" : "hidden"} px-2 font-medium mb-4 ${theme === "light" ? "text-[#e3e3e3]" : ""
              }`}
          >
            Recent
          </p>

          {recentUserPrompts.length === 0 && openTab && (
            <p className={`${theme === "light" ? "text-[#9a9a9a]" : "text-gray-500"} px-2`}>
              No recent prompts yet.
            </p>
          )}

          {recentUserPrompts.map((value, i) => (
            <button
              key={`${i}-${value.slice(0, 24)}`}
              className={`${openTab ? "" : "hidden"} item-container transition-colors duration-200 ${theme === "dark" ? "hover:bg-[#f0f3f8]" : "hover:bg-[#2a2a2a]"
                } text-left w-full`}
              onClick={() => loadPrompt(value)}
              title={value}
            >
              <FontAwesomeIcon
                icon={faMessage}
                className={`${openTab ? "" : "hidden"} ${theme === "dark" ? "text-black" : "text-[#e3e3e3]"
                  }`}
              />
              <span className={`${theme === "dark" ? "text-black" : "text-[#e3e3e3]"}`}>
                {value.length > 40 ? `${value.slice(0, 40)}…` : value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-5 flex flex-col font-medium">
        {[
          { icon: faCircleQuestion, title: 'Info', text: "Help", onClick: undefined },
          { icon: faClockRotateLeft, title: 'History', text: "Activity", onClick: historyMessages },
          { icon: faGear, title: 'Settings', text: "Settings", onClick: () => setShowSettings(true) },
        ].map((item, i) => (
          <button
            key={i}
            type="button"
            title={item.title}
            className={`
              item-container
              ${openTab ? "w-[13vw] rounded-[50px]" : "w-10 h-10 justify-center rounded-full"}
              ${theme === "dark" ? "hover:bg-[#f0f3f8]" : "hover:bg-[#2a2a2a]"}
            `}
            onClick={item.onClick}
          >
            <FontAwesomeIcon
              icon={item.icon}
              className={`${theme === "light" ? "text-[#e3e3e3]" : ""}`}
            />
            <p className={`${openTab ? "block" : "hidden"} ${theme === "light" ? "text-[#e3e3e3]" : ""}`}>
              {item.text}
            </p>
          </button>
        ))}
      </div>

      {/* Settings Modal */}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

export default SidebarContent;
