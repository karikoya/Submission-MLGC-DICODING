const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
    try {
        // Decode dan preprocess gambar
        const tensor = tf.node
            .decodeJpeg(image)
            .resizeNearestNeighbor([224, 224]) // Ubah ukuran gambar menjadi 224x224
            .expandDims() // Tambahkan dimensi batch
            .toFloat(); // Konversi ke tipe float

        // Prediksi menggunakan model
        const prediction = model.predict(tensor);
        const score = await prediction.data(); // Ambil hasil prediksi sebagai array
        const confidenceScore = Math.max(...score) * 100; // Hitung skor kepercayaan tertinggi

        // Klasifikasi hasil
        const classes = ["Cancer", "Non-cancer"];
        const classResult = confidenceScore > 50 ? 0 : 1; // Tentukan hasil berdasarkan confidence score
        const label = classes[classResult];

        // Berikan saran berdasarkan hasil prediksi
        let suggestion;
        if (label === "Cancer") {
            suggestion = "Segera periksa ke dokter!";
        } else {
            suggestion = "Penyakit kanker tidak terdeteksi.";
        }

        // Kembalikan hasil prediksi dan saran
        return { label, suggestion };
    } catch (error) {
        // Tangani error untuk payload terlalu besar
        if (error.message.includes('Payload content length greater than maximum allowed')) {
            return {
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000',
                code: 413, // Status HTTP untuk "Payload Too Large"
            };
        }

        // Tangani error lainnya dengan custom InputError
        throw new InputError("Terjadi kesalahan dalam melakukan prediksi", 400);
    }
}

module.exports = predictClassification;
