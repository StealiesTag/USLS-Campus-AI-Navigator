import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, NavigationRoute, UserInteraction } from "../types";
import { CAMPUS_BUILDINGS, calculateCampusRoute } from "../data/campusData";
import { askCampusNavigatorAI } from "../lib/ai";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Navigation,
  Footprints,
  Clock,
  Compass,
  BookmarkPlus,
  Loader2,
  Trash2,
  Volume2,
  VolumeX,
  MapPin,
  Check,
} from "lucide-react";

export interface NavigationChatProps {
  selectedBuildingId?: string | null;
  originBuildingId?: string;
  onSetOrigin: (buildingId: string) => void;
  onSetDestination: (buildingId: string) => void;
  activeRoute?: NavigationRoute | null;
  onSaveInteraction?: (interaction: UserInteraction) => void;
}

export const NavigationChat: React.FC<NavigationChatProps> = ({
  selectedBuildingId,
  originBuildingId = "user-current-location",
  onSetOrigin,
  onSetDestination,
  activeRoute,
  onSaveInteraction,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-assistant-msg",
      role: "assistant",
      content:
        "Hello! I am your USLS AI Campus Navigator. Ask me for directions (e.g. 'How do I get to Santuario de La Salle from my location?'), where to find the Registrar, or where to grab lunch.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick suggestion chips
  const suggestionChips = [
    "Directions to Santuario de La Salle from my location",
    "Where is the Registrar / Admissions?",
    "Show route to College Library",
    "Where can I buy food & drinks?",
    "Where is the Coliseum basketball arena?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Text to Speech
  const speakText = (text: string) => {
    if (!speechEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptText = (customPrompt || input).trim();
    if (!promptText || loading) return;

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: promptText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await askCampusNavigatorAI(promptText, originBuildingId, messages);

      const aiMessage: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: response.text,
        timestamp: Date.now(),
        destinationId: response.destinationId,
        originId: response.originId,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // If AI identified a destination, update the map route
      if (response.destinationId) {
        if (response.originId) {
          onSetOrigin(response.originId);
        }
        onSetDestination(response.destinationId);
      }

      speakText(response.text);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: `Sorry, I ran into an issue: ${err?.message || "Unable to reach navigator AI."}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoute = async () => {
    if (!activeRoute) return;
    setSaveSuccess(false);

    const title = `${activeRoute.origin.shortName} → ${activeRoute.destination.shortName}`;
    const newInteraction: UserInteraction = {
      id: "trip-" + Date.now(),
      userId: user ? user.uid : "guest",
      title,
      originId: activeRoute.origin.id,
      destinationId: activeRoute.destination.id,
      originName: activeRoute.origin.name,
      destinationName: activeRoute.destination.name,
      distanceMeters: activeRoute.distanceMeters,
      estimatedMinutes: activeRoute.estimatedMinutes,
      aiSummary: `Walk ~${activeRoute.distanceMeters} meters (~${activeRoute.estimatedMinutes} min) via campus covered walkway.`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (user && db) {
      try {
        const docRef = await addDoc(
          collection(db, "users", user.uid, "interactions"),
          {
            ...newInteraction,
            serverTimestamp: serverTimestamp(),
          }
        );
        newInteraction.id = docRef.id;
      } catch (err) {
        console.warn("Firestore save fallback to local:", err);
      }
    }

    if (onSaveInteraction) {
      onSaveInteraction(newInteraction);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <aside className="w-full lg:w-96 flex flex-col h-full bg-white border-l border-slate-200 shrink-0 text-slate-800 shadow-xl z-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sparkles className="h-4 w-4 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 leading-none">
              AI Navigator
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Powered by Gemini 3.7 Flash
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2 rounded-xl transition-colors border ${
              speechEnabled
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent"
            }`}
            title={speechEnabled ? "Voice Speech Enabled" : "Enable Voice Speech"}
          >
            {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={() =>
              setMessages([
                {
                  id: "initial-assistant-msg",
                  role: "assistant",
                  content: "Chat cleared. Where would you like to go on campus?",
                  timestamp: Date.now(),
                },
              ])
            }
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active Route HUD Box */}
      {activeRoute && (
        <div className="m-3 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-emerald-800 flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5" />
              Active Walking Route
            </span>
            <span className="text-[11px] font-bold text-slate-600">
              {activeRoute.origin.shortName} &rarr; {activeRoute.destination.shortName}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-3 font-bold">
              <span className="flex items-center gap-1 text-emerald-800">
                <Footprints className="h-3.5 w-3.5" />
                ~{activeRoute.distanceMeters} m
              </span>
              <span className="flex items-center gap-1 text-blue-700">
                <Clock className="h-3.5 w-3.5" />
                ~{activeRoute.estimatedMinutes} min
              </span>
            </div>

            <button
              onClick={handleSaveRoute}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-2xs ${
                saveSuccess
                  ? "bg-emerald-700 text-white"
                  : "bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
              }`}
            >
              {saveSuccess ? <Check className="h-3 w-3" /> : <BookmarkPlus className="h-3 w-3" />}
              <span>{saveSuccess ? "Saved!" : "Save Trip"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-xs ${
                  isUser
                    ? "bg-emerald-700 text-white font-bold"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[84%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? "bg-emerald-700 text-white font-medium rounded-tr-none shadow-sm"
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs font-medium"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.destinationId && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onSetDestination(msg.destinationId!)}
                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Focus on Map</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-500 flex items-center gap-2 shadow-xs font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
              <span>Calculating campus route &amp; directions...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto scrollbar-none flex gap-1.5">
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="text-[11px] font-medium whitespace-nowrap bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-3 py-1 rounded-full border border-slate-200 hover:border-emerald-200 transition-colors shadow-2xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-200 bg-white"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI directions, buildings, gates..."
            disabled={loading}
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 pl-3.5 pr-11 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1.5 p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-colors disabled:opacity-40 shadow-xs active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </aside>
  );
};
