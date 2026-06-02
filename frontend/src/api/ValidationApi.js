const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function uploadStructure(file, jobId) {
    const formData = new FormData();
    formData.append("structure", file);
    formData.append("job_id", jobId);
  
    const response = await fetch(`${API_BASE_URL}/validation/upload/structure`, {
      method: "POST",
      body: formData
    });

 
  
    const data = await response.json();
    return data;
  }
  
export async function uploadBandstructure(file) {
  const formData = new FormData();
  formData.append("bandstructure", file);

  const response = await fetch(`${API_BASE_URL}/validation/upload/bandstructure`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (data.success === false || data.error || data.message?.toLowerCase().includes("invalid")) {
    const error = new Error(data.message || "Invalid bandstructure data.");
    error.response = { status: response.status, data };
    throw error;
  }

  if (!response.ok) {
    const error = new Error(data.message || "Failed to upload bandstructure.");
    error.response = { status: response.status, data };
    throw error;
  }

  return data;
}

  
  export async function verifyBandStructure(jobId) {
    const response = await fetch(`${API_BASE_URL}/validation/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ job_id: jobId })
    });
  
    const data = await response.json();
    return data;
  }
  