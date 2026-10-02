"""
Shared rate limiter instance — imported by main.py and individual route modules.
Using a single shared instance ensures all routes share the same rate-limit storage.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
