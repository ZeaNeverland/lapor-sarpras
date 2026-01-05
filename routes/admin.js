const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get dashboard statistics
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Total laporan
    const { count: totalLaporan, error: countError } = await db.from('laporan').select('*', { count: 'exact' });
    if (countError) throw countError;

    // Laporan by status
    const { data: statusCount, error: statusError } = await db.from('laporan').select('status, count(*)').group('status');
    if (statusError) throw statusError;

    // Total sarpras
    const { count: totalSarpras, error: sarprasCountError } = await db.from('sarpras').select('*', { count: 'exact' });
    if (sarprasCountError) throw sarprasCountError;

    // Sarpras by kondisi
    const { data: kondisiCount, error: kondisiError } = await db.from('sarpras').select('kondisi, count(*)').group('kondisi');
    if (kondisiError) throw kondisiError;

    // Recent laporan
    const { data: recentLaporan, error: recentError } = await db.from('laporan').select(`
      laporan.*, 
      sarpras!inner(nama_sarpras), 
      users!inner(nama as nama_pelapor)
    `).order('created_at', { ascending: false }).limit(10);
    if (recentError) throw recentError;

    res.json({
      success: true,
      data: {
        totalLaporan,
        statusCount,
        totalSarpras,
        kondisiCount,
        recentLaporan
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching data' });
  }
});

// Update laporan status (Admin only)
router.patch('/laporan/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, catatan_admin } = req.body;

    const { error } = await db.from('laporan').update({
      status,
      catatan_admin: catatan_admin || null
    }).eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating status' });
  }
});

// Get all users (Admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data: users, error } = await db.from('users').select('id, username, nama, email, role, created_at');

    if (error) throw error;

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching data' });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id == req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const { error } = await db.from('users').delete().eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: error.message || 'Error deleting user' });
  }
});

module.exports = router;
