import { useState, useRef, useEffect } from "react";
import { Html } from "@react-three/drei";
import { useTheme } from "@mui/material/styles";
import { useLanguage } from "../../context/LanguageContext";

const Atom = ({
  position,
  frac,
  color = "#32cd32",
  radius = 0.4,
  element,
  onClick,
  selected = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const theme = useTheme();
  const { t } = useLanguage();

  const outlineRef = useRef();
  const atomRef = useRef();

  useEffect(() => {
    if (outlineRef.current) outlineRef.current.renderOrder = 0;
    if (atomRef.current) atomRef.current.renderOrder = 1;
  }, []);

  const outlineColor = theme.palette.mode === "dark" ? "#fff" : "#000";
  const scaledRadius = radius * 1.5; // 

  return (
    <group>
      {selected && (
        <mesh ref={outlineRef} position={position}>
          <sphereGeometry args={[scaledRadius * 1.10, 64, 64]} />
          <meshBasicMaterial
            color={outlineColor}
            side={2}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
            depthTest={true}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Main atom */}
      <mesh
        ref={atomRef}
        position={position}
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.({ element, position });
        }}
      >
        <sphereGeometry args={[scaledRadius, 64, 64]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.3}
        />

        {/* Hover tooltip */}
        {hovered && (
          <Html distanceFactor={10}>
            <div
              style={{
                background: theme.palette.mode === "dark" ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
                color: theme.palette.mode === "dark" ? "#eee" : "#000",
                padding: "6px 8px",
                borderRadius: "6px",
                fontSize: "20px",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                userSelect: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <div><b>{element}</b></div>
              <div>
                {t('cartesian')} ({position.map((v) => v.toFixed(2)).join(", ")})
              </div>
              <div>
                {t('fractional')} ({frac.map((v) => v.toFixed(3)).join(", ")})
              </div>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
};

export default Atom;
