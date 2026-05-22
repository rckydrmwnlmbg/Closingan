import { Sparkles, Edit, RefreshCw, X, Send } from "lucide-react";

interface AiAssistPanelProps {
  suggestion: string | null;
  isLoading: boolean;
  onSend: (text: string) => void;
  onEdit: (text: string) => void;
  onRegenerate: () => void;
  onDismiss: () => void;
}

export function AiAssistPanel({
  suggestion,
  isLoading,
  onSend,
  onEdit,
  onRegenerate,
  onDismiss,
}: AiAssistPanelProps) {
  if (!isLoading && !suggestion) return null;

  return (
    <div className="mx-4 mb-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-indigo-700 font-medium text-sm">
        <Sparkles size={16} />
        <span>AI Suggestion</span>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
          <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <p className="text-gray-800 text-sm mb-3 whitespace-pre-wrap">{suggestion}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSend(suggestion!)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Send size={14} />
              Kirim
            </button>
            <button
              onClick={() => onEdit(suggestion!)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 border border-indigo-200 text-xs font-medium rounded-md hover:bg-indigo-50 transition-colors"
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 border border-gray-200 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={14} />
              Generate Ulang
            </button>
            <div className="flex-1"></div>
            <button
              onClick={onDismiss}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              title="Abaikan"
            >
              <X size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
