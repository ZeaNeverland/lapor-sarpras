const express = require('express');
const router = express.Router();
const db = require('../config/database');
const QRCode = require('qrcode');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all sarpras
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = db.from('sarpras').select('*').order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching sarpras:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching data' });
  }
});

// Get sarpras by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await db.from('sarpras').select('*').eq('id', req.params.id).single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found in Supabase
        return res.status(404).json({ success: false, message: 'Sarpras not found' });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching sarpras:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching data' });
  }
});

// Get sarpras by QR code
router.get('/qr/:kode', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await db.from('sarpras').select('*').eq('kode_sarpras', req.params.kode).single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found in Supabase
        return res.status(404).json({ success: false, message: 'Sarpras not found' });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching sarpras:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching data' });
  }
});

// Create sarpras (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { kode_sarpras, nama_sarpras, kategori, lokasi, kondisi } = req.body;

    // Generate QR Code
    const qrCodeData = await QRCode.toDataURL(kode_sarpras);

    const { data, error } = await db.from('sarpras').insert({
      kode_sarpras,
      nama_sarpras,
      kategori,
      lokasi,
      kondisi: kondisi || 'baik',
      qr_code: qrCodeData
    }).select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Sarpras created successfully',
      id: data[0].id
    });
  } catch (error) {
    console.error('Error creating sarpras:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating sarpras' });
  }
});

// Update sarpras (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { nama_sarpras, kategori, lokasi, kondisi } = req.body;

    const { error } = await db.from('sarpras').update({
      nama_sarpras,
      kategori,
      lokasi,
      kondisi
    }).eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Sarpras updated successfully' });
  } catch (error) {
    console.error('Error updating sarpras:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating sarpras' });
  }
});

// Delete sarpras (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = await db.from('sarpras').delete().eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Sarpras deleted successfully' });
  } catch (error) {
    console.error('Error deleting sarpras:', error);
    res.status(500).json({ success: false, message: error.message || 'Error deleting sarpras' });
  }
});

module.exports = router;
