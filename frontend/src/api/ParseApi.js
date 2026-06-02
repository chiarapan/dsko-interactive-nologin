const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export async function parseStructureFile(file) {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch(`${API_BASE_URL}/parse/geostructure`, {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse structure file.");
      }
  
      // Handle success
      return { success: true, data };
    } catch (error) {
      console.error("File upload error:", error);
      return { success: false, error: error.message };
    }
  }
  

  export async function parseBandFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/parse/bandstructure`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (!data.energies || !data.kpoints) {
    const error = new Error("Malformed bandstructure data.");
    error.response = { status: 400, data: { message: "Malformed or missing data in JSON file." } };
    throw error;
  }

  return data;
}
