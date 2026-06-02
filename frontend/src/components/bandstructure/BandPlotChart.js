import React, { useMemo, useState, useEffect } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import Plot from "../../utils/CustomPlot";
import { compressKDist } from "../../utils/compressKDist";
import { useSession } from "../../context/SessionContext";


const BandPlotChart = ({ bandData, isDarkMode, selectedTrace, onPointSelect }) => {
  const { kpoints, k_dist, energies, num_bands, val_n, label = {}, is_spin_polarized } = bandData;

  const [spinChannel, setSpinChannel] = useState("up");
  const { setBreakIndices } = useSession();

  const handlePointClick = (event) => {
    if (onPointSelect) {
      onPointSelect(event, spinChannel);
    }
  };

  const numKPoints = kpoints.length;

  const channelEnergies = useMemo(() => {
    if (is_spin_polarized) {
      if (spinChannel === "both") {
        return {
          up: energies?.up || [],
          down: energies?.down || [],
        };
      }
      return energies?.[spinChannel] || [];
    }
    return energies || [];
  }, [energies, spinChannel, is_spin_polarized]);

  const { mergedTicks, mergedLabels, breakIndices } = useMemo(() => {
    const entries = Object.entries(label)
      .map(([key, value]) => ({ index: parseInt(key, 10), label: value }))
      .sort((a, b) => a.index - b.index);

    const mergedTicks = [];
    const mergedLabels = [];
    const breakIndices = [];

    let i = 0;
    while (i < entries.length) {
      const current = entries[i];
      const next = entries[i + 1];
      if (next && next.index - current.index === 1) {
        const avgIndex = Math.round((current.index + next.index) / 2);
        mergedTicks.push(avgIndex);
        mergedLabels.push(`${current.label}|${next.label}`);
        breakIndices.push(next.index);
        i += 2;
      } else {
        mergedTicks.push(current.index);
        mergedLabels.push(current.label);
        i++;
      }
    }

    return { mergedTicks, mergedLabels, breakIndices };
  }, [label]);

  const k_dist_adjusted = useMemo(() => compressKDist(k_dist, breakIndices, 0.0001), [k_dist, breakIndices]);

  useEffect(() => {
    if (breakIndices?.length) {
      setBreakIndices(breakIndices)
    }
  }, [breakIndices]);

  const energyMatrix = useMemo(() => {
    if (!channelEnergies) return [];

    const buildMatrix = (flatArray) => {
      const matrix = Array.from({ length: num_bands }, () =>
        Array(numKPoints).fill(0)
      );
      for (let k = 0; k < numKPoints; k++) {
        for (let b = 0; b < num_bands; b++) {
          const index = k * num_bands + b;
          matrix[b][k] = flatArray[index];
        }
      }
      return matrix;
    };

    if (spinChannel === "both" && is_spin_polarized) {
      return {
        up: buildMatrix(channelEnergies.up),
        down: buildMatrix(channelEnergies.down),
      };
    }

    return buildMatrix(channelEnergies);
  }, [channelEnergies, num_bands, numKPoints, spinChannel, is_spin_polarized]);

  const plotTraces = useMemo(() => {
    const buildTraces = (matrix, spin) =>
      matrix.map((bandY, bandIndex) => {
        const x = [];
        const y = [];
        const customdata = [];

        for (let i = 0; i < k_dist_adjusted.length; i++) {
          x.push(k_dist_adjusted[i]);
          y.push(bandY[i]);
          customdata.push([i, bandIndex - val_n, ...kpoints[i]]);
        }


        return {
          x,
          y,
          type: "scattergl",
          mode: "lines",
          line: {
            color:
              spin === "down"
                ? `hsl(${(bandIndex / num_bands) * 360}, 60%, 70%)`
                : `hsl(${(bandIndex / num_bands) * 360}, 60%, 80%)`,
            width: 2.5,
            dash: spin === "down" ? "dot" : "solid",
          },
          name: is_spin_polarized
            ? `Band ${bandIndex - val_n} (${spin})`
            : `Band ${bandIndex - val_n}`,
          showlegend: true,
          customdata,
          hovertemplate:
            "Energy: %{y:.3f} eV<br>" +
            "k-point-index: %{customdata[0]}<br>" +
            "Band index: %{customdata[1]}<br>" +
            "k-point-coord: [%{customdata[2]:.2f}, %{customdata[3]:.2f}, %{customdata[4]:.2f}]<br>" +
            "<extra></extra>",
        };
      });

    if (spinChannel === "both" && is_spin_polarized) {
      return [
        ...buildTraces(energyMatrix.up, "up"),
        ...buildTraces(energyMatrix.down, "down"),
      ];
    }

    return buildTraces(energyMatrix, spinChannel);
  }, [
    energyMatrix,
    k_dist_adjusted,
    kpoints,
    num_bands,
    val_n,
    breakIndices,
    spinChannel,
    is_spin_polarized,
  ]);

  const allY = useMemo(() => {
    if (Array.isArray(energyMatrix)) return energyMatrix.flat();
    return [...energyMatrix.up.flat(), ...energyMatrix.down.flat()];
  }, [energyMatrix]);

  const yMin = Math.min(...allY);
  const yMax = Math.max(...allY);
  const yRange = yMax - yMin;
  const arrowHeight = yRange * 0.05;

  const symmetryLines = useMemo(() => {
    return mergedTicks.map((idx) => ({
      type: "line",
      x0: k_dist_adjusted[idx],
      x1: k_dist_adjusted[idx],
      yref: "paper",
      y0: 0,
      y1: 1,
      line: {
        color: "gray",
        width: 2,
        dash: "dot",
      },
    }));
  }, [k_dist_adjusted, mergedTicks]);

  const plotLayout = useMemo(
    () => ({
      autosize: true,
      paper_bgcolor: isDarkMode ? "#1e1e1e" : "#fff",
      plot_bgcolor: isDarkMode ? "#1e1e1e" : "#fff",
      font: { color: isDarkMode ? "#ddd" : "#000" },
      margin: { l: 60, r: 40, t: 60, b: 50 }, 
      font: { size: 12 },                     
      legend: { traceorder: "reversed", font: { size: 10, color: isDarkMode ? "#ddd" : "#000", } },
      xaxis: {
        tickvals: mergedTicks.map((i) => k_dist_adjusted[i]),
        ticktext: mergedLabels,
        showgrid: true,
        tickfont: { color: isDarkMode ? "#ccc" : "#333" },
        linecolor: isDarkMode ? "#888" : "#000",
        gridcolor: isDarkMode ? "#444" : "#ccc",
      },
      yaxis: {
        title: { text: "E - E_Fermi" },
        zeroline: true,
        range: [yMin - arrowHeight * 1.5, yMax + arrowHeight],
        tickfont: { color: isDarkMode ? "#ccc" : "#333" },
        linecolor: isDarkMode ? "#888" : "#000",
        gridcolor: isDarkMode ? "#444" : "#ccc",
      },
      shapes: [
        {
          type: "line",
          x0: k_dist_adjusted[0],
          x1: k_dist_adjusted[k_dist_adjusted.length - 1],
          y0: 0,
          y1: 0,
          line: { color: "gray", width: 2, dash: "dot" },
        },
        ...symmetryLines,
      ],
    }),
    [isDarkMode, mergedTicks, mergedLabels, k_dist_adjusted, yMin, yMax, arrowHeight, symmetryLines]
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="100%"
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        bgcolor: "background.paper",
        boxShadow: isDarkMode
          ? "inset 0 0 12px rgba(255, 255, 255, 0.8)"
          : "inset 0 0 12px rgba(0, 0, 0, 0.8)",
      }}
    >
      {is_spin_polarized && (
        <Tabs
          value={spinChannel}
          onChange={(e, newValue) => setSpinChannel(newValue)}
          sx={{
            mb: 2,
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              bgcolor: "primary.main",
              transition: "all 0.3s ease",
            },
          }}
          textColor="primary"
          indicatorColor="primary"
          centered
          variant="standard"
        >
          {["up", "down", "both"].map((spin) => (
            <Tab
              key={spin}
              value={spin}
              label={
                spin === "up"
                  ? "Spin Up"
                  : spin === "down"
                    ? "Spin Down"
                    : "Both Spins"
              }
              sx={{
                textTransform: "none",
                fontWeight: spinChannel === spin ? "700" : "400",
                fontSize: "1rem",
                color:
                  spinChannel === spin ? "primary.main" : "text.secondary",
                px: 6,
                py: 1,
                minWidth: 300,
                transition: "color 0.3s ease",
                "&:hover": {
                  color: "primary.dark",
                },
              }}
            />
          ))}
        </Tabs>
      )}

      <Box width="100%" maxWidth="1000px">
        <Plot
          data={[...plotTraces, selectedTrace]}
          layout={plotLayout}
          config={{ responsive: true, displayModeBar: true }}
          onClick={handlePointClick}
          style={{ width: "100%", height: "500px" }}
        />
      </Box>
    </Box>
  );
};

export default React.memo(BandPlotChart);