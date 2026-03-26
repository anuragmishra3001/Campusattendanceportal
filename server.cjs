const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key_here';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const PABBLY_WEBHOOK_URL = process.env.PABBLY_WEBHOOK_URL || 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjcwNTZmMDYzMjA0M2M1MjY0NTUzNDUxM2Ii_pc';

// --- MySQL Database Setup ---
let pool;
const initDB = async () => {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'attendance_db',
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            ssl: {
                rejectUnauthorized: false
            }
        });

        // Create table if it doesn't exist
        const connection = await pool.getConnection();
        await connection.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_name VARCHAR(255) NOT NULL,
                roll_no VARCHAR(50) NOT NULL,
                course VARCHAR(100),
                section VARCHAR(50),
                mobile_no VARCHAR(20),
                event_id VARCHAR(100) NOT NULL,
                event_date DATE,
                checkin_time TIME,
                lat DECIMAL(10, 8),
                lng DECIMAL(11, 8),
                gps_accuracy DECIMAL(10, 2),
                status VARCHAR(20) DEFAULT 'verified',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_attendance (roll_no, event_id)
            )
        `);
        connection.release();
        console.log('✅ MySQL Connected & Table Ready');
    } catch (err) {
        console.error('❌ MySQL Connection Failed:', err.message);
        console.log('⚠️ Falling back to In-Memory storage only');
    }
};
initDB();

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
app.get('/api/attendance/status', async (req, res) => {
    const { roll_no, event_id } = req.query;
    if (!roll_no || !event_id) {
        return res.status(400).json({ error: 'roll_no and event_id are required' });
    }

    // Try MySQL first
    if (pool) {
        try {
            const [rows] = await pool.query(
                'SELECT id FROM attendance WHERE roll_no = ? AND event_id = ?',
                [roll_no, event_id]
            );
            if (rows.length > 0) {
                return res.json({ found: true, message: 'Attendance Verified ✅' });
            }
        } catch (err) {
            console.error('MySQL Error on status check:', err.message);
        }
    }

    // Fallback to In-Memory
    const eventRecords = attendanceStore.get(event_id);
    if (eventRecords && eventRecords.has(roll_no)) {
        res.json({ found: true, message: 'Attendance Verified ✅' });
    } else {
        res.json({ found: false, message: 'Attendance Not Found ❌' });
    }
});

// Route to get all records for an event (Admin Dashboard calls this)
app.get('/api/admin/records', async (req, res) => {
    const { event_id, password } = req.query;
    
    // Simple protection: must provide admin password
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!event_id) {
        return res.status(400).json({ error: 'event_id is required' });
    }

    // Try fetching from MySQL first
    if (pool) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM attendance WHERE event_id = ? ORDER BY created_at DESC',
                [event_id]
            );
            return res.json({ records: rows, source: 'database' });
        } catch (err) {
            console.error('MySQL Error on fetch:', err.message);
        }
    }

    // Fallback to In-Memory
    const eventRecordsMap = attendanceStore.get(event_id);
    const records = eventRecordsMap ? Array.from(eventRecordsMap.values()) : [];
    res.json({ records, source: 'memory' });
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
    if (pool) {
        try {
            const [existing] = await pool.query(
                'SELECT id FROM attendance WHERE roll_no = ? AND event_id = ?',
                [roll_no, event_id]
            );
            if (existing.length > 0) {
                return res.status(409).json({ error: 'Attendance already recorded for this event (DB)' });
            }
        } catch (err) {
            console.error('MySQL Error on duplicate check:', err.message);
        }
    }

    if (!attendanceStore.has(event_id)) {
        attendanceStore.set(event_id, new Map());
    }
    const eventRecords = attendanceStore.get(event_id);
    if (eventRecords.has(roll_no)) {
        return res.status(409).json({ error: 'Attendance already recorded for this event (Memory)' });
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

    // Save to MySQL first
    if (pool) {
        try {
            await pool.query(
                `INSERT INTO attendance (student_name, roll_no, course, section, mobile_no, event_id, event_date, checkin_time, lat, lng, gps_accuracy, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [student_name, roll_no, course, section, mobile_no, event_id, event_date, checkin_time, lat, lng, gps_accuracy, 'verified']
            );
            console.log(`✅ Saved to MySQL: ${roll_no}`);
        } catch (err) {
            console.error('❌ Failed to save to MySQL:', err.message);
        }
    }

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
