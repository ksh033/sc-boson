import { v4 } from 'uuid';
import Base64 from './base64';

export default {
  uuid(): string {
    return v4().replace(/-/g, '');
  },

  base64(v: string): string {
    return Base64.encode(v);
  },

  decodeBase64(v: string): string {
    return Base64.decode(v);
  },

  getHostUrl() {
    const { location } = window;
    return `${location.protocol}//${location.host}/`;
  },

  appendHtml(html: string, parent: HTMLElement = document.body): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = html;
    const el: any = div.children[0];
    parent.appendChild(el);
    return el;
  },
};
