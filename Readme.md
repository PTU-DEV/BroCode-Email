The error `Permission denied (publickey)` indicates that GitHub couldn't authenticate you with your SSH key. Follow these steps to resolve it:

---

### **1. Verify SSH Key on Your System**
Check if you already have an SSH key:

```bash
ls ~/.ssh
```

Look for files like `id_rsa` and `id_rsa.pub`. If they exist, skip to **Step 3**.

---

### **2. Generate a New SSH Key (if none exists)**
Run this command and follow the prompts:

```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

- When asked for a **file to save the key**, press **Enter** to use the default location.  
- When asked for a **passphrase**, you can choose to add one or press **Enter** to skip.

Now add your SSH key to the SSH agent:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

---

### **3. Add SSH Key to Your GitHub Account**
1. Copy your SSH key:
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```

2. Go to **GitHub** → Click on your profile picture → **Settings** → **SSH and GPG keys**.  
3. Click **"New SSH Key"** → Paste the copied key → Click **Add SSH Key**.  
4. Optionally, name it something like `"My Laptop"` for identification.

---

### **4. Test SSH Connection**
Run this command to ensure your SSH key works:

```bash
ssh -T git@github.com
```

If successful, you'll see:
```
Hi <username>! You've successfully authenticated, but GitHub does not provide shell access.
```

---

### **5. Update Remote URL**
If your remote URL is still HTTPS-based, switch it to SSH:

```bash
git remote set-url origin git@github.com:<organization-name>/<repo-name>.git
```

---

### **6. Retry Pushing Code**
Now try pushing your code again:

```bash
git push origin main
```

---

### **7. Common Issues & Solutions**
✅ **`Host key verification failed`** — Run `ssh-keygen -R github.com` and retry.  
✅ **`Permission denied` despite adding the key** — Ensure the SSH key is **added to your GitHub account** and **loaded in your agent**.  
✅ **Incorrect SSH Agent** — Run `ssh-add -l` to confirm your key is active.  
