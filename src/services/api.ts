const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

/**
 * [UNCHANGED]
 * Uploads a knowledge base file (e.g., .txt, .pdf) to the backend for embedding.
 * This is used for Retrieval-Augmented Generation (RAG).
 * @param file File object to embed.
 */
export async function embedUserFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE_URL}/embed/user`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");

    return data;
  } catch (error) {
    console.error("❌ Upload Error:", error);
    throw error;
  }
}

/**
 * [UNCHANGED]
 * Sends a standard text question and chat history to the backend.
 * @param question The user's query string.
 * @param history Chat history array.
 */
export async function sendQuery(
  question: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<{ answer: string; updated_history: any[] }> {
  const res = await fetch(`${API_BASE_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      history,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to get answer from backend");
  }

  return await res.json();
}

/**
 * [UNCHANGED]
 * Shortcut function to send a text query and get just the string answer.
 * @param question The user's query string.
 * @param history Chat history.
 */
export async function queryBot(
  question: string,
  history: { role: string; content: string }[]
): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, history }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Query failed");

    return data.answer;
  } catch (error) {
    console.error("❌ Query Error:", error);
    throw error;
  }
}

/**
 * ✨ [NEWLY ADDED] ✨
 * Sends an image file and a text prompt to the backend for a multimodal query.
 * @param imageFile The image file the user uploaded.
 * @param prompt The text question about the image (can be an empty string).
 * @returns A promise that resolves to the bot's string answer.
 */
export async function sendImageQuery(
  imageFile: File,
  prompt: string
): Promise<string> {
  const formData = new FormData();
  // These keys ('image', 'prompt') MUST match what your Python backend endpoint expects.
  formData.append("image", imageFile);
  formData.append("prompt", prompt);

  try {
    // This sends the request to the new '/upload' endpoint on your backend.
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData, // FormData automatically sets the correct 'multipart/form-data' header.
    });

    const data = await res.json();
    if (!res.ok) {
      // We expect the backend to send an 'error' key if something goes wrong.
      throw new Error(data.error || "Image query failed");
    }

    // Adjust 'data.response' if your backend sends the answer under a different key.
    // Based on my first suggestion, the key is 'response'.
    return data.response;
  } catch (error) {
    console.error("❌ Image Query Error:", error);
    throw error;
  }
}