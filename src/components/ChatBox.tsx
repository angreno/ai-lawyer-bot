import React, { useState, useRef } from "react";
// ✨ 1. Import both API functions
import { sendQuery, sendImageQuery } from "@/api";

// ✨ 2. Define a type for chat history turns for clarity
interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

const ChatBox = () => {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<HistoryTurn[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // ✨ 3. Add state and refs for file handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✨ 4. Update the main function to handle both files and text
  const handleAsk = async () => {
    if (!question.trim() && !selectedFile) return;

    setLoading(true);
    setAnswer(""); // Clear previous answer

    // Add user's turn to history for display
    const userMessage = question || `File: ${selectedFile?.name}`;
    setHistory(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      let botAnswer = "";

      if (selectedFile) {
        // --- A. If a file is selected, use sendImageQuery ---
        botAnswer = await sendImageQuery(selectedFile, question);
        // Manually add the bot's response to history
        setHistory(prev => [...prev, { role: "assistant", content: botAnswer }]);
      } else {
        // --- B. If no file, use the standard sendQuery ---
        const res = await sendQuery(question, history);
        botAnswer = res.answer;
        setHistory(res.updated_history); // Backend returns the full updated history
      }

      setAnswer(botAnswer);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setAnswer(`Error: ${errorMessage}`);
      setHistory(prev => [...prev, { role: 'assistant', content: `Error: ${errorMessage}` }]);
    } finally {
      // Clear inputs after sending
      setQuestion("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ border: "1px solid #ccc", padding: "1rem", minHeight: "200px", marginBottom: "1rem" }}>
        {history.map((turn, idx) => (
          <div key={idx} style={{ marginBottom: "0.5rem" }}>
            <strong style={{ textTransform: "capitalize" }}>{turn.role}:</strong> {turn.content}
          </div>
        ))}
        {loading && <p><i>Thinking...</i></p>}
        {answer && !loading && (
          <div>
             <strong>Assistant:</strong> {answer}
          </div>
        )}
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={selectedFile ? "Ask a question about the file..." : "Ask a question..."}
        rows={3}
        style={{ width: "100%", boxSizing: "border-box" }}
      />

      {/* ✨ 5. Add UI elements for file handling */}
      <div style={{ margin: "0.5rem 0" }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
          accept=".pdf,.png,.jpg,.jpeg,.txt"
        />
        <button onClick={() => fileInputRef.current?.click()}>
          Attach File
        </button>

        {selectedFile && (
          <div style={{ display: "inline-block", marginLeft: "1rem" }}>
            <span>{selectedFile.name}</span>
            <button onClick={removeSelectedFile} style={{ marginLeft: "0.5rem" }}>
              &times;
            </button>
          </div>
        )}
      </div>

      <button onClick={handleAsk} disabled={loading || (!question.trim() && !selectedFile)}>
        {loading ? "Thinking..." : "Ask"}
      </button>
    </div>
  );
};

export default ChatBox;