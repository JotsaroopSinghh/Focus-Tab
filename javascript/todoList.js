document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('taskInput');
  const tasksList = document.getElementById('tasks');
  const footer = document.getElementById('todoFooter');

  let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function renderTasks() {
    tasksList.innerHTML = '';
    const maxVisible = 5;
    const visible = tasks.slice(0, maxVisible);

    visible.forEach(task => {
      const taskItem = document.createElement('li');
      const span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;
      taskItem.appendChild(span);
      if (task.completed) {
        taskItem.classList.add('completed');
      }
      taskItem.addEventListener('click', () => toggleTask(task.id));
      tasksList.appendChild(taskItem);
    });

    const remaining = tasks.length - visible.length;
    if (footer) {
      footer.textContent = remaining > 0 ? `+${remaining} more` : '';
    }
  }

  function addTask() {
    const text = taskInput.value.trim();
    if (text !== '') {
      tasks.unshift({ id: Date.now(), text, completed: false });
      taskInput.value = '';
      saveTasks();
      renderTasks();
    }
  }

  function toggleTask(id) {
    const taskToToggle = tasks.find(task => task.id === id);
    if (!taskToToggle) return;
    taskToToggle.completed = !taskToToggle.completed;
    saveTasks();
    renderTasks();
  }

  const addBtn = document.getElementById('addTaskBtn') || document.querySelector('.input_text button');
  addBtn?.addEventListener('click', addTask);

  taskInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  renderTasks();
});

/* FT rebind hook */
window.__ftReinitHooks = window.__ftReinitHooks || [];
window.__ftReinitHooks.push(function __ft_bindTodo(){
  const btn = document.getElementById("addTaskBtn");
  const input = document.getElementById("taskInput");
  if (!btn || !input) return;
  if (btn.dataset.ftBound === "1") return;
  btn.dataset.ftBound = "1";
  btn.addEventListener("click", () => {
    if (typeof addTask === "function") addTask();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (typeof addTask === "function") addTask();
    }
  });
});
