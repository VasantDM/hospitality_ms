import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    from django.core.management import execute_from_command_line
    port = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1:8000"
    execute_from_command_line(["manage.py", "runserver", port])

