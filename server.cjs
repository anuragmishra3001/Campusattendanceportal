const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key_here';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const PABBLY_WEBHOOK_URL = process.env.PABBLY_WEBHOOK_URL || 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjcwNTZmMDYzMjA0M2M1MjY0NTUzNDUxM2Ii_pc';

// In-memory storage: Map<eventId, Map<roll_no, fullRecord>>
const attendanceStore = new Map();

// Helper to generate HMAC
const generateHMAC = (data) => {
    return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
};

// --- API Routes ---

// Route to verify admin password
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Route to check attendance status
app.get('/api/attendance/status', (req, res) => {
    const { roll_no, event_id } = req.query;
    if (!roll_no || !event_id) {
        return res.status(400).json({ error: 'roll_no and event_id are required' });
    }

    const eventRecords = attendanceStore.get(event_id);
    if (eventRecords && eventRecords.has(roll_no)) {
        res.json({ found: true, message: 'Attendance Verified ✅' });
    } else {
        res.json({ found: false, message: 'Attendance Not Found ❌' });
    }
});

// Route to get all records for an event (Admin Dashboard calls this)
app.get('/api/admin/records', (req, res) => {
    const { event_id, password } = req.query;
    
    // Simple protection: must provide admin password
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!event_id) {
        return res.status(400).json({ error: 'event_id is required' });
    }

    const eventRecordsMap = attendanceStore.get(event_id);
    const records = eventRecordsMap ? Array.from(eventRecordsMap.values()) : [];
    
    res.json({ records });
});

// Route to get a signed token (Admin calls this)
app.get('/api/token', (req, res) => {
    const { event_id } = req.query;
    if (!event_id) return res.status(400).json({ error: 'event_id is required' });

    const timestamp = Date.now();
    const payload = `${event_id}:${timestamp}`;
    const signature = generateHMAC(payload);
    const token = `${timestamp}.${signature}`;

    res.json({ token, timestamp });
});

// Route to submit attendance (Student calls this)
app.post('/api/attendance', async (req, res) => {
    const {
        student_name,
        roll_no,
        course,
        section,
        mobile_no,
        event_id,
        token,
        timestamp,
        lat,
        lng,
        gps_accuracy,
        checkin_time,
        event_date
    } = req.body;

    // 1. Basic Validation
    if (!student_name || !roll_no || !event_id || !token || !timestamp) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Token Validation (HMAC + Expiry)
    const payload = `${event_id}:${timestamp}`;
    const expectedSignature = generateHMAC(payload);
    const [ts, signature] = token.split('.');

    if (signature !== expectedSignature || ts !== timestamp.toString()) {
        return res.status(401).json({ error: 'Invalid token signature' });
    }

    const age = (Date.now() - timestamp) / 1000;
    if (age > 120) {
        return res.status(401).json({ error: 'Token expired' });
    }

    // 3. GPS Validation (Accuracy <= 100m)
    if (gps_accuracy > 100) {
        return res.status(400).json({ error: 'GPS accuracy too low' });
    }

    // 4. Duplicate Check (roll_no + event_id)
    if (!attendanceStore.has(event_id)) {
        attendanceStore.set(event_id, new Map());
    }
    const eventRecords = attendanceStore.get(event_id);
    if (eventRecords.has(roll_no)) {
        return res.status(409).json({ error: 'Attendance already recorded for this event' });
    }

    // 5. Save to Store (full record)
    const fullRecord = {
        student_name,
        roll_no,
        course,
        section,
        mobile_no,
        event_id,
        event_date,
        checkin_time,
        lat,
        lng,
        gps_accuracy,
        status: 'verified'
    };
    eventRecords.set(roll_no, fullRecord);

    // 6. Send to Pabbly Webhook (Async)
    const pabblyData = fullRecord;

    // Return success immediately to student
    res.json({ success: true, message: 'Attendance recorded successfully' });

    // Send to Pabbly in the background
    try {
        if (PABBLY_WEBHOOK_URL && PABBLY_WEBHOOK_URL !== 'YOUR_PABBLY_WEBHOOK_URL_HERE') {
            await axios.post(PABBLY_WEBHOOK_URL, pabblyData);
            console.log(`Sent to Pabbly for ${roll_no}`);
        } else {
            console.log('Pabbly Webhook URL not set. Data:', pabblyData);
        }
    } catch (err) {
        console.error('Error sending to Pabbly:', err.message);
    }
});

// --- Production Frontend Serving ---

// If in production, serve the 'dist' folder
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    
    // Handle SPA routing: send index.html for any unknown route
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    if (process.env.NODE_ENV === 'production') {
        console.log('Serving frontend from /dist');
    }
});
