import React from 'react';

function Statistics ({displayTooltipLegend}) {

    return(
        <div className='statisticsContents'>
            <div className="legend-Graph">
                <ul className="legend-Graph-list">
                    <li id="labelObservations"> <hr></hr>  Observations</li>
                    <li id="labelPredictions"> <hr></hr>  Predictions</li>
                </ul>
            </div>
            <div className='statistics-box'>
                
                <button id="rmse-explain" className="stats-info" onClick={() => displayTooltipLegend("rmse")}>?</button>
                Rmse: <span id="rmse"></span></div>
            <div className='statistics-box'>
                
                <button id="bias-explain" className="stats-info" onClick={() => displayTooltipLegend("bias")}>?</button>
                Bias: <span id="bias"></span></div>
        </div>
    );
}


export default Statistics;

