import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleUser,
  faCode,
  faCompass,
  faImage,
  faLightbulb,
  faMessage,
  faMicrophone,
  faMoon,
  faPaperPlane,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import "./Main.css";
import { Context } from "../context/Context";

function Main() {
  const {
    onSent,
    input,
    setInput,
    loading,
    showResult,
    theme,
    setTheme,
    mainTab,
    setMainTab,
    error,
    newChat,
    messages, // <- full conversation
  } = useContext(Context);

  const handleTab = () => setMainTab(!mainTab);

  const prompts = [
    {
      text: "Provide a list of questions to help me prepare for a social media manager job interview.",
      icon: faLightbulb,
    },
    { text: "Generate four unit tests for the following C# function", icon: faCode },
    { text: "Give me 10 tips for room organization.", icon: faCompass },
    {
      text:
        "Write a beginner's guide to kitesurfing, including an overview of what is needed to get started.",
      icon: faMessage,
    },
  ];

  const isDark = theme !== "light";

  return (
    <div
      className={`flex-1 basis-[95%] w-full pb-[15vh] relative overflow-hidden ${
        theme === "light" ? "bg-[#131314]" : "bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between h-8 m-4 items-center text-[#585858]">
        <div className="flex gap-5">
          <p className={`text-xl ${theme === "light" ? "text-[#e3e3e3]" : ""} cursor-pointer`}>
            Gemini
          </p>
        </div>
        <div className="flex gap-5">
          <FontAwesomeIcon
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            icon={theme === "light" ? faMoon : faSun}
            className={`text-3xl ${isDark ? "" : "text-white"} cursor-pointer`}
          />
          <FontAwesomeIcon
            icon={faCircleUser}
            className={`text-3xl ${isDark ? "" : "text-white"} cursor-pointer`}
          />
        </div>
      </div>

      {/* Body */}
      {(!showResult || messages.length === 0) ? (
        <div className="m-auto w-[300px] sm:w-[550px] lg:w-[900px] ">
          <div className="w-[900px] my-[50px] text-[25px] lg:text-[50px] p-5 font-medium">
            <p>
              <span className="headerDesign">Hello, Yash.</span>
            </p>
            <p
              className={`flex w-[250px] sm:w-[650px] ${
                theme === "light" ? "text-[#444746]" : "text-[#c4c7c5]"
              }`}
            >
              How can I help you today ?
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-[15px] grid-cols-1 m-auto sm:grid-cols-2 sm:w-[550px] lg:w-[900px] lg:grid-cols-4 p-5 text-[#585858] text-[15px]">
            {prompts.map((prompt, index) => (
              <div
                key={index}
                onClick={() => setInput(prompt.text)}
                className={`cardDesign cursor-pointer ${
                  theme === "light" ? "bg-[#1e1f20]" : "bg-[#f0f4f9]"
                } ${theme === "light" ? "hover:bg-[#333537]" : "hover:bg-[#dfe4ea]"} ${
                  theme === "light" ? "text-[#e3e3e3]" : ""
                }`}
              >
                <p>{prompt.text}</p>
                <FontAwesomeIcon
                  icon={prompt.icon}
                  className={`cardIconDesign ${theme === "light" ? "bg-[#131314]" : "bg-white"}`}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-[75%] sm:w-[45%] m-auto scrollHide">
          {/* Conversation */}
          <div className="flex flex-col gap-2">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div key={m.id} className="flex p-4 gap-4 items-start">
                  {isUser ? (
                    <FontAwesomeIcon
                      icon={faCircleUser}
                      className={`text-3xl ${isDark ? "text-black" : "text-[#e3e3e3]"}`}
                    />
                  ) : (
                    <img src="/google-gemini-icon.svg" alt="" className="w-6 mt-1" />
                  )}
                  <div className="flex-1">
                    {/* If you trust the content to be HTML-formatted (we formatted it in context) */}
                    <p
                      className={`text-[17px] leading-8 ${
                        isDark ? "text-black" : "text-[#e3e3e3]"
                      }`}
                      dangerouslySetInnerHTML={{ __html: m.content }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Loading skeleton (after the last user message, before assistant streams in) */}
            {loading && (
              <div className="flex p-4 gap-4 items-start">
                <img src="/google-gemini-icon.svg" alt="" className="w-6 mt-1" />
                <div className="w-full gap-3 flex flex-col">
                  <hr className="loadingBar" />
                  <hr className="loadingBar" />
                  <hr className="loadingBar" />
                </div>
              </div>
            )}

            {/* Error panel (also appended as an assistant message, but this is a banner) */}
            {error && (
              <div
                role="alert"
                className={`w-full rounded-xl border p-4 text-sm ${
                  theme === "light"
                    ? "border-[#3a3a3a] bg-[#1b1b1b] text-[#f2f2f2]"
                    : "border-red-200 bg-red-50 text-red-900"
                }`}
              >
                <div className="font-semibold mb-1">Server error</div>
                <p className="mb-3">
                  {error ||
                    "Sorry—something went wrong on the server. Please try again."}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSent()}
                    className={`px-3 py-1.5 rounded-lg border transition hover:opacity-90 ${
                      theme === "light" ? "border-[#3a3a3a]" : "border-red-300"
                    }`}
                  >
                    Retry
                  </button>
                  <button
                    onClick={newChat}
                    className={`px-3 py-1.5 rounded-lg border transition hover:opacity-90 ${
                      theme === "light" ? "border-[#3a3a3a]" : "border-red-300"
                    }`}
                  >
                    Start a new chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 w-full max-w-[900px]">
        <div
          className={`w-full rounded-full shadow-lg px-4 sm:px-6 py-2 flex items-center gap-3 ${
            theme === "light" ? "bg-[#1e1f20]" : "bg-[#f0f4f9]"
          }`}
        >
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              type="button"
              title="Upload Image"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                theme === "light" ? "text-[#e3e3e3]" : "text-black"
              }`}
            >
              <FontAwesomeIcon icon={faImage} className="text-lg" />
            </button>

            <button
              type="button"
              title="Use Microphone"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                theme === "light" ? "text-[#e3e3e3]" : "text-black"
              }`}
            >
              <FontAwesomeIcon icon={faMicrophone} className="text-lg" />
            </button>
          </div>

          <input
            value={input}
            type="text"
            placeholder="Enter a prompt here…"
            className={`flex-1 h-12 rounded-full px-4 font-medium placeholder:opacity-70 bg-transparent ${
              theme === "light" ? "text-[#e3e3e3]" : "text-black"
            } focus:outline-none focus:ring-0 focus:border-0 transition-all duration-300`}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                e.preventDefault();
                onSent();
              }
            }}
          />

          <button
            type="button"
            title="Submit"
            disabled={!input.trim() || loading}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 disabled:opacity-40 ${
              theme === "light" ? "text-[#e3e3e3]" : "text-black"
            }`}
            onClick={() => onSent()}
          >
            <FontAwesomeIcon icon={faPaperPlane} className="text-base" />
          </button>
        </div>

        <div
          className={`mt-2 text-[12px] flex flex-col items-center text-center leading-snug ${
            theme === "light" ? "text-[#e3e3e3]" : "text-black"
          }`}
        >
          <span>
            Gemini may display inaccurate info, including about people, so
            double-check its responses.
          </span>
          <a href="#" className="underline hover:opacity-80 mt-1">
            Your privacy and Gemini Apps
          </a>
        </div>
      </div>
    </div>
  );
}

export default Main;
