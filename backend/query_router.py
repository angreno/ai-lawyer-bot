import os
import pickle
import faiss
import requests
from flask import Blueprint, request, jsonify
from sentence_transformers import SentenceTransformer
from config import INDEX_DIR, LLM_ENDPOINT

query_bp = Blueprint("query", __name__)

# === Load model once ===
model = SentenceTransformer("all-MiniLM-L6-v2")

# === Try loading FAISS index and metadata ===
INDEX_PATH = os.path.join(INDEX_DIR, "index.faiss")
META_PATH = os.path.join(INDEX_DIR, "meta.pkl")

chunks, metadatas = [], []

try:
    index = faiss.read_index(INDEX_PATH)
except Exception:
    index = None

try:
    with open(META_PATH, "rb") as f:
        chunks, metadatas = pickle.load(f)
except Exception:
    chunks, metadatas = [], []


# === Intent classification ===
def detect_intent(user_input: str) -> str:
    user_input = user_input.lower()
    if "documentation" in user_input or "upload" in user_input:
        return "documentation"
    elif "definition" in user_input or "what is" in user_input or "define" in user_input:
        return "definition"
    elif "how do i" in user_input or "steps" in user_input or "process" in user_input:
        return "how_to"
    elif "act" in user_input or "law" in user_input or "legal" in user_input:
        return "legal_reference"
    else:
        return "generic"


# === Retrieve relevant chunks from vector DB ===
def retrieve_context(question, top_k=10):
    if not index or not chunks:
        return []

    q_embedding = model.encode([question])
    D, I = index.search(q_embedding, top_k)

    selected = []
    seen_sources = set()
    preferred_domains = ["www.thebesa.com", "www.gov.uk", "www.lawsociety.org.uk"]

    for idx in I[0]:
        chunk, meta = chunks[idx], metadatas[idx]
        source = meta.get("source", "unknown")

        if any(domain in source for domain in preferred_domains) and source not in seen_sources:
            seen_sources.add(source)
            selected.append((chunk, meta))

        if len(selected) >= 5:
            break

    if len(selected) < 5:
        for idx in I[0]:
            chunk, meta = chunks[idx], metadatas[idx]
            if (chunk, meta) not in selected:
                selected.append((chunk, meta))
            if len(selected) >= 5:
                break

    return selected


# === Build Prompt from context and history ===
def build_prompt(conversation_history, context, question, intent, used_sources):
    sources_list = "\n".join(f"- {src}" for src in used_sources)

    instructions_by_intent = {
        "documentation": "Provide details on required documents, their purpose, and how to obtain or verify them.",
        "definition": "Provide a clear definition followed by bullet points explaining key details.",
        "how_to": "Provide a step-by-step explanation or guide.",
        "legal_reference": "Provide summaries or citations of legal acts, sections, or cases.",
        "generic": "Answer clearly and helpfully using only the provided context.",
    }
    instructions = instructions_by_intent.get(intent, instructions_by_intent["generic"])

    history_block = ""
    for turn in conversation_history[-4:]:
        history_block += f"{turn['role'].capitalize()}: {turn['content']}\n"

    prompt = f"""
You are a helpful legal assistant having a conversation with a user.

Here is the recent chat history:
{history_block}

Use the context below to answer the user's next question. Be concise, structured, and relevant to the current and past conversation.

Context:
{context}

Question: {question}

Instructions: {instructions}

Your answer must be structured and must end with a section:
**Sources Used**:
{sources_list}
"""
    return prompt.strip()


# === Query Ollama or LLM endpoint ===
def query_ollama(prompt: str) -> str:
    try:
        response = requests.post(
            LLM_ENDPOINT,
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False,
                "temperature": 0.3,
            },
            timeout=60,
        )
        response.raise_for_status()
        return response.json().get("response", "").strip()

    except Exception as e:
        return f"❌ LLM request failed: {e}"


# === Main Query Endpoint ===
@query_bp.route("/query", methods=["POST"])
def query_chatbot():
    try:
        data = request.get_json()
        question = data["question"]
        conversation_history = data.get("history", [])

        intent = detect_intent(question)
        top_contexts = retrieve_context(question)

        context_blocks = []
        used_sources = set()

        for i, (chunk, meta) in enumerate(top_contexts, start=1):
            source = meta.get("source", f"source_{i}")
            used_sources.add(source)
            context_blocks.append(f"--- Source {i}: {source} ---\n{chunk}")

        context = "\n\n".join(context_blocks)
        prompt = build_prompt(conversation_history, context, question, intent, used_sources)

        print("🧠 LLM thinking...")

        answer = query_ollama(prompt)

        # Append to memory
        conversation_history.append({"role": "user", "content": question})
        conversation_history.append({"role": "assistant", "content": answer})

        return jsonify({
            "status": "success",
            "answer": answer,
            "used_sources": list(used_sources),
            "updated_history": conversation_history
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }), 500
