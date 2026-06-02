from app.models_optimizer import OptimizerSession
from extensions import db
import json, zlib, base64
from sqlalchemy.exc import SQLAlchemyError
from flask import abort
from typing import Optional
from datetime import datetime
from app.utils.session_utils import compress_data, decompress_data, apply_filters

import logging
logger = logging.getLogger(__name__)

def create_optimizer_session(data):
    try:
        if not data.get("data"):
            logger.warning("Missing 'data' field in optimizer session creation.")
            return {"success": False, "message": "Missing required field: data"}, 400

        original_json = json.dumps(data["data"])
        compressed_data = compress_data(data["data"])

        session_payload = {
            "notes": data.get("notes", ""),
            "author": data.get("author", ""),
            "atom": data.get("atom", ""),
            "numParticles": data.get("numParticles", ""),
            "data": compressed_data
        }

        session = OptimizerSession(**session_payload)
        db.session.add(session)
        db.session.commit()
        db.session.refresh(session)

        logger.info(f"Created new optimizer session with ID {session.id}")
        session_dict = session.to_dict()

        return {"success": True, "session": session_dict}, 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in create_optimizer_session: {str(e)}")
        return {"success": False, "message": f"Error creating optimizer session: {str(e)}"}, 500
    finally:
        if 'compressed_data' in locals():
            del compressed_data
        if 'serialized_data' in locals():
            del serialized_data


def get_all_sessions():
    logger.info("Fetching all optimizer sessions.")
    sessions = OptimizerSession.query.all()
    return [session.to_dict(include_data=False) for session in sessions]


def get_session_by_id(session_id: int) -> Optional[OptimizerSession]:
    logger.debug(f"Fetching session by ID: {session_id}")
    return db.session.get(OptimizerSession, session_id)


def get_session_details(session_id: int):
    logger.info(f"Retrieving details for session ID: {session_id}")
    session = get_session_by_id(session_id)
    if not session:
        logger.warning(f"Session ID {session_id} not found.")
        return {"success": False, "message": "Session not found"}, 404

    try:
        session_dict = session.to_dict()
        session_dict["data"] = decompress_data(session.data)
        logger.info(f"Session ID {session_id} decompressed successfully.")
        return {"success": True, "session": session_dict}, 200
    except Exception as e:
        logger.error(f"Failed to decompress session {session_id} data: {str(e)}")
        return {
            "success": False,
            "message": f"Failed to decompress session data: {str(e)}"
        }, 500


def update_optimizer_session(session_id: int, updates: dict):
    logger.info(f"Updating session ID {session_id} with data: {updates}")
    session = get_session_by_id(session_id)

    if not session:
        logger.warning(f"Session with ID {session_id} not found for update.")
        return {
            "success": False,
            "message": f"Session with ID {session_id} not found."
        }, 404

    try:
        for key in ["author", "atom", "notes"]:
            if key in updates:
                setattr(session, key, updates[key])

        db.session.commit()
        session_dict = session.to_dict()
        session_dict["data"] = decompress_data(session.data)

        logger.info(f"Session ID {session_id} updated successfully.")
        return {
            "success": True,
            "message": f"Session with ID {session_id} updated successfully.",
            "session": session_dict
        }, 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error during update of session {session_id}: {str(e)}")
        return {
            "success": False,
            "message": f"Failed to update session with ID {session_id}: {str(e)}"
        }, 500


def delete_session(session_id: int) -> dict:
    logger.info(f"Attempting to delete session ID {session_id}")
    session = get_session_by_id(session_id)

    if session is None:
        logger.warning(f"Session ID {session_id} not found for deletion.")
        return {
            "success": False,
            "message": f"Session with ID {session_id} not found."
        }

    try:
        db.session.delete(session)
        db.session.commit()
        logger.info(f"Session ID {session_id} deleted successfully.")
        return {
            "success": True,
            "message": f"Session with ID {session_id} deleted successfully."
        }
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error while deleting session {session_id}: {e}")
        return {
            "success": False,
            "message": f"Failed to delete session with ID {session_id}: {str(e)}"
        }


def get_sessions_by_filters(author=None, atom=None, start_date=None, end_date=None):
    logger.info(f"Filtering sessions with author='{author}', atom='{atom}', start='{start_date}', end='{end_date}'")
    query = OptimizerSession.query
    query = apply_filters(query, OptimizerSession, author, atom, start_date, end_date)
    sessions = query.all()
    logger.info(f"Found {len(sessions)} sessions matching filters.")
    return [session.to_dict(include_data=False) for session in sessions]
