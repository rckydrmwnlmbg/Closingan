import { Socket } from "socket.io-client";
import { ArrowLeft, Send, Sparkles, Edit, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleAiSuggestion = (data: { conversationId: string; suggestion: string }) => {
      if (data.conversationId === conversationId && aiMode === "AI_ASSIST") {
        setAiSuggestion(data.suggestion);
        setIsGeneratingSuggestion(false);
        setIsSheetOpen(true);
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
      setIsSheetOpen(false);
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
    setIsSheetOpen(false);
  };

  const regenerateSuggestion = async () => {
    setIsGeneratingSuggestion(true);
    setIsSheetOpen(true);
    setAiSuggestion(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/conversations/${conversationId}/ai-suggest`, {
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

  const handleMagicWandClick = () => {
    regenerateSuggestion();
  };

  const handleEditSuggestion = (text: string) => {
    setReply(text);
    setAiSuggestion(null);
    setIsSheetOpen(false);
  };

  const handleDismissSuggestion = () => {
    setAiSuggestion(null);
    setIsSheetOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
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

      {/* Input */}
      <div className="p-4 bg-white flex items-center border-t border-gray-200">
        <input
          type="text"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Ketik balasan manual..."
          className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        {aiMode === "AI_ASSIST" && (
          <button
            onClick={handleMagicWandClick}
            className="ml-2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Generate AI Suggestion"
          >
            <Sparkles size={20} />
          </button>
        )}
        <button
          onClick={() => handleSend()}
          className="ml-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
        >
          <Send size={20} />
        </button>
      </div>

      {/* AI Assist Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-xl h-auto max-h-[80vh] overflow-y-auto sm:max-w-md sm:mx-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2 text-indigo-700">
              <Sparkles size={18} />
              AI Suggestion
            </SheetTitle>
            <SheetDescription>
              Draft balasan dari AI
            </SheetDescription>
          </SheetHeader>

          <div className="mb-6">
            {isGeneratingSuggestion ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-indigo-100 rounded w-full"></div>
                <div className="h-4 bg-indigo-100 rounded w-5/6"></div>
                <div className="h-4 bg-indigo-100 rounded w-4/6"></div>
              </div>
            ) : (
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {aiSuggestion || "Tidak ada draft."}
                </p>
              </div>
            )}
          </div>

          <SheetFooter className="flex-col gap-2 sm:flex-col">
            <button
              onClick={() => handleSend(aiSuggestion!)}
              disabled={isGeneratingSuggestion || !aiSuggestion}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              Kirim Langsung
            </button>
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                onClick={() => handleEditSuggestion(aiSuggestion!)}
                disabled={isGeneratingSuggestion || !aiSuggestion}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-indigo-700 border border-indigo-200 font-medium rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={regenerateSuggestion}
                disabled={isGeneratingSuggestion}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={16} className={isGeneratingSuggestion ? "animate-spin" : ""} />
                Regenerate
              </button>
            </div>
            <button
              onClick={handleDismissSuggestion}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 text-gray-500 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Abaikan
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
