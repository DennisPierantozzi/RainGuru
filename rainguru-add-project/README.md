# TU Delft RainGuRU

## Description
RainGuRU is a weather nowcaster application that uses its own deep learning model to accurately predict rainfall for the following 100 minutes.
This application is a new version of [RainGuRU](https://rainguru.hkvservices.nl) (developed by HKV). The goal of making this application is to make a version of RainGuRU on TU Delft servers as well as modernizing and improving the previous version of RainGuRU.

## Visuals
We have used the original website of [RainGuRU](https://rainguru.hkvservices.nl) as reference point for the new version.
Our version can be found [here](http://rainguru.tudelft.nl).

## Installation
To run the server locally, some things must be installed in order to run the application.

### Python
The backend of the application was written in Python. This means that Python needs to be installed in order to run the server. If it has not been installed already, you can install Python with the following link: [Download Python](https://www.python.org/downloads/). During development, version 3.10 has been used. Other versions may work, but we do not guarantee anything.

Next up, check whether you have pip installed by running the following command in a terminal: ```pip help```. If this doesn't display an error message, it is installed. If it does, you can use this tutorial to download pip: [Download pip](https://www.geeksforgeeks.org/how-to-install-pip-on-windows/).

When pip is installed, you will need to install pipenv to act as a virtual environment for the server. To install pipenv, run the command ```pip install --user pipenv```. To open this virtual environment, navigate to the `tu-delft-rainguru/rainguru` directory and run the following command: `pipenv shell`. This should open a new shell and make sure that any command will be executed in a pipenv environment.

To install all dependencies in the virtual environment, run `pipenv install`.

### Postgres
For postgres, use this link to download: [Download Postgres](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads). This should also download pgadmin, which is a UI which you can use to work with postgres. Open pgadmin and make your own login with a password. Make sure to remember this password, as we will need it to set up the connection with Django. When going through the installer, select all the default settings, such as using port 5432 for creating postgres.  
When pgadmin opens for the first time, click on Servers and then PostgreSQL. Then right click on 'Databases' and select 'Create' and then 'Database'. Choose a database name and password for the database.  
When you want to open the database, you click on the left side on 'Servers', it will ask you again for a password. Enter your created password here, when you select the database you created, this will open a screen displaying some statistics. You can close pgadmin now, since we won't need it anymore.

To set up the connection with Django, go to the ```tu-delft-rainguru/rainguru``` directory and create a file called `.env` containing the following content:
```
POSTGRES_DB=<database_name>\
POSTGRES_USER=postgres\
POSTGRES_PASSWORD=<password>
```
Use the first password that you entered when installing postgres.

To create the database tables, go to the ```tu-delft-rainguru/rainguru``` directory and run `python manage.py makemigrations` as well as `python manage.py migrate`.
If no errors occur, you can move on to the next step.

### KNMI API key
The application needs an API key to connect to KNMI. Go to the [KNMI Open API website](https://developer.dataplatform.knmi.nl/apis) and click 'Request an API key' for the 'Radar Reflectivity Composites' API.
Follow the steps on their website to make an account and request the proper key. After this, add a new line to the previously created `.env` file with the following content:
`API_KEY=<api_key>` and add your own key.

### Frontend package manager
Finally, a package manager has to be active in order for the frontend to work properly. We will use Nodejs for this.
For Nodejs, use this tutorial to install, since it will also install 'npm': [Download Nodejs](https://kinsta.com/blog/how-to-install-node-js/#how-to-install-nodejs-and-npm).

When Nodejs and npm have been installed, go to `tu-delft-rainguru/rainguru/frontend` and run the command `npm install --legacy-peer-deps`. This should install all necessary node modules.


## Running the application
If all steps were followed properly, the application should now be ready to run. 
To run the backend code for the server, go to `tu-delft-rainguru/rainguru`, run `pipenv shell`, then `cd rainguru` and finally `python manage.py runserver --noreload`.
To run the package manager for the frontend, navigate to `tu-delft-rainguru/rainguru/frontend` and run `npm run dev`.

To run backend tests, run the same commands as to run the server, but use `python manage.py test` instead of `python manage.py runserver --noreload`.
To run frontend tests, go to `tu-delft-rainguru/rainguru/frontend` and run `npm test`.

After running both the server and the package manager for the frontend, you can go to http://localhost:8000/ in a browser to use the application.

## Model upgrades
We have a CI/CD pipeline in place for verifying whether the model is correctly integrated into the rest of the project. 
To update the model, place the new model into the ```rainguru/api/prediction_model``` directory and modify line 21 of ```generate_model_output.py``` in the same folder to refer to the new name of the model and iteration number. 
To test whether the model is correctly integrated, commit and push the added code.
Do not worry if any IDE shows some errors for the imports in any of the new files, the server will still work as the IDE will not recognize the environment variables properly.
In order to locally test whether it has been integrated properly, run the same commands as running the tests but run the following command instead of the usual test command:
```python ./manage.py test api.tests.model_integration_test```. To deploy this new version, please follow the steps in the [Deploy Manual](deploy_manual.md).

## Storing data
Since there was a requirement to toggle between storing and not storing data, there is a boolean called `store_data` on line 10 of `tu-delft-rainguru/rainguru/api/update_predictions/store_data/store_predictions_observations.py`.
Toggle this to change between storing and not storing data.


## Usage
On the top bar of the application, you find a menu button where you can click to view any application/privacy/legal information.  
Next to the menu button, you have 2 buttons, the left one will locate your current location and show the precipitation from there in the graph and the right one will locate TU Delft and show the precipitation from there in the graph.  
At the bottom of the screen, you have a slider and animation buttons with which you can control the animation. When you click on the map, a marker will be put at that location and the precipitation at that location will be shown in the slider.  
In the slider, you can find timestamps to find which interval/precipitation amount belongs to which timestamp. Below the slider you can find a legend to indicate what colour in the animation on the map belongs to what amount of precipitation.

## Support
This project is owned by the Ruisdael Observatory at TU Delft, the contact information can be found under the tab 'Application Information' in the menu of the [website](http://rainguru.tudelft.nl).

## Contributing
If you wish to contribute, please use the contact under the tab 'Application Information' in the menu of the [website](http://rainguru.tudelft.nl).

## Authors and acknowledgment
The members of the development team:
* Milan de Koning
* Thijs Penning
* Mike Raave
* Nikola Nachev
* Kanta Tanahashi

## License

