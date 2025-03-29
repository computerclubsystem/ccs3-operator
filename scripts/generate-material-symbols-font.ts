import * as https from 'node:https';
import { OutgoingHttpHeaders } from 'node:http';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { IconName } from '../projects/shared/src/lib/types/icon-name';

interface GenerateArguments {
  outputFontFilePath: string;
  outputFontFileName: string;
  outputFontCssFilePath: string;
  outputFontCssFileName: string;
}

interface GenerateResult {
  cssUrl: string;
  cssLength: number;
  createdCssFileFullPath: string;
  fontFileUrl: string;
  fontFileSize: number;
  createFontFileFullPath: string;
}

class MaterialSymbolsGenerator {
  async generate(args: GenerateArguments): Promise<GenerateResult> {
    const sortedSymbolNames = this.getSortedSymbolNames();
    const cssUrl = this.generateCssUrl(sortedSymbolNames);
    const downloadedCssBuffer = await this.downloadFile(cssUrl);
    const downloadedCssText = downloadedCssBuffer.toString();
    const fontFileUrl = this.getFontFileUrlFromCss(downloadedCssText)!;
    const downloadedFontBuffer = await this.downloadFile(fontFileUrl);
    const outputFontFileFullPath = path.join(args.outputFontFilePath, args.outputFontFileName);
    await fs.writeFile(outputFontFileFullPath, downloadedFontBuffer);
    const modifiedCssText = downloadedCssText.replace(fontFileUrl, `material-symbols-outlined/ccs3-op-material-symbols-outlined.woff2`);
    const outputCssFileFullPath = path.join(args.outputFontCssFilePath, args.outputFontCssFileName);
    await fs.writeFile(outputCssFileFullPath, modifiedCssText);
    const result: GenerateResult = {
      cssUrl: cssUrl,
      cssLength: downloadedCssText.length,
      createdCssFileFullPath: outputCssFileFullPath,
      fontFileUrl: fontFileUrl,
      fontFileSize: downloadedFontBuffer.length,
      createFontFileFullPath: outputFontFileFullPath,
    };
    return result;
  }

  getFontFileUrlFromCss(css: string): string | null {
    // This will try to extract the URL from "url(...)" but it will include the closing bracket and the word "format"
    const matches = css.match(/src: url\((.*.format)/);
    const match = matches?.[1];
    if (!match) {
      return null;
    }
    // The regex above is not good enough - it includes the closing brackedt and the word "fromat" of the "url(...)" - remove it
    return match.substring(0, match.length - 8);
  }

  getSortedSymbolNames(): string[] {
    const symbolIconNames = Object.values(IconName);
    symbolIconNames.sort((a, b) => a.localeCompare(b));
    return symbolIconNames;
  };

  generateCssUrl(sortedSymbolNames: string[]): string {
    const urlPrefix = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=`;
    const commaSeparatedNames = sortedSymbolNames.join(',');
    return urlPrefix + commaSeparatedNames;
  };

  async downloadFile(cssUrl: string): Promise<Buffer> {
    const promise = new Promise<Buffer>((resolve, reject) => {
      const url = URL.parse(cssUrl)!;
      const headers: OutgoingHttpHeaders = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      };
      const reqOptions: https.RequestOptions = {
        headers: headers,
        protocol: 'https:',
        hostname: url.hostname,
        path: url.pathname + url.search,
      };
      https.get(reqOptions, res => {
        const buffs: Buffer[] = [];
        res.on('end', () => {
          resolve(Buffer.concat(buffs));
        });
        res.on('error', err => {
          reject(err);
        });
        res.on('readable', () => {
          const chunk: Buffer = res.read();
          if (chunk) {
            buffs.push(chunk);
          }
        });
      });
    });
    return promise;
  };
}

const generator = new MaterialSymbolsGenerator();
const outputFontsPath = 'public/assets/fonts/';
const args: GenerateArguments = {
  outputFontCssFileName: 'material-symbols-outlined.css',
  outputFontCssFilePath: outputFontsPath,
  outputFontFileName: 'ccs3-op-material-symbols-outlined.woff2',
  outputFontFilePath: `${outputFontsPath}material-symbols-outlined`,
};
(async () => {
  const result = await generator.generate(args);
  console.log('- CSS url:', result.cssUrl);
  console.log('- CSS size:', result.cssLength);
  console.log('- Created CSS file full path:', result.createdCssFileFullPath);
  console.log('- Font file url:', result.fontFileUrl);
  console.log('- Font file size:', result.fontFileSize);
  console.log('- Created font file full path:', result.createFontFileFullPath);
})();

