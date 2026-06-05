print("Starting run.py...")

import os
from app import create_app

print("Import done, calling create_app()")

app = create_app()

print("App created!")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
