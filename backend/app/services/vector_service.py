import logging
import hashlib
from typing import List, Dict, Any, Optional
from app.config import settings
from app.database.supabase_client import get_supabase

logger = logging.getLogger(__name__)

def generate_embedding(text: str) -> List[float]:
    """
    Generates a 768-dimensional text embedding for questions or resumes using
    Gemini Embeddings with deterministic fallback for local/offline execution.
    """
    if settings.GEMINI_API_KEY and "your_gemini" not in settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=text
            )
            if hasattr(response, 'embeddings') and response.embeddings:
                return response.embeddings[0].values
            elif hasattr(response, 'embedding') and response.embedding:
                return response.embedding.values
        except Exception as e:
            logger.warning(f"Gemini embedding API call failed: {e}. Using deterministic vector generator.")

    # High-entropy deterministic pseudo-embedding (768 dimensions)
    h = hashlib.sha256(text.encode('utf-8')).hexdigest()
    base_val = int(h, 16)
    vector = []
    for i in range(768):
        val = ((base_val >> (i % 64)) & 0xFF) / 255.0 - 0.5
        vector.append(round(val, 6))
    return vector

def query_vector_questions(query_text: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Executes cosine distance similarity search via Supabase pgvector RPC
    """
    client = get_supabase()
    embedding = generate_embedding(query_text)

    if client:
        try:
            res = client.rpc('match_questions', {
                'query_embedding': embedding,
                'match_threshold': 0.5,
                'match_count': limit
            }).execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.info(f"Supabase pgvector RPC not populated or failed: {e}")

    return []
