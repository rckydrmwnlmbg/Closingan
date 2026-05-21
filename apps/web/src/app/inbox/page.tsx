"use client";

import { useEffect, useState } from "react";
import { ConversationList } from "@/components/inbox/ConversationList";
import { MessageThread } from "@/components/inbox/MessageThread";
import { io, Socket } from "socket.io-client";

export default function InboxPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // In a real app, token would come from auth context/session
    const token = "mock_token";
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000", {
      auth: { token },
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      {/* Sidebar / Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 bg-white ${
          selectedConversationId ? "hidden md:flex" : "flex"
        } flex-col`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Inbox</h1>
        </div>
        <ConversationList
          socket={socket}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </div>

      {/* Main Area / Message Thread */}
      <div
        className={`flex-1 flex flex-col ${
          !selectedConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConversationId ? (
          <MessageThread
            conversationId={selectedConversationId}
            socket={socket}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-lg">Select a conversation</p>
              <p className="text-sm">to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
