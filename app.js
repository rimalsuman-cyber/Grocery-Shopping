const STORAGE_KEY = "shopping-list-reminder:v1";

const categoryRules = [
  ["Produce", ["apple", "banana", "berry", "berries", "carrot", "lettuce", "onion", "tomato", "potato", "pepper", "avocado", "lime", "lemon", "spinach"]],
  ["Dairy", ["milk", "egg", "eggs", "cheese", "yogurt", "butter", "cream"]],
  ["Pantry", ["rice", "pasta", "flour", "sugar", "oil", "cereal", "coffee", "tea", "beans", "sauce", "bread"]],
  ["Frozen", ["frozen", "ice cream", "pizza"]],
  ["Household", ["soap", "towel", "paper", "detergent", "cleaner", "trash", "foil"]],
];

const quantitySuggestions = {
  milk: "1 gal",
  banana: "6",
  bananas: "6",
  eggs: "12 ct",
  egg: "12 ct",
  bread: "1 loaf",
  cheese: "1 block",
  yogurt: "4 pack",
  apples: "6",
  coffee: "1 bag",
  rice: "2 lb",
};

const noteSuggestions = {
  milk: "2 percent",
  banana: "ripe",
  bananas: "ripe",
  eggs: "free range",
  apples: "crisp",
  bread: "whole grain",
  coffee: "medium roast",
};

const quickSuggestions = ["milk", "bananas", "eggs", "bread", "coffee", "rice", "apples", "detergent"];

const state = loadState();

const itemInput = document.querySelector("#itemInput");
const addButton = document.querySelector("#addButton");
const voiceButton = document.querySelector("#voiceButton");
const quickChips = document.querySelector("#quickChips");
const categoryList = document.querySelector("#categoryList");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const clearDoneButton = document.querySelector("#clearDoneButton");
const reminderToggle = document.querySelector("#reminderToggle");
const reminderSummary = document.querySelector("#reminderSummary");
const settingsButton = document.querySelector("#settingsButton");
const settingsDialog = document.querySelector("#settingsDialog");
const saveSettingsButton = document.querySelector("#saveSettingsButton");
const listNameInput = document.querySelector("#listNameInput");
const storeInput = document.querySelector("#storeInput");
const reminderTimeInput = document.querySelector("#reminderTimeInput");
const tripLabel = document.querySelector("#tripLabel");
const storeLabel = document.querySelector("#storeLabel");

function loadState() {
  const fallback = {
    listName: "Weekly Groceries",
    store: "Any grocery store",
    reminderEnabled: true,
    reminderTime: "17:30",
    items: [
      createItem("Milk"),
      createItem("Bananas"),
      createItem("Eggs"),
    ],
  };

  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createItem(rawName) {
  const name = toTitleCase(rawName.trim());
  const key = name.toLowerCase();
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name,
    category: detectCategory(key),
    quantity: quantitySuggestions[key] || "1",
    note: noteSuggestions[key] || "suggested",
    done: false,
  };
}

function detectCategory(name) {
  const rule = categoryRules.find(([, terms]) => terms.some((term) => name.includes(term)));
  return rule ? rule[0] : "Other";
}

function toTitleCase(value) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function addItemsFromInput(value) {
  const names = value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!names.length) return;
  state.items.unshift(...names.map(createItem));
  itemInput.value = "";
  saveState();
  render();
  pulseNotification();
}

function pulseNotification() {
  if (!state.reminderEnabled || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function groupedItems() {
  const order = ["Produce", "Dairy", "Pantry", "Frozen", "Household", "Other"];
  return order
    .map((category) => [category, state.items.filter((item) => item.category === category)])
    .filter(([, items]) => items.length);
}

function render() {
  saveState();
  renderSummary();
  renderChips();
  renderItems();
}

function renderSummary() {
  const total = state.items.length;
  const done = state.items.filter((item) => item.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  tripLabel.textContent = state.listName;
  storeLabel.textContent = state.store;
  progressText.textContent = `${done} of ${total} bought`;
  progressBar.style.width = `${percent}%`;
  reminderToggle.checked = state.reminderEnabled;
  reminderSummary.textContent = state.reminderEnabled ? `Today at ${formatTime(state.reminderTime)}` : "Off";
  listNameInput.value = state.listName;
  storeInput.value = state.store;
  reminderTimeInput.value = state.reminderTime;
}

function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function renderChips() {
  quickChips.replaceChildren();
  quickSuggestions.forEach((suggestion) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.textContent = suggestion;
    chip.addEventListener("click", () => {
      itemInput.value = itemInput.value ? `${itemInput.value}, ${suggestion}` : suggestion;
      itemInput.focus();
    });
    quickChips.append(chip);
  });
}

function renderItems() {
  categoryList.replaceChildren();

  if (!state.items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Add a few items and they will be grouped automatically.";
    categoryList.append(empty);
    return;
  }

  groupedItems().forEach(([categoryName, items]) => {
    const categoryNode = document.querySelector("#categoryTemplate").content.cloneNode(true);
    const article = categoryNode.querySelector(".category");
    const header = categoryNode.querySelector(".category-header");
    const title = header.querySelector("span");
    const count = header.querySelector("small");
    const itemsNode = categoryNode.querySelector(".items");

    title.textContent = categoryName;
    count.textContent = `${items.filter((item) => !item.done).length} left`;

    header.addEventListener("click", () => {
      itemsNode.hidden = !itemsNode.hidden;
    });

    items
      .slice()
      .sort((a, b) => Number(a.done) - Number(b.done))
      .forEach((item) => itemsNode.append(renderItem(item)));

    article.append(itemsNode);
    categoryList.append(categoryNode);
  });
}

function renderItem(item) {
  const node = document.querySelector("#itemTemplate").content.cloneNode(true);
  const row = node.querySelector(".item-row");
  const check = node.querySelector(".check-button");
  const name = node.querySelector(".item-main strong");
  const note = node.querySelector(".item-main span");
  const quantity = node.querySelector(".quantity-chip");
  const del = node.querySelector(".delete-button");

  row.classList.toggle("done", item.done);
  name.textContent = item.name;
  note.textContent = item.note;
  quantity.textContent = item.quantity;

  check.addEventListener("click", () => {
    item.done = !item.done;
    if ("vibrate" in navigator) navigator.vibrate(12);
    render();
  });

  quantity.addEventListener("click", () => {
    const next = prompt("Quantity", item.quantity);
    if (next !== null && next.trim()) {
      item.quantity = next.trim();
      render();
    }
  });

  del.addEventListener("click", () => {
    state.items = state.items.filter((candidate) => candidate.id !== item.id);
    render();
  });

  return node;
}

addButton.addEventListener("click", () => addItemsFromInput(itemInput.value));

itemInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addItemsFromInput(itemInput.value);
  }
});

voiceButton.addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    itemInput.placeholder = "Voice input is not available in this browser";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = navigator.language || "en-US";
  recognition.onresult = (event) => {
    itemInput.value = event.results[0][0].transcript.replace(/\band\b/g, ",");
    addItemsFromInput(itemInput.value);
  };
  recognition.start();
});

clearDoneButton.addEventListener("click", () => {
  state.items = state.items.filter((item) => !item.done);
  render();
});

reminderToggle.addEventListener("change", () => {
  state.reminderEnabled = reminderToggle.checked;
  pulseNotification();
  render();
});

settingsButton.addEventListener("click", () => settingsDialog.showModal());

saveSettingsButton.addEventListener("click", () => {
  state.listName = listNameInput.value.trim() || "Shopping List";
  state.store = storeInput.value.trim() || "Any grocery store";
  state.reminderTime = reminderTimeInput.value || "17:30";
  render();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

render();
