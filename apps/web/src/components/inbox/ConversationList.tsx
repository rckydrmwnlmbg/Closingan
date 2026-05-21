import { Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

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

  useEffect(() => {
    // In a real app we would fetch the initial list via API
    setConversations([
      {
        id: "1",
        customerName: "Budi Santoso",
        lastMessagePreview: "Apakah ada stok?",
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
        aiMode: "AUTO_REPLY",
        state: "OPEN"
      }
    ]);
    setLoading(false);

    if (socket) {
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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => (
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
      ))}
    </div>
  );
}
