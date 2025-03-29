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

## Generate Material Symbols font
The application is using Material Symbols for icons. This requires generating font containing only the used symbols and saving its CSS and the font file in certain places so the app does not need to load it from external site. There are 2 files needed for Material Symbols to work:
- The font file in `public/assets/fonts/material-symbols-outlined/ccs3-op-material-symbols.woff2`
- The Material Symbols CSS in `public/assets/fonts/material-symbols-outlined.css`
- The Material Symbols CSS modified to point to `src: url(material-symbols-outlined/ccs3-op-material-symbols.woff2)`


There is a script `scripts/generate-material-symbols-font.ts` that does this automatically. After the file `projects/shared/src/lib/types/icon-name.ts` is modified, save it and execute
```bash
npm run scripts:generate-material-symbols-font
```

Manual procedure would be:
- Identify all symbols used in the application by looking at `projects/shared/src/lib/types/icon-name.ts`, - Navigate to https://fonts.google.com/icons?icon.set=Material+Symbols&icon.style=Outlined
- Select some icon and copy the `href` value of its `<link rel...` code
- Modify the `icon_names` query parameter to contain all the icon names used in `icon-name.ts` in alphabetical order separated by comma
- Navigate to the generated URL - it is a CSS
- Paste the content of the downloaded CSS into `public/assets/fonts/material-symbols-outlined.css`
- Download the font file referred in the CSS (https://fonts.gstatic.com/icon/font...) (name it `ccs3-op-material-symbols.woff2`) and put it in the folder `public/assets/fonts/material-symbols-outlined` overwriting existing file 
- Modify `public/assets/fonts/material-symbols-outlined.css` to point to local folder by changing the line `src: url(https://fonts.gstatic.com...` to `src: url(material-symbols-outlined/ccs3-op-material-symbols.woff2) format('woff2');`

  

