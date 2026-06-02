import React, { useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { HexColorPicker } from "react-colorful";
import {
  Typography,
  IconButton,
  Paper,
  Chip,
  Button,
  ButtonGroup,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Box,
  useTheme,
} from "@mui/material";
import { ZoomIn, ZoomOut, Atom, Hash, LayoutGrid } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import CrystalStructure from "./CrystalStructure";
import {
  crystalBoxStyles,
  plotBoxStyles,
  titleBoxStyles,
  zoomBoxStyles,
} from "../../styles/CrystalPlot.styles";
import { useLanguage } from "../../context/LanguageContext";

const CrystalViewer = ({ structure }) => {
  console.log("structure", structure);
  const theme = useTheme();
  const [viewMode, setViewMode] = useState("unit");
  const [supercell, setSupercell] = useState([2, 2, 2]);
  const [supercellDialogOpen, setSupercellDialogOpen] = useState(false);
  const [tempSupercell, setTempSupercell] = useState(supercell);
  const controlsRef = useRef();
  const crystalRef = useRef();
  const latticeVectors = structure.lattice ?? [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const maxLatticeLength = Math.hypot(
    latticeVectors[0][0] + latticeVectors[1][0] + latticeVectors[2][0],
    latticeVectors[0][1] + latticeVectors[1][1] + latticeVectors[2][1],
    latticeVectors[0][2] + latticeVectors[1][2] + latticeVectors[2][2]
  );
  const cameraDistance = maxLatticeLength * 1.5; 

  const [selectedAtom, setSelectedAtom] = useState(null);
  const { t } = useLanguage();

  const [customColors, setCustomColors] = useState({});

  const [colorDialog, setColorDialog] = useState({ open: false, element: null, tempColor: null });



  const handleZoom = useCallback((direction) => {
    if (!controlsRef.current) return;
    direction === "in"
      ? controlsRef.current.dollyOut(1.1)
      : controlsRef.current.dollyIn(1.1);
    controlsRef.current.update();
  }, []);

  const effectiveSupercell =
    viewMode === "supercell"
      ? supercell.map((v) => Math.max(1, parseInt(v)))
      : [1, 1, 1];

  const atomCount =
    structure.atoms.length *
    effectiveSupercell.reduce((a, b) => a * b, 1);

  const handleChipClick = () => {
    if (viewMode === "supercell") {
      setTempSupercell([...supercell]);
      setSupercellDialogOpen(true);
    }
  };

  const handleColorClick = (element) => {
    const currentColor = customColors[element] ?? "#808080";
    setColorDialog({ open: true, element, tempColor: currentColor });
  };



  const applySupercell = () => {
    setSupercell(tempSupercell.map((v) => Math.max(1, parseInt(v))));
    setSupercellDialogOpen(false);
  };

  const handleTempChange = (index, value) => {
    const updated = [...tempSupercell];
    updated[index] = value;
    setTempSupercell(updated);
  };


  return (
    <Box
      sx={{
        mt: 2,
        mb: 5,
        mx: "auto",
        px: 2,
        width: "100%",
        maxWidth: 1300,
      }}
    >
      <Box sx={crystalBoxStyles(theme)}>
        <Box display="flex" justifyContent="center" alignItems="center" mb={2} flexWrap="wrap">
          <Typography variant="h4" fontWeight={700} sx={titleBoxStyles}>
            {t('crystalstructure_viewer_title')}
          </Typography>
        </Box>

        <Box
          display="flex"
          justifyContent="center"
          mb={2}
          flexDirection="column"
          alignItems="center"
          gap={2}
        >
          <Paper
            elevation={3}
            sx={{
              px: 3,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Chip
              icon={<Hash size={18} />}
              label={`${t('atoms')}: ${atomCount}`}
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "0.9rem", px: 1.5 }}
            />
            <Chip
              label={
                viewMode === "unit"
                  ? `${t('viewing')}: ${t('unit_cell')}`
                  : viewMode === "supercell"
                    ? `${t('viewing')}: ${t('periodic')} (${effectiveSupercell.join("×")})`
                    : viewMode === "symmetry"
                      ? `${t('viewing')}: ${t('symmetry')}`
                      : `${t('viewing')}: ${t('lattice_parameters')}`
              }
              color="primary"
              variant="outlined"
              onClick={handleChipClick}
              sx={{
                fontWeight: 600,
                fontSize: "0.85rem",
                px: 1.5,
                cursor: viewMode === "supercell" ? "pointer" : "default",
              }}
            />
            <Chip
              icon={<LayoutGrid size={18} />}
              label={`${t('elements')}:`}
              variant="filled"
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                bgcolor: theme.palette.grey[400],
                color: theme.palette.text.primary,
                px: 1.5,
              }}
            />
            {[...new Set(structure.atoms.map((atom) => atom.element))].map((el) => {
              const atom = structure.atoms.find((a) => a.element === el);
              const color = customColors[el] ?? atom?.cpk_color ?? "#808080";
              return (
                <Chip
                  key={el}
                  icon={<Atom size={16} color="#ffffff" />}
                  label={el}
                  variant="filled"
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.85rem",
                    px: 1,
                    bgcolor: color,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => handleColorClick(el)}
                />
              );
            })}

            <Chip
              icon={<Atom size={16} color="#ffffff" />}
              label="Bonds"
              variant="filled"
              sx={{
                fontWeight: 500,
                fontSize: "0.85rem",
                px: 1,
                bgcolor: customColors["bonds"] ?? "#555555",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={() => handleColorClick("bonds")}
            />





          </Paper>

          <ButtonGroup variant="outlined" sx={{ flexWrap: "wrap", gap: 1 }}>
            <Button
              variant={viewMode === "unit" ? "contained" : "outlined"}
              onClick={() => setViewMode("unit")}
            >
              {t('unit_cell')}
            </Button>
            <Button
              variant={viewMode === "supercell" ? "contained" : "outlined"}
              onClick={() => setViewMode("supercell")}
            >
              {t('periodic_view')}
            </Button>
            <Button
              variant={viewMode === "symmetry" ? "contained" : "outlined"}
              onClick={() => setViewMode("symmetry")}
            >
              {t('symmetry')}
            </Button>
            <Button
              variant={viewMode === "lattice" ? "contained" : "outlined"}
              onClick={() => setViewMode("lattice")}
            >
              {t('lattice_parameters')}
            </Button>
          </ButtonGroup>
        </Box>

        {/* Main content area */}
        {viewMode === "symmetry" && structure.symmetry ? (
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: 900,
              width: "100%",
              mx: "auto",
              boxShadow: 3,
              borderRadius: 2,
              p: 2,
              mt: 3,
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{ mb: 2, fontWeight: 700, textAlign: "center" }}
            >
              {t('symmetry_information')}
            </Typography>

            <Table
              size="medium"
              aria-label="symmetry data table"
              sx={{
                "& th": {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 700,
                },
                "& tbody tr:nth-of-type(odd)": {
                  backgroundColor: theme.palette.action.hover,
                },
                "& tbody tr:hover": {
                  backgroundColor: theme.palette.action.selected,
                },
              }}
            >
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>{t('international')}</TableCell>
                  <TableCell>{structure.symmetry.international ?? '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>{t('number')}</TableCell>
                  <TableCell>{structure.symmetry.number ?? '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>{t('hall')}</TableCell>
                  <TableCell>{structure.symmetry.hall ?? '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>{t('pointgroup')}</TableCell>
                  <TableCell>{structure.symmetry.pointgroup ?? '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>{t('origin_shift')}</TableCell>
                  <TableCell>{structure.symmetry.origin_shift?.join(", ") ?? '—'}</TableCell>
                </TableRow>
                {(structure.symmetry.transformation_matrix ?? []).map((row, i) => (
                  <TableRow key={`matrix-row-${i}`}>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {`${t('transformation_matrix_row')} ${i + 1}`}
                    </TableCell>
                    <TableCell>{row?.join(", ") ?? '—'}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>{t('wyckoff_letters')}</TableCell>
                  <TableCell>{structure.symmetry.wyckoff_letters?.join(", ") ?? '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>{t('equivalent_atoms')}</TableCell>
                  <TableCell>{structure.symmetry.equivalent_atoms?.join(", ") ?? '—'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : viewMode === "symmetry" ? (
          <Typography color="error" textAlign="center" mt={4}>
            {t('symmetry_data_unavailable') ?? 'Symmetry data not available.'}
          </Typography>
        ) : viewMode === "lattice" ? (
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: 400,
              width: "100%",
              mx: "auto",
              boxShadow: 3,
              borderRadius: 2,
              p: 2,
              mt: 3,
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{ mb: 2, fontWeight: 700, textAlign: "center" }}
            >
              {t('lattice_parameters')}
            </Typography>

            <Table
              size="medium"
              aria-label="lattice parameters table"
              sx={{
                "& th": {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 700,
                  width: 130,
                },
                "& tbody tr:nth-of-type(odd)": {
                  backgroundColor: theme.palette.action.hover,
                },
                "& tbody tr:hover": {
                  backgroundColor: theme.palette.action.selected,
                },
              }}
            >
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>a (Å)</TableCell>
                  <TableCell>{structure.lattice_parameters.a.toFixed(4)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>b (Å)</TableCell>
                  <TableCell>{structure.lattice_parameters.b.toFixed(4)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>c (Å)</TableCell>
                  <TableCell>{structure.lattice_parameters.c.toFixed(4)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>α (°)</TableCell>
                  <TableCell>{structure.lattice_parameters.alpha.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>β (°)</TableCell>
                  <TableCell>{structure.lattice_parameters.beta.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>γ (°)</TableCell>
                  <TableCell>{structure.lattice_parameters.gamma.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // Unit cell and supercell views show the 3D canvas
          <Box sx={{ ...plotBoxStyles(theme), position: "relative" }}>
            <Canvas camera={{ position: [cameraDistance, cameraDistance, cameraDistance], fov: 60 }}>
              <ambientLight intensity={1} />
              <directionalLight position={[25, 25, 25]} intensity={1.8} />

              <group scale={[1, 1, 1]}>
                <CrystalStructure
                  structure={{ ...structure, supercell: effectiveSupercell }}
                  viewMode={viewMode}
                  selectedAtom={selectedAtom}
                  onAtomClick={setSelectedAtom}
                  onDeselect={() => setSelectedAtom(null)}
                  customAtomColors={customColors}
                  bondColor={customColors["bonds"]}

                />
              </group>


              <OrbitControls
                ref={controlsRef}
                makeDefault
                target={[0, 0, 0]}
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                enableDamping={true}
                dampingFactor={0.2}
                rotateSpeed={0.6}
                zoomSpeed={1.2}
                panSpeed={0.8}
                maxPolarAngle={Math.PI}
                minPolarAngle={0}
                maxAzimuthAngle={Infinity}
                minAzimuthAngle={-Infinity}
              />


              <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
                <group scale={[1.2, 1.2, 1.2]}>
                  <GizmoViewport
                    axisColors={["#ff0000", "#00ff00", "#0000ff"]}
                    labelColor="white"
                    matrix={new THREE.Matrix4().makeBasis(
                      new THREE.Vector3(...structure.lattice[0]).normalize(),
                      new THREE.Vector3(...structure.lattice[1]).normalize(),
                      new THREE.Vector3(...structure.lattice[2]).normalize()
                    )}
                  />
                </group>
              </GizmoHelper>

            </Canvas>

            <Box sx={zoomBoxStyles}>
              <IconButton onClick={() => handleZoom("in")} sx={{ bgcolor: "#ffffffdd" }}>
                <ZoomIn />
              </IconButton>
              <IconButton onClick={() => handleZoom("out")} sx={{ bgcolor: "#ffffffdd" }}>
                <ZoomOut />
              </IconButton>
            </Box>
          </Box>
        )}

      </Box>

      <Dialog open={supercellDialogOpen} onClose={() => setSupercellDialogOpen(false)}>
        <DialogTitle>{t('edit_supercell_dimensions')}</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} mt={1}>
            {["a", "b", "c"].map((axis, i) => (
              <TextField
                key={axis}
                type="number"
                label={`${axis}-${t('axis')}`}
                value={tempSupercell[i]}
                onChange={(e) => handleTempChange(i, e.target.value)}
                inputProps={{ min: 1 }}
                size="small"
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupercellDialogOpen(false)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={applySupercell}>
            {t('submit')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={colorDialog.open} onClose={() => setColorDialog({ open: false, element: null })}>
        <DialogTitle>Choose color for {colorDialog.element}</DialogTitle>
        <DialogContent>
          <HexColorPicker
            style={{ width: "500px", height: "500px" }}
            color={colorDialog.tempColor ?? "#808080"}
            onChange={(color) =>
              setColorDialog((prev) => ({
                ...prev,
                tempColor: color,
              }))
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setColorDialog({ open: false, element: null, tempColor: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setCustomColors((prev) => ({
                ...prev,
                [colorDialog.element]: colorDialog.tempColor,
              }));
              setColorDialog({ open: false, element: null, tempColor: null });
            }}
          >
            OK
          </Button>
        </DialogActions>

      </Dialog>


    </Box>
  );
};

export default CrystalViewer;