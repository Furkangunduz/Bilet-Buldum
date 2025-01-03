import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.status(200).json({ status: 'OK', message: 'Everything is working fine' });
  } catch (error) {
    res.status(400).json({ error: 'Error fetching healthcheck' });
  }
});

export default router;
