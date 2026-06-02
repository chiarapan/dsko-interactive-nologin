import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import time
import psutil
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import imageio.v2 as imageio

def get_memory_usage():
    return round(psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024), 2)

def calculate_feature_importance(X_data, y_data):
    try:
        df = pd.DataFrame(X_data)
        y = pd.Series(y_data)

        model = RandomForestRegressor(n_estimators=10, max_depth=10, random_state=54)

        model.fit(df, y)

        importances = model.feature_importances_
        result = [
            {"param": name, "importance": float(score)}
            for name, score in zip(df.columns, importances)
        ]
        result.sort(key=lambda x: x["importance"], reverse=True)
        return result
    except Exception as e:
        raise RuntimeError(f"Feature importance calculation failed: {str(e)}")

def generate_gif(x, y, cost, total_iters, n_particles, filename="default"):
    try:
        frames = []
        x_min, x_max = min(x), max(x)
        y_min, y_max = min(y), max(y)

        for i in range(total_iters):
            start = i * n_particles
            end = start + n_particles
            fig, ax = plt.subplots(figsize=(6, 5))

            sc = ax.scatter(
                x[start:end], y[start:end], c=cost[start:end],
                cmap='RdYlGn_r', s=20, vmin=min(cost), vmax=max(cost)
            )
            ax.set_title(f"Iteration {i + 1}")
            ax.set_xlabel("x")
            ax.set_ylabel("y")
            ax.set_xlim(x_min, x_max)
            ax.set_ylim(y_min, y_max)
            fig.colorbar(sc, ax=ax, label='Cost')

            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            plt.close(fig)
            buf.seek(0)
            frames.append(imageio.imread(buf))
            buf.close()

        gif_buf = io.BytesIO()
        imageio.mimsave(gif_buf, frames, format="GIF", duration=0.6)
        gif_buf.seek(0)

        final_name = f"animation_{os.path.splitext(filename)[0].replace(' ', '_')}.gif"
        return gif_buf, final_name
    except Exception as e:
        raise RuntimeError(f"GIF generation failed: {str(e)}")