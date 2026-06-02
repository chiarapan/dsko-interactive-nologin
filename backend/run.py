print("Starting run.py...")

from app import create_app

print("Import done, calling create_app()")

app = create_app()

print("App created!")

if __name__ == '__main__':
    app.run(debug=True)
