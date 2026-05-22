import { Socket } from "socket.io-client";
import { ArrowLeft, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { AiAssistPanel } from "./AiAssistPanel";

interface MessageThreadProps {
  conversationId: string;
  socket: Socket | null;
  onBack: () => void;
}

export function MessageThread({ conversationId, socket, onBack }: MessageThreadProps) {
  const [aiMode, setAiMode] = useState<string>("AUTO_REPLY");
  const [reply, setReply] = useState("");

  // AI Suggestion State
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleAiSuggestion = (data: { conversationId: string; suggestion: string }) => {
      if (data.conversationId === conversationId && aiMode === "AI_ASSIST") {
        setAiSuggestion(data.suggestion);
        setIsGeneratingSuggestion(false);
      }
    };

    socket.on("ai:suggestion", handleAiSuggestion);

    return () => {
      socket.off("ai:suggestion", handleAiSuggestion);
    };
  }, [socket, conversationId, aiMode]);

  const toggleAiMode = async () => {
    // In a real app we would call PATCH /conversations/:id/ai-mode
    const newMode = aiMode === "AUTO_REPLY" ? "AI_ASSIST" : "AUTO_REPLY";
    setAiMode(newMode);

    // Clear suggestion when mode changes
    if (newMode !== "AI_ASSIST") {
      setAiSuggestion(null);
    }
  };

  const handleSend = (text?: string) => {
    const textToSend = text || reply;
    if (!textToSend.trim()) return;

    // Call API POST /conversations/:id/messages
    console.log("Sending:", textToSend);

    // Locally clear the input
    if (!text) setReply("");

    // Clear suggestion if sent from panel
    setAiSuggestion(null);
  };

  const regenerateSuggestion = async () => {
    setIsGeneratingSuggestion(true);
    setAiSuggestion(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/conversations/${conversationId}/ai-suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock_token"
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setAiSuggestion(data.data.suggestion);
      }
    } catch (error) {
      console.error("Failed to generate suggestion:", error);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center border-b border-gray-200">
        <button onClick={onBack} className="md:hidden mr-3 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Budi Santoso</h2>
          <p className="text-sm text-gray-500">+6281234567890</p>
        </div>
        <div>
          {/* AI Mode Toggle */}
          <button
            onClick={toggleAiMode}
            className={`px-3 py-1 rounded text-sm font-medium ${
              aiMode === "AUTO_REPLY"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
            }`}
          >
            {aiMode === "AUTO_REPLY" ? "Auto Reply" : "AI Assist"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <div className="text-center text-xs text-gray-400">Hari ini</div>

        <div className="flex justify-start">
          <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none px-4 py-2 max-w-[80%]">
            <p className="text-gray-900">Apakah ada stok?</p>
            <span className="text-[10px] text-gray-400 mt-1 block">10:00</span>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="bg-blue-600 text-white rounded-lg rounded-tr-none px-4 py-2 max-w-[80%]">
            <p>Halo pak! Ada yang bisa dibantu?</p>
            <span className="text-[10px] text-blue-200 mt-1 block text-right">10:05</span>
          </div>
        </div>
      </div>

      {/* AI Assist Panel */}
      {aiMode === "AI_ASSIST" && (
        <div className="bg-white pt-2 border-t border-gray-200">
          <AiAssistPanel
            suggestion={aiSuggestion}
            isLoading={isGeneratingSuggestion}
            onSend={(text) => handleSend(text)}
            onEdit={(text) => {
              setReply(text);
              setAiSuggestion(null);
            }}
            onRegenerate={regenerateSuggestion}
            onDismiss={() => setAiSuggestion(null)}
          />
        </div>
      )}

      {/* Input */}
      <div className={`p-4 bg-white flex items-center ${aiMode === "AI_ASSIST" ? "" : "border-t border-gray-200"}`}>
        <input
          type="text"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Ketik balasan manual..."
          className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          onClick={handleSend}
          className="ml-3 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
