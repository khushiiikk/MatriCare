---
description: How to fix GitHub authentication error by using a Personal Access Token (PAT)
---

GitHub no longer accepts your account password for command line operations. You must use a Personal Access Token (PAT).

### Step 1: Generate a Token
1. Go to **Settings** on GitHub (click your profile photo in top right -> Settings).
2. Scroll down to the bottom left and click **Developer settings**.
3. Click **Personal access tokens** -> **Tokens (classic)**.
4. Click **Generate new token** -> **Generate new token (classic)**.
5. Give it a Note (e.g., "Laptop Git").
6. **Important**: Select the **`repo`** checkbox (this gives full control of private repositories).
7. Click **Generate token** at the bottom.
8. **COPY THE TOKEN immediately**. You won't see it again.

### Step 2: Use the Token
Now, go back to VS Code and run:

```powershell
git push origin main
```

- **Username**: `khushiiikk`
- **Password**: [PASTE THE TOKEN YOU COPIED HERE]

(Note: When you paste the password/token in the terminal, it might look like nothing is happening or typing. That is normal for security. Just paste and press Enter).
