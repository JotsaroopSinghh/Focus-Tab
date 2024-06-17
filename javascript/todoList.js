document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('taskInput');
  const tasksList = document.getElementById('tasks');
  let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function renderTasks() {
    tasksList.innerHTML = '';
    tasks.forEach(task => {
      const taskItem = document.createElement('li');
      taskItem.textContent = task.text;
      if (task.completed) {
        taskItem.classList.add('completed');
      }

      const deleteButton = document.createElement('button');
      deleteButton.textContent = '❌';
      deleteButton.onclick = function () {
        removeTask(task);
      };

      taskItem.appendChild(deleteButton);
      taskItem.addEventListener('click', () => toggleCompleteTask(task));
      tasksList.appendChild(taskItem);
    });
  }

  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
      const task = { text: taskText, completed: false };
      tasks.push(task);
      saveTasks();
      renderTasks();
      taskInput.value = '';
    }
  }

  function removeTask(taskToRemove) {
    tasks = tasks.filter(task => task !== taskToRemove);
    saveTasks();
    renderTasks();
  }

  function toggleCompleteTask(taskToToggle) {
    taskToToggle.completed = !taskToToggle.completed;
    saveTasks();
    renderTasks();
  }

  document.querySelector('.input_text button').addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  renderTasks();
});
