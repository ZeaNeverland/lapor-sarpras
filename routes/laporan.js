const express = require('express');
const router = express.Router();
const db = require('../config/database');
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');

// Get all laporan (with filters)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, user_id } = req.query;

    let query = db.from('laporan').select(`
      laporan.*, 
      sarpras!inner(nama_sarpras, kode_sarpras), 
      users!inner(nama as nama_pelapor)
    `).order('created_at', { ascending: false });

    if (status) {
      query = query.eq('laporan.status', status);
    }

    if (user_id) {
      query = query.eq('laporan.user_id', user_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching laporan:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching data' });
  }
});

// Get laporan by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await db.from('laporan').select(`
      laporan.*, 
      sarpras!inner(nama_sarpras, kode_sarpras, kategori), 
      users!inner(nama as nama_pelapor, email)
    `).eq('laporan.id', req.params.id).single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found in Supabase
        return res.status(404).json({ success: false, message: 'Laporan not found' });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching laporan:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching data' });
  }
});

// Create laporan
router.post('/', authMiddleware, upload.single('foto'), async (req, res) => {
  try {
    const { sarpras_id, deskripsi, lokasi, tanggal_laporan } = req.body;
    const foto = req.file ? req.file.filename : null;
    const user_id = req.user.id;

    const { data, error } = await db.from('laporan').insert({
      sarpras_id,
      user_id,
      deskripsi,
      lokasi,
      foto,
      tanggal_laporan
    }).select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Laporan created successfully',
      id: data[0].id
    });
  } catch (error) {
    console.error('Error creating laporan:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating laporan' });
  }
});

// Update laporan status (for users to update their own report)
router.put('/:id', authMiddleware, upload.single('foto'), async (req, res) => {
  try {
    const { deskripsi, lokasi, tanggal_laporan } = req.body;
    const foto = req.file ? req.file.filename : null;

    // Check if laporan belongs to user
    const { data: existing, error: existingError } = await db.from('laporan').select('*').eq('id', req.params.id).eq('user_id', req.user.id).single();

    if (existingError || !existing) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updateData = {
      deskripsi,
      lokasi,
      tanggal_laporan
    };

    if (foto) {
      updateData.foto = foto;
    }

    const { error } = await db.from('laporan').update(updateData).eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Laporan updated successfully' });
  } catch (error) {
    console.error('Error updating laporan:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating laporan' });
  }
});

// Delete laporan (only own reports)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if laporan belongs to user or user is admin
    const { data: existing, error: existingError } = await db.from('laporan').select('*').eq('id', req.params.id).single();

    if (existingError || !existing) {
      return res.status(404).json({ success: false, message: 'Laporan not found' });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { error } = await db.from('laporan').delete().eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Laporan deleted successfully' });
  } catch (error) {
    console.error('Error deleting laporan:', error);
    res.status(500).json({ success: false, message: error.message || 'Error deleting laporan' });
  }
});

module.exports = router;
