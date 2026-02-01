# ✅ Pre-Deployment Checklist - Do This BEFORE Starting

**Complete this checklist BEFORE beginning Iteration 1 deployment**

## 🎯 Quick Pre-Flight Check (5 minutes)

### 1. GitHub Repository
- [ ] Code is pushed to GitHub
- [ ] Repository is **public** or you have Railway/Vercel access
- [ ] Latest changes committed
- [ ] Branch: `main` or `master`

**Verify now**:
```powershell
git remote -v
git status
git log -1
```

### 2. Local Code Works
- [ ] Frontend runs locally (`npm run dev`)
- [ ] User Service runs locally (port 8081)
- [ ] Product Service runs locally (port 8082)
- [ ] Database schema is finalized
- [ ] No compilation errors

**Test now**:
```powershell
# Test services are working
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
```

### 3. Accounts Needed (Create these first)

| Account | URL | Sign Up Method | Cost |
|---------|-----|----------------|------|
| **GitHub** | github.com | Email/Username | Free |
| **PlanetScale** | planetscale.com | Sign in with GitHub | Free |
| **Railway** | railway.app | Sign in with GitHub | $5 credit free |
| **Vercel** | vercel.com | Sign in with GitHub | Free |

**Create these accounts NOW before starting!**

- [ ] GitHub account active
- [ ] PlanetScale account created (use GitHub login)
- [ ] Railway account created (use GitHub login)
- [ ] Vercel account created (use GitHub login)

### 4. Payment Card for Verification

**You need a credit/debit card for**:
- ❌ PlanetScale - NO card needed for free tier
- ⚠️ Railway - Card needed after $5 credit runs out
- ❌ Vercel - NO card needed for free tier

**For today (Iteration 1)**: No card needed! 🎉

---

## 📁 Prepare Your Files

### 1. Database Schema File

**Ensure you have a clean SQL file**:

- [ ] File exists: `FIX_ALL_SCHEMA_MISMATCHES.sql`
- [ ] Contains all CREATE TABLE statements
- [ ] No DROP TABLE statements (for safety)
- [ ] Tested locally

**Create a clean version now**:

```powershell
# Create deployment-ready schema
# Open MySQL and export schema
mysqldump -u root -p --no-data b2b_marketplace > DEPLOYMENT_SCHEMA.sql
```

Or use your existing schema files.

### 2. Environment Variables Template

**Create `.env.production.template`**:

```powershell
# Create template file
@"
# PlanetScale Database
SPRING_DATASOURCE_URL=jdbc:mysql://aws.connect.psdb.cloud/DATABASE_NAME?sslMode=VERIFY_IDENTITY
SPRING_DATASOURCE_USERNAME=your_username_here
SPRING_DATASOURCE_PASSWORD=your_password_here

# JWT Secret (generate 256-bit random string)
JWT_SECRET=your-jwt-secret-here

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-app.vercel.app
"@ | Out-File -FilePath .env.production.template
```

### 3. Documentation Ready

**Have these files ready to reference**:

- [ ] [DEPLOYMENT_ITERATION_1.md](DEPLOYMENT_ITERATION_1.md) - Main guide
- [ ] [DEPLOYMENT_PROGRESS.md](DEPLOYMENT_PROGRESS.md) - Track progress
- [ ] [FINAL_INFRA_GUIDE.md](FINAL_INFRA_GUIDE.md) - Infrastructure overview
- [ ] This checklist!

---

## 🔧 Configuration Audit

### Spring Boot Services

**Check these files exist and are correct**:

#### User Service
- [ ] `backend/user-service/pom.xml` exists
- [ ] `backend/user-service/src/main/resources/application.properties` exists
- [ ] No hardcoded localhost URLs in code
- [ ] CORS is configurable via environment variable

#### Product Service
- [ ] `backend/product-service/pom.xml` exists
- [ ] `backend/product-service/src/main/resources/application.properties` exists
- [ ] No hardcoded localhost URLs in code

### Frontend

**Check React configuration**:

- [ ] `package.json` exists in root
- [ ] `vite.config.js` configured correctly
- [ ] Environment variables use `VITE_` prefix
- [ ] No hardcoded API URLs in components
- [ ] Build command works: `npm run build`

**Test build locally**:
```powershell
npm run build
# Should create 'dist' folder
```

---

## 🌐 Network & Access

### Internet Connection
- [ ] Stable internet (deployment takes 2-3 hours)
- [ ] No VPN issues
- [ ] Can access github.com
- [ ] Can access railway.app
- [ ] Can access vercel.com
- [ ] Can access planetscale.com

### GitHub Access
- [ ] Can push to repository
- [ ] Repository is accessible
- [ ] SSH keys or HTTPS configured

**Test now**:
```powershell
git push origin main
```

---

## ⏰ Time & Schedule

### Time Required
- **Iteration 1**: 2-3 hours
- **Buffer**: Add 30-60 minutes for troubleshooting
- **Total**: Allocate 3-4 hours

### Best Time to Deploy
✅ **Good times**:
- Weekday evening (after work)
- Weekend morning
- When you have uninterrupted time

❌ **Avoid**:
- Just before important meetings
- Late night (if you need help, support is slower)
- When you're tired

### Schedule Your Deployment

**I will start deployment on**: ___/___/______ at _____:_____ AM/PM

**I expect to finish by**: _____:_____ AM/PM

---

## 💾 Backup & Safety

### Create Backups

**Before deployment, backup**:

1. **Database**:
```powershell
mysqldump -u root -p b2b_marketplace > backup_pre_deployment.sql
```

2. **Code**:
```powershell
git tag -a v1.0-pre-deployment -m "Before cloud deployment"
git push origin v1.0-pre-deployment
```

3. **Configuration**:
```powershell
# Copy all .env files
Copy-Item .env -Destination .env.backup
```

---

## 📝 Information to Collect

**Have these ready before starting**:

### Project Information
```
Project Name: _____________________________________
GitHub Repo: ______________________________________
Main Branch: ______________________________________
```

### Contact Information
```
Your Email: _______________________________________
Phone: ____________________________________________
(For verification codes)
```

### Naming Convention
```
Database Name: b2b-marketplace (or: ______________)
App Name: ________________________________________
Domain Prefix: ____________________________________
```

---

## 🔍 Pre-Deployment Tests

### Test 1: Local Frontend Build
```powershell
npm run build
# Should succeed without errors
```

- [ ] Build succeeds
- [ ] No errors in console
- [ ] dist/ folder created

### Test 2: Backend Compilation
```powershell
cd backend/user-service
mvn clean package
cd ../product-service
mvn clean package
```

- [ ] User Service compiles
- [ ] Product Service compiles
- [ ] No compilation errors

### Test 3: Database Connection
```powershell
# Test local connection works
# Run user service and check logs
```

- [ ] Services connect to database
- [ ] No connection errors

---

## 📚 Knowledge Check

**Ensure you understand**:

- [ ] What PlanetScale is (cloud MySQL database)
- [ ] What Railway is (backend hosting)
- [ ] What Vercel is (frontend hosting)
- [ ] How environment variables work
- [ ] What CORS is and why it matters
- [ ] How to read deployment logs

**If unsure, review**: [FINAL_INFRA_GUIDE.md](FINAL_INFRA_GUIDE.md)

---

## 🆘 Support Resources

**Bookmark these before starting**:

### Documentation
- [ ] Vercel Docs: https://vercel.com/docs
- [ ] Railway Docs: https://docs.railway.app
- [ ] PlanetScale Docs: https://planetscale.com/docs

### Community Support
- [ ] Vercel Discord: https://vercel.com/discord
- [ ] Railway Discord: https://discord.gg/railway
- [ ] Stack Overflow

### Emergency Contacts
```
If stuck, ask here:
- Railway Discord
- Vercel support chat
- GitHub Discussions (your repo)
```

---

## 🎬 Final Pre-Flight

**Right before starting deployment**:

- [ ] All above checkboxes completed
- [ ] Accounts created and verified
- [ ] Code committed and pushed
- [ ] Local build tested
- [ ] 3-4 hours of uninterrupted time
- [ ] Coffee/water ready ☕
- [ ] Good internet connection
- [ ] Deployment guides open in browser tabs
- [ ] Progress tracker ready: [DEPLOYMENT_PROGRESS.md](DEPLOYMENT_PROGRESS.md)

---

## 🚦 Status Check

### ✅ Ready to Deploy When:
```
✅ All checkboxes above are checked
✅ Accounts created
✅ Code working locally
✅ Time allocated
✅ Documentation ready
```

### ⚠️ NOT Ready If:
```
❌ Code doesn't work locally
❌ Haven't created accounts
❌ Less than 2 hours available
❌ Unstable internet
❌ Important changes not committed
```

---

## 🎯 You Are Ready If...

**Complete this sentence**:

"I am ready to deploy because:
- [ ] My code works locally
- [ ] I have 3+ hours available
- [ ] All accounts are created
- [ ] I understand what each service does
- [ ] I have the deployment guides ready
- [ ] My code is pushed to GitHub"

---

## ✨ Confidence Builder

**Remember**:
1. ✅ Everything is **free** for Iteration 1
2. ✅ You can **delete and retry** if something goes wrong
3. ✅ Your local code **stays safe** (we're just deploying a copy)
4. ✅ Millions of developers use these platforms daily
5. ✅ You have **detailed guides** to follow
6. ✅ Each step is **reversible**

**You've got this! 🚀**

---

## Next Step

**Once all checkboxes are ✅**:

➡️ **Open**: [DEPLOYMENT_ITERATION_1.md](DEPLOYMENT_ITERATION_1.md)  
➡️ **Start**: Part 1 - Database Setup  
➡️ **Track**: Mark progress in [DEPLOYMENT_PROGRESS.md](DEPLOYMENT_PROGRESS.md)

---

**Ready? Let's deploy! 🎉**

---

*Pre-Deployment Checklist*  
*Prepared: January 17, 2026*  
*Time to complete checklist: ~15-20 minutes*  
*Proceed to Iteration 1 when ready!*
