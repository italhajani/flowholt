from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from collections.abc import Iterator
from typing import Any

import httpx

from .config import get_settings

logger = logging.getLogger(__name__)


def _iter_text_chunks(text: str, *, chunk_size: int = 24) -> Iterator[str]:
    if not text:
        return

    buffer = ""
    for token in text.split():
        next_value = f"{buffer} {token}".strip()
        if buffer and len(next_value) > chunk_size:
            yield f"{buffer} "
            buffer = token
            continue
        buffer = next_value

    if buffer:
        yield buffer


class LLMProvider(ABC):
    """Base class for LLM providers."""

    name: str

    @abstractmethod
    def is_configured(self) -> bool:
        ...

    @abstractmethod
    def generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        ...

    @abstractmethod
    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        ...

    def stream_generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        yield from _iter_text_chunks(self.generate(prompt, system=system, temperature=temperature, max_tokens=max_tokens))

    def stream_chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        yield from _iter_text_chunks(self.chat(messages, temperature=temperature, max_tokens=max_tokens))


class OllamaProvider(LLMProvider):
    """Local Ollama instance — always free, no API key needed."""

    name = "ollama"

    def __init__(self, base_url: str, model: str) -> None:
        self._base_url = base_url.rstrip("/")
        self._model = model

    def is_configured(self) -> bool:
        return bool(self._base_url)

    def generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        body: dict[str, Any] = {
            "model": self._model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature, "num_predict": max_tokens},
        }
        if system:
            body["system"] = system
        with httpx.Client(timeout=120.0) as client:
            resp = client.post(f"{self._base_url}/api/generate", json=body)
            resp.raise_for_status()
            return resp.json().get("response", "").strip() or "Model returned no text."

    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        body: dict[str, Any] = {
            "model": self._model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature, "num_predict": max_tokens},
        }
        with httpx.Client(timeout=120.0) as client:
            resp = client.post(f"{self._base_url}/api/chat", json=body)
            resp.raise_for_status()
            return resp.json().get("message", {}).get("content", "").strip() or "Model returned no text."

    def stream_chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        body: dict[str, Any] = {
            "model": self._model,
            "messages": messages,
            "stream": True,
            "options": {"temperature": temperature, "num_predict": max_tokens},
        }
        with httpx.Client(timeout=120.0) as client:
            with client.stream("POST", f"{self._base_url}/api/chat", json=body) as resp:
                resp.raise_for_status()
                for line in resp.iter_lines():
                    if not line:
                        continue
                    payload = json.loads(line)
                    chunk = str(payload.get("message", {}).get("content") or "")
                    if chunk:
                        yield chunk


class GeminiProvider(LLMProvider):
    """Google Gemini — free tier with generous limits."""

    name = "gemini"

    def __init__(self, api_key: str, model: str = "gemini-2.5-flash") -> None:
        self._api_key = api_key
        self._model = model
        self._base_url = "https://generativelanguage.googleapis.com/v1beta"

    def is_configured(self) -> bool:
        return bool(self._api_key)

    def generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        messages = []
        if system:
            messages.append({"role": "user", "parts": [{"text": system}]})
            messages.append({"role": "model", "parts": [{"text": "Understood."}]})
        messages.append({"role": "user", "parts": [{"text": prompt}]})
        return self._call(messages, temperature=temperature, max_tokens=max_tokens)

    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        gemini_messages = []
        for msg in messages:
            role = msg["role"]
            if role == "system":
                gemini_messages.append({"role": "user", "parts": [{"text": msg["content"]}]})
                gemini_messages.append({"role": "model", "parts": [{"text": "Understood."}]})
            elif role == "assistant":
                gemini_messages.append({"role": "model", "parts": [{"text": msg["content"]}]})
            else:
                gemini_messages.append({"role": "user", "parts": [{"text": msg["content"]}]})
        return self._call(gemini_messages, temperature=temperature, max_tokens=max_tokens)

    def _call(self, contents: list[dict[str, Any]], *, temperature: float, max_tokens: int) -> str:
        url = f"{self._base_url}/models/{self._model}:generateContent?key={self._api_key}"
        body = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(url, json=body)
            resp.raise_for_status()
            data = resp.json()
        candidates = data.get("candidates", [])
        if not candidates:
            return "Model returned no candidates."
        parts = candidates[0].get("content", {}).get("parts", [])
        return "".join(part.get("text", "") for part in parts).strip() or "Model returned no text."


class GroqProvider(LLMProvider):
    """Groq — OpenAI-compatible, ultra-fast inference, free tier."""

    name = "groq"

    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile") -> None:
        self._api_key = api_key
        self._model = model
        self._base_url = "https://api.groq.com/openai/v1"

    def is_configured(self) -> bool:
        return bool(self._api_key)

    def generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        messages: list[dict[str, str]] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        return self.chat(messages, temperature=temperature, max_tokens=max_tokens)

    def stream_generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        messages: list[dict[str, str]] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        yield from self.stream_chat(messages, temperature=temperature, max_tokens=max_tokens)

    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        body = {
            "model": self._model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(f"{self._base_url}/chat/completions", json=body, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        choices = data.get("choices", [])
        if not choices:
            return "Model returned no choices."
        return choices[0].get("message", {}).get("content", "").strip() or "Model returned no text."

    def stream_chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        body = {
            "model": self._model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=120.0) as client:
            with client.stream("POST", f"{self._base_url}/chat/completions", json=body, headers=headers) as resp:
                resp.raise_for_status()
                for line in resp.iter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    payload = line[6:]
                    if payload == "[DONE]":
                        return
                    chunk = json.loads(payload).get("choices", [{}])[0].get("delta", {}).get("content", "")
                    if chunk:
                        yield str(chunk)


class OpenAICompatibleProvider(LLMProvider):
    """Generic OpenAI-compatible provider — works for OpenAI, DeepSeek, xAI (Grok), Together, etc."""

    def __init__(self, *, name: str, api_key: str, model: str, base_url: str = "https://api.openai.com/v1") -> None:
        self.name = name
        self._api_key = api_key
        self._model = model
        self._base_url = base_url.rstrip("/")

    def is_configured(self) -> bool:
        return bool(self._api_key)

    def generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        messages: list[dict[str, str]] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        return self.chat(messages, temperature=temperature, max_tokens=max_tokens)

    def stream_generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        messages: list[dict[str, str]] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        yield from self.stream_chat(messages, temperature=temperature, max_tokens=max_tokens)

    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        body = {
            "model": self._model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=120.0) as client:
            resp = client.post(f"{self._base_url}/chat/completions", json=body, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        choices = data.get("choices", [])
        if not choices:
            return "Model returned no choices."
        return choices[0].get("message", {}).get("content", "").strip() or "Model returned no text."

    def stream_chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        body = {
            "model": self._model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=120.0) as client:
            with client.stream("POST", f"{self._base_url}/chat/completions", json=body, headers=headers) as resp:
                resp.raise_for_status()
                for line in resp.iter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    payload = line[6:]
                    if payload == "[DONE]":
                        return
                    chunk = json.loads(payload).get("choices", [{}])[0].get("delta", {}).get("content", "")
                    if chunk:
                        yield str(chunk)


class AnthropicProvider(LLMProvider):
    """Anthropic Claude — uses the Messages API."""

    name = "anthropic"

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514") -> None:
        self._api_key = api_key
        self._model = model
        self._base_url = "https://api.anthropic.com/v1"

    def is_configured(self) -> bool:
        return bool(self._api_key)

    def generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        messages: list[dict[str, str]] = [{"role": "user", "content": prompt}]
        return self._call(messages, system=system, temperature=temperature, max_tokens=max_tokens)

    def stream_generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        messages: list[dict[str, str]] = [{"role": "user", "content": prompt}]
        yield from self._stream_call(messages, system=system, temperature=temperature, max_tokens=max_tokens)

    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        system_text = None
        api_messages: list[dict[str, str]] = []
        for msg in messages:
            if msg["role"] == "system":
                system_text = msg["content"]
            else:
                api_messages.append(msg)
        return self._call(api_messages, system=system_text, temperature=temperature, max_tokens=max_tokens)

    def stream_chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        system_text = None
        api_messages: list[dict[str, str]] = []
        for msg in messages:
            if msg["role"] == "system":
                system_text = msg["content"]
            else:
                api_messages.append(msg)
        yield from self._stream_call(api_messages, system=system_text, temperature=temperature, max_tokens=max_tokens)

    def _call(self, messages: list[dict[str, str]], *, system: str | None, temperature: float, max_tokens: int) -> str:
        body: dict[str, Any] = {
            "model": self._model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        if system:
            body["system"] = system
        headers = {
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=120.0) as client:
            resp = client.post(f"{self._base_url}/messages", json=body, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        content_blocks = data.get("content", [])
        texts = [block.get("text", "") for block in content_blocks if block.get("type") == "text"]
        return "".join(texts).strip() or "Model returned no text."

    def _stream_call(self, messages: list[dict[str, str]], *, system: str | None, temperature: float, max_tokens: int) -> Iterator[str]:
        body: dict[str, Any] = {
            "model": self._model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": True,
        }
        if system:
            body["system"] = system
        headers = {
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=120.0) as client:
            with client.stream("POST", f"{self._base_url}/messages", json=body, headers=headers) as resp:
                resp.raise_for_status()
                current_event = "message"
                for line in resp.iter_lines():
                    if not line:
                        continue
                    if line.startswith("event: "):
                        current_event = line[7:]
                        continue
                    if not line.startswith("data: "):
                        continue
                    payload = line[6:]
                    if payload == "[DONE]":
                        return
                    if current_event != "content_block_delta":
                        continue
                    data = json.loads(payload)
                    chunk = data.get("delta", {}).get("text", "")
                    if chunk:
                        yield str(chunk)


class MockProvider(LLMProvider):
    """Deterministic mock for dev/testing — no external calls."""

    name = "mock"

    def is_configured(self) -> bool:
        return True

    def generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        return f"[Mock LLM] Processed prompt ({len(prompt)} chars). System context: {'yes' if system else 'no'}."

    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048) -> str:
        last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        return f"[Mock LLM] Response to: {last_user[:80]}..."


class LLMRouter:
    """Routes LLM calls to the best available provider with automatic fallback."""

    def __init__(self) -> None:
        self._providers: list[LLMProvider] = []
        self._default_provider: str | None = None

    def register(self, provider: LLMProvider) -> None:
        self._providers.append(provider)

    def set_default(self, name: str) -> None:
        self._default_provider = name

    @property
    def available_providers(self) -> list[str]:
        return [p.name for p in self._providers if p.is_configured()]

    def _get_provider_chain(self) -> list[LLMProvider]:
        configured = [p for p in self._providers if p.is_configured()]
        if self._default_provider:
            default = [p for p in configured if p.name == self._default_provider]
            others = [p for p in configured if p.name != self._default_provider]
            return default + others
        return configured

    def generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048, provider: str | None = None) -> str:
        chain = self._get_provider_chain()
        if provider:
            chain = [p for p in chain if p.name == provider] or chain

        last_error: Exception | None = None
        for p in chain:
            try:
                logger.info("LLM generate via %s", p.name)
                return p.generate(prompt, system=system, temperature=temperature, max_tokens=max_tokens)
            except Exception as exc:
                logger.warning("LLM provider %s failed: %s", p.name, exc)
                last_error = exc
                continue

        if last_error:
            raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")
        raise RuntimeError("No LLM providers are configured.")

    def chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048, provider: str | None = None) -> str:
        chain = self._get_provider_chain()
        if provider:
            chain = [p for p in chain if p.name == provider] or chain

        last_error: Exception | None = None
        for p in chain:
            try:
                logger.info("LLM chat via %s", p.name)
                return p.chat(messages, temperature=temperature, max_tokens=max_tokens)
            except Exception as exc:
                logger.warning("LLM provider %s failed: %s", p.name, exc)
                last_error = exc
                continue

        if last_error:
            raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")
        raise RuntimeError("No LLM providers are configured.")

    def stream_generate(self, prompt: str, *, system: str | None = None, temperature: float = 0.7, max_tokens: int = 2048, provider: str | None = None) -> Iterator[str]:
        chain = self._get_provider_chain()
        if provider:
            chain = [p for p in chain if p.name == provider] or chain

        last_error: Exception | None = None
        for p in chain:
            yielded = False
            try:
                logger.info("LLM stream_generate via %s", p.name)
                for chunk in p.stream_generate(prompt, system=system, temperature=temperature, max_tokens=max_tokens):
                    yielded = True
                    yield chunk
                return
            except Exception as exc:
                logger.warning("LLM provider %s stream generate failed: %s", p.name, exc)
                last_error = exc
                if yielded:
                    raise
                continue

        if last_error:
            raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")
        raise RuntimeError("No LLM providers are configured.")

    def stream_chat(self, messages: list[dict[str, str]], *, temperature: float = 0.7, max_tokens: int = 2048, provider: str | None = None) -> Iterator[str]:
        chain = self._get_provider_chain()
        if provider:
            chain = [p for p in chain if p.name == provider] or chain

        last_error: Exception | None = None
        for p in chain:
            yielded = False
            try:
                logger.info("LLM stream chat via %s", p.name)
                for chunk in p.stream_chat(messages, temperature=temperature, max_tokens=max_tokens):
                    yielded = True
                    yield chunk
                return
            except Exception as exc:
                logger.warning("LLM provider %s stream chat failed: %s", p.name, exc)
                last_error = exc
                if yielded:
                    raise
                continue

        if last_error:
            raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")
        raise RuntimeError("No LLM providers are configured.")


_router: LLMRouter | None = None


def get_llm_router() -> LLMRouter:
    global _router
    if _router is not None:
        return _router

    settings = get_settings()
    _router = LLMRouter()

    # --- Core providers (system-level, env-configured) ---
    _router.register(OllamaProvider(settings.ollama_base_url, settings.ollama_model))
    _router.register(GeminiProvider(settings.gemini_api_key, settings.gemini_model))
    _router.register(GroqProvider(settings.groq_api_key, settings.groq_model))

    # --- User-facing providers (user brings their own API key via env or Vault) ---
    _router.register(OpenAICompatibleProvider(
        name="openai",
        api_key=settings.openai_api_key,
        model=settings.openai_model,
        base_url="https://api.openai.com/v1",
    ))
    _router.register(AnthropicProvider(settings.anthropic_api_key, settings.anthropic_model))
    _router.register(OpenAICompatibleProvider(
        name="deepseek",
        api_key=settings.deepseek_api_key,
        model=settings.deepseek_model,
        base_url="https://api.deepseek.com/v1",
    ))
    _router.register(OpenAICompatibleProvider(
        name="xai",
        api_key=settings.xai_api_key,
        model=settings.xai_model,
        base_url="https://api.x.ai/v1",
    ))

    # --- Fallback ---
    _router.register(MockProvider())

    # Set default based on config
    if settings.llm_provider == "auto":
        # Auto-detect: prefer Gemini > Groq > OpenAI > Anthropic > DeepSeek > xAI > Ollama > Mock
        for name in ("gemini", "groq", "openai", "anthropic", "deepseek", "xai", "ollama", "mock"):
            if any(p.name == name and p.is_configured() for p in _router._providers):
                _router.set_default(name)
                break
    else:
        _router.set_default(settings.llm_provider)

    logger.info("LLM router initialized. Available: %s, Default: %s", _router.available_providers, _router._default_provider)
    return _router


def reset_llm_router() -> None:
    """Reset the cached router (useful for testing or config changes)."""
    global _router
    _router = None
