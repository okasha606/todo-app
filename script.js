const form = document.getElementById("add-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const count = document.getElementById("count");
const filterButtons = document.querySelectorAll(".filter");
const clearCompletedBtn = document.getElementById("clear-completed");
const clearAllBtn = document.getElementById("clear-all");

let todos = loadTodos();
let currentFilter = "all";
let editingId = null;

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
  const saved = localStorage.getItem("todos");
  return saved ? JSON.parse(saved) : [];
}

function addTodo(text) {
  todos.push({ id: Date.now(), text: text, done: false });
}

function toggleTodo(id) {
  const todo = todos.find(function (t) { return t.id === id; });
  todo.done = !todo.done;
}

function deleteTodo(id) {
  todos = todos.filter(function (t) { return t.id !== id; });
}

function saveEdit(id, newText) {
  newText = newText.trim();
  if (newText === "") {
    deleteTodo(id);
  } else {
    const todo = todos.find(function (t) { return t.id === id; });
    todo.text = newText;
  }
  editingId = null;
}

function getVisibleTodos() {
  if (currentFilter === "active") {
    return todos.filter(function (t) { return !t.done; });
  }
  if (currentFilter === "completed") {
    return todos.filter(function (t) { return t.done; });
  }
  return todos;
}

function render() {
  list.innerHTML = "";
  const visible = getVisibleTodos();

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Nothing here yet.";
    list.appendChild(empty);
  }

  visible.forEach(function (todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    li.appendChild(checkbox);

    if (todo.id === editingId) {
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "edit-input";
      editInput.value = todo.text;
      li.appendChild(editInput);
      setTimeout(function () { editInput.focus(); }, 0);
    } else {
      const span = document.createElement("span");
      span.className = "todo-text";
      span.textContent = todo.text;
      li.appendChild(span);
    }

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "🗑️";
    del.title = "Delete";
    li.appendChild(del);

    list.appendChild(li);
  });

  const left = todos.filter(function (t) { return !t.done; }).length;
  count.textContent = left + (left === 1 ? " item left" : " items left");

  filterButtons.forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });

  saveTodos();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const text = input.value.trim();
  if (text === "") return;
  addTodo(text);
  input.value = "";
  render();
});

list.addEventListener("click", function (event) {
  const li = event.target.closest(".todo-item");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (event.target.type === "checkbox") toggleTodo(id);
  else if (event.target.classList.contains("delete-btn")) deleteTodo(id);
  else return;

  render();
});

list.addEventListener("dblclick", function (event) {
  if (!event.target.classList.contains("todo-text")) return;
  editingId = Number(event.target.closest(".todo-item").dataset.id);
  render();
});

list.addEventListener("keydown", function (event) {
  if (!event.target.classList.contains("edit-input")) return;
  const id = Number(event.target.closest(".todo-item").dataset.id);

  if (event.key === "Enter") {
    saveEdit(id, event.target.value);
    render();
  } else if (event.key === "Escape") {
    editingId = null;
    render();
  }
});

list.addEventListener("focusout", function (event) {
  if (!event.target.classList.contains("edit-input")) return;
  if (editingId === null) return;
  const id = Number(event.target.closest(".todo-item").dataset.id);
  saveEdit(id, event.target.value);
  render();
});

filterButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearCompletedBtn.addEventListener("click", function () {
  todos = todos.filter(function (t) { return !t.done; });
  render();
});

clearAllBtn.addEventListener("click", function () {
  todos = [];
  render();
});

render();
