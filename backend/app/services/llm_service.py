import requests
import json
from app.config import settings

class LLMService:
    def __init__(self):
        self.mode = settings.LLM_MODE
        self.prompt_template = """
You are a customer support assistant.
Use ONLY the provided context to answer the question.
If the answer is not in the context, say: "I do not have enough information."

Context:
{context}

Question:
{query}

Answer:"""

    def generate_answer(self, context: str, query: str) -> str:
        prompt = self.prompt_template.format(context=context, query=query)
        
        if self.mode == "Ollama":
            return self._generate_ollama(prompt)
        elif self.mode == "HuggingFace":
            return self._generate_huggingface(prompt)
        else:
            return self._generate_mock(context, query)

    def _generate_mock(self, context: str, query: str) -> str:
        if not context.strip():
            return "I do not have enough information."
        return f"[MOCK LLM MODE] Based on the retrieved internal documents: {context[:200]}..."

    def _generate_ollama(self, prompt: str) -> str:
        url = f"{settings.OLLAMA_BASE_URL}/api/generate"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json().get("response", "Error: No response from Ollama")
        except requests.exceptions.ConnectionError:
            return "Error: Could not connect to Ollama. Ensure Ollama is running locally on port 11434, or switch to 'HuggingFace' mode in backend/app/config.py."
        except Exception as e:
            return f"Error connecting to Ollama: {str(e)}"

    def _generate_huggingface(self, prompt: str) -> str:
        url = f"https://api-inference.huggingface.co/models/{settings.HF_MODEL}"
        headers = {"Authorization": f"Bearer {settings.HF_API_KEY}"}
        payload = {"inputs": prompt, "parameters": {"max_new_tokens": 512}}
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get("generated_text", "").replace(prompt, "").strip()
            return "Error: Unexpected HF API response format"
        except Exception as e:
            return f"Error connecting to HuggingFace: {str(e)}"

llm_service = LLMService()
