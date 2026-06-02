from datetime import datetime
from zoneinfo import ZoneInfo
from extensions import db
import json


class OptimizerSession(db.Model):
    __tablename__ = 'optimizer_sessions'
    __table_args__ = {'extend_existing': True}


    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)    
    data = db.Column(db.Text, nullable=False)
    notes = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(120), nullable=False)
    atom = db.Column(db.String(100), nullable=False)
    numParticles = db.Column(db.Integer, nullable=False)

    def to_dict(self, include_data: bool = True):
        parsed_data = None
        if include_data:
            try:
                parsed_data = json.loads(self.data) if self.data else None
            except (json.JSONDecodeError, TypeError):
                parsed_data = self.data

        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "data": parsed_data,
            "notes": self.notes,
            "author": self.author,
            "atom": self.atom,
            "numParticles": self.numParticles
        }

