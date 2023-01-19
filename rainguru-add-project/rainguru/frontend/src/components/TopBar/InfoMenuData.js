import React from 'react';
import { SiGnuprivacyguard } from 'react-icons/si';
import { CgDanger } from 'react-icons/cg';
import { HiInformationCircle } from 'react-icons/hi';
import { FaBook } from 'react-icons/fa';
import {IoMdPeople} from 'react-icons/io';

/**
 * Contains data to be displayed in a sidebar menu and sidebar popup.
 *  title: name of the sidebar menu
 *  icon: icon to be displayed in the sidebar menu next to title
 *  className: className that will be used to style them
 *  id: id for identifying each element in this SideBarData
 *  popupText: text to be displayed when the menu is clicked
 */
export const InfoMenuData = [
    {
        title: "Application information",
        icon: <HiInformationCircle className="sidebar-element-icon" size="1em"/>,
        className: "SideBar-item Bottom-menu-item",
        id:"application-info",
        popupText:
        <div class="popup-text" data-testid="application-info-popuptext-sidebardata">
            <div id="background" className='popup-text-box'>
            <h3><span>Background</span></h3>
            <p>The RainGuRu is a deep-learning rainfall forecasting model developed by TU Delft researchers and HKV
                (<a href="https://www.hkv.nl/">https://www.hkv.nl/</a>)  with the help of seed funding from the TU Delft
                Safety & Security Institute.
                The model uses a gated recurrent convolutional neural network known as Traj-GRU, first proposed in 2017
                by Shi et al.  (<a href="https://arxiv.org/abs/1706.03458">https://arxiv.org/abs/1706.03458</a>) and further developed and adapted for the Netherlands
              by TU Delft master students Eva van der Kooij (2021) and Diewertje Dekker (2022). The version shown on
                this website uses real-time KNMI radar data and a custom loss function designed to improve performance
                in times of heavy rain.
            </p>
            </div>
            <div id="app-info" className='popup-text-box'>
                <h3><span>Application information</span></h3>
                <p>This application was created from scratch in less than 8 weeks by 5 TU Delft Bachelor students in
                    computer science as part of the course “CSE2000 Software Project – Q4 (2021-2022)”. The application was
                    developed using Django <a href="https://www.djangoproject.com">(https://www.djangoproject.com)</a> and
                    React <a href="https://reactjs.org">(https://reactjs.org)</a> framework
                    for back-end and front-end respectively.
                    Furthermore, Leaflet <a href="https://leafletjs.com/">(https://leafletjs.com)</a> library has been used to
                    achieve interactivity of the map and finally the application
                    is currently running on the TU Delft virtual servers. </p><br/>
                <p>The new version of RainGuru, developed by Dennis Pierantozzi during his Erasmus+ Traineeship experience at TU Delft University, 
                    features a complete redesign and new functionality to display data through the use of a graph and map. 
                    The overall performance of the application has also been improved through changes made to the database and backend.
                </p>
                <h4><span>Interested in learning more?</span></h4>
                <p>RainGuRu is still in development and we hope to be able to provide newer, better versions soon.
                    If you are interested in contributing or want to learn more, please contact the principal investigator: <br/>
                    Dr. M.A. (Marc) Schleiss, Dept. of Geoscience & Remote Sensing, m.a.schleiss [at] <a href="https://www.tudelft.nl/">tudelft.nl</a>.</p>
            </div>
        </div>
    },
    {
        title: "Contributors",
        icon: <IoMdPeople className="sidebar-element-icon" size="1em"/>,
        className: "SideBar-item Bottom-menu-item" ,
        id: "contributor",
        popupText:
            <div class="popup-text" data-testid="contributor-popuptext-sidebardata">
                <div id="scientific-contributor" className='popup-text-box'>
                    <h3><span>Scientific contributors</span></h3>
                    <ul>
                        <li>Dr. Marc Schleiss, TU Delft</li>
                        <li>Dr. Francesco Fioranelli, TU Delft</li>
                        <li>Dr. Riccardo Taormina, TU Delft</li>
                        <li>Eva van der Kooij, TU Delft</li>
                        <li>Diewertje Dekker, TU Delft</li>
                        <li>Dr. Mattijn van Hoek, HKV</li>
                        <li>Ir. Dorien Lugt, HKV</li>
                    </ul>
                </div>
                <div id="development-team" className='popup-text-box'>
                    <div>
                        <h3><span>Initial software development team</span></h3>
                        <ul>
                            <li>Milan de Koning, TU Delft</li>
                            <li>Nikola Nachev, TU Delft</li>
                            <li>Thijs Penning, TU Delft</li>
                            <li>Kanta Tanahashi, TU Delft</li>
                            <li>Mike Raave, TU Delft</li>
                            <li>Dr.Elvin Isufi, TU Delft</li>
                            <li>Radu Gaghi, TU Delft</li>
                        </ul>
                    </div>
                    <div>
                        <h3><span>Version 2.0 full-stack developer</span></h3>
                        <ul>
                            <li>Dennis Pierantozzi, Erasmus+ Traineeship at TU Delft</li>
                        </ul>
                    </div>
                </div>
            </div>
    },
    {
        title: "Disclaimer & Liability",
        icon: <CgDanger className="sidebar-element-icon" size="1em"/>,
        className: "SideBar-item Bottom-menu-item",
        id: "disclaimer",
        popupText:
            <div class="popup-text" data-testid="disclaimer-popuptext-sidebardata">
                <div id="disclaimer" className='popup-text-box'>        
                        <h3><span>Disclaimer & Liability</span></h3>
                        <p>RainGuRu is a non-profit, curiosity driven research project. None of the authors, contributors and
                    institutions behind RainGuRu can be held accountable for the decisions taken by the users on the basis of
                    the presented forecasts. This includes any direct and / or indirect damage, such as loss of profit, loss of
                    business, loss of reputation, errors or omissions in the data, non-availability of data/app, defects,
                    viruses or malfunctioning of personal devices as a result of using this software.</p>
                </div>
            </div>
    },
    {
        title: "Acknowledgement",
        icon: <FaBook className="sidebar-element-icon" size="1em"/>,
        className: "SideBar-item Bottom-menu-item",
        id:"acknowledgement",
        popupText:
        <div class="popup-text" data-testid="acknowledgement-popuptext-sidebardata">
            <div id="acknowledgement" className='popup-text-box'>
                <h3><span>Acknowledgements</span></h3>
                <p>The team behind RainGuRu acknowledges the Dutch weather service KNMI for providing the real-time
                    radar 5-minute reflectivity composites needed to generate the forecasts. These data are provided
                    under the 'OpenData' policy of the Dutch government through the KNMI data platform
                    (<a href="https://dataplatform.knmi.nl/">https://dataplatform.knmi.nl/</a>)</p>
                <p>Special thanks to the ICT department of the Faculty of Civil Engineering and Geoscience at TU Delft
                    for hosting and managing the virtual server that hosts the RainGuRu application.</p>
                <p>Finally, we would like to thank the TU Delft Safety & Security Institute for providing the
                    seed funds that helped develop and implement RainGuRu.</p>
            </div>
            <div id="references" className='popup-text-box'>
                <h3><span>References</span></h3>
                <ul>
                    <li>Link to repository: <br/> <a href="https://gitlab.ewi.tudelft.nl/cse2000-software-project/2021-2022-q4/cluster-13/tu-delft-rainguru/tu-delft-rainguru.git">
                        https://gitlab.ewi.tudelft.nl/cse2000-software-project/2021-2022-q4/cluster-13/tu-delft-rainguru/tu-delft-rainguru.git</a></li>
                    <li>Van der Kooij, Eva (2021): Nowcasting heavy precipitation in the Netherlands: a deep learning approach:
                        <br/><a href="https://repository.tudelft.nl/islandora/object/uuid:536b1a77-625c-4476-9354-4d5b259a1080">
                        https://repository.tudelft.nl/islandora/object/uuid:536b1a77-625c-4476-9354-4d5b259a1080</a></li>
                    <li>Dekker, Diewertje (2022)</li>
                </ul>
            </div>
        </div>
    }
]