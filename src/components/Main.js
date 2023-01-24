export default class MainElement {
  constructor(array, generateId) {
    this._array = array;
    this._node = document.querySelector('.content');
    this._generateId = generateId;
  }

  renderTree() {
    this._createTree(this._array, this._node);
  }

  _createTree(arr, node) {
    arr.forEach((item) => {
      const element = this._createElement(item);

      // Check if tag <ul> exist into a parent node
      if (node.classList.contains('content')) {
        node.appendChild(element);
      } else if (node.childNodes.length > 0) {
        node.querySelector('.wrapper').appendChild(element);
      }

      item.children.length > 0 && this._createTree(item.children, element);
    });
  }

  _createElement(item) {
    const { label, icon, type, children } = item;
    let tagName;

    const listItem = document.createElement('li');
    listItem.classList.add('list-item');

    if (type === 'file') tagName = 'file-element';
    else if (type === 'folder') tagName = 'folder-element';
    else if (type === 'object') tagName = 'object-element';

    const element = document.createElement(tagName);
    element.textContent = label;
    element.id = this._generateId();
    element.classList.add('item');
    element.tabIndex = 0;
    if (tagName === 'file-element') element.classList.add('item-file');
    else if (type === 'folder') element.classList.add('item-folder');
    else if (type === 'object') element.classList.add('item-object');

    listItem.appendChild(element);

    // Create caret element to toggle visibility of element
    const caret = document.createElement('span');
    caret.classList.add('caret');

    function toggleCaret() {
      this.parentElement.querySelector('.wrapper').classList.toggle('active');
      this.classList.toggle('caret-down');
    }

    caret.addEventListener('click', toggleCaret);

    const wrapper = document.createElement('ul');
    wrapper.classList.add('wrapper');

    // Add tag <ul> if children exist
    if (children.length > 0) {
      listItem.prepend(caret);
      listItem.append(wrapper);
    }

    return listItem;
  }
}
