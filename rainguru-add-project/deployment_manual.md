#Deployment Manual
### Acquire access to the IIS Server
Contact the TU Delft service desk to get access on the server. 
They will provide details on how to create a sup-account.
### Log in on the server
1. Go to <https://weblogin.tudelft.nl> and login with your netID account.
2. Click on TU Delft - Desktop.
3. Once you are logged in the remote workplace type Remote Desktop Connection in the windows search bar and open the application.
4. Click on show options and enter SRV253 in the Computer field, and DASTUD\\your-sup-account-username, and click connect.
5. Enter your sup-account password and click OK.
### Update the project version
1. Click on the windows search bar and open Command Prompt as administrator
2. Navigate to the project directory C:\project\tu-delft-rainguru. This can be done by running the command ```cd ../../project/tu-delft-rainguru```
3. Update the local branch with the command ```git pull``` and run the following commands
4. ```cd rainguru/frontend```
5. ```npm run build```
6. ```pipenv shell```
7. ```cd rainguru```
8. ```python manage.py collectstatic```
9. ```yes```
### Reload the application
1. Search and open the application Internet Information Services (IIS) Manager in the windows search bar.
2. Click on the arrow next to SRV253 in the Connections section.
3. Click on Application Pools and then click on rainguru.
4. On the right side in the actions section click on recycle.

Now the server should be redeployed to the latest version.
