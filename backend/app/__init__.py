import os
import logging
from flask import Flask
from extensions import db, migrate
from app.api import api
from flask_cors import CORS
from flask_restx import Api
from app.api.validation_routes import api as validation_api
from app.api.parse_routes import api as parse_api
from app.api.health_routes import api as health_api
from app.api.optimizer_routes import api as optimizer_api
from app.api.session_routes import api as session_api
from app.api.optimizer_session_routes import api as optimizer_session_api
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.job_scheduler import clean_old_jobs
from datetime import datetime
import atexit


def create_app(testing=False):
    print("Creating Flask app...")
    load_dotenv()

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.info("Initializing Flask application...")

    app = Flask(__name__)

    cors_origins = os.getenv("CORS_ORIGINS", "*")
    if cors_origins.strip() == "*":
        origins = "*"
    else:
        origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

    CORS(app, resources={r"/*": {"origins": origins}})

    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME")

    if testing:
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
            "SQLALCHEMY_DATABASE_URI",
            f"postgresql+psycopg2://testuser:testpass@localhost:5432/testdb"
        )
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = (
            f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        )

    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        db.create_all()

    api = Api(
        title="Session API",
        version="1.0",
        description="A maintainable REST API",
        doc="/docs",
    )
    api.add_namespace(validation_api)
    api.add_namespace(parse_api)
    api.add_namespace(health_api)
    api.add_namespace(optimizer_api)
    api.add_namespace(session_api)
    api.add_namespace(optimizer_session_api)


    api.init_app(app)

    if not app.debug:
        handler = logging.StreamHandler()
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
        )
        handler.setFormatter(formatter)
        app.logger.addHandler(handler)

    UPLOAD_FOLDER = 'uploads'

    def scheduled_cleanup():
        logger.info(f"[{datetime.now()}] Running cleanup job...")
        try:
            clean_old_jobs(UPLOAD_FOLDER, max_age_minutes=2)
            logger.info(f"[{datetime.now()}] Cleanup job completed successfully.")
        except Exception as e:
            logger.error(f"[{datetime.now()}] Cleanup job failed: {e}")

    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=scheduled_cleanup,
        trigger="interval",
        minutes=30
    )
    scheduler.start()
    logger.info("BackgroundScheduler started and cleanup job scheduled every 30 minutes.")

    atexit.register(lambda: (
        logger.info("Shutting down BackgroundScheduler..."),
        scheduler.shutdown()
    ))

    print("API namespaces registered and app created.")
    return app
