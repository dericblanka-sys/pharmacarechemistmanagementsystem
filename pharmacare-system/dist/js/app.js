// PharmaCare Manager - Main Application

const App = {
    currentUser: null,
    currentPage: 'dashboard',
    cart: [],
    charts: {},

    // Initialize application
    init() {
        this.checkAuth();
        this.bindEvents();
        this.checkAlertsOnLoad();
    },

    // Check authentication status
    checkAuth() {
        const savedUser = PharmaCare.getCurrentUser();
        if (savedUser) {
            this.currentUser = savedUser;
            this.showMainApp();
        } else {
            this.showLoginPage();
        }
    },

    // Show login page
    showLoginPage() {
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    },

    // Show main application
    showMainApp() {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        this.updateUserInfo();
        this.updateNavigation();
        this.loadDashboard();
        this.checkRolePermissions();
    },

    // Update user info in header
    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.name;
            document.getElementById('userAvatar').textContent = this.currentUser.name.charAt(0).toUpperCase();
            document.getElementById('dropdownAvatar').textContent = this.currentUser.name.charAt(0).toUpperCase();
            document.getElementById('dropdownFullname').textContent = this.currentUser.name;
            
            const roleNames = {
                'admin': 'Administrator',
                'pharmacist': 'Pharmacist',
                'cashier': 'Cashier'
            };
            document.getElementById('dropdownRole').textContent = roleNames[this.currentUser.role] || this.currentUser.role;
        }
    },

    // Update navigation based on user role
    updateNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.classList.contains('admin-only') && this.currentUser?.role !== 'admin') {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
            }
        });
    },

    // Check and apply role permissions
    checkRolePermissions() {
        // Hide admin/pharmacist only elements
        document.querySelectorAll('.admin-pharmacist').forEach(el => {
            if (this.currentUser?.role === 'cashier') {
                el.style.display = 'none';
            } else {
                el.style.display = '';
            }
        });

        // Hide admin only elements
        document.querySelectorAll('.admin-only').forEach(el => {
            if (this.currentUser?.role !== 'admin') {
                el.style.display = 'none';
            }
        });

        // Update settings page
        if (this.currentUser) {
            document.getElementById('profileName').value = this.currentUser.name || '';
            document.getElementById('profileEmail').value = this.currentUser.email || '';
            document.getElementById('profilePhone').value = this.currentUser.phone || '';
            document.getElementById('profileRole').value = this.currentUser.role || '';
        }

        // Load system settings
        const settings = PharmaCare.getSystemSettings();
        document.getElementById('lowStockThreshold').value = settings.lowStockThreshold || 10;
        document.getElementById('expiryWarningDays').value = settings.expiryWarningDays || 30;
        document.getElementById('taxRate').value = settings.taxRate || 10;
    },

    // Check alerts on page load
    checkAlertsOnLoad() {
        PharmaCare.checkAlerts();
        this.updateAlertsList();
    },

    // Bind all event listeners
    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.showPage(page);
            });
        });

        // Global search
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('userDropdown').classList.add('hidden');
            }
            if (!e.target.closest('.alert-btn') && !e.target.closest('.notifications-panel')) {
                document.getElementById('notificationsPanel').classList.remove('active');
            }
        });

        // POS Search
        document.getElementById('posSearch').addEventListener('input', (e) => {
            this.searchPOSProducts(e.target.value);
        });

        // Cart discount
        document.getElementById('cartDiscount').addEventListener('change', (e) => {
            this.updateCartTotals();
        });

        // Report type change
        document.getElementById('reportType').addEventListener('change', (e) => {
            this.updateReportView();
        });

        // Set default dates for reports
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        document.getElementById('reportEndDate').value = today.toISOString().split('T')[0];
        document.getElementById('reportStartDate').value = thirtyDaysAgo.toISOString().split('T')[0];
    },

    // Handle login
    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const users = PharmaCare.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            if (user.status === 'inactive') {
                this.showToast('Your account is inactive. Please contact administrator.', 'error');
                return;
            }
            
            user.lastLogin = new Date().toISOString();
            PharmaCare.saveUser(user);
            
            this.currentUser = user;
            PharmaCare.setCurrentUser(user);
            this.showMainApp();
            this.showToast('Welcome back, ' + user.name + '!', 'success');
        } else {
            this.showToast('Invalid email or password', 'error');
        }
    },

    // Handle logout
    logout() {
        this.currentUser = null;
        PharmaCare.clearCurrentUser();
        document.getElementById('userDropdown').classList.add('hidden');
        this.showLoginPage();
        this.showToast('You have been logged out', 'info');
    },

    // Show page
    showPage(page) {
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Show selected page
        const pageEl = document.getElementById(page + 'Page');
        if (pageEl) {
            pageEl.classList.add('active');
            this.currentPage = page;
            
            // Load page-specific data
            switch(page) {
                case 'dashboard':
                    this.loadDashboard();
                    break;
                case 'inventory':
                    this.loadInventory();
                    break;
                case 'pos':
                    this.loadPOS();
                    break;
                case 'customers':
                    this.loadCustomers();
                    break;
                case 'suppliers':
                    this.loadSuppliers();
                    break;
                case 'reports':
                    this.loadReports();
                    break;
                case 'users':
                    this.loadUsers();
                    break;
                case 'settings':
                    this.loadSettings();
                    break;
            }
        }

        // Close sidebar on mobile
        document.getElementById('sidebar').classList.remove('active');
    },

    // Load Dashboard
    loadDashboard() {
        this.updateDashboardStats();
        this.loadRecentTransactions();
        this.loadAlerts();
        this.initDashboardCharts();
    },

    // Update dashboard stats
    updateDashboardStats() {
        const transactions = PharmaCare.getTransactions();
        const medicines = PharmaCare.getMedicines();
        const today = new Date().toISOString().split('T')[0];
        
        // Today's sales
        const todayTransactions = transactions.filter(t => t.date.startsWith(today));
        const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
        document.getElementById('todaySales').textContent = '$' + todaySales.toFixed(2);
        document.getElementById('todayTransactions').textContent = todayTransactions.length;
        
        // Yesterday's sales for comparison
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const yesterdayTransactions = transactions.filter(t => t.date.startsWith(yesterdayStr));
        const yesterdaySales = yesterdayTransactions.reduce((sum, t) => sum + t.total, 0);
        
        const changeEl = document.querySelector('.kpi-card:nth-child(1) .kpi-change');
        if (yesterdaySales > 0) {
            const change = ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1);
            changeEl.textContent = (change >= 0 ? '+' : '') + change + '% from yesterday';
            changeEl.className = 'kpi-change ' + (change >= 0 ? 'positive' : 'negative');
        } else {
            changeEl.textContent = 'No data from yesterday';
            changeEl.className = 'kpi-change';
        }
        
        // Low stock count
        const lowStock = medicines.filter(m => parseInt(m.quantity) <= parseInt(m.reorderLevel) && parseInt(m.quantity) > 0).length;
        document.getElementById('lowStockCount').textContent = lowStock;
        
        // Expiring soon
        const settings = PharmaCare.getSystemSettings();
        const warningDate = new Date();
        warningDate.setDate(warningDate.getDate() + parseInt(settings.expiryWarningDays));
        const expiringSoon = medicines.filter(m => new Date(m.expiryDate) < warningDate).length;
        document.getElementById('expiringCount').textContent = expiringSoon;
    },

    // Load recent transactions
    loadRecentTransactions() {
        const transactions = PharmaCare.getTransactions().slice(0, 10);
        const container = document.getElementById('recentTransactions');
        
        if (transactions.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No recent transactions</p></div>';
            return;
        }
        
        container.innerHTML = transactions.map(t => {
            const itemNames = t.items.slice(0, 2).map(i => i.name).join(', ');
            const moreItems = t.items.length > 2 ? ` +${t.items.length - 2} more` : '';
            const paymentIcons = {
                'cash': '💵',
                'card': '💳',
                'insurance': '🏥'
            };
            const paymentIcon = paymentIcons[t.paymentMethod] || '💰';
            
            return `
            <div class="activity-item">
                <div class="activity-icon sale">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${itemNames}${moreItems}</div>
                    <div class="activity-details">
                        <span class="activity-id">${t.id}</span>
                        <span>${paymentIcon} ${t.paymentMethod.charAt(0).toUpperCase() + t.paymentMethod.slice(1)}</span>
                        <span>${t.items.length} item(s)</span>
                    </div>
                    <div class="activity-time">${new Date(t.date).toLocaleString()}</div>
                </div>
                <div class="activity-amount">$${t.total.toFixed(2)}</div>
            </div>
            `;
        }).join('');
    },

    // Load alerts
    loadAlerts() {
        const alerts = PharmaCare.getAlerts().filter(a => !a.read).slice(0, 5);
        const container = document.getElementById('alertsList');
        
        if (alerts.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No alerts at this time</p></div>';
            return;
        }
        
        container.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type === 'out_of_stock' || alert.type === 'expiry' ? 'danger' : ''}" onclick="PharmaCare.markAlertRead('${alert.id}')">
                <div class="alert-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div class="alert-message">${alert.medicineName || 'Alert'}: ${alert.message}</div>
                    <div class="alert-time">${this.formatAlertTime(alert.date)}</div>
                </div>
            </div>
        `).join('');
    },

    // Format alert time
    formatAlertTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    },

    // Initialize dashboard charts
    initDashboardCharts() {
        // Sales Chart
        const salesCtx = document.getElementById('salesChart');
        if (this.charts.sales) this.charts.sales.destroy();
        
        const transactions = PharmaCare.getTransactions();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }
        
        const salesData = last7Days.map(date => {
            const dayTransactions = transactions.filter(t => t.date.startsWith(date));
            return dayTransactions.reduce((sum, t) => sum + t.total, 0);
        });
        
        this.charts.sales = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
                datasets: [{
                    label: 'Sales',
                    data: salesData,
                    borderColor: '#0056b3',
                    backgroundColor: 'rgba(0, 86, 179, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '$' + value
                        }
                    }
                }
            }
        });
        
        // Top Products Chart
        const topProductsCtx = document.getElementById('topProductsChart');
        if (this.charts.topProducts) this.charts.topProducts.destroy();
        
        // Calculate top products
        const productSales = {};
        transactions.forEach(t => {
            t.items.forEach(item => {
                if (!productSales[item.medicineId]) {
                    productSales[item.medicineId] = { name: item.name, quantity: 0, revenue: 0 };
                }
                productSales[item.medicineId].quantity += item.quantity;
                productSales[item.medicineId].revenue += item.total;
            });
        });
        
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        
        this.charts.topProducts = new Chart(topProductsCtx, {
            type: 'bar',
            data: {
                labels: topProducts.map(p => p.name),
                datasets: [{
                    label: 'Revenue',
                    data: topProducts.map(p => p.revenue),
                    backgroundColor: '#4CAF50'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '$' + value
                        }
                    }
                }
            }
        });
    },

    // Load Inventory
    loadInventory() {
        this.renderInventoryTable();
        this.updateInventoryStats();
    },

    // Render inventory table
    renderInventoryTable(medicines = null) {
        const meds = medicines || PharmaCare.getMedicines();
        const tbody = document.getElementById('inventoryTableBody');
        const settings = PharmaCare.getSystemSettings();
        
        if (meds.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No medicines found</td></tr>';
            return;
        }
        
        tbody.innerHTML = meds.map(med => {
            const quantity = parseInt(med.quantity);
            const reorderLevel = parseInt(med.reorderLevel);
            const expiryDate = new Date(med.expiryDate);
            const warningDate = new Date();
            warningDate.setDate(warningDate.getDate() + parseInt(settings.expiryWarningDays));
            
            let status = '<span class="status-badge in-stock">In Stock</span>';
            let statusClass = '';
            
            if (quantity === 0) {
                status = '<span class="status-badge out-of-stock">Out of Stock</span>';
                statusClass = 'out';
            } else if (quantity <= reorderLevel) {
                status = '<span class="status-badge low-stock">Low Stock</span>';
                statusClass = 'low';
            }
            
            let expiryStatus = '';
            if (expiryDate < new Date()) {
                expiryStatus = '<span class="status-badge expired">Expired</span>';
            } else if (expiryDate < warningDate) {
                expiryStatus = '<span class="status-badge expiring">Expiring Soon</span>';
            }
            
            const actions = this.currentUser?.role !== 'cashier' ? `
                <div class="action-btns">
                    <button class="action-btn" onclick="App.editMedicine('${med.id}')" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn danger" onclick="App.deleteMedicine('${med.id}')" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            ` : '-';
            
            return `
                <tr data-id="${med.id}">
                    <td>${med.sku}</td>
                    <td>${med.name}</td>
                    <td>${med.category}</td>
                    <td>${med.dosage}</td>
                    <td>$${parseFloat(med.price).toFixed(2)}</td>
                    <td>${quantity}</td>
                    <td>${med.expiryDate}</td>
                    <td>${status} ${expiryStatus}</td>
                    <td>${actions}</td>
                </tr>
            `;
        }).join('');
    },

    // Update inventory stats
    updateInventoryStats() {
        const medicines = PharmaCare.getMedicines();
        const settings = PharmaCare.getSystemSettings();
        
        document.getElementById('totalMedicines').textContent = medicines.length;
        
        const totalValue = medicines.reduce((sum, m) => sum + (parseFloat(m.price) * parseInt(m.quantity)), 0);
        document.getElementById('totalStockValue').textContent = '$' + totalValue.toFixed(2);
        
        const lowStock = medicines.filter(m => parseInt(m.quantity) <= parseInt(m.reorderLevel) && parseInt(m.quantity) > 0).length;
        document.getElementById('lowStockStat').textContent = lowStock;
        
        const warningDate = new Date();
        warningDate.setDate(warningDate.getDate() + parseInt(settings.expiryWarningDays));
        const expiring = medicines.filter(m => new Date(m.expiryDate) < warningDate).length;
        document.getElementById('expiringStat').textContent = expiring;
    },

    // Filter inventory
    filterInventory() {
        const search = document.getElementById('inventorySearch').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;
        const stock = document.getElementById('stockFilter').value;
        const expiry = document.getElementById('expiryFilter').value;
        const settings = PharmaCare.getSystemSettings();
        
        let medicines = PharmaCare.getMedicines();
        
        if (search) {
            medicines = medicines.filter(m => 
                m.name.toLowerCase().includes(search) ||
                m.genericName.toLowerCase().includes(search) ||
                m.sku.toLowerCase().includes(search)
            );
        }
        
        if (category) {
            medicines = medicines.filter(m => m.category === category);
        }
        
        if (stock === 'low') {
            medicines = medicines.filter(m => parseInt(m.quantity) <= parseInt(m.reorderLevel) && parseInt(m.quantity) > 0);
        } else if (stock === 'out') {
            medicines = medicines.filter(m => parseInt(m.quantity) === 0);
        } else if (stock === 'ok') {
            medicines = medicines.filter(m => parseInt(m.quantity) > parseInt(m.reorderLevel));
        }
        
        if (expiry === 'warning') {
            const warningDate = new Date();
            warningDate.setDate(warningDate.getDate() + parseInt(settings.expiryWarningDays));
            medicines = medicines.filter(m => new Date(m.expiryDate) < warningDate && new Date(m.expiryDate) > new Date());
        } else if (expiry === 'expired') {
            medicines = medicines.filter(m => new Date(m.expiryDate) < new Date());
        }
        
        this.renderInventoryTable(medicines);
    },

    // Sort inventory
    sortInventory(field) {
        const medicines = PharmaCare.getMedicines().sort((a, b) => {
            if (field === 'quantity' || field === 'price') {
                return parseFloat(a[field]) - parseFloat(b[field]);
            }
            return a[field].localeCompare(b[field]);
        });
        this.renderInventoryTable(medicines);
    },

    // Show add medicine modal
    showAddMedicineModal() {
        document.getElementById('medicineModalTitle').textContent = 'Add New Medicine';
        document.getElementById('medicineForm').reset();
        document.getElementById('medicineId').value = '';
        this.populateSupplierDropdown();
        this.openModal('medicineModal');
    },

    // Edit medicine
    editMedicine(id) {
        const medicines = PharmaCare.getMedicines();
        const medicine = medicines.find(m => m.id === id);
        
        if (medicine) {
            document.getElementById('medicineModalTitle').textContent = 'Edit Medicine';
            document.getElementById('medicineId').value = medicine.id;
            document.getElementById('medicineSku').value = medicine.sku;
            document.getElementById('medicineName').value = medicine.name;
            document.getElementById('medicineGeneric').value = medicine.genericName || '';
            document.getElementById('medicineCategory').value = medicine.category;
            document.getElementById('medicineDosage').value = medicine.dosage || '';
            document.getElementById('medicineForm').value = medicine.form || 'Tablet';
            document.getElementById('medicinePrice').value = medicine.price;
            document.getElementById('medicineCost').value = medicine.cost || '';
            document.getElementById('medicineQuantity').value = medicine.quantity;
            document.getElementById('medicineReorder').value = medicine.reorderLevel;
            document.getElementById('medicineExpiry').value = medicine.expiryDate;
            document.getElementById('medicineDescription').value = medicine.description || '';
            
            this.populateSupplierDropdown(medicine.supplier);
            this.openModal('medicineModal');
        }
    },

    // Save medicine
    saveMedicine(e) {
        e.preventDefault();
        
        const medicine = {
            id: document.getElementById('medicineId').value,
            sku: document.getElementById('medicineSku').value,
            name: document.getElementById('medicineName').value,
            genericName: document.getElementById('medicineGeneric').value,
            category: document.getElementById('medicineCategory').value,
            dosage: document.getElementById('medicineDosage').value,
            form: document.getElementById('medicineForm').value,
            price: parseFloat(document.getElementById('medicinePrice').value),
            cost: parseFloat(document.getElementById('medicineCost').value) || 0,
            quantity: parseInt(document.getElementById('medicineQuantity').value),
            reorderLevel: parseInt(document.getElementById('medicineReorder').value),
            expiryDate: document.getElementById('medicineExpiry').value,
            supplier: document.getElementById('medicineSupplier').value,
            description: document.getElementById('medicineDescription').value
        };
        
        PharmaCare.saveMedicine(medicine);
        this.closeModal('medicineModal');
        this.renderInventoryTable();
        this.updateInventoryStats();
        this.showToast('Medicine saved successfully', 'success');
    },

    // Delete medicine
    deleteMedicine(id) {
        if (confirm('Are you sure you want to delete this medicine?')) {
            PharmaCare.deleteMedicine(id);
            this.renderInventoryTable();
            this.updateInventoryStats();
            this.showToast('Medicine deleted successfully', 'success');
        }
    },

    // Populate supplier dropdown
    populateSupplierDropdown(selectedId = '') {
        const suppliers = PharmaCare.getSuppliers();
        const select = document.getElementById('medicineSupplier');
        select.innerHTML = '<option value="">Select Supplier</option>';
        
        suppliers.forEach(s => {
            select.innerHTML += `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>${s.company}</option>`;
        });
    },

    // Export inventory
    exportInventory() {
        const medicines = PharmaCare.getMedicines();
        const csv = [
            ['SKU', 'Name', 'Category', 'Dosage', 'Price', 'Quantity', 'Expiry Date', 'Supplier'].join(','),
            ...medicines.map(m => [
                m.sku, `"${m.name}"`, m.category, m.dosage, m.price, m.quantity, m.expiryDate, 
                PharmaCare.getSuppliers().find(s => s.id === m.supplier)?.company || ''
            ].join(','))
        ].join('\n');
        
        this.downloadCSV(csv, 'inventory.csv');
        this.showToast('Inventory exported successfully', 'success');
    },

    // Load POS
    loadPOS() {
        this.renderPOSProducts();
        this.populateCustomerDropdown();
        this.renderCart();
    },

    // Render POS products
    renderPOSProducts(category = 'all') {
        let medicines = PharmaCare.getMedicines().filter(m => parseInt(m.quantity) > 0);
        
        if (category !== 'all') {
            medicines = medicines.filter(m => m.category === category);
        }
        
        const grid = document.getElementById('posProductsGrid');
        grid.innerHTML = medicines.map(m => `
            <div class="product-card ${parseInt(m.quantity) <= parseInt(m.reorderLevel) ? 'low-stock' : ''}" 
                 onclick="App.addToCart('${m.id}')">
                <div class="product-name">${m.name}</div>
                <div class="product-details">${m.dosage} - ${m.form}</div>
                <div class="product-price">$${parseFloat(m.price).toFixed(2)}</div>
                <div class="product-stock ${parseInt(m.quantity) <= parseInt(m.reorderLevel) ? 'low' : ''}">
                    ${m.quantity} in stock
                </div>
            </div>
        `).join('');
    },

    // Search POS products
    searchPOSProducts(query = '') {
        let medicines = PharmaCare.getMedicines().filter(m => parseInt(m.quantity) > 0);
        
        if (query) {
            const search = query.toLowerCase();
            medicines = medicines.filter(m => 
                m.name.toLowerCase().includes(search) ||
                m.sku.toLowerCase().includes(search) ||
                m.genericName?.toLowerCase().includes(search)
            );
        }
        
        const grid = document.getElementById('posProductsGrid');
        if (medicines.length === 0) {
            grid.innerHTML = '<div class="empty-state"><p>No products found</p></div>';
            return;
        }
        
        grid.innerHTML = medicines.map(m => `
            <div class="product-card" onclick="App.addToCart('${m.id}')">
                <div class="product-name">${m.name}</div>
                <div class="product-details">${m.dosage} - ${m.form}</div>
                <div class="product-price">$${parseFloat(m.price).toFixed(2)}</div>
                <div class="product-stock">${m.quantity} in stock</div>
            </div>
        `).join('');
    },

    // Filter POS category
    filterPOSCategory(category) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === category || (category === 'all' && btn.textContent === 'All')) {
                btn.classList.add('active');
            }
        });
        this.renderPOSProducts(category);
    },

    // Add to cart
    addToCart(medicineId) {
        const medicines = PharmaCare.getMedicines();
        const medicine = medicines.find(m => m.id === medicineId);
        
        if (!medicine) return;
        
        const existingItem = this.cart.find(item => item.medicineId === medicineId);
        
        if (existingItem) {
            if (existingItem.quantity + 1 > parseInt(medicine.quantity)) {
                this.showToast('Not enough stock available', 'warning');
                return;
            }
            existingItem.quantity++;
            existingItem.total = existingItem.price * existingItem.quantity;
        } else {
            this.cart.push({
                medicineId: medicine.id,
                name: medicine.name,
                price: parseFloat(medicine.price),
                quantity: 1,
                total: parseFloat(medicine.price)
            });
        }
        
        this.renderCart();
        this.updateCartTotals();
    },

    // Render cart
    renderCart() {
        const container = document.getElementById('cartItems');
        
        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <p>No items in cart</p>
                    <span>Search and add products to get started</span>
                </div>
            `;
            document.getElementById('checkoutBtn').disabled = true;
            return;
        }
        
        container.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="App.updateCartQuantity('${item.medicineId}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="App.updateCartQuantity('${item.medicineId}', 1)">+</button>
                </div>
                <div class="cart-item-total">$${item.total.toFixed(2)}</div>
                <button class="cart-item-remove" onclick="App.removeFromCart('${item.medicineId}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');
        
        document.getElementById('checkoutBtn').disabled = false;
    },

    // Update cart quantity
    updateCartQuantity(medicineId, change) {
        const item = this.cart.find(i => i.medicineId === medicineId);
        if (!item) return;
        
        const medicines = PharmaCare.getMedicines();
        const medicine = medicines.find(m => m.id === medicineId);
        
        const newQty = item.quantity + change;
        if (newQty <= 0) {
            this.removeFromCart(medicineId);
            return;
        }
        
        if (newQty > parseInt(medicine.quantity)) {
            this.showToast('Not enough stock available', 'warning');
            return;
        }
        
        item.quantity = newQty;
        item.total = item.price * item.quantity;
        
        this.renderCart();
        this.updateCartTotals();
    },

    // Remove from cart
    removeFromCart(medicineId) {
        this.cart = this.cart.filter(item => item.medicineId !== medicineId);
        this.renderCart();
        this.updateCartTotals();
    },

    // Update cart totals
    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 10;
        const discount = parseFloat(document.getElementById('cartDiscount').value) || 0;
        
        const tax = subtotal * (taxRate / 100);
        const discountAmount = subtotal * (discount / 100);
        const total = subtotal + tax - discountAmount;
        
        document.getElementById('cartSubtotal').textContent = '$' + subtotal.toFixed(2);
        document.getElementById('cartTax').textContent = '$' + tax.toFixed(2);
        document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
    },

    // Clear cart
    clearCart() {
        this.cart = [];
        this.renderCart();
        this.updateCartTotals();
        document.getElementById('cartCustomer').value = '';
    },

    // Hold cart
    holdCart() {
        if (this.cart.length > 0) {
            this.showToast('Cart saved (session only)', 'info');
            // In a real app, this would save to backend
        }
    },

    // Process payment
    processPayment() {
        if (this.cart.length === 0) {
            this.showToast('Cart is empty', 'warning');
            return;
        }
        
        const customerId = document.getElementById('cartCustomer').value;
        const discount = parseFloat(document.getElementById('cartDiscount').value) || 0;
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 10;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * (taxRate / 100);
        const discountAmount = subtotal * (discount / 100);
        const total = subtotal + tax - discountAmount;
        
        const transaction = {
            items: this.cart.map(item => ({
                medicineId: item.medicineId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.total
            })),
            subtotal: subtotal,
            tax: tax,
            discount: discountAmount,
            total: total,
            paymentMethod: paymentMethod,
            customerId: customerId || null,
            status: 'completed'
        };
        
        const savedTransaction = PharmaCare.saveTransaction(transaction);
        
        // Show invoice
        this.showInvoice(savedTransaction);
        
        // Clear cart
        this.cart = [];
        this.renderCart();
        this.updateCartTotals();
        
        // Refresh related data
        this.loadDashboard();
    },

    // Show invoice
    showInvoice(transaction) {
        const customer = transaction.customerId 
            ? PharmaCare.getCustomers().find(c => c.id === transaction.customerId)
            : null;
        
        document.getElementById('invoiceNumber').textContent = transaction.id;
        document.getElementById('invoiceDate').textContent = new Date(transaction.date).toLocaleDateString();
        document.getElementById('invoiceTime').textContent = new Date(transaction.date).toLocaleTimeString();
        document.getElementById('invoiceCustomer').textContent = customer ? customer.name : 'Walk-in Customer';
        document.getElementById('invoiceCashier').textContent = this.currentUser?.name || 'Cashier';
        
        document.getElementById('invoiceItemsBody').innerHTML = transaction.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${item.total.toFixed(2)}</td>
            </tr>
        `).join('');
        
        document.getElementById('invoiceSubtotal').textContent = '$' + transaction.subtotal.toFixed(2);
        document.getElementById('invoiceTax').textContent = '$' + transaction.tax.toFixed(2);
        document.getElementById('invoiceDiscount').textContent = transaction.discount > 0 ? '-$' + transaction.discount.toFixed(2) : '$0.00';
        document.getElementById('invoiceDiscountRow').style.display = transaction.discount > 0 ? 'flex' : 'none';
        document.getElementById('invoiceTotal').textContent = '$' + transaction.total.toFixed(2);
        
        this.openModal('invoiceModal');
    },

    // Print invoice
    printInvoice() {
        const invoiceContent = document.getElementById('invoiceContent').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - PharmaCare Manager</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .invoice-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; border-bottom: 2px solid #0056b3; padding-bottom: 20px; }
                    .invoice-logo svg { width: 48px; height: 48px; }
                    .invoice-title h2 { color: #0056b3; margin: 0; }
                    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 24px; background: #f4f6f8; padding: 16px; border-radius: 8px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e6ed; }
                    th { background: #f4f6f8; }
                    .invoice-totals { max-width: 300px; margin-left: auto; }
                    .invoice-row { display: flex; justify-content: space-between; padding: 8px 0; }
                    .total { font-weight: bold; font-size: 1.2rem; border-top: 2px solid #e0e6ed; padding-top: 12px; margin-top: 8px; }
                    .invoice-footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e0e6ed; color: #7f8c8d; }
                    @media print { body { -webkit-print-color-adjust: exact; } }
                </style>
            </head>
            <body>${invoiceContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    // Load Customers
    loadCustomers() {
        this.renderCustomersTable();
        this.updateCustomerStats();
    },

    // Render customers table
    renderCustomersTable(customers = null) {
        const custs = customers || PharmaCare.getCustomers();
        const tbody = document.getElementById('customersTableBody');
        
        if (custs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No customers found</td></tr>';
            return;
        }
        
        tbody.innerHTML = custs.map(c => `
            <tr data-id="${c.id}">
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.phone}</td>
                <td>${c.email || '-'}</td>
                <td>${c.totalVisits}</td>
                <td>${c.lastVisit || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" onclick="App.editCustomer('${c.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn" onclick="App.viewCustomer('${c.id}')" title="View">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="action-btn danger" onclick="App.deleteCustomer('${c.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Update customer stats
    updateCustomerStats() {
        const customers = PharmaCare.getCustomers();
        const today = new Date().toISOString().split('T')[0];
        
        document.getElementById('totalCustomers').textContent = customers.length;
        
        const thisMonth = new Date().toISOString().slice(0, 7);
        const activeThisMonth = customers.filter(c => c.lastVisit && c.lastVisit.startsWith(thisMonth)).length;
        document.getElementById('activeCustomers').textContent = activeThisMonth;
        
        // Count pending prescriptions (simplified - in real app would be a separate table)
        document.getElementById('pendingPrescriptions').textContent = '0';
    },

    // Filter customers
    filterCustomers() {
        const search = document.getElementById('customerSearch').value.toLowerCase();
        let customers = PharmaCare.getCustomers();
        
        if (search) {
            customers = customers.filter(c => 
                c.name.toLowerCase().includes(search) ||
                c.phone.includes(search) ||
                c.email?.toLowerCase().includes(search)
            );
        }
        
        this.renderCustomersTable(customers);
    },

    // Show add customer modal
    showAddCustomerModal() {
        document.getElementById('customerModalTitle').textContent = 'Add New Customer';
        document.getElementById('customerForm').reset();
        document.getElementById('customerId').value = '';
        this.openModal('customerModal');
    },

    // Edit customer
    editCustomer(id) {
        const customers = PharmaCare.getCustomers();
        const customer = customers.find(c => c.id === id);
        
        if (customer) {
            document.getElementById('customerModalTitle').textContent = 'Edit Customer';
            document.getElementById('customerId').value = customer.id;
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerPhone').value = customer.phone;
            document.getElementById('customerEmail').value = customer.email || '';
            document.getElementById('customerDob').value = customer.dob || '';
            document.getElementById('customerAddress').value = customer.address || '';
            document.getElementById('customerAllergies').value = customer.allergies || '';
            document.getElementById('customerInsurance').value = customer.insurance || '';
            document.getElementById('customerInsuranceNumber').value = customer.insuranceNumber || '';
            document.getElementById('customerNotes').value = customer.notes || '';
            this.openModal('customerModal');
        }
    },

    // View customer
    viewCustomer(id) {
        const customers = PharmaCare.getCustomers();
        const customer = customers.find(c => c.id === id);
        
        if (customer) {
            this.editCustomer(id);
        }
    },

    // Save customer
    saveCustomer(e) {
        e.preventDefault();
        
        const customer = {
            id: document.getElementById('customerId').value,
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value,
            dob: document.getElementById('customerDob').value,
            address: document.getElementById('customerAddress').value,
            allergies: document.getElementById('customerAllergies').value,
            insurance: document.getElementById('customerInsurance').value,
            insuranceNumber: document.getElementById('customerInsuranceNumber').value,
            notes: document.getElementById('customerNotes').value
        };
        
        PharmaCare.saveCustomer(customer);
        this.closeModal('customerModal');
        this.renderCustomersTable();
        this.updateCustomerStats();
        this.populateCustomerDropdown();
        this.showToast('Customer saved successfully', 'success');
    },

    // Delete customer
    deleteCustomer(id) {
        if (confirm('Are you sure you want to delete this customer?')) {
            PharmaCare.deleteCustomer(id);
            this.renderCustomersTable();
            this.updateCustomerStats();
            this.populateCustomerDropdown();
            this.showToast('Customer deleted successfully', 'success');
        }
    },

    // Populate customer dropdown
    populateCustomerDropdown() {
        const customers = PharmaCare.getCustomers();
        const select = document.getElementById('cartCustomer');
        select.innerHTML = '<option value="">Walk-in Customer</option>';
        
        customers.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.name} (${c.phone})</option>`;
        });
    },

    // Update cart customer
    updateCartCustomer() {
        // Customer selection updated
    },

    // Load Suppliers
    loadSuppliers() {
        this.renderSuppliersTable();
    },

    // Render suppliers table
    renderSuppliersTable(suppliers = null) {
        const sups = suppliers || PharmaCare.getSuppliers();
        const tbody = document.getElementById('suppliersTableBody');
        
        if (sups.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No suppliers found</td></tr>';
            return;
        }
        
        const medicines = PharmaCare.getMedicines();
        
        tbody.innerHTML = sups.map(s => {
            const productCount = medicines.filter(m => m.supplier === s.id).length;
            
            const actions = this.currentUser?.role !== 'cashier' ? `
                <div class="action-btns">
                    <button class="action-btn" onclick="App.editSupplier('${s.id}')" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn danger" onclick="App.deleteSupplier('${s.id}')" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            ` : '-';
            
            return `
                <tr data-id="${s.id}">
                    <td>${s.id}</td>
                    <td>${s.company}</td>
                    <td>${s.contact}</td>
                    <td>${s.phone}</td>
                    <td>${s.email}</td>
                    <td>${productCount}</td>
                    <td>${actions}</td>
                </tr>
            `;
        }).join('');
    },

    // Show add supplier modal
    showAddSupplierModal() {
        document.getElementById('supplierModalTitle').textContent = 'Add New Supplier';
        document.getElementById('supplierForm').reset();
        document.getElementById('supplierId').value = '';
        this.openModal('supplierModal');
    },

    // Edit supplier
    editSupplier(id) {
        const suppliers = PharmaCare.getSuppliers();
        const supplier = suppliers.find(s => s.id === id);
        
        if (supplier) {
            document.getElementById('supplierModalTitle').textContent = 'Edit Supplier';
            document.getElementById('supplierId').value = supplier.id;
            document.getElementById('supplierCompany').value = supplier.company;
            document.getElementById('supplierContact').value = supplier.contact;
            document.getElementById('supplierPhone').value = supplier.phone;
            document.getElementById('supplierEmail').value = supplier.email;
            document.getElementById('supplierAddress').value = supplier.address || '';
            document.getElementById('supplierPaymentTerms').value = supplier.paymentTerms || 'Net 30';
            document.getElementById('supplierStatus').value = supplier.status || 'active';
            document.getElementById('supplierNotes').value = supplier.notes || '';
            this.openModal('supplierModal');
        }
    },

    // Save supplier
    saveSupplier(e) {
        e.preventDefault();
        
        const supplier = {
            id: document.getElementById('supplierId').value,
            company: document.getElementById('supplierCompany').value,
            contact: document.getElementById('supplierContact').value,
            phone: document.getElementById('supplierPhone').value,
            email: document.getElementById('supplierEmail').value,
            address: document.getElementById('supplierAddress').value,
            paymentTerms: document.getElementById('supplierPaymentTerms').value,
            status: document.getElementById('supplierStatus').value,
            notes: document.getElementById('supplierNotes').value
        };
        
        PharmaCare.saveSupplier(supplier);
        this.closeModal('supplierModal');
        this.renderSuppliersTable();
        this.showToast('Supplier saved successfully', 'success');
    },

    // Delete supplier
    deleteSupplier(id) {
        if (confirm('Are you sure you want to delete this supplier?')) {
            PharmaCare.deleteSupplier(id);
            this.renderSuppliersTable();
            this.showToast('Supplier deleted successfully', 'success');
        }
    },

    // Load Reports
    loadReports() {
        this.loadSalesReport();
    },

    // Update report view
    updateReportView() {
        const type = document.getElementById('reportType').value;
        
        document.querySelectorAll('.report-view').forEach(view => view.classList.remove('active'));
        document.getElementById(type + 'ReportView').classList.add('active');
        
        switch(type) {
            case 'sales':
                this.loadSalesReport();
                break;
            case 'inventory':
                this.loadInventoryReport();
                break;
            case 'customers':
                this.loadCustomerReport();
                break;
        }
    },

    // Load sales report
    loadSalesReport() {
        const transactions = PharmaCare.getTransactions();
        
        const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
        const totalTransactions = transactions.length;
        const avgSale = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        const itemsSold = transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0);
        
        document.getElementById('reportTotalRevenue').textContent = '$' + totalRevenue.toFixed(2);
        document.getElementById('reportTotalTransactions').textContent = totalTransactions;
        document.getElementById('reportAverageSale').textContent = '$' + avgSale.toFixed(2);
        document.getElementById('reportItemsSold').textContent = itemsSold;
        
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart');
        if (this.charts.revenue) this.charts.revenue.destroy();
        
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last30Days.push(date.toISOString().split('T')[0]);
        }
        
        const revenueData = last30Days.map(date => {
            const dayTransactions = transactions.filter(t => t.date.startsWith(date));
            return dayTransactions.reduce((sum, t) => sum + t.total, 0);
        });
        
        this.charts.revenue = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: last30Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Revenue',
                    data: revenueData,
                    borderColor: '#0056b3',
                    backgroundColor: 'rgba(0, 86, 179, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: value => '$' + value }
                    }
                }
            }
        });
        
        // Transactions Chart
        const transactionsCtx = document.getElementById('transactionsChart');
        if (this.charts.transactions) this.charts.transactions.destroy();
        
        const transactionsData = last30Days.map(date => {
            return transactions.filter(t => t.date.startsWith(date)).length;
        });
        
        this.charts.transactions = new Chart(transactionsCtx, {
            type: 'bar',
            data: {
                labels: last30Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Transactions',
                    data: transactionsData,
                    backgroundColor: '#4CAF50'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    // Load inventory report
    loadInventoryReport() {
        const medicines = PharmaCare.getMedicines();
        const settings = PharmaCare.getSystemSettings();
        
        const totalValue = medicines.reduce((sum, m) => sum + (parseFloat(m.price) * parseInt(m.quantity)), 0);
        const totalItems = medicines.reduce((sum, m) => sum + parseInt(m.quantity), 0);
        
        const lowStock = medicines.filter(m => parseInt(m.quantity) <= parseInt(m.reorderLevel) && parseInt(m.quantity) > 0).length;
        
        const warningDate = new Date();
        warningDate.setDate(warningDate.getDate() + parseInt(settings.expiryWarningDays));
        const expiring = medicines.filter(m => new Date(m.expiryDate) < warningDate).length;
        
        document.getElementById('reportStockValue').textContent = '$' + totalValue.toFixed(2);
        document.getElementById('reportTotalItems').textContent = totalItems;
        document.getElementById('reportLowStock').textContent = lowStock;
        document.getElementById('reportExpiring').textContent = expiring;
        
        // Category Stock Chart
        const categoryCtx = document.getElementById('categoryStockChart');
        if (this.charts.categoryStock) this.charts.categoryStock.destroy();
        
        const categories = {};
        medicines.forEach(m => {
            if (!categories[m.category]) {
                categories[m.category] = 0;
            }
            categories[m.category] += parseInt(m.quantity);
        });
        
        this.charts.categoryStock = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: ['#0056b3', '#4CAF50', '#ffc107', '#dc3545', '#6c5ce7', '#00cec9', '#e84393', '#636e72']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
        
        // Stock Movement Chart (simplified)
        const movementCtx = document.getElementById('stockMovementChart');
        if (this.charts.stockMovement) this.charts.stockMovement.destroy();
        
        this.charts.stockMovement = new Chart(movementCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Stock In',
                    data: [150, 200, 180, 220],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Stock Out',
                    data: [120, 180, 160, 200],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    // Load customer report
    loadCustomerReport() {
        const customers = PharmaCare.getCustomers();
        const transactions = PharmaCare.getTransactions();
        
        const totalCustomers = customers.length;
        
        const thisMonth = new Date().toISOString().slice(0, 7);
        const newCustomers = customers.filter(c => c.createdAt && c.createdAt.startsWith(thisMonth)).length;
        
        const repeatCustomers = customers.filter(c => c.totalVisits > 1).length;
        
        const totalSpent = transactions.reduce((sum, t) => sum + t.total, 0);
        const avgCustomerValue = customers.length > 0 ? totalSpent / customers.length : 0;
        
        document.getElementById('reportTotalCustomers').textContent = totalCustomers;
        document.getElementById('reportNewCustomers').textContent = newCustomers;
        document.getElementById('reportRepeatCustomers').textContent = repeatCustomers;
        document.getElementById('reportAvgCustomerValue').textContent = '$' + avgCustomerValue.toFixed(2);
        
        // Customer Growth Chart
        const growthCtx = document.getElementById('customerGrowthChart');
        if (this.charts.customerGrowth) this.charts.customerGrowth.destroy();
        
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toISOString().slice(0, 7));
        }
        
        const customerData = months.map(month => {
            return customers.filter(c => c.createdAt && c.createdAt.startsWith(month)).length;
        });
        
        this.charts.customerGrowth = new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: months.map(m => new Date(m).toLocaleDateString('en-US', { month: 'short' })),
                datasets: [{
                    label: 'New Customers',
                    data: customerData,
                    borderColor: '#0056b3',
                    backgroundColor: 'rgba(0, 86, 179, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
        
        // Top Customers Chart
        const topCtx = document.getElementById('topCustomersChart');
        if (this.charts.topCustomers) this.charts.topCustomers.destroy();
        
        const customerSpending = {};
        transactions.forEach(t => {
            if (t.customerId) {
                if (!customerSpending[t.customerId]) {
                    customerSpending[t.customerId] = 0;
                }
                customerSpending[t.customerId] += t.total;
            }
        });
        
        const topCustomers = Object.entries(customerSpending)
            .map(([id, spent]) => ({
                id,
                name: customers.find(c => c.id === id)?.name || 'Unknown',
                spent
            }))
            .sort((a, b) => b.spent - a.spent)
            .slice(0, 5);
        
        this.charts.topCustomers = new Chart(topCtx, {
            type: 'bar',
            data: {
                labels: topCustomers.map(c => c.name),
                datasets: [{
                    label: 'Total Spent',
                    data: topCustomers.map(c => c.spent),
                    backgroundColor: '#0056b3'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: value => '$' + value }
                    }
                }
            }
        });
    },

    // Generate report
    generateReport() {
        this.updateReportView();
        this.showToast('Report generated successfully', 'success');
    },

    // Export report
    exportReport() {
        const type = document.getElementById('reportType').value;
        let csv = '';
        
        if (type === 'sales') {
            const transactions = PharmaCare.getTransactions();
            csv = [
                ['ID', 'Date', 'Items', 'Subtotal', 'Tax', 'Discount', 'Total', 'Payment', 'Customer'].join(','),
                ...transactions.map(t => [
                    t.id,
                    new Date(t.date).toLocaleDateString(),
                    t.items.length,
                    t.subtotal.toFixed(2),
                    t.tax.toFixed(2),
                    t.discount.toFixed(2),
                    t.total.toFixed(2),
                    t.paymentMethod,
                    t.customerId || 'Walk-in'
                ].join(','))
            ].join('\n');
        } else if (type === 'inventory') {
            const medicines = PharmaCare.getMedicines();
            csv = [
                ['SKU', 'Name', 'Category', 'Quantity', 'Price', 'Value', 'Expiry'].join(','),
                ...medicines.map(m => [
                    m.sku, `"${m.name}"`, m.category, m.quantity, m.price, 
                    (m.price * m.quantity).toFixed(2), m.expiryDate
                ].join(','))
            ].join('\n');
        } else {
            const customers = PharmaCare.getCustomers();
            csv = [
                ['ID', 'Name', 'Phone', 'Email', 'Visits', 'Last Visit'].join(','),
                ...customers.map(c => [
                    c.id, `"${c.name}"`, c.phone, c.email || '', c.totalVisits, c.lastVisit || ''
                ].join(','))
            ].join('\n');
        }
        
        this.downloadCSV(csv, `${type}_report.csv`);
        this.showToast('Report exported successfully', 'success');
    },

    // Load Users
    loadUsers() {
        this.renderUsersTable();
    },

    // Render users table
    renderUsersTable(users = null) {
        const usrs = users || PharmaCare.getUsers();
        const tbody = document.getElementById('usersTableBody');
        
        if (usrs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = usrs.map(u => `
            <tr data-id="${u.id}">
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><span class="status-badge ${u.role === 'admin' ? 'in-stock' : u.role === 'pharmacist' ? 'low-stock' : 'expiring'}">${u.role}</span></td>
                <td><span class="status-badge ${u.status === 'active' ? 'in-stock' : 'out-of-stock'}">${u.status}</span></td>
                <td>${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" onclick="App.editUser('${u.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        ${u.id !== this.currentUser?.id ? `
                        <button class="action-btn danger" onclick="App.deleteUser('${u.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Show add user modal
    showAddUserModal() {
        document.getElementById('userModalTitle').textContent = 'Add New User';
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
        document.getElementById('passwordRow').style.display = 'flex';
        document.getElementById('userPassword').required = true;
        this.openModal('userModal');
    },

    // Edit user
    editUser(id) {
        const users = PharmaCare.getUsers();
        const user = users.find(u => u.id === id);
        
        if (user) {
            document.getElementById('userModalTitle').textContent = 'Edit User';
            document.getElementById('userId').value = user.id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userStatus').value = user.status;
            document.getElementById('passwordRow').style.display = 'none';
            document.getElementById('userPassword').required = false;
            this.openModal('userModal');
        }
    },

    // Save user
    saveUser(e) {
        e.preventDefault();
        
        const userData = {
            id: document.getElementById('userId').value,
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            role: document.getElementById('userRole').value,
            status: document.getElementById('userStatus').value
        };
        
        // Only update password if provided
        const password = document.getElementById('userPassword').value;
        const passwordConfirm = document.getElementById('userPasswordConfirm').value;
        
        if (document.getElementById('userId').value) {
            // Editing existing user
            const users = PharmaCare.getUsers();
            const existingUser = users.find(u => u.id === userData.id);
            userData.password = existingUser.password;
            userData.lastLogin = existingUser.lastLogin;
            userData.phone = existingUser.phone;
        } else {
            // New user
            if (password !== passwordConfirm) {
                this.showToast('Passwords do not match', 'error');
                return;
            }
            userData.password = password;
            userData.lastLogin = null;
        }
        
        PharmaCare.saveUser(userData);
        this.closeModal('userModal');
        this.renderUsersTable();
        this.showToast('User saved successfully', 'success');
    },

    // Delete user
    deleteUser(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            PharmaCare.deleteUser(id);
            this.renderUsersTable();
            this.showToast('User deleted successfully', 'success');
        }
    },

    // Load Settings
    loadSettings() {
        // Already loaded in checkRolePermissions
    },

    // Update profile
    updateProfile(e) {
        e.preventDefault();
        
        const userData = {
            ...this.currentUser,
            name: document.getElementById('profileName').value,
            email: document.getElementById('profileEmail').value,
            phone: document.getElementById('profilePhone').value
        };
        
        PharmaCare.saveUser(userData);
        this.currentUser = userData;
        PharmaCare.setCurrentUser(userData);
        this.updateUserInfo();
        this.showToast('Profile updated successfully', 'success');
    },

    // Change password
    changePassword(e) {
        e.preventDefault();
        
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;
        
        if (current !== this.currentUser.password) {
            this.showToast('Current password is incorrect', 'error');
            return;
        }
        
        if (newPass !== confirmPass) {
            this.showToast('New passwords do not match', 'error');
            return;
        }
        
        if (newPass.length < 6) {
            this.showToast('Password must be at least 6 characters', 'error');
            return;
        }
        
        const userData = { ...this.currentUser, password: newPass };
        PharmaCare.saveUser(userData);
        this.currentUser = userData;
        PharmaCare.setCurrentUser(userData);
        
        document.getElementById('passwordForm').reset();
        this.showToast('Password changed successfully', 'success');
    },

    // Update system setting
    updateSystemSetting(key, value) {
        PharmaCare.updateSystemSettings({ [key]: value });
        this.showToast('Setting updated', 'success');
    },

    // Global search
    handleGlobalSearch(query) {
        if (!query || query.length < 2) return;
        
        const search = query.toLowerCase();
        
        // Search medicines
        const medicines = PharmaCare.getMedicines().filter(m => 
            m.name.toLowerCase().includes(search) ||
            m.sku.toLowerCase().includes(search)
        );
        
        if (medicines.length > 0) {
            this.showToast(`Found ${medicines.length} medicine(ies)`, 'info');
            // Could redirect to inventory or show results
        }
    },

    // Notifications
    showNotifications() {
        document.getElementById('notificationsPanel').classList.add('active');
        this.updateAlertsList();
    },

    hideNotifications() {
        document.getElementById('notificationsPanel').classList.remove('active');
    },

    updateAlertsList() {
        const alerts = PharmaCare.getAlerts();
        const container = document.getElementById('notificationsList');
        
        if (alerts.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No notifications</p></div>';
            return;
        }
        
        container.innerHTML = alerts.slice(0, 10).map(alert => `
            <div class="notification-item ${alert.read ? '' : 'unread'}" onclick="App.markNotificationRead('${alert.id}')">
                <h4>${alert.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                <p>${alert.medicineName || ''} - ${alert.message}</p>
                <span>${new Date(alert.date).toLocaleString()}</span>
            </div>
        `).join('');
    },

    markNotificationRead(id) {
        PharmaCare.markAlertRead(id);
        this.updateAlertsList();
    },

    markAllAlertsRead() {
        PharmaCare.markAllAlertsRead();
        this.updateAlertsList();
        this.loadAlerts();
    },

    // Toggle functions
    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('active');
    },

    toggleUserMenu() {
        document.getElementById('userDropdown').classList.toggle('hidden');
    },

    togglePrescriptionUpload() {
        // Show prescription upload modal if required
    },

    // Modal functions
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = '';
    },

    // Toast notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlide 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // Utility functions
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }
};

// Global functions for demo login
function fillDemoLogin(email, password) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = password;
}

// Global function for logout
function logout() {
    App.logout();
}

// Global function for toggling sidebar
function toggleSidebar() {
    App.toggleSidebar();
}

// Global function for toggling user menu
function toggleUserMenu() {
    App.toggleUserMenu();
}

// Global function for showing notifications
function showNotifications() {
    App.showNotifications();
}

// Global function for hiding notifications
function hideNotifications() {
    App.hideNotifications();
}

// Global function for marking all alerts read
function markAllAlertsRead() {
    App.markAllAlertsRead();
}

// Global function for opening modal
function openModal(modalId) {
    App.openModal(modalId);
}

// Global function for closing modal
function closeModal(modalId) {
    App.closeModal(modalId);
}

// Global function for showing toast
function showToast(message, type) {
    App.showToast(message, type);
}

// Global function for export inventory
function exportInventory() {
    App.exportInventory();
}

// Global function for showing add medicine modal
function showAddMedicineModal() {
    App.showAddMedicineModal();
}

// Global function for editing medicine
function editMedicine(id) {
    App.editMedicine(id);
}

// Global function for deleting medicine
function deleteMedicine(id) {
    App.deleteMedicine(id);
}

// Global function for adding to cart
function addToCart(medicineId) {
    App.addToCart(medicineId);
}

// Global function for updating cart quantity
function updateCartQuantity(medicineId, change) {
    App.updateCartQuantity(medicineId, change);
}

// Global function for removing from cart
function removeFromCart(medicineId) {
    App.removeFromCart(medicineId);
}

// Global function for download CSV
function downloadCSV(content, filename) {
    App.downloadCSV(content, filename);
}

// Global function for export report
function exportReport() {
    App.exportReport();
}

// Global function for showing page
function showPage(page) {
    App.showPage(page);
}

// Global function for sorting inventory
function sortInventory(field) {
    App.sortInventory(field);
}

// Global function for filtering POS category
function filterPOSCategory(category) {
    App.filterPOSCategory(category);
}

// Global function for clearing cart
function clearCart() {
    App.clearCart();
}

// Global function for holding cart
function holdCart() {
    App.holdCart();
}

// Global function for processing payment
function processPayment() {
    App.processPayment();
}

// Global function for showing add customer modal
function showAddCustomerModal() {
    App.showAddCustomerModal();
}

// Global function for showing add supplier modal
function showAddSupplierModal() {
    App.showAddSupplierModal();
}

// Global function for generating report
function generateReport() {
    App.generateReport();
}

// Global function for showing add user modal
function showAddUserModal() {
    App.showAddUserModal();
}

// Global function for printing invoice
function printInvoice() {
    App.printInvoice();
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
