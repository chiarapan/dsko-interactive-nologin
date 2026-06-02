//https://github.com/plotly/react-plotly.js/#customizing-the-plotlyjs-bundle
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

const Plot = createPlotlyComponent(Plotly);
export default Plot;
