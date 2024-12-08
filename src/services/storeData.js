//Memuat variabel lingkungan dari file .env
require('dotenv').config();

const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

// Mengambil path kredensial dari variabel lingkungan yang ada di .env
const pathToServiceAccountKey = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Inisialisasi Firestore dengan menggunakan file kunci
const db = new Firestore({
  keyFilename: pathToServiceAccountKey, // Menunjukkan ke file JSON yang berisi kredensial service account
  project_id: process.env.GOOGLE_APPLICATION_CREDENTIALS, // ID proyek Firebase Anda
});

// Fungsi untuk menyimpan data ke Firestore
async function storeData(id, data) {
  try {
    // Referensi ke koleksi 'predictions' di Firestore
    const predictionsCollection = db.collection('predictions');

    // Menyimpan data ke Firestore menggunakan ID dokumen yang diberikan
    await predictionsCollection.doc(id).set(data);
    console.log('Data berhasil disimpan');
  } catch (error) {
    console.error('Terjadi kesalahan saat menyimpan data:', error);
  }
}

module.exports = storeData;