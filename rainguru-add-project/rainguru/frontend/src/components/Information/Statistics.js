import React from 'react'

function Statistics () {

    const toogleTooltip = (stats) => {
        let id;
        if(stats == 'rmse') {
            id = document.getElementById("tooltip-rmse");
            document.getElementById("tooltip-bias").style.display = "none";
        }
        else if (stats == "bias") {
            id = document.getElementById("tooltip-bias");
            document.getElementById("tooltip-rmse").style.display = "none";
        }
        if(id.style.display == "none"){
            id.style.display = "block";
        }
        else {
            id.style.display = "none";
        }
    }

    return(
        <div className='statisticsContents'>
            <div className="legend-Graph">
                <ul className="legend-Graph-list">
                    <li id="labelObservations"> <hr></hr>  Observations</li>
                    <li id="labelPredictions"> <hr></hr>  Predictions</li>
                </ul>
            </div>
            <div className='statistics-box'>
                <div className="tooltip-stats" id="tooltip-rmse">
                    <div>Root Mean Square Error (RMSE) is the standard deviation of the residuals (prediction errors).</div>
                </div>
                <button id="rmse-explain" className="stats-info" onClick={() => toogleTooltip("rmse")}>?</button>
                Rmse: <span id="rmse"></span></div>
            <div className='statistics-box'>
                <div className="tooltip-stats" id="tooltip-bias">
                    <div>The average of the difference</div>
                </div>
                <button id="bias-explain" className="stats-info" onClick={() => toogleTooltip("bias")}>?</button>
                Bias: <span id="bias"></span></div>
        </div>
    );
}


export default Statistics;