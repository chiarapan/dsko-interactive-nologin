import { findNearestSpecialIndex } from "./generateSelectedTrace";

export const decodingMask = ({ 
  session, 
  bandData, 
  selection, 
  selectionType, 
  exportFormat 
}) => {
  if (!session?.selectedPoints || !bandData) return "{}";

  const indexToLabel = Object.entries(bandData?.special_point_indices || {}).reduce(
    (acc, [label, index]) => {
      acc[index] = label;
      return acc;
    },
    {}
  );

  const getLabelKey = (label, bandIdx, spin) => {
    const spinPart = bandData?.is_spin_polarized ? `_${spin === "up" ? "u" : "d"}` : "";
    return `${label}${spinPart}_${bandIdx}`;
  };

  const isSpecial = (p) =>
    bandData?.special_point_indices &&
    Object.values(bandData.special_point_indices).includes(p.k_point_index);

  const pts_coord = bandData?.points || bandData?.energies?.up || [];
  const numBands = bandData?.num_bands || 0;

  const filteredPoints = session.selectedPoints
    .map((pt) => {
      if (selection === "free") return pt;
      if (Array.isArray(pt)) {
        const filtered = pt.filter(isSpecial);
        return filtered.length > 0 ? filtered : null;
      } else {
        return isSpecial(pt) ? pt : null;
      }
    })
    .filter(Boolean);

  const entries = [];

  filteredPoints.forEach((pt) => {
    const rawPoints = Array.isArray(pt) ? pt : [pt];

    rawPoints.forEach((p) => {
      const spin = p.spin || "up";
      let rawLabel = indexToLabel[p.k_point_index];

      if (!rawLabel && selection === "free") {
        const specialIndices = bandData?.special_point_indices || {};
        const { nearestLabel } = findNearestSpecialIndex(
          p.band_index,
          p.k_point_coord,
          specialIndices,
          pts_coord,
          bandData?.is_spin_polarized ? bandData.energies[spin] : bandData.energies,
          numBands
        );
        rawLabel = nearestLabel || "k";
      }

      const bandIdx = p.band_index - (bandData?.val_n || 0);

      if (exportFormat === "k_point_coord") {
        const coordArr = p.k_point_coord.map((v) => Number(v.toFixed(6)));
        entries.push({ coord: coordArr, bandIdx });
      } else {
        const labelKey = getLabelKey(rawLabel, bandIdx, spin);
        entries.push({ labelKey, label: rawLabel, bandIdx, spin });
      }
    });
  });

  // Format output
  if (selectionType === "pair") {
    if (exportFormat === "k_point_coord") {
      const lines = [];
      for (let i = 0; i < entries.length; i += 2) {
        const first = entries[i];
        const second = entries[i + 1];
        if (second) {
          lines.push(
            `  ([${first.coord.join(", ")}], ${first.bandIdx}), ([${second.coord.join(", ")}], ${second.bandIdx})`
          );
        } else {
          lines.push(`  ([${first.coord.join(", ")}], ${first.bandIdx})`);
        }
      }
      return `[\n${lines.join("\n")}\n]`;
    } else {
      const lines = [];
      for (let i = 0; i < entries.length; i += 2) {
        const first = entries[i];
        const second = entries[i + 1];
        if (second) {
          lines.push(`  ['${first.labelKey}', '${second.labelKey}']`);
        } else {
          lines.push(`  ['${first.labelKey}']`);
        }
      }
      for (let i = 0; i < lines.length - 1; i++) {
        lines[i] += ',';
      }
      return `[\n${lines.join("\n")}\n]`;
    }
  } else {
    if (exportFormat === "k_point_coord") {
      const grouped = {};
      entries.forEach(({ coord, bandIdx }) => {
        const key = `[${coord.join(", ")}]`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(bandIdx);
      });
      const entriesList = Object.entries(grouped);
      const lines = entriesList.map(([key, values], i) => {
        const comma = i < entriesList.length - 1 ? ',' : '';
        return `  '${key}': [${values.join(", ")}]${comma}`;
      });
      return `{\n${lines.join("\n")}\n}`;
    } else {
      const grouped = {};
      entries.forEach(({ label, bandIdx, spin }) => {
        const spinKey = bandData?.is_spin_polarized ? `${label}_${spin === "up" ? "u" : "d"}` : label;
        if (!grouped[spinKey]) grouped[spinKey] = [];
        grouped[spinKey].push(bandIdx);
      });
      const entriesList = Object.entries(grouped);
      const lines = entriesList.map(([key, values], i) => {
        const comma = i < entriesList.length - 1 ? ',' : '';
        return `  '${key}': [${values.join(", ")}]${comma}`;
      });
      return `{\n${lines.join("\n")}\n}`;
    }
  }
};
