const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


export const requestGifFromFlask = async ({
  x, y, cost, total_iters, n_particles, filename = "animation.gif"
}) => {
  try {
    const res = await fetch(`${API_BASE_URL}/optimizer/gif`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x, y, cost, total_iters, n_particles }),
    });

    if (!res.ok) throw new Error(`Erro ao gerar GIF: ${res.statusText}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename; 
    a.click();
  } catch (err) {
    console.error("Erro ao requisitar GIF:", err);
  }
};

