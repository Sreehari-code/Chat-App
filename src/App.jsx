// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle, LogOut } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import './App.css'

// Firebase configuration - REPLACE WITH YOUR OWN CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDLn0ubH1qjmiraUR3AHOrQ4kTq2UjJuIw",
  authDomain: "chat-app-6090b.firebaseapp.com",
  projectId: "chat-app-6090b",
  storageBucket: "chat-app-6090b.firebasestorage.app",
  messagingSenderId: "318120522594",
  appId: "1:318120522594:web:a504f84f6ae8c4d310f23b",
  measurementId: "G-V3G1C56WSP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userId] = useState(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();

  
  }, [messages]);

  // Listen for messages
  useEffect(() => {
    if (!isLoggedIn) return;

    const messagesRef = ref(database, 'messages');


  const unsubscribe = onValue(messagesRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    const now = Date.now();
    const expirationTime = 500000; // 5 minutes in ms

    Object.entries(data).forEach(([key, value]) => {
      if (now - value.timestamp > expirationTime) {
        set(ref(database, `messages/${key}`), null); // auto-delete
      }
    });

    const messagesArray = Object.entries(data).map(([key, value]) => ({
      id: key,
      ...value,
      isOwn: value.userId === userId
    }));

    messagesArray.sort((a, b) => a.timestamp - b.timestamp);
    setMessages(messagesArray);
  }
});


    return () => unsubscribe();
  }, [isLoggedIn, userId]);

  // Listen for online users
  useEffect(() => {
    if (!isLoggedIn) return;
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.values(data).filter(user => user.online);
        setOnlineUsers(usersArray);
      }
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  // Handle user presence
  useEffect(() => {
    if (!isLoggedIn) return;
   
    const userRef = ref(database, `users/${userId}`);
    
    // Set user as online
    set(userRef, {
      username: username,
      online: true,
      lastSeen: serverTimestamp()
    });
  

    // Set user as offline when disconnected
    onDisconnect(userRef).set({
      username: username,
      online: false,
      lastSeen: serverTimestamp()
    })
  ;

    return () => {
      set(userRef, {
        username: username,
        online: false,
        lastSeen: serverTimestamp()
      });
    };
  }, [isLoggedIn, username, userId]);
const [inpId , setId] = useState('')
const [count , SetCount]= useState(0)
  const id = "Sreehari-Code"
  const handleLogin = () => {
    if(username == "Sreehari" && id == "Admin Password" ) {setIsLoggedIn(true) , SetCount(count = count+1)}
   else if (username.trim() && id == inpId && count>0 ) {
      //  if(onlineUsers.includes("Sreehari")){
      setIsLoggedIn(true);
       console.log(count);
    }
    else{
      console.log(count);
      alert("Sorry")
    }
    
  };

  const handleLogout = () => {
    const userRef = ref(database, `users/${userId}`);
    set(userRef, {
      username: username,
      online: false,
      lastSeen: serverTimestamp()
    });
    setIsLoggedIn(false);
    setUsername('');
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && isLoggedIn) {
      const messagesRef = ref(database, 'messages');
      push(messagesRef, {
        user: username,
        userId: userId,
        text: inputMessage,
        timestamp: Date.now()
      });
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!isLoggedIn) {
        handleLogin();
      } else {
        handleSendMessage();
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen  from-slate-900 to-slate-800 border" >
      
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-96">
          <div className="flex items-center justify-center gap-2 mb-6">
            <MessageCircle className="w-10 h-10 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Let's Talk</h1>
          </div>
          <p className="text-slate-400 text-center mb-6">Enter your username to join the chat</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Choose a username..."
            className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 placeholder-slate-400 mb-4"
            autoFocus
          />
          <input
            type="password"
            value={inpId}
            onChange={(e) => setId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter Password"
            className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 placeholder-slate-400 mb-4"
            autoFocus
          />
          <button
            onClick={handleLogin}
            disabled={!username.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  // Main Chat Interface
  return (
    <div className="flex h-screen bg-gradient-to-br bg-black">
      {/* Sidebar */}
      <div className="w-64 bg-stone-900  border-r border-white flex flex-col">
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
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700 transition-colors">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-slate-200 text-sm">{user.username}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{username}</p>
              <p className="text-slate-400 text-xs">Online</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-stone-900 border-b border-white p-4">
          <h2 className="text-white text-lg font-semibold">General Chat</h2>
          <p className="text-slate-400 text-sm">{onlineUsers.length} members online</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-scroll p-4 space-y-4  scrollbar-hide bg-black ">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500 text-center">
                No messages yet. Start the conversation! 💬
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-md ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {msg.user[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${msg.isOwn ? 'text-blue-400' : 'text-slate-300'}`}>
                        {msg.user}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        msg.isOwn
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-slate-700 text-slate-100 rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-stone-900 border-t border-white p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-stone-800 text-white px-4 py-3 rounded-lg border border-white focus:outline-none focus:border-blue-500 placeholder-gray-3"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;