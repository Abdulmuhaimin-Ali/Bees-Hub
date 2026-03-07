import { useState } from "react";
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import "./Chat.css";

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: "me" | "them";
  time: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: "Sarah K.",
    avatar: "SK",
    lastMessage: "That hiking trail sounds amazing! Let's go this weekend?",
    time: "2m",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Maya P.",
    avatar: "MP",
    lastMessage: "I love that coffee place too ☕",
    time: "15m",
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: "Emily R.",
    avatar: "ER",
    lastMessage: "Great chatting with you!",
    time: "1h",
    unread: 0,
    online: false,
  },
  {
    id: 4,
    name: "Jordan L.",
    avatar: "JL",
    lastMessage: "Have you tried the new ramen spot downtown?",
    time: "3h",
    unread: 1,
    online: false,
  },
  {
    id: 5,
    name: "Taylor S.",
    avatar: "TS",
    lastMessage: "See you at the meetup!",
    time: "1d",
    unread: 0,
    online: false,
  },
];

const MESSAGES: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      text: "Hey Alex! I saw we both love hiking 🏔️",
      sender: "them",
      time: "10:30 AM",
    },
    {
      id: 2,
      text: "Yes! It's my favourite weekend activity. Do you have a favourite trail?",
      sender: "me",
      time: "10:32 AM",
    },
    {
      id: 3,
      text: "I love the Bruce Trail! Have you been?",
      sender: "them",
      time: "10:33 AM",
    },
    {
      id: 4,
      text: "Not yet, but it's been on my list forever!",
      sender: "me",
      time: "10:35 AM",
    },
    {
      id: 5,
      text: "That hiking trail sounds amazing! Let's go this weekend?",
      sender: "them",
      time: "10:36 AM",
    },
    {
      id: 6,
      text: "I'd love that! Saturday morning work for you?",
      sender: "them",
      time: "10:36 AM",
    },
  ],
  2: [
    {
      id: 1,
      text: "Your profile says you're into coffee - me too!",
      sender: "me",
      time: "9:00 AM",
    },
    {
      id: 2,
      text: "I love that coffee place too ☕",
      sender: "them",
      time: "9:15 AM",
    },
  ],
};

export default function Chat() {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(MESSAGES);

  const activeConvo = CONVERSATIONS.find((c) => c.id === activeChat);
  const currentMessages = activeChat ? messages[activeChat] || [] : [];

  const filteredConversations = CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSend = () => {
    if (!newMessage.trim() || !activeChat) return;
    const msg: Message = {
      id: Date.now(),
      text: newMessage,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), msg],
    }));
    setNewMessage("");
  };

  return (
    <div className="chat-page">
      {/* Conversation List */}
      <div
        className={`chat-sidebar ${activeChat !== null ? "hidden-mobile" : ""}`}
      >
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
        </div>
        <div className="chat-search">
          <Search size={16} />
          <input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="conversation-list">
          {filteredConversations.map((convo) => (
            <div
              key={convo.id}
              className={`conversation-item ${activeChat === convo.id ? "active" : ""}`}
              onClick={() => setActiveChat(convo.id)}
            >
              <div className="convo-avatar-wrapper">
                <div className="convo-avatar">{convo.avatar}</div>
                {convo.online && <span className="online-dot" />}
              </div>
              <div className="convo-info">
                <div className="convo-top">
                  <span className="convo-name">{convo.name}</span>
                  <span className="convo-time">{convo.time}</span>
                </div>
                <p className="convo-last">{convo.lastMessage}</p>
              </div>
              {convo.unread > 0 && (
                <span className="unread-badge">{convo.unread}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={`chat-window ${activeChat === null ? "hidden-mobile" : ""}`}
      >
        {activeChat === null ? (
          <div className="chat-empty">
            <span className="chat-empty-icon">💬</span>
            <h3>Select a conversation</h3>
            <p>Choose someone from your matches to start chatting</p>
          </div>
        ) : (
          <>
            <div className="chat-window-header">
              <button className="back-btn" onClick={() => setActiveChat(null)}>
                <ArrowLeft size={20} />
              </button>
              <div className="chat-user-info">
                <div className="convo-avatar small">{activeConvo?.avatar}</div>
                <div>
                  <span className="chat-user-name">{activeConvo?.name}</span>
                  {activeConvo?.online && (
                    <span className="online-text">Online</span>
                  )}
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="icon-btn">
                  <Phone size={18} />
                </button>
                <button className="icon-btn">
                  <Video size={18} />
                </button>
                <button className="icon-btn">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <div className="messages-area">
              {currentMessages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    <span className="message-time">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!newMessage.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
