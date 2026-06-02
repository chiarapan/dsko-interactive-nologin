from flask_restx import Namespace, Resource, fields
from flask import request
from app.services.validation_service import *


api = Namespace('validation', description='File validation')


@api.route('/upload/bandstructure')
class UploadBandstructure(Resource):
    def post(self):
        job_id = request.form.get('job_id')
        print(f"[POST /validation/upload/bandstructure] job_id: {job_id}")
        return upload_file_part('bandstructure', job_id)

@api.route('/upload/structure')
class UploadStructure(Resource):
    def post(self):
        job_id = request.form.get('job_id')
        print(f"[POST /validation/upload/structure] job_id: {job_id}")
        return upload_file_part('structure', job_id)

@api.route('/check')
class VerifyBandStructure(Resource):
    def post(self):
        job_id = request.json.get('job_id')
        print(f"[POST /validation/check] job_id: {job_id}")
        return verify_band_structure(job_id)

    def post(self):
        job_id = request.json.get('job_id')
        return verify_band_structure(job_id)