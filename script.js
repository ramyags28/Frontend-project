
document.addEventListener("DOMContentLoaded", function () {

    // 1. NAVIGATION
    function navigateTo(page) {
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        document.querySelectorAll(".nav-link").forEach(a => a.classList.remove("active"));
        document.getElementById(page).classList.add("active");
        document.querySelector(`[href="#${page}"]`).classList.add("active");
        document.getElementById("page-title").textContent =
            page.charAt(0).toUpperCase() + page.slice(1);
    }

    window.navigateTo = navigateTo;

    document.querySelectorAll(".nav-link").forEach(link => {
        link.onclick = e => {
            e.preventDefault();
            navigateTo(link.getAttribute("href").slice(1));
        };
    });

    // 2. TASK MANAGEMENT
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let filter = "all";

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function showTasks() {
        let list = document.getElementById("task-list");
        list.innerHTML = "";

        tasks.forEach((task, i) => {
            if (filter === "pending" && task.completed) return;
            if (filter === "completed" && !task.completed) return;

            list.innerHTML += `
                <div class="task-item ${task.completed ? "completed" : ""}">
                    <input type="checkbox" ${task.completed ? "checked" : ""}
                    onchange="completeTask(${i})">
                    <div class="task-info"><h3>${task.name}</h3></div>
                    <span class="priority ${task.priority}">${task.priority}</span>
                    <button class="delete-btn" onclick="deleteTask(${i})">✕</button>
                </div>`;
        });

        updateStats();
    }

    window.completeTask = function (i) {
        tasks[i].completed = !tasks[i].completed;
        saveTasks();
        showTasks();
    };

    window.deleteTask = function (i) {
        tasks.splice(i, 1);
        saveTasks();
        showTasks();
    };

    document.getElementById("task-form").onsubmit = function (e) {
        e.preventDefault();

        let name = document.getElementById("task-input").value.trim();
        if (!name) return alert("Enter a task!");

        tasks.push({
            name: name,
            priority: document.getElementById("task-priority").value,
            completed: false
        });

        document.getElementById("task-input").value = "";
        saveTasks();
        showTasks();
    };

    // 3. TASK FILTERS
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.onclick = function () {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            filter = button.dataset.filter;
            showTasks();
        };
    });

    // 4. DASHBOARD STATISTICS
    function updateStats() {
        let total = tasks.length;
        let completed = tasks.filter(t => t.completed).length;
        let percent = total ? Math.round(completed / total * 100) : 0;

        document.getElementById("total-tasks").textContent = total;
        document.getElementById("completed-tasks").textContent = completed;
        document.getElementById("productivity").textContent = percent + "%";
        document.getElementById("analytics-completed").textContent = completed;
        document.getElementById("analytics-rate").textContent = percent + "%";
        document.getElementById("progress-text").textContent =
            `Completed ${completed} out of ${total} tasks`;
        document.getElementById("progress-fill").style.width = percent + "%";

        let upcoming = document.getElementById("dashboard-task-list");
        upcoming.innerHTML = "";

        tasks.filter(t => !t.completed).slice(0, 3).forEach(task => {
            upcoming.innerHTML += `<p>📌 ${task.name}</p>`;
        });
    }

    // 5. FOCUS TIMER
    let time = 25 * 60;
    let timer = null;
    let mode = "focus";
    let sessions = Number(localStorage.getItem("sessions")) || 0;

    function displayTime() {
        let min = Math.floor(time / 60);
        let sec = time % 60;
        document.getElementById("timer").textContent =
            String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
    }

    document.getElementById("start-timer").onclick = function () {
        if (timer) return;

        timer = setInterval(function () {
            if (time > 0) {
                time--;
                displayTime();
            } else {
                clearInterval(timer);
                timer = null;

                if (mode === "focus") {
                    sessions++;
                    localStorage.setItem("sessions", sessions);
                    document.getElementById("focus-sessions").textContent = sessions;
                    document.getElementById("analytics-focus").textContent = sessions;
                }

                document.getElementById("timer-status").textContent = "Timer completed!";
                alert("Timer completed!");
            }
        }, 1000);
    };

    document.getElementById("pause-timer").onclick = function () {
        clearInterval(timer);
        timer = null;
        document.getElementById("timer-status").textContent = "Timer paused.";
    };

    document.getElementById("reset-timer").onclick = function () {
        clearInterval(timer);
        timer = null;
        time = 25 * 60;
        displayTime();
    };

    document.querySelectorAll(".timer-options button").forEach(button => {
        button.onclick = function () {
            clearInterval(timer);
            timer = null;
            time = Number(button.dataset.minutes) * 60;
            mode = button.dataset.mode;
            displayTime();
        };
    });

    // 6. PROFILE SETTINGS
    let name = localStorage.getItem("name") || "Ramya";

    function updateProfile() {
        document.getElementById("profile-name").textContent = name;
        document.getElementById("avatar").textContent = name[0].toUpperCase();
        document.getElementById("welcome-title").textContent = "Good morning, " + name + "! 👋";
    }

    document.getElementById("username").value = name;
    updateProfile();

    document.getElementById("save-profile").onclick = function () {
        name = document.getElementById("username").value.trim();
        if (!name) return alert("Enter your name!");
        localStorage.setItem("name", name);
        updateProfile();
        alert("Profile saved!");
    };

    // 7. LIGHT MODE
    let light = document.getElementById("light-mode");
    light.checked = localStorage.getItem("theme") === "light";
    document.body.classList.toggle("light-mode", light.checked);

    light.onchange = function () {
        document.body.classList.toggle("light-mode", light.checked);
        localStorage.setItem("theme", light.checked ? "light" : "dark");
    };

    // 8. NOTIFICATION PREFERENCE
    let notification = document.getElementById("notifications");
    notification.checked = localStorage.getItem("notifications") === "true";

    notification.onchange = function () {
        localStorage.setItem("notifications", notification.checked);
    };

    // 9. INITIALIZE
    showTasks();
    displayTime();
    document.getElementById("focus-sessions").textContent = sessions;
    document.getElementById("analytics-focus").textContent = sessions;

});
