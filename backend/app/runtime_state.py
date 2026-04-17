"""
Mutable runtime state shared between main.py startup/shutdown hooks and routers.
"""
from __future__ import annotations

import asyncio

# Set by the lifespan startup handler in main.py
worker_task: asyncio.Task | None = None
scheduler_task: asyncio.Task | None = None
