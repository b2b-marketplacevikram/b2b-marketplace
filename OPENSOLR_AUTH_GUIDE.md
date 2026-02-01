# How to Get Your OpenSolr Authentication Credentials

## 🔐 Finding Your Credentials

### Step 1: Access OpenSolr Dashboard
1. Go to: **https://opensolr.com/admin**
2. Log in with your account
3. Click on your index: **b2b_products**

### Step 2: Get Authentication Details

You have **TWO options** to find your credentials:

#### Option A: Index Auth Credentials (Easiest)
Look at the left sidebar in your screenshot - you should see:
- **"Index Auth Credentials"** link
- Click on it to reveal:
  - **Username**: (usually your index name or auto-generated)
  - **Password**: (randomly generated string)

#### Option B: Security Section
1. In the left sidebar, click **"Security"** or **"Info"**
2. Look for **"Authentication"** or **"Credentials"** section
3. Find:
   - **Index Username**
   - **Index Password**

## 📝 Save Your Credentials

Once you have them, create a `.env` file:

```powershell
# Create .env file
@"
SOLR_USERNAME=your_username_here
SOLR_PASSWORD=your_password_here
"@ | Set-Content -Path "backend/search-service/.env"
```

Or on Windows, set environment variables:

```powershell
# Set environment variables (PowerShell)
[System.Environment]::SetEnvironmentVariable('SOLR_USERNAME', 'your_username', 'User')
[System.Environment]::SetEnvironmentVariable('SOLR_PASSWORD', 'your_password', 'User')
```

## 🧪 Test With Credentials

### Method 1: Run the Updated Test Script

```powershell
cd f:\B2B-MarketPlace\b2b-marketplace
.\test-opensolr.ps1
```

The script will prompt you for username and password.

### Method 2: Manual Test with PowerShell

```powershell
# Set your credentials
$username = "your_username"
$password = "your_password"

# Create auth header
$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($username):$($password)"))
$headers = @{
    Authorization = "Basic $base64Auth"
}

# Test connection
Invoke-RestMethod -Uri "https://us-east-8-10.solrcluster.com/solr/b2b_products/admin/ping" `
    -Headers $headers

# Index a product
$product = @{
    id = "TEST001"
    name = "Test Product"
    price = 99.99
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://us-east-8-10.solrcluster.com/solr/b2b_products/update?commit=true" `
    -Method Post `
    -ContentType "application/json" `
    -Headers $headers `
    -Body "[$product]"

# Search
Invoke-RestMethod -Uri "https://us-east-8-10.solrcluster.com/solr/b2b_products/select?q=*:*" `
    -Headers $headers
```

## 🔧 Update Backend Configuration

After getting your credentials, update the backend:

### For Local Development

**Option 1: Using .env file** (Recommended)

Create: `backend/search-service/.env`

```env
SOLR_USERNAME=your_username_here
SOLR_PASSWORD=your_password_here
```

**Option 2: Set in application.properties** (NOT recommended - security risk)

```properties
solr.username=your_username_here
solr.password=your_password_here
```

### For Production (Railway/Render)

Add environment variables in your deployment:

```bash
SOLR_USERNAME=your_username_here
SOLR_PASSWORD=your_password_here
```

## ⚠️ Security Notes

1. **Never commit credentials** to Git
2. **Add to .gitignore**:
   ```
   echo ".env" >> .gitignore
   echo "*.env" >> .gitignore
   ```

3. **Use environment variables** for production

4. **Keep credentials secure** - they provide full access to your Solr index

## 🤔 Can't Find Credentials?

If you don't see authentication details in your dashboard:

### Option 1: Contact OpenSolr Support
- Email: support@opensolr.com
- Or schedule a call: https://doodle.com/bp/opensolrsupport/meetings

### Option 2: Try Without Auth First
Some OpenSolr plans might not require authentication for basic access. Try running:

```powershell
# Test without auth
Invoke-RestMethod -Uri "https://us-east-8-10.solrcluster.com/solr/b2b_products/admin/ping"
```

If this works, you might not need auth (depends on your plan).

### Option 3: Create New Credentials
Some OpenSolr plans let you create custom credentials:
1. Go to **Security** section
2. Click **"Create New Credentials"** or **"Reset Password"**
3. Save the new credentials

## ✅ After Setting Up Auth

Your updated files now support authentication:

1. ✅ **application.properties** - Has auth properties
2. ✅ **test-opensolr.ps1** - Prompts for credentials
3. ⏳ **Next**: Get credentials from dashboard
4. ⏳ **Then**: Run test script to verify

---

**Need help finding your credentials?** Let me know what you see in your OpenSolr dashboard and I'll guide you!
