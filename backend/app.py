from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import requests
import base64
import fitz  # PyMuPDF library

from config import UPLOAD_DIR
from embedder_user import embed_single_user_file
from query_router import query_bp

# ✅ Basic App Setup
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from your frontend
app.config["UPLOAD_FOLDER"] = UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.register_blueprint(query_bp)  # Register your existing query router

# ✅ Configuration for your local LLM server
OLLAMA_URL = "http://localhost:11434/api/generate"


# ==============================================================================
# ✨ NEW HELPER FUNCTIONS FOR FILE PROCESSING ✨
# ==============================================================================

def process_uploaded_pdf(file_storage, user_prompt):
    """Extracts text from a PDF and asks the LLM a question about it."""
    try:
        pdf_document = fitz.open(stream=file_storage.read(), filetype="pdf")
        extracted_text = "".join(page.get_text() for page in pdf_document)
        pdf_document.close()

        if not extracted_text:
            return {"response": "I couldn't read any text from this PDF."}

        combined_prompt = (
            f"Please answer the following question based ONLY on the provided document content.\n"
            f"User's Question: '{user_prompt}'\n\n"
            f"Document Content:\n---\n{extracted_text}\n---"
        )

        # Call a standard text model (e.g., llama3, mistral)
        payload = {"model": "llama3", "prompt": combined_prompt, "stream": False}
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        # Return the actual response content from the LLM call
        return response.json()

    except Exception as e:
        print(f"Error processing PDF: {e}")
        return {"error": f"Failed to process PDF: {str(e)}"}


def process_uploaded_image(file_storage, user_prompt):
    """Encodes an image and sends it to a multimodal LLM."""
    try:
        image_bytes = file_storage.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')

        # Call a multimodal model (e.g., llava)
        payload = {
            "model": "llava",
            "prompt": user_prompt,
            "stream": False,
            "images": [image_base64]
        }
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        # Return the actual response content from the LLM call
        return response.json()

    except Exception as e:
        print(f"Error processing image: {e}")
        return {"error": f"Failed to process image: {str(e)}"}


# ==============================================================================
# ✨ NEW ENDPOINT FOR LIVE FILE QUERIES ✨
# ==============================================================================

@app.route("/api/upload", methods=["POST"])
def upload_and_query_file():
    """
    This endpoint handles live queries with a file (image or PDF).
    It does NOT save the file permanently.
    """
    # The frontend's `sendImageQuery` uses the key 'image' for the file part
    if 'image' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['image']
    prompt = request.form.get('prompt', 'Summarize this file.')

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    _, file_extension = os.path.splitext(file.filename)
    file_extension = file_extension.lower()

    if file_extension == '.pdf':
        result = process_uploaded_pdf(file, prompt)
    elif file_extension in ['.png', '.jpg', '.jpeg', '.webp']:
        result = process_uploaded_image(file, prompt)
    else:
        return jsonify({"error": f"Unsupported file type for querying: {file_extension}"}), 400

    if "error" in result:
        return jsonify(result), 500

    # The frontend expects a 'response' key from a successful query
    return jsonify(result)


# ==============================================================================
# ✅ YOUR EXISTING ROUTES (UNCHANGED) ✅
# ==============================================================================

@app.route("/embed/user", methods=["POST"])
def handle_embed_user_file():
    """
    This endpoint is for adding a file to your permanent knowledge base (RAG).
    """
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file part in request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"status": "error", "message": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    # This calls your embedding function from embedder_user.py
    result = embed_single_user_file(file_path)
    return jsonify(result)


@app.route("/", methods=["GET"])
def health():
    """Health check to confirm the server is running."""
    return jsonify({"status": "ok", "message": "Server running"})


# ✅ Run the server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)