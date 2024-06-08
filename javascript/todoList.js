// Display the saved tasks
tasks.forEach((task) => {
  addTaskToDOM(task);
});

// Function to add a task
function addTask() {
  let taskInput = document.getElementById("taskInput");
  let taskText = taskInput.value.trim();
  if (taskText !== "") {
    let task = { text: taskText, completed: false };
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    addTaskToDOM(task);
    taskInput.value = ""; // Clear the input field
  }
}

// Function to add a task to the DOM
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

// Function to remove a task
function removeTask(taskToRemove) {
  tasks = tasks.filter((task) => task !== taskToRemove);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
