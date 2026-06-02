const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function saveSessionToDB(sessionData) {
  const { atom, author, notes, ...data } = sessionData;
  const payload = { atom, data, notes, author };

  await fetch(`${API_BASE_URL}/sessions/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getSessions() {
  const res = await fetch(`${API_BASE_URL}/sessions/all`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function loadSessionById(sessionId) {
  const res = await fetch(`${API_BASE_URL}/sessions/get/${sessionId}`);

  if (!res.ok) throw new Error('Failed to load session');

  const json = await res.json(); 

  return json;
}


export async function deleteById(sessionId) {
  const res = await fetch(`${API_BASE_URL}/sessions/delete/${sessionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete session');
  return res.json();
}

export async function updateSession(sessionId, sessionData) {
  const { atom, author, notes, ...data } = sessionData;
  const payload = { atom, data, notes, author };

  await fetch(`${API_BASE_URL}/sessions/update/${sessionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}


export const filterSessions = async ({ author, atom, startDate, endDate }) => {
  const params = new URLSearchParams();
  if (author) params.append("author", author);
  if (atom) params.append("atom", atom);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const res = await fetch(`${API_BASE_URL}/sessions/filter?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Failed to filter sessions: ${res.statusText}`);
  }

  return await res.json(); 
};
