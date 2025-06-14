// frontend/script.js

// Ganti dengan URL Worker Anda setelah dideploy.
// Misalnya: https://your-worker-name.your-username.workers.dev
// ATAU lebih baik, setelah Pages di-deploy, gunakan path relatif atau domain khusus
// Contoh: const API_BASE_URL = '/api'; (jika Anda setup Pages dengan function routing)
// Untuk pengembangan awal, kita akan menggunakan placeholder yang akan Anda ganti
const API_BASE_URL = '/api'; // *** GANTI INI NANTI ***

const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');

async function fetchTodos() {
    loadingMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    todoList.innerHTML = ''; // Clear existing list

    try {
        const response = await fetch(`${API_BASE_URL}/todos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const todos = await response.json();
        displayTodos(todos);
    } catch (error) {
        console.error('Failed to fetch todos:', error);
        errorMessage.style.display = 'block';
    } finally {
        loadingMessage.style.display = 'none';
    }
}

function displayTodos(todos) {
    if (todos.length === 0) {
        todoList.innerHTML = '<li>No to-do items yet! Add one above.</li>';
        return;
    }
    todos.forEach(todo => {
        const listItem = document.createElement('li');
        listItem.textContent = todo.text;
        // You could add delete buttons here, etc.
        todoList.appendChild(listItem);
    });
}

async function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') {
        alert('Please enter a to-do item!');
        return;
    }

    addTodoBtn.disabled = true; // Disable button to prevent double-clicks
    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        todoInput.value = ''; // Clear input
        await fetchTodos(); // Refresh the list
    } catch (error) {
        console.error('Failed to add todo:', error);
        alert('Failed to add to-do item.');
    } finally {
        addTodoBtn.disabled = false;
    }
}

// Event Listeners
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTodo();
    }
});

// Initial load
fetchTodos();
