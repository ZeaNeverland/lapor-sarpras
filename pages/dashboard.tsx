import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import axios from '@/utils/axios';
import { useAuth, isAdmin } from '@/utils/auth';
import { FiPlus, FiClipboard, FiCheckCircle, FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';

// Interface yang lebih spesifik untuk data
interface StatusCount {
  status: string;
  count: number;
}

interface KondisiCount {
  kondisi: string;
  count: number;
}

interface RecentLaporan {
  id: string;
  tanggal_laporan: string;
  nama_sarpras: string;
  nama_pelapor: string;
  status: 'menunggu' | 'diproses' | 'selesai';
}

interface DashboardData {
  totalLaporan: number;
  statusCount: StatusCount[];
  totalSarpras: number;
  kondisiCount: KondisiCount[];
  recentLaporan: RecentLaporan[];
}

interface UserLaporan {
  id: string;
  nama_sarpras: string;
  deskripsi: string;
  tanggal_laporan: string;
  lokasi: string;
  status: 'menunggu' | 'diproses' | 'selesai';
}

// Pindahkan fungsi-fungsi ini di luar komponen untuk mencegah pembuatan ulang
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'menunggu':
      return 'bg-yellow-100 text-yellow-800';
    case 'diproses':
      return 'bg-blue-100 text-blue-800';
    case 'selesai':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'menunggu':
      return <FiClock className="inline mr-1" />;
    case 'diproses':
      return <FiAlertCircle className="inline mr-1" />;
    case 'selesai':
      return <FiCheckCircle className="inline mr-1" />;
    default:
      return null;
  }
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userLaporan, setUserLaporan] = useState<UserLaporan[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Menggunakan useCallback untuk mencegah pembuatan ulang fungsi
  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoadingData(true);
    setError(null);

    try {
      if (isAdmin(user)) {
        const response = await axios.get('/admin/dashboard');
        setDashboardData(response.data.data);
      } else {
        const response = await axios.get(`/laporan?user_id=${user.id}`);
        setUserLaporan(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Menggunakan useMemo untuk mencegah perhitungan ulang yang tidak perlu
  const isLoading = useMemo(() => loading || (loadingData && !dashboardData && userLaporan.length === 0),
    [loading, loadingData, dashboardData, userLaporan.length]);

  const handleRefresh = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Anda belum login</h2>
            <Link href="/login" className="btn-primary">
              Login
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={handleRefresh} className="btn-primary">
              <FiRefreshCw className="inline mr-2" />
              Coba Lagi
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Refresh data"
            >
              <FiRefreshCw className="text-gray-600" />
            </button>
            {user && !isAdmin(user) && (
              <Link href="/laporan/create" className="btn-primary">
                <FiPlus className="inline mr-2" />
                Buat Laporan Baru
              </Link>
            )}
          </div>
        </div>

        {user && isAdmin(user) && dashboardData ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white shadow rounded-lg p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white" role="region" aria-label="Total laporan">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Laporan</p>
                    <p className="text-3xl font-bold mt-2">{dashboardData.totalLaporan}</p>
                  </div>
                  <FiClipboard className="text-5xl text-blue-200" aria-hidden="true" />
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white" role="region" aria-label="Laporan menunggu">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Menunggu</p>
                    <p className="text-3xl font-bold mt-2">
                      {dashboardData.statusCount.find(s => s.status === 'menunggu')?.count || 0}
                    </p>
                  </div>
                  <FiClock className="text-5xl text-yellow-200" aria-hidden="true" />
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6 bg-gradient-to-br from-blue-400 to-blue-500 text-white" role="region" aria-label="Laporan diproses">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Diproses</p>
                    <p className="text-3xl font-bold mt-2">
                      {dashboardData.statusCount.find(s => s.status === 'diproses')?.count || 0}
                    </p>
                  </div>
                  <FiAlertCircle className="text-5xl text-blue-200" aria-hidden="true" />
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6 bg-gradient-to-br from-green-500 to-green-600 text-white" role="region" aria-label="Laporan selesai">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Selesai</p>
                    <p className="text-3xl font-bold mt-2">
                      {dashboardData.statusCount.find(s => s.status === 'selesai')?.count || 0}
                    </p>
                  </div>
                  <FiCheckCircle className="text-5xl text-green-200" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Recent Laporan */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Laporan Terbaru</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sarpras
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pelapor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.recentLaporan.map((laporan) => (
                      <tr key={laporan.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(laporan.tanggal_laporan).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {laporan.nama_sarpras}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {laporan.nama_pelapor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(laporan.status)}`}>
                            {getStatusIcon(laporan.status)}
                            {laporan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link href={`/admin/laporan/${laporan.id}`} className="text-primary-600 hover:text-primary-900">
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* User Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow rounded-lg p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white" role="region" aria-label="Total laporan">
                <p className="text-primary-100 text-sm font-medium">Total Laporan Saya</p>
                <p className="text-3xl font-bold mt-2">{userLaporan.length}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white" role="region" aria-label="Laporan menunggu">
                <p className="text-yellow-100 text-sm font-medium">Menunggu</p>
                <p className="text-3xl font-bold mt-2">
                  {userLaporan.filter(l => l.status === 'menunggu').length}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6 bg-gradient-to-br from-green-500 to-green-600 text-white" role="region" aria-label="Laporan selesai">
                <p className="text-green-100 text-sm font-medium">Selesai</p>
                <p className="text-3xl font-bold mt-2">
                  {userLaporan.filter(l => l.status === 'selesai').length}
                </p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Laporan Saya</h2>
              {userLaporan.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada laporan. Buat laporan pertama Anda!</p>
                  <Link href="/laporan/create" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <FiPlus className="inline mr-2" />
                    Buat Laporan
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userLaporan.map((laporan) => (
                    <div key={laporan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{laporan.nama_sarpras}</h3>
                          <p className="text-sm text-gray-600 mt-1">{laporan.deskripsi}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(laporan.tanggal_laporan).toLocaleDateString('id-ID')} • {laporan.lokasi}
                          </p>
                        </div>
                        <span className={`ml-4 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(laporan.status)}`}>
                          {getStatusIcon(laporan.status)}
                          {laporan.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}