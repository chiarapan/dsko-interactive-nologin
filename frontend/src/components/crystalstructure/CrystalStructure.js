import { useRef, useMemo } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
} from "three";
import { useTheme } from "@mui/material/styles";
import Atom from "./Atom";
import Bond from "./Bond";

const getSupercell = (pbc) => pbc.map((val) => (val ? 2 : 1));
const gridSize = 2.5;
const getBondCutoff = (r1, r2) => (r1 + r2) * 1.15;

const fracToCartesian = (frac, lattice) => {
  const [u, v, w] = frac;
  const [a1, a2, a3] = lattice;
  return [
    u * a1[0] + v * a2[0] + w * a3[0],
    u * a1[1] + v * a2[1] + w * a3[1],
    u * a1[2] + v * a2[2] + w * a3[2],
  ];
};

const getGridKey = ([x, y, z]) =>
  `${Math.floor(x / gridSize)}|${Math.floor(y / gridSize)}|${Math.floor(z / gridSize)}`;

const UnitCell = ({ lattice, lineColor }) => {
  const [a, b, c] = lattice.map((vec) => new Vector3(...vec));

  const geometry = useMemo(() => {
    const p000 = new Vector3(0, 0, 0);
    const p100 = a.clone();
    const p010 = b.clone();
    const p001 = c.clone();
    const p110 = a.clone().add(b);
    const p101 = a.clone().add(c);
    const p011 = b.clone().add(c);
    const p111 = a.clone().add(b).add(c);

    const positions = [
      ...p000.toArray(), ...p100.toArray(),
      ...p100.toArray(), ...p110.toArray(),
      ...p110.toArray(), ...p010.toArray(),
      ...p010.toArray(), ...p000.toArray(),

      ...p001.toArray(), ...p101.toArray(),
      ...p101.toArray(), ...p111.toArray(),
      ...p111.toArray(), ...p011.toArray(),
      ...p011.toArray(), ...p001.toArray(),

      ...p000.toArray(), ...p001.toArray(),
      ...p100.toArray(), ...p101.toArray(),
      ...p110.toArray(), ...p111.toArray(),
      ...p010.toArray(), ...p011.toArray(),
    ];

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, [a, b, c]);

  return (
    <group>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color={lineColor} linewidth={4} />
      </lineSegments>
    </group>
  );
};

const CrystalStructure = ({
  structure,
  onAtomClick,
  selectedAtom,
  onDeselect,
  customAtomColors = {},
  bondColor,
  atomColor,
}) => {
  const theme = useTheme();
  const groupRef = useRef();

  const { lattice, atoms, pbc } = structure;
  const supercell = structure.supercell ?? getSupercell(pbc);

  const unitCellLineColor = theme.palette.mode === "dark" ? "#eee" : "#000";
  const defaultBondColor = bondColor ?? (theme.palette.mode === "dark" ? "#ccc" : "#555");
  const defaultAtomColor = atomColor ?? (theme.palette.mode === "dark" ? "#aaa" : "#808080");

  const a = new Vector3(...lattice[0]);
  const b = new Vector3(...lattice[1]);
  const c = new Vector3(...lattice[2]);
  const centerOffset = a.clone().multiplyScalar(supercell[0] / 2)
    .add(b.clone().multiplyScalar(supercell[1] / 2))
    .add(c.clone().multiplyScalar(supercell[2] / 2))
    .multiplyScalar(-1);

  const maxRadius = Math.max(...atoms.map((a) => a.covalent_radius ?? 1.2));
  const maxCutoff = maxRadius * 2 + 0.4;
  const maxOffset = Math.ceil(maxCutoff / gridSize);

  const allAtoms = [];

  for (let i = 0; i < supercell[0]; i++) {
    for (let j = 0; j < supercell[1]; j++) {
      for (let k = 0; k < supercell[2]; k++) {
        for (const atom of atoms) {
          const frac = [
            atom.frac[0] + i,
            atom.frac[1] + j,
            atom.frac[2] + k,
          ];

          const baseAtom = {
            element: atom.element,
            frac,
            covalent_radius: atom.covalent_radius,
            cpk_color: atom.cpk_color,
          };

          const addAtom = (offset) => {
            const wrapped = [
              frac[0] + offset[0],
              frac[1] + offset[1],
              frac[2] + offset[2],
            ];
            const position = fracToCartesian(wrapped, lattice);
            allAtoms.push({
              ...baseAtom,
              position,
              frac: wrapped,
            });
          };

          addAtom([0, 0, 0]);

          // Add ghost atoms across boundary if needed
          const nearZero = (x) => x < 1e-5 || Math.abs(x - 1) < 1e-2;
          const translations = [];

          if (nearZero(atom.frac[0])) translations.push([1, 0, 0]);
          if (nearZero(atom.frac[1])) translations.push([0, 1, 0]);
          if (nearZero(atom.frac[2])) translations.push([0, 0, 1]);

          // add 2D face translations
          for (const t of translations) addAtom(t);

          // add 3D edge translations
          if (translations.length >= 2) {
            for (let m = 0; m < translations.length; m++) {
              for (let n = m + 1; n < translations.length; n++) {
                const t = [
                  translations[m][0] + translations[n][0],
                  translations[m][1] + translations[n][1],
                  translations[m][2] + translations[n][2],
                ];
                addAtom(t);
              }
            }
          }

          // add corner translation
          if (translations.length === 3) {
            const t = [1, 1, 1];
            addAtom(t);
          }
        }
      }
    }
  }

  const grid = new Map();
  allAtoms.forEach((atom, index) => {
    const key = getGridKey(atom.position);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push({ ...atom, index });
  });

  const bonds = [];
  const bondSet = new Set();

  const allowedSameElementBonds = new Set([
    "Si", "C", "N", "S", "H", "O", "F", "Cl", "Br", "I", "P",
  ]);

  allAtoms.forEach((atom1) => {
    const [x, y, z] = atom1.position;
    const cx = Math.floor(x / gridSize);
    const cy = Math.floor(y / gridSize);
    const cz = Math.floor(z / gridSize);

    for (let dx = -maxOffset; dx <= maxOffset; dx++) {
      for (let dy = -maxOffset; dy <= maxOffset; dy++) {
        for (let dz = -maxOffset; dz <= maxOffset; dz++) {
          const neighborKey = `${cx + dx}|${cy + dy}|${cz + dz}`;
          const neighbors = grid.get(neighborKey) || [];

          for (const atom2 of neighbors) {
            if (atom1 === atom2) continue;
            if (atom1.element === atom2.element &&
                !allowedSameElementBonds.has(atom1.element)) continue;

            const [x2, y2, z2] = atom2.position;
            const dist = Math.hypot(x - x2, y - y2, z - z2);
            const cutoff = getBondCutoff(atom1.covalent_radius, atom2.covalent_radius);

            if (dist < cutoff && dist > 0.3) {
              const id1 = `${atom1.element}-${atom1.position.map((v) => v.toFixed(3)).join(",")}`;
              const id2 = `${atom2.element}-${atom2.position.map((v) => v.toFixed(3)).join(",")}`;
              const bondKey = [id1, id2].sort().join("|");

              if (!bondSet.has(bondKey)) {
                bondSet.add(bondKey);
                bonds.push({ start: atom1.position, end: atom2.position });
              }
            }
          }
        }
      }
    }
  });

  return (
    <>
      <mesh position={[0, 0, -100]} onClick={() => onDeselect?.()}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <group ref={groupRef} position={centerOffset}>
        {allAtoms.map((atom, idx) => (
          <Atom
            key={idx}
            position={atom.position}
            frac={atom.frac}
            element={atom.element}
            selected={
              selectedAtom &&
              atom.element === selectedAtom.element &&
              atom.position.every((v, i) => Math.abs(v - selectedAtom.position[i]) < 1e-2)
            }
            color={customAtomColors[atom.element] ?? atom.cpk_color ?? defaultAtomColor}
            onClick={({ element, position }) => {
              onAtomClick?.({ element, position });
            }}
          />
        ))}
        {bonds.map((bond, idx) => (
          <Bond key={idx} start={bond.start} end={bond.end} color={defaultBondColor} />
        ))}
        <UnitCell lattice={lattice} lineColor={unitCellLineColor} />
      </group>
    </>
  );
};

export default CrystalStructure;
