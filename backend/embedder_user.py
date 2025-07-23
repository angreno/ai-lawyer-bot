import os
import pickle
import fitz  # PyMuPDF
import faiss
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config import INDEX_DIR

# === Constants for user-uploaded files ===
USER_INDEX_PATH = os.path.join(INDEX_DIR, "user_index.faiss")
USER_META_PATH = os.path.join(INDEX_DIR, "user_meta.pkl")

# === Load model once globally ===
model = SentenceTransformer("all-MiniLM-L6-v2")


def load_user_index_and_meta():
    """Load existing FAISS index and chunk metadata, if available."""
    index = faiss.read_index(USER_INDEX_PATH) if os.path.exists(USER_INDEX_PATH) else None

    if os.path.exists(USER_META_PATH):
        with open(USER_META_PATH, "rb") as f:
            chunks, metadatas = pickle.load(f)
    else:
        chunks, metadatas = [], []

    return index, chunks, metadatas


def embed_single_user_file(file_path: str) -> dict:
    """Embeds a single .pdf or .txt file and updates FAISS index."""
    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext == ".txt":
            with open(file_path, "r", encoding="utf-8") as f:
                raw_text = f.read()

        elif ext == ".pdf":
            doc = fitz.open(file_path)
            raw_text = "\n".join(page.get_text() for page in doc)

        else:
            return {"status": "error", "message": f"❌ Unsupported file type: {ext}"}

        if not raw_text.strip():
            return {"status": "error", "message": "❌ File is empty"}

    except Exception as e:
        return {"status": "error", "message": f"❌ Failed to read file: {e}"}

    # === Chunk Text ===
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    split_chunks = text_splitter.split_text(raw_text)
    chunk_metadatas = [{"source": os.path.basename(file_path)} for _ in split_chunks]

    # === Embed ===
    try:
        embeddings = model.encode(split_chunks, show_progress_bar=False)
    except Exception as e:
        return {"status": "error", "message": f"❌ Embedding failed: {e}"}

    # === Load/Create Index ===
    index, old_chunks, old_metadatas = load_user_index_and_meta()
    if index is None:
        index = faiss.IndexFlatL2(embeddings.shape[1])

    index.add(embeddings)

    # === Save Index & Metadata ===
    all_chunks = old_chunks + split_chunks
    all_metadatas = old_metadatas + chunk_metadatas

    os.makedirs(INDEX_DIR, exist_ok=True)
    faiss.write_index(index, USER_INDEX_PATH)
    with open(USER_META_PATH, "wb") as f:
        pickle.dump((all_chunks, all_metadatas), f)

    return {
        "status": "success",
        "chunks": len(split_chunks),
        "source": os.path.basename(file_path),
    }
