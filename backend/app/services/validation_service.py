from flask import request
import os
from ase.io.jsonio import read_json
from ase.spectrum.band_structure import BandStructure
from ase.io import read
import uuid
from ase.atoms import Atoms


UPLOAD_FOLDER = 'uploads'
SUPPORTED_EXTS = ['.xyz', '.vasp', '.cif', '.traj']


def upload_file_part(part: str, job_id: str = None):
    if part not in request.files:
        return {'success': False, 'error': f'{part} file missing'}, 400

    if not job_id:
        job_id = str(uuid.uuid4())

    file = request.files[part]
    ext = os.path.splitext(file.filename)[1].lower()

    folder = os.path.join(UPLOAD_FOLDER, job_id)
    os.makedirs(folder, exist_ok=True)

    filepath = os.path.join(folder, f'{part}{ext}')
    file.save(filepath)

    return {'success': True, 'job_id': job_id, 'filename': file.filename}, 200

def verify_band_structure(job_id: str):
    folder = os.path.join(UPLOAD_FOLDER, job_id)
    if not os.path.exists(folder):
        return {'success': False, 'error': 'Invalid job_id'}, 404

    try:
        structure_file = next(f for f in os.listdir(folder) if f.startswith('structure'))
        band_file = next(f for f in os.listdir(folder) if f.startswith('bandstructure'))

        structure_path = os.path.join(folder, structure_file)
        band_path = os.path.join(folder, band_file)

        result = test_structure_and_bandstructure(structure_path, band_path)
        return {'success': True, 'message': result}, 200

    except AssertionError as e:
        # Incompatible → remove structure
        try:
            os.remove(structure_path)
        except Exception:
            pass
        return {'success': False, 'error': str(e)}, 400

    except StopIteration:
        return {'success': False, 'error': 'Both files must be uploaded first'}, 400

    except Exception as e:
        return {'success': False, 'error': str(e)}, 500


def test_structure_and_bandstructure(structure_path: str, band_structure_path: str) -> str:
    ext = os.path.splitext(structure_path)[1].lower()
    if ext not in SUPPORTED_EXTS:
        raise ValueError(f"Unsupported extension '{ext}'. Supported: {SUPPORTED_EXTS}")

    structure: Atoms = read(structure_path, index=-1)
    assert len(structure) > 0, "Structure is empty or invalid"
    structure.wrap()

    band_structure: BandStructure = read_json(band_structure_path)
    assert band_structure.energies.size > 0, "Band structure is empty"

    st_bandpath = structure.cell.bandpath()
    bs_bandpath = band_structure.path

    if set(st_bandpath.special_points.keys()) != set(bs_bandpath.special_points.keys()):
        raise AssertionError("Mismatch: Special k-points in the structure and band structure must match")

    return "Structure and band structure are compatible."
