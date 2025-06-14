// worker-backend/src/index.js

/**
 * Tipe Env.
 * @typedef {Object} Env
 * @property {KVNamespace} TODO_LIST_DATA - Namespace KV yang telah kita buat.
 */

/**
 * Objek Handler untuk permintaan HTTP.
 */
export default {
    /**
     * Fungsi fetch yang akan dipanggil untuk setiap permintaan.
     * @param {Request} request - Objek permintaan masuk.
     * @param {Env} env - Objek lingkungan dengan variabel dan binding.
     * @returns {Promise<Response>} Objek respons.
     */
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        // Log untuk debugging di Cloudflare Workers Dashboard
        console.log(`Request: ${method} ${path}`);

        try {
            // Route untuk mengambil semua to-do items
            if (path === '/todos' && method === 'GET') {
                return await handleGetTodos(env);
            }

            // Route untuk menambahkan to-do item baru
            if (path === '/todos' && method === 'POST') {
                return await handleAddTodo(request, env);
            }

            // Route default untuk permintaan yang tidak cocok
            return new Response('Not Found', { status: 404 });

        } catch (error) {
            console.error('Error in Worker:', error);
            return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
        }
    },
};

/**
 * Menangani permintaan GET /todos.
 * Mengambil semua to-do dari KV.
 * @param {Env} env
 * @returns {Promise<Response>}
 */
async function handleGetTodos(env) {
    // Mendapatkan semua kunci dari KV namespace
    const { keys } = await env.TODO_LIST_DATA.list();
    const todos = [];

    // Loop melalui kunci dan ambil nilai (item to-do)
    for (const key of keys) {
        const todoItem = await env.TODO_LIST_DATA.get(key.name);
        if (todoItem) {
            todos.push({ id: key.name, text: todoItem });
        }
    }

    // Urutkan berdasarkan ID (yang merupakan timestamp) agar yang terbaru di atas
    todos.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    return new Response(JSON.stringify(todos), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // Penting untuk CORS dari frontend
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

/**
 * Menangani permintaan POST /todos.
 * Menambahkan to-do baru ke KV.
 * @param {Request} request
 * @param {Env} env
 * @returns {Promise<Response>}
 */
async function handleAddTodo(request, env) {
    // Pastikan ini adalah preflight request untuk CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400', // Cache preflight request selama 24 jam
            },
        });
    }

    const todoData = await request.json();
    const todoText = todoData.text;

    if (!todoText) {
        return new Response('Missing "text" in request body', { status: 400 });
    }

    // Gunakan timestamp sebagai ID unik untuk item to-do
    const todoId = Date.now().toString();

    // Simpan to-do item di KV
    await env.TODO_LIST_DATA.put(todoId, todoText);

    return new Response(JSON.stringify({ id: todoId, text: todoText }), {
        status: 201, // Created
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // Penting untuk CORS dari frontend
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
