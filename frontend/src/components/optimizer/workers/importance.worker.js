const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const sendToFlask = async (X, y, apiUrl, retries = 1) => {
  try {
    const res = await fetch(`${API_BASE_URL}/optimizer/importance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ X, y })
    });

    if (res.status === 404 && retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return await sendToFlask(X, y, apiUrl, retries - 1);
    }

    if (!res.ok) throw new Error(`Server error: ${res.statusText}`);

    return await res.json();
  } catch (err) {
    console.error("Flask error:", err);
    return null;
  }
};

// eslint-disable-next-line no-restricted-globals
self.onmessage = async (e) => {
  const { X, y, apiUrl } = e.data;

  try {
    const result = await sendToFlask(X, y, apiUrl);
    if (!result) throw new Error("Failed to compute importance");

    postMessage({ success: true, result });
  } catch (err) {
    postMessage({ success: false, error: err.message });
  }
};
