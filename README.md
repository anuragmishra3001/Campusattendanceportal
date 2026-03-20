# CampusCheck - QR Attendance Portal

A secure, GPS-validated attendance system for campus events.

## Features
- Dynamic QR code generation with HMAC signing.
- 60-120 second token expiry.
- GPS accuracy validation (<= 100m).
- Automatic data sync to Google Sheets via Pabbly.
- Duplicate submission prevention.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Shadcn UI.
- Backend: Node.js (Express).

## Setup
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file based on `.env.example`.
4. Run the backend: `node server.cjs`.
5. Run the frontend: `npm run dev`.
