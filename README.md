# CCS3 Operator

Web application for connecting operators to Computer Club System and managing the computer club

# Debug
- Set environment variable `CCS3_OPERATOR_CONNECTOR_STATIC_FILES_PATH` to the absolute path where this app is build (the build output folder is `dist`). For the changes to take effect, you might need to log out and log in again. This environment variable is used by operator connector service to know where to find the web application static files and serve them
- Start the operator connector service app
- Build this application in watch mode
```bash
npm run watch
```
- Open browser at https://-host name or IP address of operator connector computer-:65443
  - Sample with host name - https://ccs3.operator-connector.local:65443 (this will work if `hosts` file has mapping between the IP address of the computer where operator connector is running and the host `ccs3.operator-connector.local`). This is the preferred method, because operator connector certificate can be installed on the operator computer as trusted so the browser does not show certificate errors
  - Sample with IP address - https://127.0.0.1:65443 - if IP address is used, the browser will show certificate errors and the operator must select "Advanced" and "Proceed ..." to load the web application
