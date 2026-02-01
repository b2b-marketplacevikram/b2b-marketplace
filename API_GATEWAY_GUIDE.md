# 🚪 API Gateway - Local Setup Guide

## What is API Gateway?

API Gateway is a **single entry point** (port 8080) that routes all frontend requests to the appropriate backend microservices. Instead of calling 10 different ports, you call one.

## Benefits

✅ **Single URL** - Frontend calls `http://localhost:8080` for everything  
✅ **Centralized CORS** - Configure CORS once, not in every service  
✅ **Production-Ready** - Matches production architecture  
✅ **Easy Monitoring** - All traffic flows through one point  
✅ **Future-Proof** - Add rate limiting, auth, logging later  

## Prerequisites

Before starting API Gateway, ensure these services are running:

- ✅ MySQL Database (port 3306)
- ✅ User Service (port 8081)
- ✅ Product Service (port 8082)
- ✅ Order Service (port 8083)
- ✅ Cart Service (port 8085)

## 🚀 Quick Start (3 Steps)

### Step 1: Start Required Services

```powershell
# Start all backend services
.\START_USER_SERVICE.ps1      # Port 8081
.\START_PRODUCT_SERVICE.ps1   # Port 8082
.\START_ORDER_SERVICE.ps1     # Port 8083
.\START_CART_SERVICE.ps1      # Port 8085
```

Wait until all services show "Started" message.

### Step 2: Start API Gateway

```powershell
# Start the gateway
.\START_API_GATEWAY.ps1       # Port 8080
```

Wait for message: `Netty started on port 8080`

### Step 3: Configure Frontend

**Option A: Use `.env.gateway` file (Recommended)**

```powershell
# Copy the gateway config
Copy-Item .env.gateway .env

# Restart frontend
.\START_FRONTEND.ps1
```

**Option B: Manual `.env` file**

Create/edit `.env`:

```env
VITE_USE_API_GATEWAY=true
VITE_API_GATEWAY_URL=http://localhost:8080/api
```

Then restart frontend.

## 🧪 Testing the Gateway

### Test 1: Check Gateway is Running

Open browser: http://localhost:8080/actuator/health

Should see:
```json
{
  "status": "UP"
}
```

### Test 2: Test Routes

```powershell
# Test user service route
curl http://localhost:8080/api/auth/health

# Test product service route  
curl http://localhost:8080/api/products/health

# Test order service route
curl http://localhost:8080/api/orders/health
```

### Test 3: Use Frontend

1. Open http://localhost:5173
2. Login
3. Browse products
4. Check browser DevTools → Network tab
5. All requests should go to `localhost:8080` instead of `8081`, `8082`, etc.

## 📊 How It Works

### Without Gateway (Current)
```
React Frontend
  ├── http://localhost:8081/api/users     (User Service)
  ├── http://localhost:8082/api/products  (Product Service)
  ├── http://localhost:8083/api/orders    (Order Service)
  └── http://localhost:8085/api/cart      (Cart Service)
```

### With Gateway (After Setup)
```
React Frontend
  └── http://localhost:8080/api/*
         ↓
    API Gateway (8080)
         ↓ routes to:
         ├── User Service (8081)
         ├── Product Service (8082)
         ├── Order Service (8083)
         └── Cart Service (8085)
```

## 🔧 Configuration

Gateway configuration: `backend/api-gateway/src/main/resources/application.yml`

### Route Mappings

| Frontend Request | Gateway Port | Routed To | Service Port |
|-----------------|--------------|-----------|--------------|
| `/api/users/**` | 8080 | User Service | 8081 |
| `/api/products/**` | 8080 | Product Service | 8082 |
| `/api/orders/**` | 8080 | Order Service | 8083 |
| `/api/payments/**` | 8080 | Payment Service | 8084 |
| `/api/cart/**` | 8080 | Cart Service | 8085 |
| `/api/notifications/**` | 8080 | Notification Service | 8086 |
| `/api/messages/**` | 8080 | Messaging Service | 8087 |
| `/api/emails/**` | 8080 | Email Service | 8088 |
| `/api/search/**` | 8080 | Search Service | 8089 |

## 🐛 Troubleshooting

### Gateway Won't Start

**Problem**: Port 8080 already in use

**Solution**:
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID)
taskkill /PID <process_id> /F
```

### Services Not Responding

**Problem**: Gateway starts but routes return 503

**Solution**: Ensure backend services are running first
```powershell
# Check each service
curl http://localhost:8081/actuator/health  # User Service
curl http://localhost:8082/actuator/health  # Product Service
curl http://localhost:8083/actuator/health  # Order Service
```

### Frontend Still Calls Direct Ports

**Problem**: Requests still go to 8081, 8082, etc.

**Solution**: 
1. Check `.env` file has `VITE_USE_API_GATEWAY=true`
2. Restart frontend (Ctrl+C and `npm run dev` again)
3. Clear browser cache (Ctrl+Shift+Delete)

### CORS Errors

**Problem**: CORS errors in browser console

**Solution**: Gateway already has CORS configured. Check:
```yaml
# backend/api-gateway/src/main/resources/application.yml
allowedOrigins:
  - "http://localhost:3000"
  - "http://localhost:5173"  # ← Your Vite dev server
```

## 📈 Performance Tips

1. **Start Gateway Last** - Services must be running first
2. **Health Checks** - Gateway checks if services are healthy
3. **Timeouts** - Default 30s timeout per route
4. **Connection Pooling** - Reuses connections to backend services

## 🔄 Switching Between Modes

### Switch TO Gateway Mode

```powershell
# Update .env
echo "VITE_USE_API_GATEWAY=true" > .env
echo "VITE_API_GATEWAY_URL=http://localhost:8080/api" >> .env

# Restart frontend
# Ctrl+C in frontend terminal, then:
npm run dev
```

### Switch Back to Direct Mode

```powershell
# Update .env
echo "VITE_USE_API_GATEWAY=false" > .env

# Or delete .env to use defaults

# Restart frontend
npm run dev
```

## 📋 Complete Startup Sequence

```powershell
# Terminal 1: Database (if not running)
# Already running on port 3306

# Terminal 2: User Service
.\START_USER_SERVICE.ps1

# Terminal 3: Product Service
.\START_PRODUCT_SERVICE.ps1

# Terminal 4: Order Service
.\START_ORDER_SERVICE.ps1

# Terminal 5: Cart Service
.\START_CART_SERVICE.ps1

# Terminal 6: API Gateway (NEW)
.\START_API_GATEWAY.ps1

# Terminal 7: Frontend
Copy-Item .env.gateway .env
.\START_FRONTEND.ps1
```

## 🎯 When to Use Gateway?

### ✅ Use Gateway When:

- Testing production-like setup
- Developing new gateway features (auth, rate limiting)
- Need centralized logging
- Preparing for deployment
- Learning microservices architecture

### ❌ Skip Gateway When:

- Quick local development
- Debugging specific service
- Services are frequently restarting
- Simplicity is priority

## 🔍 Monitoring Gateway

### Check Gateway Logs

Look for these messages:
```
Started ApiGatewayApplication in X seconds
Netty started on port 8080
```

### Check Route Registration

Gateway logs show registered routes on startup:
```
Mapped [/api/users/**] to user-service at http://localhost:8081
Mapped [/api/products/**] to product-service at http://localhost:8082
...
```

## 📚 Additional Resources

- **Configuration**: `backend/api-gateway/src/main/resources/application.yml`
- **Main Class**: `backend/api-gateway/src/main/java/com/b2b/marketplace/gateway/ApiGatewayApplication.java`
- **Docker Compose**: `docker-compose.single-server.yml` (uses gateway)
- **Architecture**: `ARCHITECTURE.md`

## ❓ FAQ

**Q: Do I need to change my backend services?**  
A: No! Services work the same. Gateway just routes requests to them.

**Q: Will this slow down requests?**  
A: Minimal overhead (~1-5ms). Gateway uses reactive WebFlux for performance.

**Q: Can I use some services through gateway and some directly?**  
A: Not easily. Choose one mode: all through gateway OR all direct.

**Q: Is this required for production?**  
A: Highly recommended! Provides security, monitoring, and scalability.

**Q: Can I run multiple gateway instances?**  
A: Yes! Use a load balancer to distribute traffic across multiple gateways.

---

**Ready to Start?**

```powershell
# One command to rule them all! (if all services running)
.\START_API_GATEWAY.ps1
```

Then update `.env` and enjoy your single entry point! 🎉
