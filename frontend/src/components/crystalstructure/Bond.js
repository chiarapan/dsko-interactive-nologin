import React, { useMemo } from "react";
import { Vector3, Quaternion } from "three";
import { Cylinder } from "@react-three/drei";
import { useTheme } from "@mui/material/styles";

const Bond = ({ start, end, order = 1, color, radius = 0.15 }) => {
  const theme = useTheme();

  const bondColor = color
    ? color
    : theme.palette.mode === "dark"
    ? "#ccc" 
    : "#555"; 

  const { positions, quaternions, length } = useMemo(() => {
    const startVec = new Vector3(...start);
    const endVec = new Vector3(...end);
    const dir = new Vector3().subVectors(endVec, startVec);
    const len = dir.length();
    const mid = startVec.clone().addScaledVector(dir, 0.5);

    // Vector perpendicular to dir and up vector (0,1,0), normalized
    let normal = new Vector3().crossVectors(dir, new Vector3(0, 1, 0)).normalize();

    // Fallback if dir is parallel to up vector (cross product zero)
    if (normal.lengthSq() === 0) {
      normal = new Vector3(1, 0, 0); // choose arbitrary perpendicular vector
    }

    const spacing = 0.1;

    let offsets = [0]; // single bond
    if (order === 2) offsets = [-spacing / 2, spacing / 2];
    if (order === 3) offsets = [-spacing, 0, spacing];

    const positions = offsets.map((offset) =>
      mid.clone().addScaledVector(normal, offset).toArray()
    );
    const quaternions = offsets.map(() =>
      new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize())
    );

    return { positions, quaternions, length: len };
  }, [start, end, order]);

  return (
    <>
      {positions.map((pos, idx) => (
        <Cylinder
          key={idx}
          args={[radius, radius, length, 32]}
          position={pos}
          quaternion={quaternions[idx]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color={bondColor}
            metalness={0.3}
            roughness={0.3}
            clearcoat={0.8}
          />
        </Cylinder>
      ))}
    </>
  );
};

export default Bond;

