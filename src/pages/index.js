// Imports:
import './index.css';
import FolderElement from '../components/FolderElement.js';
import FileElement from '../components/FileElement.js';
import ObjectElement from '../components/ObjectElement.js';
import MainElement from '../components/Main.js';
import AddItemPopup from '../components/AddItemPopup.js';
// import { testArr } from './utils/constants.js';

// Connecting to the DOM
class TreeView extends HTMLElement {
  connectedCallback() {
    const element = document.querySelector('#treeview');
    const html = document.importNode(element.content, true);
    this.appendChild(html);
  }
}

customElements.define('treeview-webcomp', TreeView);

// Variables:
let targetItem;
const deleteBtn = document.querySelector('.delete-btn');
const addBtn = document.querySelector('.add-btn');
const saveBtn = document.querySelector('.save-btn');
const content = document.querySelector('.content');
const searchInput = document.querySelector('.search');

// Functions:
// Function to iterate DOM nodes and save information to array
function createArrayFromNodes(node, arr) {
  const listItems = node.children;
  [...listItems].forEach((element) => {
    const items = element.childNodes;

    items.forEach((item) => {
      if (item.className === 'item') {
        const newObject = {};

        newObject.label = item.innerText;
        newObject.icon_id = item.id;
        if (item.localName === 'file-element') {
          newObject.type = 'file';
        } else if (item.localName === 'folder-element') {
          newObject.type = 'folder';
        } else if (item.localName === 'object-element') {
          newObject.type = 'object';
        }
        newObject.children = [];

        arr.push(newObject);
        if (
          item.nextSibling &&
          item.nextSibling.className.includes('wrapper')
        ) {
          const element = item.nextSibling;
          createArrayFromNodes(element, newObject.children);
        }
      }
    });
  });
}

function saveItems() {
  const newArr = [];

  createArrayFromNodes(content, newArr);
  localStorage.setItem('initialArray', JSON.stringify(newArr));
}

function getItems() {
  const arr = localStorage.getItem('initialArray');

  if (!arr) return [];

  return JSON.parse(arr);
}

function deleteItem() {
  const items = document.querySelectorAll('.item');

  items.forEach((item) => {
    if (item.id === targetItem) {
      const elementToDelete = item.closest('.list-item');

      elementToDelete.remove();
    }
  });
}

function openAddItemPopup() {
  popup.open();
}

// Common ID generator
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function highlightSearchResult(data, array, count) {
  data.forEach((item) => {
    if (item.id === array[count].id) {
      item.focus();
      const parent = item.closest('.list-item').parentNode;

      if (
        parent.classList.contains('wrapper') &&
        !parent.classList.contains('active')
      ) {
        parent.classList.add('active');
        item.focus();
        item.previousSibling &&
          item.previousSibling.classList.contains('caret') &&
          item.previousSibling.classList.add('caret-down');

        item.parentNode.parentNode.parentNode.children[0].classList.contains(
          'caret'
        ) &&
          !item.parentNode.parentNode.parentNode.children[0].classList.contains(
            'caret-down'
          ) &&
          item.parentNode.parentNode.parentNode.children[0].classList.add(
            'caret-down'
          );
      }
    }
  });
}

function handleSearch() {
  const items = document.querySelectorAll('.item');
  const itemsArr = Array.prototype.slice.call(items);
  const result = itemsArr.filter((item) => {
    return item.textContent
      .toLowerCase()
      .includes(searchInput.value.toLowerCase());
  });

  let counter = 0;

  highlightSearchResult(items, result, counter);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (counter < result.length - 1) {
        counter += 1;
        highlightSearchResult(items, result, counter);
      }
    }
  });
}

// Render to the DOM app structure
const main = new MainElement(getItems(), generateId);
main.renderTree();

// Popup activate
const popup = new AddItemPopup('.add-item-popup', generateId);
popup.setEventListeners();

// Event listeners:
// Target element listener
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('item')) {
    // save id of the target element to the variable
    targetItem = e.target.id;
    e.target.focus();
  }
});

// Buttons listeners
deleteBtn.addEventListener('click', deleteItem);
addBtn.addEventListener('click', openAddItemPopup);
saveBtn.addEventListener('click', saveItems);
searchInput.addEventListener('search', handleSearch);


// Drag&drop logics
const itemsListContainer = document.querySelector(`.content`);
const itemsElements = itemsListContainer.querySelectorAll(`.list-item`);

// Iterate through all the elements of the list and assign the desired value
for (const task of itemsElements) {
  task.draggable = true;
}

itemsListContainer.addEventListener(`dragstart`, (evt) => {
  evt.target.classList.add(`selected`);
});

itemsListContainer.addEventListener(`dragend`, (evt) => {
  evt.target.classList.remove(`selected`);
});

itemsListContainer.addEventListener(`dragover`, (evt) => {
  // Allow dropping elements into this area
  evt.preventDefault();

  // Finding the movable element
  const activeElement = itemsListContainer.querySelector(`.selected`);
  // Find the element over which the cursor is currently located
  const currentElement = evt.target;
  // Checking that the event was triggered:
  // 1. not on the element that we are moving,
  // 2. it is on the list item
  const isMoveable =
    activeElement !== currentElement &&
    currentElement.classList.contains(`list-item`);

  // If not, interrupt the execution of the function
  if (!isMoveable) {
    return;
  }

  // Find the element before which we will insert
  const nextElement =
    currentElement === activeElement.nextElementSibling
      ? currentElement.nextElementSibling
      : currentElement;

  // Inserting activeElement before nextElement
  itemsListContainer.insertBefore(activeElement, nextElement);
});

const getNextElement = (cursorPosition, currentElement) => {
  // Get an object with sizes and coordinates
  const currentElementCoord = currentElement.getBoundingClientRect();
  // Find the vertical coordinate of the center of the current element
  const currentElementCenter =
    currentElementCoord.y + currentElementCoord.height / 2;

  // If the cursor is above the center of the element, return the current element
  // Else — next DOM-element
  const nextElement =
    cursorPosition < currentElementCenter
      ? currentElement
      : currentElement.nextElementSibling;

  return nextElement;
};

itemsListContainer.addEventListener(`dragover`, (evt) => {
  evt.preventDefault();

  const activeElement = itemsListContainer.querySelector(`.selected`);
  const currentElement = evt.target;
  const isMoveable =
    activeElement !== currentElement &&
    currentElement.classList.contains(`list-item`);

  if (!isMoveable) {
    return;
  }

  // evt.clientY — the vertical coordinate of the cursor at the moment, when the event was triggered
  const nextElement = getNextElement(evt.clientY, currentElement);

  // Check whether the elements need to be swapped
  if (
    (nextElement && activeElement === nextElement.previousElementSibling) ||
    activeElement === nextElement
  ) {
    // If not, exit the function to avoid unnecessary changes to the DOM
    return;
  }

  itemsListContainer.insertBefore(activeElement, nextElement);
});
