# GameMaster - Board Game E-Commerce Website

A modern, responsive board game e-commerce website with PayPal integration, featuring PayPal Orders v2 API with Expanded Checkout, custom card fields, SCA 3DS authentication, and comprehensive transaction logging.

## 🚀 Features

- **Modern UI**: Fluid, responsive design with smooth animations
- **Product Catalog**: Dynamic board game products with detailed pages
- **Shopping Cart**: Multi-item cart with quantity management
- **PayPal Integration**: 
  - PayPal Orders v2 API
  - Expanded Checkout with custom card fields
  - SCA 3DS authentication for all transactions
  - Sandbox and production ready
- **Transaction Logging**: CSV export of all payment details
- **Mobile Responsive**: Works seamlessly on all devices

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- PayPal Developer Account
- Git
- GitHub Account
- Render.com Account (for deployment)

## 🛠️ Installation & Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gamemaster-store.git
cd gamemaster-store
```

### 2. Install Dependencies

```bash
npm install
```

### 3. PayPal Configuration

#### Get PayPal Sandbox Credentials
1. Visit [PayPal Developer Dashboard](https://developer.paypal.com)
2. Log in or create an account
3. Go to "My Apps & Credentials"
4. Under "Sandbox", click "Create App"
5. Enter app name and select a sandbox business account
6. Copy your **Client ID** and **Client Secret**

#### Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
PAYPAL_API_URL=https://api-m.sandbox.paypal.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

#### Update Frontend PayPal SDK

In `index.html`, replace the PayPal SDK script tag:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_SANDBOX_CLIENT_ID&components=buttons,card-fields&currency=USD&intent=capture&enable-funding=venmo&disable-funding=paylater"></script>
```

Replace `YOUR_SANDBOX_CLIENT_ID` with your actual PayPal client ID.

### 4. Project Structure

```
gamemaster-store/
├── index.html          # Main frontend file
├── styles.css          # CSS styles
├── script.js          # Frontend JavaScript
├── server.js          # Express backend server
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (create this)
├── .gitignore        # Git ignore file
├── README.md         # This file
└── transactions.csv  # Transaction log (generated)
```

### 5. Run Locally

```bash
npm start
```

Visit `http://localhost:3000` to see the website.

## 📄 Package.json

```json
{
  "name": "gamemaster-store",
  "version": "1.0.0",
  "description": "Modern board game e-commerce website with PayPal integration",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "keywords": ["ecommerce", "paypal", "board-games", "express", "node"],
  "author": "Your Name",
  "license": "MIT"
}
```

## 🚀 Deployment to Render.com

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:

```bash
git init
git add .
git commit -m "Initial commit: GameMaster board game store"
git branch -M main
git remote add origin https://github.com/your-username/gamemaster-store.git
git push -u origin main
```

### Step 2: Deploy to Render

1. **Sign up/Login to Render.com**
   - Visit [render.com](https://render.com)
   - Sign up with GitHub (recommended)

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your `gamemaster-store` repository

3. **Configure Deployment Settings**
   ```
   Name: gamemaster-store
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: (leave blank)
   Build Command: npm install
   Start Command: node server.js
   ```

4. **Set Environment Variables**
   - Click "Environment" tab
   - Add the following variables:
   ```
   PAYPAL_CLIENT_ID = your_actual_sandbox_client_id
   PAYPAL_CLIENT_SECRET = your_actual_sandbox_client_secret
   PAYPAL_API_URL = https://api-m.sandbox.paypal.com
   NODE_ENV = production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)
   - Your app will be live at `https://your-app-name.onrender.com`

### Step 3: Update PayPal Frontend Configuration

After deployment, update the PayPal SDK script in your `index.html` to use your production client ID if going live, or keep sandbox for testing.

## 🌐 GitHub Pages (Static Frontend Only)

To deploy just the frontend to GitHub Pages:

### Step 1: Create GitHub Pages Branch

1. Create a `gh-pages` branch
2. Remove server-side dependencies from frontend
3. Use client-side only PayPal integration

### Step 2: GitHub Pages Setup

1. Go to repository Settings
2. Navigate to "Pages" section
3. Select source: "Deploy from a branch"
4. Choose "gh-pages" branch
5. Save settings

**Note**: GitHub Pages only supports static sites. For full PayPal functionality, use Render.com for the backend.

## 🔄 Automatic Deployments

### Render Auto-Deploy

Once connected to GitHub, Render automatically:
- Deploys on every push to main branch
- Runs build commands
- Updates environment variables
- Provides deployment logs

## 🔧 Production Configuration

### Environment Variables for Production

```bash
# Production PayPal (when ready)
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret
PAYPAL_API_URL=https://api-m.paypal.com

# Production Settings
NODE_ENV=production
PORT=10000  # Render assigns this automatically
```

### Switch to Production PayPal

1. Create a live PayPal app in Developer Dashboard
2. Update environment variables with live credentials
3. Change PayPal API URL to `https://api-m.paypal.com`
4. Update frontend SDK URL to use live client ID
5. Test thoroughly with real PayPal accounts

## 📊 Transaction Monitoring

### CSV Download

Access transaction logs at: `https://your-app.onrender.com/api/transactions`

### Log Format

The CSV contains:
- Timestamp
- Order ID
- Payment Status
- Purchase Details
- Payer Information
- Payment Source

## 🐛 Troubleshooting

### Common Issues

1. **PayPal SDK Not Loading**
   - Verify client ID in HTML script tag
   - Check console for JavaScript errors
   - Ensure CORS is properly configured

2. **Server Not Starting**
   - Check Node.js version (16+)
   - Verify all dependencies installed
   - Check environment variables

3. **PayPal Orders Failing**
   - Verify sandbox/production endpoints
   - Check client ID and secret
   - Review server logs for API errors

4. **Deployment Issues**
   - Check Render build logs
   - Verify package.json scripts
   - Ensure environment variables are set

### Debugging Commands

```bash
# Check Node version
node --version

# Install dependencies fresh
rm -rf node_modules package-lock.json
npm install

# Run with debug logs
DEBUG=* node server.js

# Check environment variables
printenv | grep PAYPAL
```

## 📝 API Endpoints

- `GET /` - Main application
- `GET /health` - Health check
- `POST /api/create-paypal-order` - Create PayPal order with 3DS
- `POST /api/capture-paypal-order` - Capture PayPal payment
- `GET /api/transactions` - Download CSV transactions
- `GET /api/transactions/count` - Get transaction count
- `POST /api/paypal-webhook` - PayPal webhook handler

## 📄 Files Structure

- **index.html** - Complete frontend with modern UI
- **script.js** - Full JavaScript with PayPal integration
- **server.js** - Express server with PayPal Orders v2 API
- **styles.css** - Responsive CSS with animations
- **package.json** - Dependencies and scripts
- **.gitignore** - Git ignore rules
- **README.md** - This documentation

## 🤝 Support

For issues:
1. Check the troubleshooting section
2. Review PayPal Developer documentation
3. Check Render.com support docs
4. Create an issue in the GitHub repository

## 📄 License

MIT License - see LICENSE file for details.

---

**Happy Selling! 🎲🎯**