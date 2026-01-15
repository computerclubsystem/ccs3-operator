import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CustomStylesService {
  private readonly doc = inject(DOCUMENT);
  private readonly stylElementAttributeName = 'ccs3-op-profile-style';

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
