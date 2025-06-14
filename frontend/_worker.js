// frontend/_worker.js
// Ini adalah entry point untuk Pages Functions.
// Kita akan menggunakan ini untuk me-rewrite permintaan API ke Worker backend kita yang terpisah.

import worker_backend from '../worker-backend/src/index';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Jika permintaan adalah untuk jalur /api/todos, teruskan ke worker-backend kita
        if (url.pathname.startsWith('/api/todos')) {
            // Modifikasi URL agar cocok dengan rute Worker backend
            url.pathname = url.pathname.replace('/api', ''); // Menghapus '/api'
            const modifiedRequest = new Request(url.toString(), request);

            // Teruskan permintaan ke worker_backend yang diimpor
            return worker_backend.fetch(modifiedRequest, env);
        }

        // Jika bukan permintaan API, biarkan Pages melayani aset statis
        return env.ASSETS.fetch(request);
    },
};
