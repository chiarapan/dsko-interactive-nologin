import Plot from 'react-plotly.js';
import { Box, Typography, useTheme } from '@mui/material';
import { useLanguage } from '../../../context/LanguageContext';
import { correlationPlotBoxStyles } from '../../../styles/Optimizer.styles';

function CorrelationPlot({ plotData}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useLanguage();

  if (!plotData || !plotData.x || plotData.x.length === 0) {
    return <Typography sx={{ my:4, fontSize: "0.9rem" }} color="error">{t('no_data_to_plot')}</Typography>;
  }

  // Avoid rendering NaNs or undefined values
  const safeText = plotData.z.map(row =>
    row.map(v => typeof v === 'number' && isFinite(v) ? v.toFixed(2) : '')
  );
  const rowCount = plotData?.y?.length || 1;
  const basePerRow = rowCount < 15 ? 28 : 16;
  const dynamicHeight = Math.max(300, rowCount * basePerRow + 100); // padding extra
  const fontSize = Math.max(5.5, 16 - Math.floor(rowCount / 2));
  const legendSize = rowCount <= 15 ? 11 : rowCount <= 30 ? 11 : 9;
// console.log("CORRELATION: ", dynamicFontSize, dynamicHeight, height, maxHeight)
  return (
    <Box
      sx={{
        ...correlationPlotBoxStyles(isDark, dynamicHeight),
        height: dynamicHeight,
      }}
    >
      <Plot
        data={[{
          x: plotData.x,
          y: plotData.y,
          z: plotData.z,
          type: 'heatmap',
          // colorscale: isDark
          // ? [
          //     [0, '#3399ff'],    
          //     [0.5, '#1e1e1e'],   
          //     [1, '#ff1a1a']   
          //   ]
          // : 'RdBu',
          colorscale: 'RdBu',

          reversescale: false,
          zmid: 0,
          zmin: -1,
          zmax: 1,
          text: safeText,
          texttemplate: "%{text}",
          textfont: {
            size: fontSize,
            color: isDark ? '#f5f5f5' : 'black',
          },
          xgap: 1,
          ygap: 1,
          hovertemplate: "x: %{x}<br>y: %{y}<br>c: %{z:.2f}<extra></extra>",
          colorbar: {
            thickness: 15,
            len: 1.0,
            tickfont: {
              size: Math.max(8, fontSize - 1),
            },
            title: {
              // text: 'Correlation',
              font: {
                size: Math.max(10, fontSize + 1),
              },
            },
          },
        }]}
        layout={{
          xaxis: {
            tickfont: { size: legendSize },
            automargin: true,
          },

          yaxis: {
            tickfont: { size: legendSize },
            automargin: true,
            dtick: 1,
          },
          autosize: true,
          margin: { t: 40, l: 100, r: 30, b: 100 },
          paper_bgcolor: isDark ? "#1e1e1e" : "#ffffff",
          plot_bgcolor: isDark ? "#2a2a2a" : "#ffffff",
          font: {
            color: isDark ? "#dddddd" : "#111111",
          },
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        config={{ responsive: true }}
      />
    </Box>
  );

}

export default CorrelationPlot;
