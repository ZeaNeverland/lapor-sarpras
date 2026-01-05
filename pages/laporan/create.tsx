import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import QRScanner from '@/components/QRScanner';
import { useAuth } from '@/utils/auth';
import axios from '@/utils/axios';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';

interface SarprasData {
    id: number;
    kode_sarpras: string;
    nama_sarpras: string;
    kategori: string;
    lokasi: string;
    kondisi: string;
}

export default function CreateLaporanWithQR() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [scanning, setScanning] = useState(true);
    const [sarpras, setSarpras] = useState<SarprasData | null>(null);
    const [formData, setFormData] = useState({
        deskripsi: '',
        lokasi: '',
        tanggal_laporan: new Date().toISOString().split('T')[0],
    });
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user && !loading) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleScanSuccess = async (decodedText: string) => {
        try {
            // Fetch sarpras data based on QR code content
            const response = await axios.get(`/sarpras/qr/${decodedText}`);

            if (response.data.success) {
                setSarpras(response.data.data);
                setScanning(false);
            } else {
                setError('Sarpras tidak ditemukan');
            }
        } catch (err) {
            setError('Sarpras tidak ditemukan atau terjadi kesalahan');
            console.error('Error fetching sarpras:', err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingSubmit(true);
        setError(null);

        try {
            const response = await axios.post('/laporan', {
                sarpras_id: sarpras?.id,
                deskripsi: formData.deskripsi,
                lokasi: formData.lokasi || sarpras?.lokasi, // Use sarpras location as default
                tanggal_laporan: formData.tanggal_laporan
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal membuat laporan');
            console.error('Error creating laporan:', err);
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return null; // Redirect handled by useEffect
    }

    if (success) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                        <FiCheck className="mx-auto text-green-500 text-5xl mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Laporan Berhasil Dibuat!</h2>
                        <p className="text-gray-600 mb-6">Laporan kerusakan untuk {sarpras?.nama_sarpras} telah berhasil dikirim.</p>
                        <div className="animate-pulse">Mengalihkan ke dashboard...</div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                    >
                        <FiArrowLeft className="mr-1" /> Kembali
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Buat Laporan Kerusakan
                    </h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {error}
                        <button
                            onClick={() => {
                                setError(null);
                                setScanning(true);
                            }}
                            className="ml-4 text-red-700 underline"
                        >
                            Coba lagi
                        </button>
                    </div>
                )}

                {scanning ? (
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-4">Scan QR Code Sarpras</h2>
                        <p className="text-gray-600 mb-6">Arahkan kamera ke QR code pada sarana prasarana yang akan dilaporkan kerusakannya.</p>
                        <QRScanner
                            onScanSuccess={handleScanSuccess}
                            onScanError={(error) => setError(`Error scanning: ${error}`)}
                        />
                    </div>
                ) : sarpras ? (
                    <div className="card">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">Detail Sarpras</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Nama Sarpras</p>
                                    <p className="font-medium">{sarpras.nama_sarpras}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Kode Sarpras</p>
                                    <p className="font-medium">{sarpras.kode_sarpras}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Kategori</p>
                                    <p className="font-medium">{sarpras.kategori}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Lokasi</p>
                                    <p className="font-medium">{sarpras.lokasi}</p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold mb-4">Form Laporan Kerusakan</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi Kerusakan *
                                </label>
                                <textarea
                                    id="deskripsi"
                                    name="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Jelaskan kerusakan yang terjadi pada sarpras..."
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="lokasi" className="block text-sm font-medium text-gray-700 mb-1">
                                    Lokasi Kerusakan
                                </label>
                                <input
                                    type="text"
                                    id="lokasi"
                                    name="lokasi"
                                    value={formData.lokasi}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Lokasi spesifik kerusakan (opsional)"
                                />
                                <p className="mt-1 text-xs text-gray-500">Jika kosong, akan menggunakan lokasi sarpras: {sarpras.lokasi}</p>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="tanggal_laporan" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Laporan *
                                </label>
                                <input
                                    type="date"
                                    id="tanggal_laporan"
                                    name="tanggal_laporan"
                                    value={formData.tanggal_laporan}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setScanning(true);
                                        setSarpras(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <FiX className="inline mr-2" /> Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loadingSubmit}
                                    className="flex-1 px-4 py-2 bg-primary-600 border border-transparent rounded-md text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    {loadingSubmit ? 'Mengirim...' : 'Kirim Laporan'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : null}
            </div>
        </Layout>
    );
}