# Fix npm PowerShell Execution Policy Issue

## The Problem
Windows PowerShell is blocking npm from running because the scripts are not digitally signed.

## Quick Fix (Recommended)

### Step 1: Run PowerShell as Administrator
1. Press `Windows Key`
2. Type "PowerShell"
3. Right-click "Windows PowerShell"
4. Click "Run as Administrator"

### Step 2: Change Execution Policy
In the Administrator PowerShell, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

When asked "Do you want to change the execution policy?", type `Y` and press Enter.

### Step 3: Close and Reopen PowerShell
Close the administrator PowerShell and open a normal PowerShell window.

### Step 4: Test npm
```powershell
cd d:\Study\MCH\MaternalHealth
npm --version
```

You should now see the npm version number!

### Step 5: Start the Server
```powershell
npm run dev
```

---

## Alternative Fix (If Above Doesn't Work)

Use Command Prompt instead of PowerShell:
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Run:
```cmd
cd d:\Study\MCH\MaternalHealth
npm run dev
```

---

## What This Does
- `RemoteSigned` policy allows locally created scripts to run
- This is safe and is the recommended setting for development
- You'll only need to do this once

---

## After Fixing
Once npm works, run:
```powershell
npm install
npm run dev
```

Then open: **http://localhost:5173/**
