# Backend Server

## How to Run the Backend Server

### Create and Activate Virtual Development Environment

A current installation of Python 3.10 (GPL-compatible license) is required!

```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Requirements

Required packages:
- Flask
- Flask SQL-Alchemy
- Flask-Migrate
- Flask CORS
- Python-dotenv
- Pymysql
- Flask-RESTX
- ASE
- Spglib

```bash
pip install -r requirements.txt
```

### Configuration via .env File

Create a `.env` file in the root directory with the following content:

```bash
DB_USER=postgres
DB_PASSWORD=admin
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bs
```

### Start Server

- To run the backend use `flask run`
- Alternatively, `python run.py` can also be used during development
- The server should be accessible at [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

## Endpoint Documentation

The documentation of the endpoints is available at [http://127.0.0.1:5000/docs](http://127.0.0.1:5000/docs).

## Table of Contents

- **Database Model**
  - Session
- **Endpoints**
  - Save session
  - Get all sessions
  - Get Session by ID
  - Update session
  - Delete session
  - Search session

---

## Database Model

### Session

| Column Name | Type | PK | Unique | Nullable |
|-------------|------|----|---------|---------| 
| id | Integer | True | False | False |
| `created_at` | Datetime | False | - | - |
| `updated_at` | Datetime | False | - | - |
| data | LONGTEXT | False | False | False |
| notes | Text | False | False | False |
| author | String | False | False | False |

*The server will generate a session_id when a session is saved.*

## Endpoints

### Save Session

- **Endpoint:** `/sessions/add`
- **Method:** POST

*This endpoint creates a new session by saving data such as the band structure and geometry, which are compressed for efficient storage. Upon successful completion, it returns a confirmation message along with detailed information about the saved session.*

**Response 201 CREATED - Session Saved**

```json
{
  "message": "Saved successfully",
  "session": {
    "id": 13,
    "created_at": "2025-07-09T22:21:30.095514",
    "updated_at": "2025-07-09T22:21:30.095524",
    "data": "eJxTKi4pysxLVwIADQ0C3A==",
    "atom": "string",
    "notes": "string",
    "author": "string"
  }
}
```

---

### Get All Sessions

- **Endpoint:** `/sessions/all`
- **Method:** GET

*Provides a comprehensive overview of all saved sessions, including timestamps for when each session was created and last updated. The response excludes detailed band structure and geometry data to minimize payload size and improve performance.*

**Response 200 OK**

```json
[
  {
    "id": 1,
    "created_at": "2025-06-24T20:49:27.085423",
    "updated_at": "2025-06-24T22:34:35.735573",
    "data": null,
    "atom": "string",
    "notes": "string",
    "author": "string"
  },
  {
    "id": 4,
    "created_at": "2025-06-24T22:40:35.338633",
    "updated_at": "2025-06-24T22:40:35.338642",
    "data": null,
    "atom": "string",
    "notes": "string",
    "author": "string"
  }
]
```

---

### Get Session by ID

- **Endpoint:** `/sessions/get/<id>`
- **Method:** GET

*The response includes all session data required to resume a previously saved state.*

**Response 200 OK**

```json
{
  "id": 0,
  "created_at": "2025-06-06 11:25:41",
  "updated_at": "2025-06-06 13:47:39",
  "data": "{\"session\": .....}",
  "atom": "string",
  "notes": "string",
  "author": "string"
}
```

---

### Update Session

- **Endpoint:** `/sessions/update/<id>`
- **Method:** PUT

*The response delivers a success status accompanied by the updated dataset.*

**Response 200 OK**

```json
{
  "message": "Session updated successfully",
  "session": {
    "id": 1,
    "created_at": "2025-06-24T20:49:27.085423",
    "updated_at": "2025-07-09T22:36:08.797273",
    "data": "eJzMvVuvNclxJfZXCD53H+T9Ms8G/GC/GjYgGIJGo...0/Ci/UYg==",
    "atom": "string",
    "notes": "string",
    "author": "updated"
  }
}
```

---

### Delete Session

- **Endpoint:** `/sessions/delete/<id>`
- **Method:** DELETE

**Response 200 OK**

*The response of the request returns success message.*

```json
{
  "message": "Session with ID 9 deleted successfully."
}
```

---

### Search Session

- **Endpoint:** `/sessions/search`
- **Method:** POST

**Response 200 OK**

*Search for a saved session.*

```json
[
  {
    "id": 4,
    "created_at": "2025-06-24T22:40:35.338633",
    "updated_at": "2025-06-24T22:40:35.338642",
    "data": null,
    "notes": "string",
    "author": "string",
    "atom": "string"
  }
]
```

---

## Parse Endpoints

### Parse Structure File

- **Endpoint:** `/parse/geostructure`
- **Method:** POST

**Response 200 OK**

*The response delivers structural data essential for crystal visualization.*

```json
{
  "lattice": [
    [1.313365, -2.274816, 0],
    [1.313365, 2.274816, 0],
    [0, 0, 5.207234]
  ],
  "lattice_parameters": {
    "a": 2.626730944935358,
    "b": 2.626730944935358,
    "c": 5.207234,
    "alpha": 90,
    "beta": 90,
    "gamma": 120.0000238000837
  },
  "atoms": [
    {
      "element": "Zn",
      "frac": [0.3333329999999999, 0.6666669999999999, 0.24999999999999997],
      "cartesian": [1.313365, 0.758273516544, 1.3018085],
      "covalent_radius": 1.22,
      "cpk_color": "#a42a2a"
    }
  ],
  "pbc": [true, true, true],
  "natoms": 2,
  "formula": "Zn2",
  "structureFileName": "hex_Zn.vasp",
  "element_counts": {
    "Zn": 2
  },
  "val_n": 24
}
```

**Response 400 BAD REQUEST**

*This error occurs when the request payload does not include a valid structure file in one of the supported formats (.cif, .vasp, .xyz, .gen, or .traj).*

```json
{
  "error": "Unsupported file format"
}
```

---

### Parse Band Structure File

- **Endpoint:** `/parse/bandstructure`
- **Method:** POST

**Response 200 OK**

*The response returns electronic band structure data suitable for plotting.*

```json
{
  "kpoints": [],
  "energies": [],
  "energy_matrix": [],
  "num_bands": 6,
  "special_point_indices": {
    "G": 0,
    "H": 42,
    "P": 139,
    "N": 72
  },
  "fermi_level": 0,
  "k_dist": [],
  "points": [
    {
      "k_point_index": 199,
      "k_point_coord": [-1.1380838174812728e-17, 1.1380838174812728e-17, 0.4999999978150534],
      "band_index": 4,
      "energy": 8.1997
    }
  ],
  "bandFileName": "bcc_Li_comp.json",
  "val_n": 0,
  "label": {
    "0": "Γ",
    "42": "H",
    "72": "N",
    "102": "Γ",
    "139": "P",
    "177": "H",
    "178": "P",
    "199": "N"
  },
  "is_spin_polarized": false
}
```

**Response 400 BAD REQUEST**

*This error indicates that the band-structure JSON file is missing from the request payload.*

```json
{
  "error": "Failed to parse band structure file: Expecting value: line 1 column 1 (char 0)"
}
```

---

## Validation Endpoints

### Prepare Band Structure File for Verification

- **Endpoint:** `/validation/upload/bandstructure`
- **Method:** POST

**Response 200 OK**

*When a band structure file is successfully uploaded via the endpoint, the server responds with the following JSON:*

```json
{
  "success": true,
  "job_id": "b3ade504-599d-4d5f-a42c-070a2b0bc543",
  "filename": "bcc_Li_comp.json"
}
```

**Response 400 BAD REQUEST**

*If the request does not include the required bandstructure file:*

```json
{
  "success": false,
  "error": "bandstructure file missing"
}
```

---

### Prepare Structure File for Verification

- **Endpoint:** `/validation/upload/structure`
- **Method:** POST

**Response 200 OK**

*When a structure file is successfully uploaded via the endpoint:*

```json
{
  "success": true,
  "job_id": "b3ade504-599d-4d5f-a42c-070a2b0bc543",
  "filename": "bcc_Li_eq.traj"
}
```

**Response 400 BAD REQUEST**

*If the request does not include the required structure file:*

```json
{
  "success": false,
  "error": "structure file missing"
}
```

---

### Verify the Validity of the Two Files

- **Endpoint:** `/validation/check`
- **Method:** POST

**Response 200 OK**

*When the structure and band structure files associated with a given job ID are compatible:*

```json
{
  "success": true,
  "message": "Structure and band structure are compatible."
}
```

**Response 400 BAD REQUEST**

*If either the structure file or the band structure file is missing:*

```json
{
  "success": false,
  "error": "Both files must be uploaded first"
}
```

---

## Optimizer Endpoints

### Database Model - Optimizer Session

| Column Name | Type | PK | Unique | Nullable |
|-------------|------|----|---------|---------| 
| id | Integer | True | False | False |
| `created_at` | Datetime | False | - | - |
| `updated_at` | Datetime | False | - | - |
| data | LONGTEXT | False | False | False |
| notes | Text | False | False | False |
| author | String | False | False | False |

*The server will generate the session_id when a session is created.*

### Save Optimizer Session

- **Endpoint:** `/optimizer/create`
- **Method:** POST

*This endpoint saves a new session containing data. Upon successful save, it returns a confirmation message along with the details of the saved session. The data is compressed due to its large size.*

**Response 201 CREATED - Session Saved**

```json
{
  "message": "Optimizer session created successfully",
  "session": {
    "id": 12,
    "created_at": "2025-07-09T23:10:37.272652",
    "updated_at": null,
    "data": "eJxTKi4pysxLVwIADQ0C3A==",
    "author": "string",
    "notes": "string",
    "atom": "string",
    "numParticles": "string"
  }
}
```

---

### Get All Optimizer Sessions

- **Endpoint:** `/optimizer/all`
- **Method:** GET

*A full overview of the saved sessions, showing when each session was created and last updated, with options to resume or delete.*

**Response 200 OK**

```json
[
  {
    "id": 0,
    "created_at": "string",
    "updated_at": "string",
    "data": "string",
    "author": "string",
    "notes": "string",
    "atom": "string",
    "numParticles": "string"
  }
]
```

---

### Update Optimizer Session

- **Endpoint:** `/optimizer/update/<id>`
- **Method:** PUT

*The response delivers a success status accompanied by the updated dataset.*

**Response 200 OK**

```json
{
  "message": "string",
  "session": {
    "id": 0,
    "created_at": "string",
    "updated_at": "string",
    "data": "string",
    "author": "string",
    "notes": "string",
    "atom": "string",
    "numParticles": "string"
  }
}
```

---

### Delete Optimizer Session

- **Endpoint:** `/optimizer/delete/<id>`
- **Method:** DELETE

**Response 200 OK**

*The response of the request returns success message.*

```json
{
  "message": "Session with ID 12 deleted successfully."
}
```

---

### Search Optimizer Session

- **Endpoint:** `/optimizer/search`
- **Method:** POST

**Response 200 OK**

*Search for a saved session.*

```json
[
  {
    "id": 1,
    "created_at": "2025-06-24T21:46:58.232598",
    "data": null,
    "notes": "string",
    "author": "string",
    "atom": "string",
    "numParticles": 16
  }
]
```

---

### Download the Particle Distribution Animation as GIF

- **Endpoint:** `/optimizer/gif`
- **Method:** POST

**Response 200 OK**

*The response is a downloadable GIF file.*

---

### Random Forest Importance

- **Endpoint:** `/optimizer/importance`
- **Method:** POST

**Response 200 OK**

*Example response showing feature importances from the Random Forest model, used to estimate the influence of input parameters on the cost metric.*

```json
[
  { "param": "r0_wf_O_2s", "importance": 0.6806 },
  { "param": "r0_wf_O_2p", "importance": 0.3116 },
  { "param": "W_wf_O_2s", "importance": 0.0027 },
  { "param": "r0_dens_O", "importance": 0.0018 },
  { "param": "a_wf_O_2s", "importance": 0.0008 },
  { "param": "a_wf_O_2p", "importance": 0.0007 },
  { "param": "W_dens_O", "importance": 0.0006 },
  { "param": "W_wf_O_2p", "importance": 0.0006 },
  { "param": "a_dens_O", "importance": 0.0006 }
]
```