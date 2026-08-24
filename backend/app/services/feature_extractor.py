from urllib.parse import urlparse

def extract_features(url):
    parsed = urlparse(url)

    return [
        len(url),
        url.count('.'),
        url.count('-'),
        len(parsed.netloc),
        1 if parsed.scheme == "https" else 0,
        1 if "@" in url else 0
    ]