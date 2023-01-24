import FolderElement from './FolderElement.js';

export default class ObjectElement extends FolderElement {
  constructor() {
    super();
  }
}

customElements.define('object-element', ObjectElement);
