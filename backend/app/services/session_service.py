from app.models import Session
from extensions import db
from typing import Optional
import json, base64, zlib
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from app.utils.session_utils import compress_data, decompress_data, apply_filters



UPLOAD_FOLDER = 'uploads'
SUPPORTED_EXTS = ['.xyz', '.vasp', '.cif']




def get_all_sessions():
    sessions = Session.query.all()
    return [session.to_dict(include_data=False) for session in sessions]


def get_session_by_id(session_id: int) -> Optional[Session]:
    return db.session.get(Session, session_id)

def get_session_details(session_id: int):
    session = get_session_by_id(session_id)
    if not session:
        return {"success": False, "message": "Session not found"}, 404

    try:
        session_dict = session.to_dict()
        session_dict["data"] = decompress_data(session.data)
        
        return {"success": True, "session": session_dict}, 200
    except Exception as e:
        print(f"Failed to decompress session {session_id} data: {str(e)}")
        return {
            "success": False,
            "message": f"Failed to decompress session data: {str(e)}"
        }, 500


def create_session(data):
    try:
        if not data.get("data"):
            return {"success": False, "message": "Missing required field: data"}, 400

        compressed_data = compress_data(data["data"])

        serialized_data = {
            "notes": data.get("notes", ""),
            "author": data.get("author", ""),
            "atom": data.get("atom", ""),
            "data": compressed_data
        }

        session = Session(**serialized_data)
        db.session.add(session)
        db.session.commit()
        db.session.refresh(session)

        session_dict = session.to_dict()

        return {"success": True, "session": session_dict}, 201

    except Exception as e:
        db.session.rollback()
        print(f"Error in create_session: {str(e)}")
        return {"success": False, "message": f"Error creating session: {str(e)}"}, 500
    finally:
        if 'compressed_data' in locals():
            del compressed_data
        if 'serialized_data' in locals():
            del serialized_data
    


def update_session(session_id: int, data: dict) -> dict:
    session = get_session_by_id(session_id)
    if not session:
        return {"success": False, "message": "Session not found"}

    try:
        allowed_fields = {'author', 'atom', 'notes'}

        for key in allowed_fields:
            if key in data:
                setattr(session, key, data[key])

        db.session.commit()
        db.session.refresh(session)

        session_dict = session.to_dict()

        return {
            "success": True,
            "message": "Session updated successfully",
            "session": session_dict
        }

    except SQLAlchemyError as e:
        db.session.rollback()
        return {
            "success": False,
            "message": f"Error updating session: {str(e)}"
        }



def delete_session(session_id: int) -> dict:
    session = get_session_by_id(session_id)
    
    if session is None:
        return {
            "success": False,
            "message": f"Session with ID {session_id} not found."
        }
    try:
        db.session.delete(session)
        db.session.commit()
        return {
            "success": True,
            "message": f"Session with ID {session_id} deleted successfully."
        }
    except Exception as e:
        db.session.rollback()
        print(f"Error while deleting session: {e}")
        return {
            "success": False,
            "message": f"Failed to delete session with ID {session_id}: {str(e)}"
        }

    

def get_sessions_by_filters(author=None, atom=None, start_date=None, end_date=None):
    query = Session.query
    query = apply_filters(query, Session, author, atom, start_date, end_date)
    return [session.to_dict(include_data=False) for session in query.all()]