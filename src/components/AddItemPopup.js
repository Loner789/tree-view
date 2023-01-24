// Modal window class
export default class AddItemPopup {
  constructor(popupSelector, generateId, addButtonSelector) {
    this._popup = document.querySelector(popupSelector);
    this._handleEscClose = this._handleEscClose.bind(this);
    this._objectBtn = document.querySelector(".object-btn");
    this._folderBtn = document.querySelector(".folder-btn");
    this._fileBtn = document.querySelector(".file-btn");
    this._generateId = generateId;
    this._targetItem;
    this._addFile = this._addFile.bind(this);
    this._addFolder = this._addFolder.bind(this);
    this._addObject = this._addObject.bind(this);
    this._togglePopup = this._togglePopup.bind(this);
    this._addButton = document.querySelector(addButtonSelector);
    this._opened = false;
  }

  _handleEscClose(evt) {
    if (evt.key === "Escape") {
      this.close();
    }
  }

  _createItem(tagName, name) {
    const wrapper = document.createElement("li");

    wrapper.classList.add("list-item");

    const element = document.createElement(tagName);

    element.classList.add("item");
    element.tabIndex = 0;
    element.id = this._generateId();
    element.textContent = name;
    if (tagName === "file-element") element.classList.add("item-file");
    else if (tagName === "folder-element") element.classList.add("item-folder");
    else if (tagName === "object-element") element.classList.add("item-object");

    wrapper.appendChild(element);

    return wrapper;
  }

  _addFile() {
    const container = document.querySelector(".content");
    const fileElement = this._createItem("file-element", "New File");

    container.appendChild(fileElement);
    this.close();
  }

  _addNotFileItem(type) {
    const items = document.querySelectorAll(".item");

    items.forEach((item) => {
      if (!this._targetItem)
        throw new Error(
          "Необходимо выбрать файл или объект для размещения папки"
        );
      if (item.id === this._targetItem) {
        const listItem = item.closest(".list-item");
        const element =
          type === "folder"
            ? this._createItem("folder-element", "New Folder")
            : this._createItem("object-element", "New Object");

        // Check if target item has nested nodes
        if (listItem.children.length > 1) {
          const innerUl = listItem.querySelector(".wrapper");
          const innerCaret = listItem.querySelector(".caret");
          innerUl.appendChild(element);
          !innerUl.classList.contains("active") &&
            innerUl.classList.add("active"),
            innerCaret.classList.add("caret-down");
        } else {
          const caret = document.createElement("span");
          caret.classList.add("caret");
          caret.classList.add("caret-down");

          function toggleCaret() {
            this.parentElement
              .querySelector(".wrapper")
              .classList.toggle("active");
            this.classList.toggle("caret-down");
          }

          caret.addEventListener("click", toggleCaret);

          const wrapper = document.createElement("ul");
          wrapper.classList.add("wrapper");
          wrapper.classList.add("active");
          wrapper.appendChild(element);

          listItem.prepend(caret);
          listItem.append(wrapper);
        }
      }
    });

    this.close();
  }

  _addFolder() {
    this._addNotFileItem("folder");
  }

  _addObject() {
    this._addNotFileItem("object");
  }

  _togglePopup() {
    this._opened ? this.close() : this.open();
  }

  open() {
    this._popup.classList.add("popup_opened");

    document.addEventListener("keydown", this._handleEscClose);
    this._fileBtn.addEventListener("click", this._addFile);
    this._folderBtn.addEventListener("click", this._addFolder);
    this._objectBtn.addEventListener("click", this._addObject);
    this._opened = true;
  }

  close() {
    this._popup.classList.remove("popup_opened");

    document.removeEventListener("keydown", this._handleEscClose);
    this._fileBtn.removeEventListener("click", this._addFile);
    this._folderBtn.removeEventListener("click", this._addFolder);
    this._objectBtn.removeEventListener("click", this._addObject);
    this._opened = false;
  }

  setEventListeners() {
    document.addEventListener("mousedown", (e) => {
      const targetButtons =
        e.target === this._objectBtn ||
        e.target === this._folderBtn ||
        e.target === this._fileBtn ||
        e.target === this._addButton;

      !targetButtons && this.close();
    });

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("item")) {
        // save id of the target element to the variable
        this._targetItem = e.target.id;
        e.target.focus();
      }
    });

    this._addButton.addEventListener("click", this._togglePopup);
  }
}
