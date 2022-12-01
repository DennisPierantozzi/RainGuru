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
        id.style.display = "block";
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
                
                <button id="rmse-explain" className="stats-info" onClick={() => toogleTooltip("rmse")}>?</button>
                Rmse: <span id="rmse"></span></div>
            <div className='statistics-box'>
                
                <button id="bias-explain" className="stats-info" onClick={() => toogleTooltip("bias")}>?</button>
                Bias: <span id="bias"></span></div>
        </div>
    );
}


export default Statistics;