import { createContext, useState, useEffect } from "react";
import run from "../config/Gemini";

export const Context = createContext();

const formatMarkdownToHTML = (raw) => {
  if (!raw || typeof raw !== "string") return "";
  let responseArray = raw.split("**");
  let newResponse = "";
  for (let i = 0; i < responseArray.length; i++) {
    if (i === 0 || i % 2 !== 1) newResponse += responseArray[i];
    else newResponse += "<b>" + responseArray[i] + "</b>";
  }
  let newResponse2 = newResponse.split("*").join("</br>");
  return newResponse2;
};

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // conversation
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // THEME
  const [theme, setTheme] = useState("light"); // default; will be corrected on mount

  // NEW: expose a toggle fn so UI can just call toggleTheme()
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // Load theme from localStorage or system preference once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      } else if (window?.matchMedia) {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      }
    } catch {
      // ignore storage errors; keep default
    }
  }, []);

  // Apply theme to <html> for Tailwind (class strategy) & persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const [openTab, setOpenTab] = useState(false);
  const [mainTab, setMainTab] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Load from localStorage once
  const historyMessages = () => {
    const saved = localStorage.getItem("chatMessages");
    if (!saved) alert("There is no prior history available for the given conversation.");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (messages.length === parsed.length)
            alert("There is no prior history available for the given conversation.");
          setMessages(parsed);
          if (parsed.length > 0) setShowResult(true);
        }
      } catch (err) {
        console.error("Failed to parse saved chat:", err);
      }
    }
  };

  // ✅ Save whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    setError(null);
    setInput("");
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };

  const delayAppendToLastMessage = (index, nextWord) => {
    setTimeout(() => {
      setMessages((prev) => {
        if (!prev.length) return prev;
        const lastIdx = prev.length - 1;
        const last = prev[lastIdx];
        if (last.role !== "assistant") return prev; // safety
        const updated = [...prev];
        updated[lastIdx] = { ...last, content: last.content + nextWord };
        return updated;
      });
    }, 75 * index);
  };

  const onSent = async (prompt) => {
    setLoading(true);
    setShowResult(true);
    setError(null);

    const text = prompt !== undefined ? prompt : input.trim();
    if (!text) {
      setLoading(false);
      return;
    }

    // 1) push user message
    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      let res;
      const stitched = [...messages, userMsg]
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");
      res = await run(stitched);

      if (!res || typeof res !== "string") {
        throw new Error("Received an unexpected response from the server.");
      }
      const formatted = formatMarkdownToHTML(res);
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "", // will stream in
        },
      ]);

      // stream word-by-word like your original UX
      const words = formatted.split(" ");
      for (let i = 0; i < words.length; i++) {
        delayAppendToLastMessage(i, words[i] + " ");
      }
    } catch (e) {
      const fallbackMsg =
        "Sorry—something went wrong on the server. Please try again in a moment.";
      const readable = e?.message || fallbackMsg;
      setError(readable);
      // append an assistant error message to keep the thread intact
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            '<div role="alert"><b>Server error:</b> Sorry—something went wrong on the server. Please try again.</div>',
        },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const contextValue = {
    messages,
    setMessages,
    onSent,
    newChat,
    input,
    setInput,
    loading,
    showResult,
    error,

    // THEME
    theme,
    setTheme,     // keep direct setter if you still use it
    toggleTheme,  // <— use this in your Toggle button

    openTab,
    setOpenTab,
    mainTab,
    setMainTab,
    historyMessages,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;



// import { createContext, useState } from "react";
// import run from "../config/Gemini";

// export const Context = createContext();

// const ContextProvider = (props) => {
//   const [input, setInput] = useState("");
//   const [showResult, setShowResult] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [theme, setTheme] = useState("light");
//   const [openTab, setOpenTab] = useState(false);
//   const [mainTab, setMainTab] = useState(false);

//   // Conversation history: [{ role: 'user'|'assistant', content: string, error?: boolean }]
//   const [messages, setMessages] = useState([]);

//   // Optional: keep a light stack of previous prompts if you still need it
//   const [prevPrompt, setPrevPrompt] = useState([]);

//   // Centralized error message (also mirrored as an assistant bubble)
//   const [error, setError] = useState(null);

//   const newChat = () => {
//     setLoading(false);
//     setShowResult(false);
//     setMessages([]);
//     setInput("");
//     setError(null);
//   };

//   const formatToHtml = (res) => {
//     // bold for **...**, line break for *
//     const responseArray = res.split("**");
//     let newResponse = "";
//     for (let i = 0; i < responseArray.length; i++) {
//       if (i === 0 || i % 2 !== 1) newResponse += responseArray[i];
//       else newResponse += "<b>" + responseArray[i] + "</b>";
//     }
//     return newResponse.split("*").join("</br>");
//   };

//   const onSent = async (prompt) => {
//     setError(null);
//     setLoading(true);

//     const userText = prompt !== undefined ? prompt : input.trim();
//     if (!userText) {
//       setLoading(false);
//       return;
//     }

//     // show conversation area after first send
//     setShowResult(true);

//     // push user message
//     setMessages((prev) => [...prev, { role: "user", content: userText }]);

//     // book-keep previous prompts if you like
//     if (prompt === undefined) setPrevPrompt((prev) => [...prev, userText]);

//     // clear the input immediately for better UX
//     setInput("");

//     try {
//       let res = await run(userText);

//       if (!res || typeof res !== "string") {
//         throw new Error("Received an unexpected response from the server.");
//       }

//       const html = formatToHtml(res);

//       // append assistant response
//       setMessages((prev) => [...prev, { role: "assistant", content: html }]);
//     } catch (e) {
//       const fallbackMsg =
//         "Sorry—something went wrong on the server. Please try again in a moment.";
//       const readable = e?.message || fallbackMsg;

//       // set top-level error (optional)
//       setError(readable);

//       // also append an assistant error bubble so it’s visible in the thread
//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: readable, error: true },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const contextValue = {
//     // conversation
//     messages,
//     setMessages,
//     onSent,
//     newChat,

//     // input / ui
//     input,
//     setInput,
//     loading,
//     showResult,
//     theme,
//     setTheme,
//     openTab,
//     setOpenTab,
//     mainTab,
//     setMainTab,

//     // legacy / optional
//     prevPrompt,
//     setPrevPrompt,

//     // error
//     error,
//     setError,
//   };

//   return (
//     <Context.Provider value={contextValue}>{props.children}</Context.Provider>
//   );
// };

// export default ContextProvider;

