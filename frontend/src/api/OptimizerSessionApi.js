const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
 
// Create a new optimizer session
export async function createOptimizerSession(optimizerSessionData) {
  const { atom, author, notes, numParticles, ...data } = optimizerSessionData;
  const payload = {
    data: JSON.stringify(data),
    notes,
    author,
    atom,
    numParticles
  };

  const response = await fetch(`${API_BASE_URL}/optimizer/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create session');
  }

  return response.json();  
}



// Get all optimizer sessions
export async function getAllOptimizerSessions() {
  const response = await fetch(`${API_BASE_URL}/optimizer/all`);
  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }
  return await response.json();
}

// Get a session by ID
export async function getOptimizerSessionById(sessionId) {
  const response = await fetch(`${API_BASE_URL}/optimizer/get/${sessionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch session with ID ${sessionId}`);
  }
  return await response.json();
}

// Update author, atom, and notes for a session by ID
export async function updateOptimizerSession(sessionId, updateData) {
  const response = await fetch(`${API_BASE_URL}/optimizer/update/${sessionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update session with ID ${sessionId}`);
  }

  return await response.json();
}    

// Delete a session by ID
export async function deleteOptimizerSession(sessionId) {
  const response = await fetch(`${API_BASE_URL}/optimizer/delete/${sessionId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete session with ID ${sessionId}`);
  }

  return true;
}

export const filterOptimizerSessions = async ({ author, atom, startDate, endDate }) => {
  const params = new URLSearchParams();
  if (author) params.append("author", author);
  if (atom) params.append("atom", atom);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const res = await fetch(`${API_BASE_URL}/optimizer/search?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Failed to filter sessions: ${res.statusText}`);
  }

  return await res.json(); 
};