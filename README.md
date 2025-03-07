# CCS3 Operator

## Debug
- Build in production watch mode:
```bash
npm run watch
```
- The output can be found in `dist\ccs3-operator\browser`
- Configure `CCS3_OPERATOR_CONNECTOR_STATIC_FILES_PATH` environment variable for the `ccs3-backend\operator-connector` app to point to the absolute path of `dist\ccs3-operator\browser` and start `operator-connector`
- Open browser and navigate to https://localhost:65502

## Lint
To add eslint to project:
```bash
npm run ng -- generate angular-eslint:add-eslint-to-project {the project name as specified in angular.json}
```
Sample for the `projects/boolean-indicator`:
```bash 
npm run ng -- generate angular-eslint:add-eslint-to-project boolean-indicator
```
