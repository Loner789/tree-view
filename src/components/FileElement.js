import FolderElement from './FolderElement.js';

export default class FileElement extends FolderElement {
  constructor() {
    super();
  }
}

customElements.define('file-element', FileElement);
