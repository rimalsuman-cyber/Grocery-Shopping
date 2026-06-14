const STORAGE_KEY = "shopping-list-reminder:v1";
const supermarkets = [
  "Lidl",
  "Aldi",
  "Migros",
  "Coop",
  "Denner",
  "Lidl-DE",
  "Asian Store",
  "Turkish Store",
  "NP-Store-BE",
  "Volg",
  "Agip",
];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const categoryRules = [
  ["Fruits", ["apple", "banana", "berry", "berries", "avocado", "lime", "lemon"]],
  ["Vegetables", ["carrot", "lettuce", "onion", "tomato", "potato", "pepper", "spinach"]],
  ["Dairy", ["milk", "egg", "eggs", "cheese", "yogurt", "butter", "cream"]],
  ["Drinks", ["water", "juice", "soda", "cola", "lemonade", "beer", "wine", "tea drink"]],
  ["Pantry", ["rice", "pasta", "flour", "sugar", "oil", "cereal", "coffee", "tea", "beans", "sauce", "bread"]],
  ["Frozen", ["frozen", "ice cream", "pizza"]],
  ["Household", ["soap", "towel", "paper", "detergent", "cleaner", "trash", "foil"]],
  ["Petrol and Gas", ["petrol", "gas", "fuel", "diesel", "benzine", "gasoline", "oil change"]],
];

const quantitySuggestionsBySystem = {
  eu: {
    milk: "1 l",
    banana: "1 kg",
    bananas: "1 kg",
    eggs: "10 pcs",
    egg: "10 pcs",
    bread: "500 g",
    cheese: "250 g",
    yogurt: "500 g",
    apples: "1 kg",
    coffee: "250 g",
    rice: "1 kg",
    water: "1.5 l",
    juice: "1 l",
    soda: "1.5 l",
    cola: "1.5 l",
    lemonade: "1.5 l",
  },
  us: {
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
    water: "12 pack",
    juice: "64 fl oz",
    soda: "2 l",
    cola: "2 l",
    lemonade: "2 l",
  },
};

const quantityByNameBySystem = {
  eu: {
    Apples: "1 kg",
    Banana: "1 kg",
    Bananas: "1 kg",
    Bread: "500 g",
    Cheese: "250 g",
    Coffee: "250 g",
    Egg: "10 pcs",
    Eggs: "10 pcs",
    Milk: "1 l",
    Rice: "1 kg",
    Water: "1.5 l",
    Juice: "1 l",
    Soda: "1.5 l",
    Cola: "1.5 l",
    Lemonade: "1.5 l",
    Yogurt: "500 g",
  },
  us: {
    Apples: "6",
    Banana: "6",
    Bananas: "6",
    Bread: "1 loaf",
    Cheese: "1 block",
    Coffee: "1 bag",
    Egg: "12 ct",
    Eggs: "12 ct",
    Milk: "1 gal",
    Rice: "2 lb",
    Water: "12 pack",
    Juice: "64 fl oz",
    Soda: "2 l",
    Cola: "2 l",
    Lemonade: "2 l",
    Yogurt: "4 pack",
  },
};

const noteSuggestions = {
  milk: "1.5 percent",
  banana: "green",
  bananas: "ripe",
  eggs: "free range",
  apples: "crisp",
  bread: "whole grain",
  coffee: "medium roast",
};
const defaultCommentTexts = new Set(["suggested", ...Object.values(noteSuggestions)]);

const quickSuggestionsByCategory = {
  Fruits: ["apples", "bananas", "berries", "avocados", "limes", "lemons"],
  Vegetables: ["carrots", "lettuce", "tomatoes", "potatoes", "spinach", "onions", "peppers"],
  Dairy: ["milk", "eggs", "cheese", "yogurt", "butter", "cream"],
  Drinks: ["water", "juice", "soda", "cola", "lemonade", "beer", "wine"],
  Pantry: ["bread", "coffee", "rice", "pasta", "cereal", "beans", "oil", "tea"],
  Household: ["detergent", "soap", "paper towels", "trash bags", "cleaner", "foil"],
  "Petrol and Gas": ["petrol", "gas", "diesel", "fuel", "benzine", "gasoline"],
  Extra: ["batteries", "flowers", "medicine", "candles", "tape", "gift card"],
};
let selectedMeasurementSystem = "eu";
const defaultItems = [];

const state = loadState();

const itemInput = document.querySelector("#itemInput");
const addButton = document.querySelector("#addButton");
const voiceButton = document.querySelector("#voiceButton");
const suggestionCategorySelect = document.querySelector("#suggestionCategorySelect");
const quickItemSelect = document.querySelector("#quickItemSelect");
const categoryList = document.querySelector("#categoryList");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const clearDoneButton = document.querySelector("#clearDoneButton");
const smsButton = document.querySelector("#smsButton");
const emailButton = document.querySelector("#emailButton");
const reminderToggle = document.querySelector("#reminderToggle");
const reminderSummary = document.querySelector("#reminderSummary");
const settingsButton = document.querySelector("#settingsButton");
const settingsDialog = document.querySelector("#settingsDialog");
const settingsForm = settingsDialog.querySelector("form");
const closeSettingsButton = settingsDialog.querySelector('button[value="close"]');
const saveSettingsButton = document.querySelector("#saveSettingsButton");
const listNameInput = document.querySelector("#listNameInput");
const storeSelect = document.querySelector("#storeSelect");
const measurementSystemSelect = document.querySelector("#measurementSystemSelect");
const reminderMonthSelect = document.querySelector("#reminderMonthSelect");
const reminderDaySelect = document.querySelector("#reminderDaySelect");
const reminderTimeInput = document.querySelector("#reminderTimeInput");
const tripLabel = document.querySelector("#tripLabel");
const storeLabel = document.querySelector("#storeLabel");
const supermarketList = document.querySelector("#supermarketList");

function loadState() {
  const now = new Date();
  const defaultReminder = {
    enabled: true,
    month: now.getMonth() + 1,
    day: now.getDate(),
    time: "17:30",
  };
  const fallback = {
    listName: "Weekly Groceries",
    store: "Migros",
    measurementSystem: "eu",
    remindersByStore: {
      Migros: defaultReminder,
    },
    itemsByStore: {
      Migros: defaultItems,
    },
  };

  try {
    const loaded = { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    loaded.measurementSystem = ["eu", "us"].includes(loaded.measurementSystem) ? loaded.measurementSystem : "eu";
    selectedMeasurementSystem = loaded.measurementSystem;
    if (loaded.store === "AsianStore") loaded.store = "Asian Store";
    loaded.itemsByStore = loaded.itemsByStore || {};
    loaded.remindersByStore = loaded.remindersByStore || {};
    if (loaded.itemsByStore.AsianStore && !loaded.itemsByStore["Asian Store"]) {
      loaded.itemsByStore["Asian Store"] = loaded.itemsByStore.AsianStore;
      delete loaded.itemsByStore.AsianStore;
    }
    if (loaded.remindersByStore.AsianStore && !loaded.remindersByStore["Asian Store"]) {
      loaded.remindersByStore["Asian Store"] = loaded.remindersByStore.AsianStore;
      delete loaded.remindersByStore.AsianStore;
    }
    loaded.store = supermarkets.includes(loaded.store) ? loaded.store : fallback.store;

    if (
      "reminderEnabled" in loaded ||
      "reminderMonth" in loaded ||
      "reminderDay" in loaded ||
      "reminderTime" in loaded
    ) {
      const migratedMonth = normalizeMonth(loaded.reminderMonth, defaultReminder.month);
      loaded.remindersByStore[loaded.store] = {
        enabled: loaded.reminderEnabled ?? defaultReminder.enabled,
        month: migratedMonth,
        day: normalizeDay(loaded.reminderDay, migratedMonth, defaultReminder.day),
        time: loaded.reminderTime || defaultReminder.time,
      };
      delete loaded.reminderEnabled;
      delete loaded.reminderMonth;
      delete loaded.reminderDay;
      delete loaded.reminderTime;
    }

    if (Array.isArray(loaded.items)) {
      loaded.itemsByStore[loaded.store] = loaded.items;
      delete loaded.items;
    }
    supermarkets.forEach((supermarket) => {
      if (!Array.isArray(loaded.itemsByStore[supermarket])) {
        loaded.itemsByStore[supermarket] = [];
      }
      loaded.itemsByStore[supermarket].forEach((item) => {
        if (item.category === "Produce") item.category = "Fruits";
        if (item.category === "Other") item.category = "Extra";
        if (typeof item.commentVisible !== "boolean") item.commentVisible = false;
        if (typeof item.comment !== "string" || defaultCommentTexts.has(item.comment)) item.comment = "";
        if (["Carrots", "Lettuce", "Tomatoes", "Potatoes", "Spinach", "Onions", "Peppers"].includes(item.name)) {
          item.category = "Vegetables";
        }
        if (item.name === "Milk" && item.note === "2 percent") item.note = "1.5 percent";
        syncItemQuantity(item, loaded.measurementSystem);
      });
      loaded.remindersByStore[supermarket] = normalizeReminder(loaded.remindersByStore[supermarket], defaultReminder);
    });
    return loaded;
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentItems() {
  if (!Array.isArray(state.itemsByStore[state.store])) {
    state.itemsByStore[state.store] = [];
  }
  return state.itemsByStore[state.store];
}

function setCurrentItems(items) {
  state.itemsByStore[state.store] = items;
}

function currentReminder() {
  if (!state.remindersByStore[state.store]) {
    const now = new Date();
    state.remindersByStore[state.store] = {
      enabled: true,
      month: now.getMonth() + 1,
      day: now.getDate(),
      time: "17:30",
    };
  }
  return state.remindersByStore[state.store];
}

function normalizeReminder(reminder, fallback) {
  const month = normalizeMonth(reminder?.month, fallback.month);
  return {
    enabled: reminder?.enabled ?? fallback.enabled,
    month,
    day: normalizeDay(reminder?.day, month, fallback.day),
    time: reminder?.time || fallback.time,
  };
}

function activeMeasurementSystem() {
  return selectedMeasurementSystem;
}

function quantityForKey(key, systemName = activeMeasurementSystem()) {
  const system = quantitySuggestionsBySystem[systemName] || quantitySuggestionsBySystem.eu;
  return system[key] || "1";
}

function parseQuantityParts(quantity) {
  const match = String(quantity).match(/^([\d.,]+)\s*(.*)$/);
  return {
    amount: match ? match[1].replace(",", ".") : "1",
    unit: match && match[2] ? match[2] : "",
  };
}

function unitOptions() {
  return activeMeasurementSystem() === "us"
    ? ["", "ct", "lb", "oz", "gal", "bag", "loaf", "block", "pack", "pcs"]
    : ["", "g", "kg", "ml", "l", "pcs"];
}

function populateUnitSelect(select, selectedUnit) {
  select.replaceChildren();
  unitOptions().forEach((unit) => {
    const option = document.createElement("option");
    option.value = unit;
    option.textContent = unit || "none";
    select.append(option);
  });
  if ([...select.options].some((option) => option.value === selectedUnit)) {
    select.value = selectedUnit;
  }
}

function syncItemQuantity(item, systemName = activeMeasurementSystem()) {
  const system = quantityByNameBySystem[systemName] || quantityByNameBySystem.eu;
  if (system[item.name]) item.quantity = system[item.name];
}

function createItem(rawName, quantityOverride) {
  const name = toTitleCase(rawName.trim());
  const key = name.toLowerCase();
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name,
    category: detectCategory(key),
    quantity: quantityOverride || quantityForKey(key),
    note: noteSuggestions[key] || "suggested",
    comment: "",
    commentVisible: false,
    done: false,
  };
}

function detectCategory(name) {
  const rule = categoryRules.find(([, terms]) => terms.some((term) => name.includes(term)));
  return rule ? rule[0] : "Extra";
}

function toTitleCase(value) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function normalizeMonth(value, fallback) {
  const month = Number(value);
  return month >= 1 && month <= 12 ? month : fallback;
}

function normalizeDay(value, month, fallback) {
  const day = Number(value);
  const max = daysInMonth(month);
  return day >= 1 && day <= max ? day : Math.min(fallback, max);
}

function daysInMonth(month) {
  const year = new Date().getFullYear();
  return new Date(year, month, 0).getDate();
}

function addItemsFromInput(value) {
  const names = value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!names.length) return;
  currentItems().unshift(...names.map((name) => createItem(name)));
  itemInput.value = "";
  saveState();
  render();
  pulseNotification();
}

function pulseNotification() {
  if (!currentReminder().enabled || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function groupedItems() {
  const order = ["Fruits", "Vegetables", "Dairy", "Drinks", "Pantry", "Frozen", "Household", "Petrol and Gas", "Extra"];
  return order
    .map((category) => [category, currentItems().filter((item) => item.category === category)])
    .filter(([, items]) => items.length);
}

function formatShoppingList() {
  const items = currentItems();
  if (!items.length) return "No items in shopping list";

  return groupedItems()
    .map(([category, categoryItems]) => {
      const lines = categoryItems.map((item) => {
        const quantity = item.quantity ? ` (${item.quantity})` : "";
        const comment = item.comment ? ` - ${item.comment}` : "";
        return `- ${item.name}${quantity}${comment}`;
      });
      return `${category}:\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

function sendSMS() {
  if (!currentItems().length) {
    alert("Please add items to your shopping list first.");
    return;
  }

  const message = `${state.listName} - ${state.store}\n\n${formatShoppingList()}`;
  window.location.href = `sms:?body=${encodeURIComponent(message)}`;
}

function sendEmail() {
  if (!currentItems().length) {
    alert("Please add items to your shopping list first.");
    return;
  }

  const subject = encodeURIComponent(`${state.listName} - ${state.store}`);
  const body = encodeURIComponent(formatShoppingList());
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function render() {
  saveState();
  renderSummary();
  renderSupermarkets();
  renderReminderDateOptions();
  renderItemDropdown();
  renderItems();
}

function renderSummary() {
  const items = currentItems();
  const reminder = currentReminder();
  const total = items.length;
  const done = items.filter((item) => item.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  tripLabel.textContent = state.listName;
  storeLabel.textContent = state.store;
  progressText.textContent = `${done} of ${total} bought`;
  progressBar.style.width = `${percent}%`;
  reminderToggle.checked = reminder.enabled;
  reminderSummary.textContent = reminder.enabled
    ? `${monthNames[reminder.month - 1]} ${reminder.day} at ${formatTime(reminder.time)}`
    : "Off";
  listNameInput.value = state.listName;
  storeSelect.value = supermarkets.includes(state.store) ? state.store : "Migros";
  measurementSystemSelect.value = state.measurementSystem;
  reminderMonthSelect.value = String(reminder.month);
  reminderDaySelect.value = String(reminder.day);
  reminderTimeInput.value = reminder.time;
}

function renderReminderDateOptions() {
  const reminder = currentReminder();
  if (!reminderMonthSelect.children.length) {
    monthNames.forEach((month, index) => {
      const option = document.createElement("option");
      option.value = String(index + 1);
      option.textContent = month;
      reminderMonthSelect.append(option);
    });
  }

  const selectedMonth = normalizeMonth(reminderMonthSelect.value || reminder.month, reminder.month);
  const maxDay = daysInMonth(selectedMonth);
  if (reminderDaySelect.children.length !== maxDay) {
    reminderDaySelect.replaceChildren();
    for (let day = 1; day <= maxDay; day += 1) {
      const option = document.createElement("option");
      option.value = String(day);
      option.textContent = String(day);
      reminderDaySelect.append(option);
    }
  }

  reminderMonthSelect.value = String(reminder.month);
  reminderDaySelect.value = String(normalizeDay(reminder.day, reminder.month, 1));
}

function openSettings() {
  if (typeof settingsDialog.showModal === "function") {
    settingsDialog.showModal();
  } else {
    settingsDialog.setAttribute("open", "");
    document.body.classList.add("settings-open");
  }
}

function closeSettings() {
  if (typeof settingsDialog.close === "function") {
    settingsDialog.close();
  } else {
    settingsDialog.removeAttribute("open");
  }
  document.body.classList.remove("settings-open");
}

function renderSupermarkets() {
  supermarketList.replaceChildren();
  supermarkets.forEach((supermarket) => {
    const remaining = (state.itemsByStore[supermarket] || []).filter((item) => !item.done).length;
    const pill = document.createElement("button");
    pill.className = "store-pill";
    pill.classList.toggle("active", state.store === supermarket);
    pill.classList.toggle("has-pending", remaining > 0);
    pill.type = "button";
    pill.setAttribute(
      "aria-label",
      remaining > 0 ? `${supermarket}, ${remaining} item${remaining === 1 ? "" : "s"} left to buy` : `${supermarket}, all bought`
    );

    const name = document.createElement("span");
    name.textContent = supermarket;
    pill.append(name);

    if (remaining > 0) {
      const badge = document.createElement("span");
      badge.className = "store-status-badge";
      badge.textContent = remaining;
      badge.setAttribute("aria-hidden", "true");
      pill.append(badge);
    }

    pill.addEventListener("click", () => {
      state.store = supermarket;
      render();
    });
    supermarketList.append(pill);
  });
}

function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function renderItemDropdown() {
  const suggestions = quickSuggestionsByCategory[suggestionCategorySelect.value] || quickSuggestionsByCategory.Fruits;
  quickItemSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose item";
  quickItemSelect.append(placeholder);

  suggestions.forEach((suggestion) => {
    const option = document.createElement("option");
    option.value = suggestion;
    option.textContent = suggestion;
    quickItemSelect.append(option);
  });
}

function renderItems() {
  categoryList.replaceChildren();

  if (!currentItems().length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = `Add a few ${state.store} items and they will be grouped automatically.`;
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
  const commentToggle = node.querySelector(".comment-toggle");
  const commentInput = node.querySelector(".item-comment-input");
  const rowQuantityInput = node.querySelector(".row-quantity-input");
  const rowUnitSelect = node.querySelector(".row-unit-select");
  const del = node.querySelector(".delete-button");
  const quantityParts = parseQuantityParts(item.quantity);

  row.classList.toggle("done", item.done);
  name.textContent = item.name;
  commentInput.value = item.comment || "";
  commentInput.hidden = !item.commentVisible;
  commentToggle.checked = item.commentVisible;
  commentToggle.setAttribute("aria-label", `${item.commentVisible ? "Hide" : "Show"} comment for ${item.name}`);
  commentInput.placeholder = `Comment for ${item.name}`;
  rowQuantityInput.value = quantityParts.amount;
  populateUnitSelect(rowUnitSelect, quantityParts.unit);

  function saveRowQuantity() {
    const amount = rowQuantityInput.value.trim() || "1";
    const unit = rowUnitSelect.value;
    item.quantity = unit ? `${amount} ${unit}` : amount;
    saveState();
  }

  check.addEventListener("click", () => {
    item.done = !item.done;
    if ("vibrate" in navigator) navigator.vibrate(12);
    render();
  });

  rowQuantityInput.addEventListener("change", saveRowQuantity);
  rowUnitSelect.addEventListener("change", saveRowQuantity);
  function saveComment() {
    item.comment = commentInput.value.trim();
    item.note = item.comment || "suggested";
    saveState();
  }

  commentInput.addEventListener("input", saveComment);
  commentInput.addEventListener("change", saveComment);
  commentToggle.addEventListener("change", () => {
    item.commentVisible = commentToggle.checked;
    commentInput.hidden = !item.commentVisible;
    commentToggle.setAttribute("aria-label", `${item.commentVisible ? "Hide" : "Show"} comment for ${item.name}`);
    saveState();
    if (item.commentVisible) {
      commentInput.focus();
      commentInput.select();
    }
  });

  del.addEventListener("click", () => {
    setCurrentItems(currentItems().filter((candidate) => candidate.id !== item.id));
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

suggestionCategorySelect.addEventListener("change", renderItemDropdown);

quickItemSelect.addEventListener("change", () => {
  const suggestion = quickItemSelect.value;
  if (!suggestion) return;
  itemInput.value = itemInput.value ? `${itemInput.value}, ${suggestion}` : suggestion;
  quickItemSelect.value = "";
  itemInput.focus();
});

measurementSystemSelect.addEventListener("change", () => {
  state.measurementSystem = measurementSystemSelect.value;
  selectedMeasurementSystem = state.measurementSystem;
  Object.values(state.itemsByStore).flat().forEach(syncItemQuantity);
  render();
});

clearDoneButton.addEventListener("click", () => {
  setCurrentItems(currentItems().filter((item) => !item.done));
  render();
});

smsButton.addEventListener("click", sendSMS);

emailButton.addEventListener("click", sendEmail);

reminderToggle.addEventListener("change", () => {
  currentReminder().enabled = reminderToggle.checked;
  pulseNotification();
  render();
});

settingsButton.addEventListener("click", openSettings);

closeSettingsButton.addEventListener("click", (event) => {
  event.preventDefault();
  closeSettings();
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

saveSettingsButton.addEventListener("click", (event) => {
  event.preventDefault();
  state.listName = listNameInput.value.trim() || "Shopping List";
  state.store = storeSelect.value;
  state.measurementSystem = measurementSystemSelect.value;
  selectedMeasurementSystem = state.measurementSystem;
  Object.values(state.itemsByStore).flat().forEach(syncItemQuantity);
  const reminder = currentReminder();
  reminder.month = normalizeMonth(reminderMonthSelect.value, reminder.month);
  reminder.day = normalizeDay(reminderDaySelect.value, reminder.month, reminder.day);
  reminder.time = reminderTimeInput.value || "17:30";
  render();
  closeSettings();
});

reminderMonthSelect.addEventListener("change", () => {
  const reminder = currentReminder();
  const nextMonth = normalizeMonth(reminderMonthSelect.value, reminder.month);
  const nextDay = normalizeDay(reminderDaySelect.value, nextMonth, reminder.day);
  reminder.month = nextMonth;
  reminder.day = nextDay;
  renderReminderDateOptions();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

render();
