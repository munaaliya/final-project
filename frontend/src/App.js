import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isUploadMode, setIsUploadMode] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedChatIndex, setSelectedChatIndex] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("query", question);

    try {
        const res = await axios.post("http://localhost:8080/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        console.log("Response dari upload:", res.data);
        if (res.data.answer) { 
            streamResponse(res.data.answer);
            setChatHistory((prevChatHistory) => [
                ...prevChatHistory,
                { question, answer: res.data.answer },
            ]);
        } else {
            console.error("No response");
        }
    } catch (error) {
        console.error("Error uploading file:", error);
    }
};

const streamResponse = (answer) => {
    setResponse(""); 

    const addCharacter = (index) => {
        if (index < answer.length) {
            setResponse((prev) => prev + answer[index]); 
            setTimeout(() => addCharacter(index + 1), 100); 
        }
    };
    if (answer.length < 20) {
        addCharacter(0); 
        return;
    }
    const words = answer.split(" ");
    const addWord = (index) => {
        if (index < words.length) {
            setResponse((prev) => prev + (index === 0 ? "" : " ") + words[index]);
            setTimeout(() => addWord(index + 1), 100);
        }
    };

    addWord(0); 
};

const handleChat = async () => {
    setResponse("");
    const payload = {
        inputs: {
            query: query,
            table: {},
        },
    };

    try {
        const response = await axios.post("http://localhost:8080/chat", payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status !== 200) {
            throw new Error("Network was not ok");
        }

        const data = response.data;

        if (data.answer) {
            console.log("Jawaban yang diterima:", data.answer); 
            streamResponse(data.answer);
            setChatHistory((prevChatHistory) => [
                ...prevChatHistory,
                { question: query, answer: data.answer },
            ]);
        } else {
            console.error("No response");
        }
    } catch (error) {
        console.error("Error querying chat:", error);
    }
};
  const handleDeleteChat = (index) => {
    setChatHistory((prevChatHistory) =>
      prevChatHistory.filter((_, i) => i !== index)
    );
    setResponse("");
    setSelectedChatIndex(null);
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setResponse("");
    setQuestion("");
    setQuery("");
    setFile(null); 
    setSelectedChatIndex(null);
  };

  const handleModeChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "upload") {
      setIsUploadMode(true);
      setResponse("");
      setSelectedChatIndex(null);
    } else if (selectedValue === "chat") {
      setIsUploadMode(false);
      setResponse(""); 
      setSelectedChatIndex(null);
    } else {
      const selectedIndex = parseInt(selectedValue);
      if (!isNaN(selectedIndex)) {
        const selectedChat = chatHistory[selectedIndex];
        setResponse(selectedChat.answer); 
        setQuery(""); 
        setSelectedChatIndex(selectedIndex);
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
    if (isDarkTheme) {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className={`container ${isDarkTheme ? "dark" : "light"}`}>
      <button onClick={toggleMenu} className={`burger-button ${isDarkTheme ? '' : 'light'}`}>
         <i className="fas fa-bars" style={{ fontSize: '24px' }}></i>
      </button>

      {menuOpen && (
        <div className="menu">
          <button onClick={handleNewChat} className="menu-item">
            <i className="fas fa-plus"></i> New Chat
            </button>
          <button onClick={toggleTheme} className="menu-item">
            <i className={isDarkTheme ? "fas fa-sun" : "fas fa-moon"}></i> Switch to {isDarkTheme ? "Light" : "Dark"} Theme
          </button>
        </div>
      )}
  
      <h1 className={`header ${isDarkTheme ? '' : 'light'}`}>Chatbox AI</h1>
      <div id="mode-selector">
        <label htmlFor="mode-dropdown"></label>
        <select id="mode-dropdown" onChange={handleModeChange}>
          <option value="upload">Upload Data</option>
          <option value="chat">Chat Without Data</option>
          {chatHistory.length > 0 && <option disabled>--- Chat History ---</option>}
          {chatHistory.map((chat, index) => (
            <option key={index} value={index}>
              {`Q: ${chat.question} | A: ${chat.answer}`}
            </option>
          ))}
        </select>
      </div>
  
      {isUploadMode ? (
        <div>
          <input type="file" onChange={handleFileChange} id="file-input" />
          <input
            type="text"
            onChange={handleQuestionChange}
            value={question}
            id="question-input"
            placeholder="Enter your question"
          />
          <button onClick={handleUpload} className="button">
            Upload and Analyze
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question..."
            className="chat-field"
          />
          <button onClick={handleChat} className="button">
            Chat
          </button>
        </div>
      )}
  
      <div className="response-box">
        <h2>Response</h2>
        {response ? (
        <div>
          <p>{response}</p> 
        {selectedChatIndex !== null &&(
          <button onClick={() => handleDeleteChat(selectedChatIndex)} className="button button-danger">
          Delete 
          </button>
        )}
        </div>
      ):(
         <p>No response yet</p>
        )}
      </div>

  
    </div>
  );
}

export default App;