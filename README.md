# CertifAI Mobile

React Native (Expo) mobile app for the CertifAI file certification platform.

## What is CertifAI?

CertifAI solves one of the biggest unsolved problems in the AI era:

> **"Is this real, or was it generated/manipulated?"**

The core insight: instead of trying to *detect fakes* (a cat-and-mouse game), CertifAI *proves what's real*. Anything without a provenance certificate is treated as unverified. The burden shifts — exactly like HTTPS flipped web security.

### The trust chain

```
Capture → Hash on device → Register → Upload → Verify → Certificate
```

At capture moment, the app cryptographically certifies:
- The file hash (integrity — file wasn't altered after capture)
- GPS coordinates + timestamp
- Device info (model, OS version, device ID)

The output is a provenance certificate that answers:
*"This file was captured on a real device at this place and time and has not been modified since."*

---

## Market Context

| Customer | Pain | Price |
|---|---|---|
| Insurance companies | AI fraud claims ($40B/year in US) | $2-5k/month |
| Law firms | Evidence integrity in court | $1-3k/month |
| News agencies | Photo/video authenticity | $5-15k/month |
| Healthcare platforms | Medical image integrity | Enterprise |
| HR/compliance | Document authenticity | Per-use API |

### Why this beats deepfake detection

Deepfake detection is reactive — models get better, detectors get better, forever. CertifAI is proactive — you don't need to detect fakes, you verify what's real. Same insight that made HTTPS work.

---

## Roadmap

### Phase 1 — Now (MVP)
- ✅ React Native mobile app (Expo)
- ✅ Camera capture with GPS + device metadata
- ✅ SHA-256 hashing on device before upload
- ✅ Two-step certification flow (register → upload)
- ✅ Certificate display screen
- ✅ Python + FastAPI backend ([certifai-backend](https://github.com/pokkermp3/certifai-backend))

### Phase 2 — SDK + API
- React Native SDK (npm package) for third-party integration
- C2PA compliance (Coalition for Content Provenance and Authenticity)
- API: POST /certify → returns C2PA certificate ($0.10/certificate)
- Hardware attestation (Android StrongBox)

### Phase 3 — Expand
- Legal (court-admissible evidence)
- HR/investigation documentation
- Seed round with insurance pilots as proof

---

## Tech Stack

```
Mobile:   React Native (Expo SDK 55) + TypeScript
Backend:  Python 3.12 + FastAPI (see certifai-backend repo)
Database: SQLite (MVP) → PostgreSQL (production)
Storage:  Local filesystem (MVP) → S3 (production)
Deploy:   Expo Go (dev) → EAS Build (production)
```

---

## Architecture

```
certifai-mobile/
├── App.tsx                    # Navigation setup
│
├── src/
│   ├── types/
│   │   └── certificate.ts     # TypeScript interfaces
│   │
│   ├── services/
│   │   ├── api.ts             # HTTP client → backend
│   │   └── certify.ts         # Hashing + certification logic
│   │
│   ├── hooks/
│   │   ├── useCamera.ts       # Camera permissions + capture
│   │   └── useCertify.ts      # Certification state machine
│   │
│   └── screens/
│       ├── HomeScreen.tsx     # Home + recent certificates list
│       ├── CameraScreen.tsx   # Camera capture UI
│       └── CertificateScreen.tsx # Certificate detail view
```

### Design pattern: Screen → Hook → Service

- **Screens** contain only UI — no logic
- **Hooks** manage state and orchestrate services
- **Services** handle all external communication (camera, API, hashing)

---

## How the certification flow works

### Step 1 — Hash on device
```
Photo captured → expo-file-system reads raw bytes
             → expo-crypto computes SHA-256
             → hash stored in memory
```

### Step 2 — Register capture
```
POST /api/v1/certificates
Body: { id, file_name, file_size, mime_type,
        device_hash, captured_at,
        gps_lat, gps_lon, gps_accuracy,
        device_id, device_model, os_version, app_version }
Returns: { certificate_id }
```

### Step 3 — Upload file
```
POST /api/v1/certificates/{id}/upload
Body: multipart/form-data (the actual photo)
Returns: { hash_verified, server_hash, device_hash,
           status, pdf_url, file_url }
```

If `hash_verified = true` → the hash the phone computed matches
what the server computed from the uploaded file. The file is certified.

---

## Setup

### Requirements

- Node.js 20+
- Expo Go app on your Android/iOS device
- Backend running ([certifai-backend](https://github.com/pokkermp3/certifai-backend))

### Install

```bash
git clone https://github.com/pokkermp3/certifai-mobile
cd certifai-mobile
npm install
```

### Configure backend URL

Edit `src/services/api.ts`:

```typescript
const BASE_URL = 'http://YOUR_BACKEND_IP:8080/api/v1';
```

To find your IP:
```bash
hostname -I | awk '{print $1}'
```

### Run

```bash
npx expo start --go
```

Scan the QR code with Expo Go on your phone.

> **Note:** Your phone and computer must be on the same network.
> On university/corporate WiFi use: `npx expo start --go --tunnel`
> Or connect your computer to your phone's hotspot.

---

## Dependencies

| Package | Purpose |
|---|---|
| `expo-camera` | Hardware camera access |
| `expo-location` | GPS coordinates at capture |
| `expo-device` | Device model, OS, ID |
| `expo-crypto` | SHA-256 hashing on device |
| `expo-file-system/legacy` | Read file bytes for hashing |
| `@react-navigation/native` | Screen navigation |
| `@react-navigation/native-stack` | Stack navigator |

---

## Related

- **Backend repo:** [certifai-backend](https://github.com/pokkermp3/certifai-backend) — Python + FastAPI + SQLite
- **Standard to implement:** [C2PA](https://c2pa.org/) — Coalition for Content Provenance and Authenticity (Adobe, Microsoft, Google, BBC)
