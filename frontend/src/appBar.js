import React, { useState } from 'react';


const MainPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      // Simulate a response from the AI
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `AI: ${input}`, sender: 'ai' },
        ]);
      }, 1000);
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  return (
    <div className={`main-page ${isDarkTheme ? 'dark' : 'light'}`}>
      <header className="header">
        <div className="logo">Chatbox AI</div>
        <button onClick={toggleTheme} className="theme-toggle">
          {isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        </button>
      </header>

      <div className="chat-interface">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2023 Chatbox AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainPage;