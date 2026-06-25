import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './styles/App.css';
import Chat from './components/Chat';
import Console from './components/Console';
import Browser from './components/Browser';
import HostingPanel from './components/HostingPanel';
import SelfImprove from './components/SelfImprove';
import Settings from './components/Settings';

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activePanel, setActivePanel] = useState('chat');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:8080', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to Pikman AI');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Pikman AI');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleAuthenticate = async (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      alert('ПИН-код должен быть минимум 4 символа');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        setIsAuthenticated(true);
        setPin('');
      } else {
        alert('❌ Неверный ПИН-код');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Ошибка подключения');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pin-screen">
        <div className="pin-container">
          <h1>🧠 Pikman AI</h1>
          <p>Введите ПИН-код для входа</p>
          <form onSubmit={handleAuthenticate}>
            <input
              type="password"
              placeholder="1234"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength="16"
              autoFocus
            />
            <button type="submit">Войти</button>
          </form>
          <div className="status-indicator">
            <span className={isConnected ? 'connected' : 'disconnected'}>
              {isConnected ? '🟢 Онлайн' : '🔴 Офлайн'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>🧠 Pikman AI</h1>
          <span className={`status ${isConnected ? 'online' : 'offline'}`}>
            {isConnected ? '🟢' : '🔴'}
          </span>
        </div>
        <nav className="nav-tabs">
          <button
            className={`tab ${activePanel === 'chat' ? 'active' : ''}`}
            onClick={() => setActivePanel('chat')}
          >
            💬 Чат
          </button>
          <button
            className={`tab ${activePanel === 'console' ? 'active' : ''}`}
            onClick={() => setActivePanel('console')}
          >
            🖥️ Консоль
          </button>
          <button
            className={`tab ${activePanel === 'browser' ? 'active' : ''}`}
            onClick={() => setActivePanel('browser')}
          >
            🌐 Браузер
          </button>
          <button
            className={`tab ${activePanel === 'hosting' ? 'active' : ''}`}
            onClick={() => setActivePanel('hosting')}
          >
            ☁️ Хостинги
          </button>
          <button
            className={`tab ${activePanel === 'improve' ? 'active' : ''}`}
            onClick={() => setActivePanel('improve')}
          >
            🧬 Улучшение
          </button>
          <button
            className={`tab ${activePanel === 'settings' ? 'active' : ''}`}
            onClick={() => setActivePanel('settings')}
          >
            ⚙️ Настройки
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activePanel === 'chat' && <Chat socket={socket} userProfile={userProfile} />}
        {activePanel === 'console' && <Console socket={socket} />}
        {activePanel === 'browser' && <Browser socket={socket} />}
        {activePanel === 'hosting' && <HostingPanel socket={socket} />}
        {activePanel === 'improve' && <SelfImprove socket={socket} />}
        {activePanel === 'settings' && <Settings socket={socket} userProfile={userProfile} />}
      </main>
    </div>
  );
}

export default App;
