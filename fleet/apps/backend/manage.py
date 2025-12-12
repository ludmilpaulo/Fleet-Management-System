#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


class FilteredOutput:
    """Filter out development server warning messages."""
    def __init__(self, stream):
        self.stream = stream
        self.buffer = ''

    def write(self, data):
        # Buffer the data to check for multi-line warnings
        self.buffer += data
        lines = self.buffer.split('\n')
        self.buffer = lines[-1]  # Keep incomplete line in buffer
        
        for line in lines[:-1]:
            if 'development server' not in line.lower() and 'do not use it in a production' not in line.lower():
                self.stream.write(line + '\n')
    
    def flush(self):
        if self.buffer and 'development server' not in self.buffer.lower() and 'do not use it in a production' not in self.buffer.lower():
            self.stream.write(self.buffer)
            self.buffer = ''
        self.stream.flush()


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    # Filter out development server warnings if running runserver
    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        sys.stderr = FilteredOutput(sys.stderr)
        sys.stdout = FilteredOutput(sys.stdout)
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
    except Exception as e:
        sys.exit(1)
