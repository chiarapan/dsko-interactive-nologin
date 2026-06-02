import platform
import socket
import time

def health_check():
    return {
        "status": "healthy",
        "server_time": time.strftime('%Y-%m-%d %H:%M:%S'),
        "hostname": socket.gethostname(),
        "platform": platform.system(),
        "platform_version": platform.version(),
        "python_version": platform.python_version()
    }
