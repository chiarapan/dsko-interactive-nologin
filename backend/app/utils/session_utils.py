import json, zlib, base64
from datetime import datetime


def compress_data(data: dict) -> str:
    """Compress dictionary to base64 string."""
    try:
        json_str = json.dumps(data)
        compressed = zlib.compress(json_str.encode('utf-8'))
        return base64.b64encode(compressed).decode('utf-8')
    except (TypeError, json.JSONDecodeError) as e:
        raise ValueError(f"Error compressing data: {e}")

def decompress_data(encoded_input: str | bytes) -> dict:
    """Decompress base64 string to dictionary."""
    try:
        if isinstance(encoded_input, str):
            encoded_input = encoded_input.encode('utf-8')
        compressed = base64.b64decode(encoded_input)
        json_str = zlib.decompress(compressed).decode('utf-8')
        return json.loads(json_str)
    except (zlib.error, json.JSONDecodeError, base64.binascii.Error) as e:
        raise ValueError(f"Error decompressing data: {e}")

def apply_filters(query, model, author=None, atom=None, start_date=None, end_date=None):
    """Apply common filters to session queries."""
    if author:
        query = query.filter(model.author.ilike(f"%{author}%"))
    if atom:
        query = query.filter(model.atom.ilike(f"%{atom}%"))
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(model.created_at >= start)
        except ValueError:
            raise ValueError("Invalid start_date format. Use YYYY-MM-DD.")
    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(model.created_at <= end)
        except ValueError:
            raise ValueError("Invalid end_date format. Use YYYY-MM-DD.")
    return query
