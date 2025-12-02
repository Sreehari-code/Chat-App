// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle, LogOut } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyDLn0ubH1qjmiraUR3AHOrQ4kTq2UjJuIw",
  authDomain: "chat-app-6090b.firebaseapp.com",
  projectId: "chat-app-6090b",
  storageBucket: "chat-app-6090b.firebasestorage.app",
  messagingSenderId: "318120522594",
  appId: "1:318120522594:web:a504f84f6ae8c4d310f23b",
  measurementId: "G-V3G1C56WSP"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function App() {
  const ADMIN_USERNAME = "Sreehari";
  const ADMIN_PASSWORD = "AdminPassword";

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [inpId, setId] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  const [userId] = useState(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen messages
  useEffect(() => {
    if (!isLoggedIn) return;
    const messagesRef = ref(database, 'messages');

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMessages([]);
        return;
      }

      const now = Date.now();
      const expirationTime = 500000;

      Object.entries(data).forEach(([key, value]) => {
        if (now - value.timestamp > expirationTime) {
          set(ref(database, `messages/${key}`), null);
        }
      });

      const messagesArray = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value,
        isOwn: value.userId === userId,
      }));

      messagesArray.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(messagesArray);
    });

    return () => unsubscribe();
  }, [isLoggedIn, userId]);

  // Track online users
  useEffect(() => {
    if (!isLoggedIn) return;

    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.values(data).filter(u => u.online);
        setOnlineUsers(usersArray);
      }
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  // Presence
  useEffect(() => {
    if (!isLoggedIn) return;

    const userRef = ref(database, `users/${userId}`);

    set(userRef, {
      username: username,
      online: true,
      lastSeen: serverTimestamp(),
    });

    onDisconnect(userRef).set({
      username: username,
      online: false,
      lastSeen: serverTimestamp(),
    });

    return () => {
      set(userRef, {
        username: username,
        online: false,
        lastSeen: serverTimestamp(),
      });
    };
  }, [isLoggedIn, username, userId]);

  // LOGIN HANDLER
  const handleLogin = () => {
    const usersRef = ref(database, "users");

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const adminOnline = data && Object.values(data).some(
        (u) => u.username === ADMIN_USERNAME && u.online === true
      );

      if (username === ADMIN_USERNAME && inpId === ADMIN_PASSWORD) {
        setIsLoggedIn(true);
        return;
      }

      if (!adminOnline) {
        alert("Admin is not online. Please wait until the admin joins.");
        return;
      }
else if (inpId == "Sreehari-Code")
{
      setIsLoggedIn(true);
}
    }, { onlyOnce: true });
  };

  const handleLogout = () => {
    const userRef = ref(database, `users/${userId}`);
    set(userRef, {
      username: username,
      online: false,
      lastSeen: serverTimestamp(),
    });
    setIsLoggedIn(false);
    setUsername('');
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const messagesRef = ref(database, "messages");
    push(messagesRef, {
      user: username,
      userId: userId,
      text: inputMessage,
      timestamp: Date.now(),
    });

    setInputMessage('');
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-80 sm:w-96">
          <div className="flex items-center justify-center gap-2 mb-6">
            <MessageCircle className="w-10 h-10 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Let's Talk</h1>
          </div>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg mb-4"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setId(e.target.value)}
            className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <div className={`fixed md:static top-0 left-0 h-full z-20 bg-stone-900 border-r border-white flex flex-col w-64
        transform ${showSidebar ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300`}>
        
        <button onClick={() => setShowSidebar(false)} className="md:hidden absolute top-3 right-3 text-white">✕</button>

        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-white">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold">Let's Talk</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 text-slate-300 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-sm font-semibold">Online Users ({onlineUsers.length})</span>
          </div>

          <div className="space-y-2">
            {onlineUsers.map((user, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 
                    rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-slate-200 text-sm">{user.username}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-stone-900 border-b border-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-white text-lg font-semibold">General Chat</h2>
            <p className="text-slate-400 text-sm">{onlineUsers.length} online</p>
          </div>

          <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden text-white">
            <Users className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black scrollbar-hide">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">No messages yet.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-md ${msg.isOwn ? "flex-row-reverse" : ""}`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500
                      rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {msg.user[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${msg.isOwn ? "text-blue-400" : "text-slate-300"}`}>
                        {msg.user}
                      </span>
                      <span className="text-xs text-slate-500">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className={`rounded-2xl px-4 py-2 ${msg.isOwn ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-100"}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-stone-900 border-t border-white p-4">
          <div className="flex gap-2">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-stone-800 text-white px-4 py-3 rounded-lg border border-white"
            />
            <button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
              <Send className="w-5 h-5" /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
