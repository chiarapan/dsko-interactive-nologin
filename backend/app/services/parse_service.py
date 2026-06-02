from flask_restx.reqparse import RequestParser
from ase.io import read
from werkzeug.datastructures import FileStorage
from io import BytesIO, StringIO
import numpy as np
from typing import Dict, Any
from app.utils.atomic_data import atomic_data
from ase.formula import Formula
from ase.data.colors import cpk_colors
from ase.data import covalent_radii, atomic_numbers
from ase.geometry import Cell, cell_to_cellpar
from ase.io.jsonio import read_json
import spglib


upload_parser = RequestParser()
upload_parser.add_argument(
    'file',
    type=FileStorage,
    location='files',
    required=True,
    help='Structure file (.cif, .vasp, .xyz, .gen, .traj)'
)


def detect_format(filename: str) -> str:
    if filename.endswith(".cif"):
        return "cif"
    elif filename.endswith(".vasp") or filename.endswith(".poscar"):
        return "vasp"
    elif filename.endswith(".gen"):
        return "gen"
    elif filename.endswith(".traj"):
        return "traj"
    elif filename.endswith(".xyz"):
        return "xyz"
    return None

def parse_structure_file(file: FileStorage) -> dict:
    print("[parse_structure_file] File received:", file.filename)
    filename = file.filename.lower()
    file_format = detect_format(filename)

    print("[parse_structure_file] Detected format:", file_format)
    if not file_format:
        raise ValueError("Unsupported file format")

    # Read file content
    if file_format == "traj":
        atoms = read(BytesIO(file.read()), format="traj")
    else:
        decoded = file.read().decode("utf-8")
        atoms = read(StringIO(decoded), format=file_format)

    print("[parse_structure_file] Parsed atoms:", atoms)

    # Ensure periodic boundary conditions for symmetry detection
    atoms.set_pbc([True, True, True])

    # Geometry
    lattice = atoms.get_cell().tolist()
    a, b, c, alpha, beta, gamma = cell_to_cellpar(atoms.get_cell())
    scaled_positions = atoms.get_scaled_positions().tolist()
    cartesian_positions = atoms.get_positions().tolist()

    # Elements and formula
    elements = atoms.get_chemical_symbols()
    formula = atoms.get_chemical_formula()
    parsed = Formula(formula)
    element_counts = parsed.count()

    # Atom data
    atom_data = []
    for el, frac, pos in zip(elements, scaled_positions, cartesian_positions):
        atomic_num = atomic_numbers[el]
        radius = covalent_radii[atomic_num]
        color_rgb = cpk_colors[atomic_num]
        color_hex = '#%02x%02x%02x' % tuple(int(c * 255) for c in color_rgb)
        atom_data.append({
            "element": el,
            "frac": frac,
            "cartesian": pos,
            "covalent_radius": radius,
            "cpk_color": color_hex
        })

    # Total valence electrons
    total_valence = 0
    for el, count in element_counts.items():
        val = atomic_data.get(el, {}).get("valence_number")
        if val is None:
            raise ValueError(f"Missing valence number for element '{el}' in atomic_data")
        total_valence += val * count

    # Symmetry detection 
    symmetry_data = {}
    try:
        symmetry_input = (atoms.get_cell(), atoms.get_scaled_positions(), atoms.get_atomic_numbers())
        dataset = spglib.get_symmetry_dataset(symmetry_input, symprec=1e-3)
        symmetry_data = {
            "international": dataset["international"],
            "number": dataset["number"],
            "hall": dataset["hall"],
            "pointgroup": dataset["pointgroup"],
            "origin_shift": dataset["origin_shift"].tolist(),
            "transformation_matrix": dataset["transformation_matrix"].tolist(),
            "wyckoff_letters": list(dataset["wyckoffs"]),
            "equivalent_atoms": dataset["equivalent_atoms"].tolist(),
        }
    except Exception as e:
        print("[parse_structure_file] Spglib symmetry detection failed:", e)

    return {
        "lattice": lattice,
        "lattice_parameters": {
            "a": a,
            "b": b,
            "c": c,
            "alpha": alpha,
            "beta": beta,
            "gamma": gamma
        },
        "atoms": atom_data,
        "pbc": atoms.get_pbc().tolist(),
        "natoms": len(atoms),
        "formula": formula,
        "structureFileName": file.filename,
        "element_counts": element_counts,
        "val_n": total_valence,
        "symmetry": symmetry_data,
    }




#  File-upload parser 
upload_parser_band = RequestParser()
upload_parser_band.add_argument(
    "file",
    type=FileStorage,
    location="files",
    required=True,
    help="Band-structure JSON file",
)


def validate_N_val(N_val):
    if not isinstance(N_val, int):
        raise ValueError("N_val must be an integer.")
    if N_val <= 0:
        raise ValueError("N_val must be positive and non-zero.")
    return True


def parse_band_structure_file(file, val_n: int = 0, tol: float = 1e-5) -> Dict[str, Any]:
    print("[parse_band_structure_file] File received:", getattr(file, 'filename', 'unknown'))
    try:
        file.seek(0)
        content = file.read()
        print("[parse_band_structure_file] File read completed")
        if isinstance(content, bytes):
            content = content.decode("utf-8")

        bs = read_json(StringIO(content))
        print("[parse_band_structure_file] JSON parsed")

        cell = bs.path.cell
        if not hasattr(cell, "reciprocal"):
            cell = Cell(cell)
        recip_cell = cell.reciprocal()

        kpts_frac = bs.path.kpts
        kpts_np = np.dot(kpts_frac, recip_cell)

        num_kpts = kpts_np.shape[0]

        k_dist = [0.0]
        for i in range(1, num_kpts):
            dk = kpts_np[i] - kpts_np[i - 1]
            k_dist.append(k_dist[-1] + np.linalg.norm(dk))

        fermi_level = bs.reference or 0.0
        energies_raw = np.array(bs.energies)

        is_spin_polarized = len(energies_raw) == 2  # shape: [2, kpts, bands]

        if is_spin_polarized:
            energies_up = energies_raw[0] - fermi_level
            energies_down = energies_raw[1] - fermi_level
            energies_shifted = {"up": energies_up, "down": energies_down}
            num_bands = energies_up.shape[1]
        else:
            energies_up = energies_raw[0] - fermi_level
            energies_shifted = energies_up
            num_bands = energies_up.shape[1]

        if is_spin_polarized:
            energies_flat = {
                "up": energies_shifted["up"].flatten().tolist(),
                "down": energies_shifted["down"].flatten().tolist()
            }

            points = []
            for spin in ["up", "down"]:
                for k_idx, kpt in enumerate(kpts_frac.tolist()):
                    for band_idx in range(num_bands):
                        points.append({
                            "k_point_index": k_idx,
                            "k_point_coord": kpt,
                            "band_index": band_idx,
                            "spin": spin,
                            "energy": float(energies_shifted[spin][k_idx, band_idx])
                        })

            energy_matrix = {
                "up": energies_shifted["up"].tolist(),
                "down": energies_shifted["down"].tolist()
            }

        else:
            energies_flat = energies_shifted.flatten().tolist()
            points = []
            for k_idx, kpt in enumerate(kpts_frac.tolist()):
                for band_idx in range(num_bands):
                    points.append({
                        "k_point_index": k_idx,
                        "k_point_coord": kpt,
                        "band_index": band_idx,
                        "energy": float(energies_shifted[k_idx, band_idx])
                    })

            energy_matrix = energies_shifted.tolist()

        raw_special = getattr(bs.path, "special_points", {})
        special_pts = {}
        special_idx = {}

        for lbl, coords in raw_special.items():
            vec = np.array(coords)
            special_pts[lbl] = vec.tolist()
            for idx, kpt in enumerate(kpts_frac):
                if np.allclose(vec, kpt, atol=tol):
                    special_idx[lbl] = idx
                    break

        tick_indices = bs.path._find_special_point_indices(eps=1e-2)
        tick_index_labels = {}
        for idx in tick_indices:
            kpt = kpts_frac[idx]
            for label, sp_kpt in special_pts.items():
                if np.allclose(kpt, sp_kpt, atol=1e-3):
                    corrected_label = 'Γ' if label == 'G' else label
                    tick_index_labels[int(idx)] = corrected_label
                    break

        return {
            "kpoints": kpts_frac.tolist(),
            "energies": energies_flat,
            "energy_matrix": energy_matrix,
            "num_bands": num_bands,
            "special_point_indices": special_idx,
            "fermi_level": fermi_level,
            "k_dist": k_dist,
            "points": points,
            "bandFileName": getattr(file, 'filename', 'unknown'),
            "val_n": val_n,
            "label": tick_index_labels,
            "is_spin_polarized": is_spin_polarized,
        }

    except KeyError as e:
        raise ValueError(f"Missing key in JSON: {e}")
    except Exception as e:
        raise ValueError(f"Failed to parse band structure file: {str(e)}")
