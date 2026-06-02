const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


export const sendPing = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health/ping`);
    if (res.ok) {
      const json = await res.json();
      console.log("Ping response", json);
      return true;
    }
  } catch (err) {
    console.error("Ping failed:", err);
  }
  return false;
};