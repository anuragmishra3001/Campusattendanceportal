const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Helper for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

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

        // Create tables if they don't exist
        const connection = await pool.getConnection();
        
        // Main attendance records table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_name VARCHAR(255) NOT NULL,
                roll_no VARCHAR(50) NOT NULL,
                course VARCHAR(100),
                section VARCHAR(50),
                mobile_no VARCHAR(20),
                event_id VARCHAR(100) NOT NULL,
                device_id VARCHAR(255),
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

        // Migration: Add device_id column if it doesn't exist
        try {
            const [columns] = await connection.query('SHOW COLUMNS FROM attendance LIKE "device_id"');
            if (columns.length === 0) {
                await connection.query('ALTER TABLE attendance ADD COLUMN device_id VARCHAR(255) AFTER event_id');
                console.log('✅ Added device_id column to attendance table');
            }
        } catch (err) {
            console.error('⚠️ Migration error (adding device_id):', err.message);
        }

        // Event sessions table to store venue location
        await connection.query(`
            CREATE TABLE IF NOT EXISTS event_sessions (
                event_id VARCHAR(100) PRIMARY KEY,
                venue_lat DECIMAL(10, 8),
                venue_lng DECIMAL(11, 8),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        connection.release();
        console.log('✅ MySQL Connected & Tables Ready');
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

// Health check endpoint for keeping the server awake
app.get('/api/ping', (req, res) => {
    res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

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
app.get('/api/token', async (req, res) => {
    const { event_id, lat, lng } = req.query;
    if (!event_id) return res.status(400).json({ error: 'event_id is required' });

    // Store event session location if provided
    if (pool && lat && lng) {
        try {
            await pool.query(
                `INSERT INTO event_sessions (event_id, venue_lat, venue_lng, is_active) 
                 VALUES (?, ?, ?, TRUE) 
                 ON DUPLICATE KEY UPDATE venue_lat = ?, venue_lng = ?, is_active = TRUE`,
                [event_id, lat, lng, lat, lng]
            );
            console.log(`📍 Venue set for ${event_id}: ${lat}, ${lng}`);
        } catch (err) {
            console.error('MySQL Error on session update:', err.message);
        }
    }

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
        device_id,
        token,
        timestamp,
        lat,
        lng,
        gps_accuracy,
        checkin_time,
        event_date
    } = req.body;

    // 1. Basic Validation
    if (!student_name || !roll_no || !event_id || !token || !timestamp || !device_id) {
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

    // 3.1 Venue Proximity Check (100m Geofence)
    if (pool) {
        try {
            const [sessions] = await pool.query(
                'SELECT venue_lat, venue_lng FROM event_sessions WHERE event_id = ? AND is_active = TRUE',
                [event_id]
            );
            
            if (sessions.length > 0) {
                const venue = sessions[0];
                const distance = calculateDistance(lat, lng, venue.venue_lat, venue.venue_lng);
                console.log(`📏 Student distance from venue: ${Math.round(distance)}m`);
                
                if (distance > 100) {
                    return res.status(403).json({ 
                        error: `Out of range. You must be within 100m of the venue. Your distance: ${Math.round(distance)}m` 
                    });
                }
            }
        } catch (err) {
            console.error('MySQL Error on venue check:', err.message);
        }
    }

    // 4. Duplicate Check (roll_no + event_id AND device_id + event_id)
    if (pool) {
        try {
            // Check for roll_no duplication
            const [existingRoll] = await pool.query(
                'SELECT id FROM attendance WHERE roll_no = ? AND event_id = ?',
                [roll_no, event_id]
            );
            if (existingRoll.length > 0) {
                return res.status(409).json({ error: 'Attendance already recorded for this event (Roll No)' });
            }

            // One Device Per Event Restriction Check
            // This prevents multiple students from using the same device for the same event
            const [existingDevice] = await pool.query(
                'SELECT id FROM attendance WHERE device_id = ? AND event_id = ?',
                [device_id, event_id]
            );
            if (existingDevice.length > 0) {
                return res.status(403).json({ error: 'This device has already been used for attendance in this event.' });
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
        return res.status(409).json({ error: 'Attendance already recorded for this event (Roll No - Memory)' });
    }

    // Check for device_id in memory fallback
    const alreadyUsedDevice = Array.from(eventRecords.values()).find(r => r.device_id === device_id);
    if (alreadyUsedDevice) {
        return res.status(403).json({ error: 'This device has already been used for attendance in this event (Memory).' });
    }

    // 5. Save to Store (full record)
    const fullRecord = {
        student_name,
        roll_no,
        course,
        section,
        mobile_no,
        event_id,
        device_id,
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
                `INSERT INTO attendance (student_name, roll_no, course, section, mobile_no, event_id, device_id, event_date, checkin_time, lat, lng, gps_accuracy, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [student_name, roll_no, course, section, mobile_no, event_id, device_id, event_date, checkin_time, lat, lng, gps_accuracy, 'verified']
            );
            console.log(`✅ Saved to MySQL: ${roll_no} (Device: ${device_id})`);
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
