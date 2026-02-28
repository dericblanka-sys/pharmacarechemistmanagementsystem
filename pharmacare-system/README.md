# PharmaCare - Chemist Management System

A comprehensive pharmacy management system for managing inventory, sales, customers, and reporting.

## Features

### User Management
- Secure login system with role-based access control
- Three user roles: Administrator, Pharmacist, and Cashier
- User profile management and activity tracking

### Inventory Management
- Complete medicine catalog with SKU, generic names, and categories
- Real-time stock level tracking
- Low stock alerts and notifications
- Expiry date monitoring and warnings
- Supplier management

### Customer Management
- Customer database with contact information
- Purchase history tracking
- Prescription management
- Customer communication logs

### Sales Processing
- Point of Sale (POS) interface
- Cart management with quantity controls
- Multiple payment methods (Cash, Card, Insurance)
- Invoice generation with print functionality
- Transaction history

### Reporting & Analytics
- Sales reports with revenue analytics
- Inventory reports and stock valuation
- Customer analytics and growth tracking
- Data export functionality

## Offline Usage

This application is fully functional offline! All dependencies are included locally:

- **Chart.js** - Local copy in `js/chart.min.js`
- **Fonts** - Uses system fonts (no external font dependencies)
- **No CDN links** - Everything is self-contained

### To Use Offline:
1. Simply open `index.html` in any web browser
2. Works without internet connection
3. All data is stored in your browser's localStorage

## Demo Accounts

Use any of these accounts to explore the system (password: any value):

| Role | Email |
|------|-------|
| Administrator | admin@pharmacare.com |
| Pharmacist | pharmacist@pharmacare.com |
| Cashier | cashier@pharmacare.com |

## Getting Started

### Local Installation

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Login using one of the demo accounts above

That's it! No server or database installation required.

## Deploy with Your Own Domain (Remove Platform Watermark)

The current demo URL includes a platform watermark. To use with your own custom domain:

### Step 1: Download the Project

Download all files from this folder to your computer.

### Step 2: Choose a Hosting Option

**Option A: Netlify (Recommended - Free)**

1. Go to [netlify.com](https://netlify.com) and create a free account
2. Drag and drop this project folder to the Netlify dashboard
3. Your site deploys instantly with NO watermark
4. Click "Domain Management" to add your custom domain

**Option B: Vercel (Free)**

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Install Vercel CLI: `npm i -g vercel`
3. Navigate to the project folder in terminal
4. Run: `vercel --prod`
5. Follow the prompts to deploy
6. Add custom domain in Vercel dashboard

**Option C: GitHub Pages (Free)**

1. Create a free GitHub account at [github.com](https://github.com)
2. Create a new repository (e.g., "pharmacare")
3. Upload all files to the repository
4. Go to Repository Settings > Pages
5. Select "main" branch and save
6. Your site goes live at: `https://yourusername.github.io/pharmacare`

**Option D: Traditional Web Hosting**

Upload all files to your web hosting via:
- FTP/SFTP client (FileZilla, WinSCP)
- cPanel File Manager
- Git deployment

### Step 3: Connect Your Custom Domain

**Getting a Domain:**
- Go to GoDaddy, Namecheap, or Google Domains
- Search and register your desired domain (typically $10-15/year)
- Example: `pharmacare.com`, `yourpharmacy.com`, etc.

**Connecting to Netlify:**
1. In Netlify dashboard, go to "Domain Management"
2. Click "Add custom domain"
3. Enter your domain (e.g., `pharmacare.com`)
4. Netlify will provide DNS records to add

**DNS Setup:**
In your domain registrar's DNS settings, add:

```
Type: CNAME
Name: www (or @ for root)
Value: your-app-name.netlify.app
TTL: Auto
```

**Enabling HTTPS:**
- Netlify/Vercel automatically provision free SSL certificates
- Your site will show as "Secure" in browsers
- HTTPS is enabled within minutes

## Customization

### Changing Colors and Branding

Edit `css/styles.css` and modify the CSS variables:

```css
:root {
    --primary-color: #0056b3;      /* Main brand color - blue */
    --secondary-color: #4CAF50;    /* Success/positive elements - green */
    --background-color: #F4F6F8;   /* Page background */
}
```

### Adding Your Business Information

Edit `index.html` (around line 1320) to update the invoice footer with your:
- Business name
- Address
- Phone number
- Email

### Modifying Demo Accounts

Edit `js/data.js` and update the `initializeDemoData()` function with your own user accounts.

### Changing System Settings

Edit `js/data.js` to modify:
- Default tax rate
- Low stock threshold
- Expiry warning period

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Charts:** Chart.js (included locally)
- **Icons:** SVG inline icons
- **Storage:** localStorage (browser-based)
- **Framework:** None (pure vanilla JS)

## File Structure

```
pharmacare/
├── index.html          # Main application file
├── README.md           # This file
├── css/
│   └── styles.css      # All styles
└── js/
    ├── data.js         # Data layer and localStorage
    ├── app.js          # Main application logic
    └── chart.min.js    # Chart.js library (local)
```

## License

This project is available for personal and commercial use.

---

**PharmaCare** - Professional Pharmacy Management
