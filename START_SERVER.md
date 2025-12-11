# Quick Start Guide - MatriCare Website

## Start the Development Server

### Method 1: Using Terminal
```bash
cd d:\Study\MCH\MaternalHealth
npm run dev
```

### Method 2: If port is busy
```bash
# Kill any process on port 5173
npx kill-port 5173
npm run dev
```

### Method 3: Use different port
```bash
npx vite --port 3000
```

## Expected Output
You should see:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Open the Website
Once server is running, open your browser and go to:
**http://localhost:5173/**

## Troubleshooting

### If you see "Cannot find module"
```bash
npm install
npm run dev
```

### If port 5173 is already in use
- Close any other terminal windows
- Or use: `npx vite --port 3000`

### If nothing works
1. Close ALL terminals
2. Open NEW terminal
3. Run: `npm run dev`

---

## Quick Checklist
- [ ] Terminal is open in correct folder
- [ ] Ran `npm run dev`
- [ ] Server shows "ready" message
- [ ] Opened http://localhost:5173/ in browser
