tasks.forEach((task) => {
  addTaskToDOM(task);
});

function addTask() {
  let taskInput = document.getElementById("taskInput");
  let taskText = taskInput.value.trim();
  if (taskText !== "") {
    let task = { text: taskText, completed: false };
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    addTaskToDOM(task);
    taskInput.value = "";
  }
}

function addTaskToDOM(task) {
  let tasksList = document.getElementById("tasks");
  let taskItem = document.createElement("li");
  taskItem.textContent = task.text;
  if (task.completed) {
    taskItem.classList.add("completed");
  }
  let deleteButton = document.createElement("button");
  deleteButton.textContent = "❌";
  deleteButton.onclick = function () {
    removeTask(task);
    tasksList.removeChild(taskItem);
  };
  taskItem.appendChild(deleteButton);
  tasksList.appendChild(taskItem);
}

function removeTask(taskToRemove) {
  tasks = tasks.filter((task) => task !== taskToRemove);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

 function checkTodoWindowSize() {
        const todoWidget = document.getElementById("todo-list");
        const todoTitle = document.getElementById("todo-title");
        const closeButton = document.getElementById("todo-close-btn");
        if (window.innerWidth <= 1000) {
          todoWidget.style.display = "none";
          todoTitle.style.display = "block";
          closeButton.style.display = "block";
        } else {
          todoWidget.style.display = "block";
          todoTitle.style.display = "none";
          closeButton.style.display = "none";
        }
      }

      function centerTodoWidget() {
        const todoWidget = document.getElementById("todo-list");
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const widgetWidth = todoWidget.offsetWidth;
        const widgetHeight = todoWidget.offsetHeight;
        const left = (windowWidth - widgetWidth) / 2;
        const top = (windowHeight - widgetHeight) / 2;

        todoWidget.style.left = `${left}px`;
        todoWidget.style.top = `${top}px`;
      }

      window.addEventListener("resize", checkTodoWindowSize);
      window.addEventListener("load", checkTodoWindowSize);

      document.getElementById("todo-title").addEventListener("click", () => {
        const todoWidget = document.getElementById("todo-list");
        const todoTitle = document.getElementById("todo-title");
        todoWidget.style.display = "block";
        todoTitle.style.display = "none";
        centerTodoWidget();
      });

      document
        .getElementById("todo-close-btn")
        .addEventListener("click", () => {
          const todoWidget = document.getElementById("todo-list");
          const todoTitle = document.getElementById("todo-title");
          todoWidget.style.display = "none";
          todoTitle.style.display = "block";
        });

      window.addEventListener("load", centerTodoWidget);
      window.addEventListener("resize", centerTodoWidget);