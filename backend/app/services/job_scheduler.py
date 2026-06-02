import time
import shutil
import os


def clean_old_jobs(folder: str, max_age_minutes: int = 2):
    """
    Deletes subfolders in `folder` older than `max_age_minutes`.
    """
    now = time.time()
    max_age_seconds = max_age_minutes * 1

    for subdir in os.listdir(folder):
        path = os.path.join(folder, subdir)
        if os.path.isdir(path):
            modified_time = os.path.getmtime(path)
            if now - modified_time > max_age_seconds:
                try:
                    shutil.rmtree(path)
                    print(f"[CLEANUP] Deleted expired job folder: {path}")
                except Exception as e:
                    print(f"[CLEANUP ERROR] Failed to delete {path}: {e}")
