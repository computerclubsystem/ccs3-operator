import { Inject, Injectable, DOCUMENT } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class CustomStylesService {
  private readonly stylElementAttributeName = 'ccs3-op-profile-style';
  constructor(
    @Inject(DOCUMENT) private readonly doc: Document
  ) { }

  applyStyleText(css: string): void {
    let styleEl = this.doc.head.querySelector(`[${this.stylElementAttributeName}]`) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = this.doc.createElement('style');
      styleEl.setAttribute(this.stylElementAttributeName, '');
      this.doc.head.appendChild(styleEl);
    }
    styleEl.innerText = '';
    const textNode = this.doc.createTextNode(css);
    styleEl.appendChild(textNode);
  }
}
