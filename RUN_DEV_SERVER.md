# How to Run MatriCare Dev Server

## Issue
The `npm run dev` command fails with "vite is not recognized" error due to PATH resolution issues.

## Solutions (Try in order)

### Option 1: Use npx (Recommended)
```bash
npx vite
```

### Option 2: Use direct path to vite
```bash
.\node_modules\.bin\vite
```

### Option 3: Modify package.json script
Change the "dev" script in package.json to:
```json
"dev": "npx vite"
```

Then run:
```bash
npm run dev
```

### Option 4: Use node directly
```bash
node node_modules/vite/bin/vite.js
```

## Expected Output
When successful, you should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

Open http://localhost:3000 in your browser to view the MatriCare website!

## Troubleshooting
- Make sure you're in the `d:\Study\MCH\MaternalHealth` directory
- If none work, try: `npm install -g vite` (installs vite globally)
