from extensions import db
from datetime import datetime
import json


class Session(db.Model):
    __tablename__ = 'session'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    data = db.Column(db.Text, nullable=False)
    notes = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), nullable=False)
    atom = db.Column(db.String(100), nullable=False)


    def to_dict(self, include_data=True):
        """
        Convert session to dict. Optionally exclude the heavy `data` field.
        """
        parsed_data = None
        if include_data and self.data:
            try:
                parsed_data = json.loads(self.data)
            except (json.JSONDecodeError, TypeError):
                parsed_data = self.data  

        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "data": parsed_data if include_data else None,
            "notes": self.notes,
            "author": self.author,
            "atom": self.atom
        }


