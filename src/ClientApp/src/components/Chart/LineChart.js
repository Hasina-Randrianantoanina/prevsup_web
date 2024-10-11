import {
    Line
} from 'react-chartjs-2';
import React, {
    Component
} from 'react'
import {
    addDataChart
} from '../Function/Utilities';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

class LineChart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: '',
                    },
                },
            },

            options2: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: '',
                    },
                },
                scales:{
                    yAxes:{
                       ticks:{
                        format:{
                            style:'percent'                            
                        }
                       } 
                    }
                }
            },
        }

    }

    componentDidUpdate() {

    }

    componentDidMount() {

    }

    render() {

        const {
            labels,
            data,
        } = this.props;
        const datasets = [];

        data.forEach(dt => {
            let r = Math.random() * 255;
            let g =  Math.random() * 255;
            let b = Math.random() * 255;
            datasets.push({
                label: dt.label,
                data: dt.data,
                borderColor: `rgba(${r}, ${g}, ${b})`,
                backgroundColor: `rgba(${r}, ${g}, ${b}, 0.5)`,
            });
        })

        const dataLine = {
            labels: labels,
            datasets: datasets,
        };
        
        return ( <Line ref={this.props.reference} options = {this.state.options}
            data = {
                dataLine
            }
            />
        )
    }
}

export default LineChart;