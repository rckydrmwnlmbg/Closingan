import { Socket } from "socket.io-client";
import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface ConversationListProps {
  socket: Socket | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

type Conversation = {
  id: string;
  customerName?: string;
  customerPhone?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount: number;
  aiMode: string;
  state: string;
};

export function ConversationList({ socket, selectedId, onSelect }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadConversations = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const url = query ? `/v1/conversations?search=${encodeURIComponent(query)}` : '/v1/conversations';
      const res = await fetchApi(url);
      if (res.data) {
        setConversations(res.data as Conversation[]);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadConversations(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, loadConversations]);

  useEffect(() => {
      socket.on("conversation:updated", (data) => {
        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === data.conversationId);
          if (index === -1) return prev;
          const newConvs = [...prev];
          newConvs[index] = {
            ...newConvs[index],
            unreadCount: data.unreadCount,
            lastMessagePreview: data.lastMessage,
            lastMessageAt: new Date().toISOString(),
          };
          return newConvs;
        });
      });

      socket.on("ai:mode_changed", (data) => {
        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === data.conversationId);
          if (index === -1) return prev;
          const newConvs = [...prev];
          newConvs[index] = { ...newConvs[index], aiMode: data.aiMode };
          return newConvs;
        });
      });
    }

    return () => {
      if (socket) {
        socket.off("conversation:updated");
        socket.off("ai:mode_changed");
      }
    };
  }, [socket]);

  // No early return for loading so search box is always visible

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No conversations found</div>
        ) : (
          conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
            selectedId === conv.id ? "bg-blue-50 hover:bg-blue-50" : ""
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium text-gray-900">{conv.customerName || conv.customerPhone}</h3>
            {conv.lastMessageAt && (
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600 truncate mr-2">{conv.lastMessagePreview}</p>
            {conv.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {conv.unreadCount}
              </span>
            )}
          </div>
        </div>
      )))}
      </div>
    </div>
  );
}
