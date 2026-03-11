import os
import json
import re
import asyncio
import httpx
from typing import Dict, Any

API_URL = "https://inference.do-ai.run/v1/chat/completions"
TOKEN = os.getenv("DIGITALOCEAN_INFERENCE_KEY", "")
MODEL = os.getenv("DO_INFERENCE_MODEL", "openai-gpt-oss-120b")

# Helper to extract JSON from LLM response

def _extract_json(text: str) -> str:
    m = re.search(r"```(?:json)?\s*\n?([\s\S]*?)\n?\s*```", text, re.DOTALL)
    if m:
        return m.group(1).strip()
    m = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
    if m:
        return m.group(1).strip()
    return text.strip()

def _coerce_unstructured_payload(raw_text: str) -> Dict[str, Any]:
    compact = raw_text.strip()
    tags = [part.strip(" -•\t") for part in re.split(r",|\\n", compact) if part.strip(" -•\t")]
    return {
        "note": "Model returned plain text instead of JSON",
        "raw": compact,
        "text": compact,
        "summary": compact,
        "tags": tags[:6],
    }


async def _call_inference(messages, max_tokens=512):
    if not TOKEN:
        return {"note": "Inference token not configured"}
    payload = {
        "model": MODEL,
        "messages": messages,
        "max_completion_tokens": max_tokens,
    }
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(API_URL, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            extracted = _extract_json(text)
            # Try parsing JSON; if fails, return raw text under "hint"
            try:
                return json.loads(extracted)
            except Exception:
                return {"hint": extracted}
    except Exception as e:
        # Log can be added; return fallback
        return {"note": "AI temporarily unavailable"}
