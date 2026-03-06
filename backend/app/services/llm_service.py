import json
import requests
from groq import Groq
from app.config import settings

class LLMService:
    def __init__(self):
        self.mode = settings.LLM_MODE
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None
        self.prompt_template = """
You are a Senior Fraud Intelligence Analyst.
Your goal is to provide high-fidelity intelligence briefings based ONLY on the provided context.

GUIDELINES:
- Provide a detailed and technical explanation.
- Use markdown headers (#) for sections.
- If the answer is not in the context, state: "I do not have enough information."

CONTEXT:
{context}

QUERY:
{query}

INTELLIGENCE BRIEFING:"""

    def generate_answer(self, context: str, query: str) -> str:
        # If context and query are already formatted into a single prompt (like in verification_service)
        if "You are a senior fraud investigator" in context:
            prompt = context
        else:
            prompt = self.prompt_template.format(context=context, query=query)
        
        if self.mode == "Groq":
            return self._generate_groq(prompt)
        elif self.mode == "Ollama":
            return self._generate_ollama(prompt)
        elif self.mode == "HuggingFace":
            return self._generate_huggingface(prompt)
        else:
            return self._generate_mock(context, query)

    def _generate_mock(self, context: str, query: str) -> str:
        # Check if this is a routing request from RetrievalService
        if "Select the best SOP filename" in query:
            context_upper = context.upper()
            mappings = {
                "SYNTHETIC": "TECH_SYNTH_012.md",
                "ACCOUNT TAKEOVER": "SO_ATO_001.md",
                "ATO": "SO_ATO_001.md",
                "APP SCAM": "APP_SCAM_008.md",
                "PUSH PAYMENT": "APP_SCAM_008.md",
                "CARD-NOT-PRESENT": "CNP_FRAUD_005.md",
                "CNP": "CNP_FRAUD_005.md"
            }
            for key, val in mappings.items():
                if key in context_upper:
                    return val
            return "NONE"

        return f"MOCK RESPONSE for query: {query}. (Context length: {len(context)})"
    def generate_structured_json(self, prompt: str) -> str:
        """
        Force the LLM to return a JSON object.
        """
        if self.mode == "Groq":
            return self._generate_groq(prompt, json_mode=True)
        else:
            # Fallback for Ollama/HF
            return self.generate_answer(prompt, "Respond in RAW JSON format only.")

    def _generate_groq(self, prompt: str, json_mode: bool = False) -> str:
        if not self.groq_client:
            return "Error: Groq API key not found. Please set GROQ_API_KEY in your .env file."
        
        try:
            kwargs = {
                "messages": [{"role": "user", "content": prompt}],
                "model": settings.GROQ_MODEL,
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}
            
            chat_completion = self.groq_client.chat.completions.create(**kwargs)
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"Error connecting to Groq: {str(e)}"

    def _generate_ollama(self, prompt: str) -> str:
        import requests
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
