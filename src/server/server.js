require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

(async () => {
    // Inisialisasi server
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'], // Mengizinkan semua origin untuk CORS
            },
        },
    });

    // Memuat model dan menyimpannya ke dalam konteks aplikasi
    try {
        const model = await loadModel();
        server.app.model = model;
    } catch (error) {
        console.error('Error loading model:', error.message);
        process.exit(1); // Menghentikan aplikasi jika gagal memuat model
    }

    // Menambahkan rute
    server.route(routes);

    // Middleware untuk menangani error dan memberikan respon custom
    server.ext('onPreResponse', (request, h) => {
        const response = request.response;

        // Menangani error payload yang terlalu besar
        if (response.isBoom && response.output.statusCode === 413) {
            return h.response({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000',
            }).code(413);
        }

        // Menangani error spesifik dari InputError
        if (response instanceof InputError) {
            return h.response({
                status: 'fail',
                message: `${response.message} Silakan gunakan foto lain.`,
            }).code(response.statusCode);
        }

        // Menangani error prediksi yang gagal
        if (response.isBoom && response.output.statusCode === 400) {
            return h.response({
                status: 'fail',
                message: 'Terjadi kesalahan dalam melakukan prediksi',
            }).code(400);
        }

        // Menangani error umum lainnya
        if (response.isBoom) {
            return h.response({
                status: 'fail',
                message: response.message || 'An unknown error occurred.',
            }).code(response.output.statusCode);
        }

        // Melanjutkan jika tidak ada error
        return h.continue;
    });

    // Memulai server
    try {
        await server.start();
        console.log(`Server started at: ${server.info.uri}`);
    } catch (error) {
        console.error('Error starting server:', error.message);
    }
})();
