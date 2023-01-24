export default class FolderElement extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('dblclick', this._renameElement);
    this.addEventListener('click', this._highlightElement);
  }

  _renameElement() {
    const value = this.innerHTML;
    const input = document.createElement('input');

    input.value = value;

    input.onblur = function () {
      const value = this.value;

      this.parentNode.innerHTML = value;
    };

    input.onkeyup = function (e) {
      if (e.key == 'Enter') {
        const value = this.value;

        this.parentNode.innerHTML = value;
      }
    };

    this.innerHTML = '';
    this.appendChild(input);
    input.focus();
  }
}

customElements.define('folder-element', FolderElement);
