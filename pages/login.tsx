import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { FiShield, FiUser } from 'react-icons/fi';

// Interface untuk user data
interface UserData {
  id: string;
  username: string;
  name: string;
  role: string;
}

export default function RoleSelector() {
  const [role, setRole] = useState<'admin' | 'user' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const token = Cookies.get('token');
    if (token) {
      // Jika sudah ada token, arahkan ke dashboard yang sesuai
      // (dengan asumsi data user ada di cookie)
      const userCookie = Cookies.get('user');
      if (userCookie) {
        const user: UserData = JSON.parse(userCookie);
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      } else {
        // Jika token ada tapi data user tidak, arahkan ke dashboard umum
        router.push('/dashboard');
      }
    }
  }, [router]);

  // Fungsi untuk menangani pemilihan role dan "login"
  const handleLogin = useCallback(async () => {
    // Validasi: role harus dipilih
    if (!role) {
      setError('Silakan pilih role terlebih dahulu');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Simulasi delay untuk proses "login"
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Buat data pengguna dan token tiruan (mock) berdasarkan role yang dipilih
      // Ini menggantikan permintaan API ke server
      const mockUserData: UserData = {
        id: role === 'admin' ? 'demo-admin-id' : 'demo-user-id',
        username: role === 'admin' ? 'admin_demo' : 'user_demo',
        name: role === 'admin' ? 'Admin Demo' : 'User Demo',
        role: role,
      };

      const mockToken = `demo-jwt-token-${Date.now()}`;

      // Simpan token dan data pengguna ke cookie
      // Cookie diatur untuk berakhir dalam 1 jam
      Cookies.set('token', mockToken, {
        expires: 1 / 24, // 1 jam
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      Cookies.set('user', JSON.stringify(mockUserData), {
        expires: 1 / 24,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Arahkan pengguna ke dashboard yang sesuai dengan role
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }

    } catch (err) {
      // Secara default, simulasi ini tidak akan gagal, tetapi kita tetap menangani error
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [role, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistem Laporan Sarpras
          </h1>
          <p className="text-gray-600">Pilih role untuk masuk ke sistem</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Pilih Role Anda <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  role === 'admin'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <FiShield className="mx-auto h-8 w-8 mb-2" />
                <span className="block text-sm font-semibold">Admin</span>
                <span className="block text-xs mt-1">Akses penuh sistem</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  role === 'user'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <FiUser className="mx-auto h-8 w-8 mb-2" />
                <span className="block text-sm font-semibold">User</span>
                <span className="block text-xs mt-1">Akses terbatas</span>
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">
              Klik pada salah satu role untuk melanjutkan.
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !role}
            className="w-full px-4 py-3 bg-primary-600 border border-transparent rounded-md text-white font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center transition-colors"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              `Masuk sebagai ${role ? role.charAt(0).toUpperCase() + role.slice(1) : '...'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}