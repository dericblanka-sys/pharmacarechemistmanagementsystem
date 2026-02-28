// PharmaCare Manager - Data Layer
// Handles all data storage and retrieval using localStorage

const PharmaCare = {
    // Initialize data store
    init() {
        if (!this.getData('initialized')) {
            this.initializeDemoData();
        }
    },

    // Get data from localStorage
    getData(key) {
        try {
            const data = localStorage.getItem(`pharmacare_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting data:', error);
            return null;
        }
    },

    // Save data to localStorage
    setData(key, value) {
        try {
            localStorage.setItem(`pharmacare_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    },

    // Initialize demo data
    initializeDemoData() {
        // Initialize users
        const users = [
            {
                id: 'U001',
                name: 'Admin User',
                email: 'admin@pharmacare.com',
                password: 'admin',
                role: 'admin',
                status: 'active',
                phone: '555-0101',
                lastLogin: new Date().toISOString()
            },
            {
                id: 'U002',
                name: 'John Pharmacist',
                email: 'pharmacist@pharmacare.com',
                password: 'pharmacist',
                role: 'pharmacist',
                status: 'active',
                phone: '555-0102',
                lastLogin: new Date().toISOString()
            },
            {
                id: 'U003',
                name: 'Jane Cashier',
                email: 'cashier@pharmacare.com',
                password: 'cashier',
                role: 'cashier',
                status: 'active',
                phone: '555-0103',
                lastLogin: new Date().toISOString()
            }
        ];

        // Initialize medicines
        const medicines = [
            {
                id: 'M001',
                sku: 'ABX-001',
                name: 'Amoxicillin',
                genericName: 'Amoxicillin',
                category: 'Antibiotics',
                dosage: '500mg',
                form: 'Capsule',
                price: 15.99,
                cost: 8.50,
                quantity: 150,
                reorderLevel: 20,
                expiryDate: '2026-06-15',
                supplier: 'S001',
                description: 'Broad-spectrum antibiotic for bacterial infections',
                createdAt: new Date().toISOString()
            },
            {
                id: 'M002',
                sku: 'ABX-002',
                name: 'Azithromycin',
                genericName: 'Azithromycin',
                category: 'Antibiotics',
                dosage: '250mg',
                form: 'Tablet',
                price: 22.50,
                cost: 12.00,
                quantity: 8,
                reorderLevel: 15,
                expiryDate: '2026-03-20',
                supplier: 'S001',
                description: 'Macrolide antibiotic for respiratory infections',
                createdAt: new Date().toISOString()
            },
            {
                id: 'M003',
                sku: 'PAI-001',
                name: 'Ibuprofen',
                genericName: 'Ibuprofen',
                category: 'Pain Relief',
                dosage: '400mg',
                form: 'Tablet',
                price: 8.99,
                cost: 3.50,
                quantity: 200,
                reorderLevel: 30,
                expiryDate: '2026-12-01',
                supplier: 'S002',
                description: 'NSAID for pain and inflammation',
                createdAt: new Date().toISOString()
            },
            {
                id: 'M004',
                sku: 'PAI-002',
                name: 'Paracetamol',
                genericName: 'Acetaminophen',
                category: 'Pain Relief',
                dosage: '500mg',
                form: 'Tablet',
                price: 6.50,
                cost: 2.50,
                quantity: 5,
                reorderLevel: 25,
                expiryDate: '2026-02-10',
                supplier: 'S002',
                description: 'Pain reliever and fever reducer',
                createdAt: new Date().toISOString()
            },
            {
                id: 'M005',
                sku: 'VIT-001',
                name: 'Vitamin C',
                genericName: 'Ascorbic Acid',
                category: 'Vitamins',
                dosage: '1000mg',
                form: 'Tablet',
                price: 12.99,
                cost: 5.00,
                quantity: 100,
                reorderLevel: 20,
                expiryDate: '2026-08-15',
                supplier: 'S003',
                description: 'Essential vitamin for immune support',
                createdAt: new Date().toISOString()
            },
            {
                id: 'M006',
                sku: 'VIT-002',
                name: 'Multivitamin',
                genericName: 'Multiple Vitamins',
                category: 'Vitamins',
                dosage: 'Standard',
                form: 'Tablet',
                price: 18.99,
                cost: 8.00,
                quantity: 75,
                reorderLevel: 15,
                expiryDate: '2026-09-30',
                supplier: 'S003',
                description: 'Daily multivitamin supplement',
                createdAt: new Date().toISOString()
            },
            {
                id: 'M007',
                sku: 'CAR-001',
                name: 'Aspirin',
                genericName: 'Acetylsalicylic Acid',
                category: 'Cardiology',
                dosage: '81mg',
                form: 'Tablet',
                price: 9.99,
                cost: 4.00,
                quantity: 120,
                reorderLevel: 25,
                expiryDate: '2026-07-20',
                supplier: 'S002',
                description: 'Low-dose aspirin for heart health',
                createdAt: new Date().toISOString()
            },
            {
                id: 'M008',
                sku: 'CAR-002',
                name: 'Atorvastatin',
                genericName: 'Atorvastatin Calcium',
                category: 'Cardiology',
                dosage: '20mg',
                form: 'Tablet',
                price: 35.99,
                cost: 18.00,
                quantity: 60,
                reorderLevel: 10,
                expiryDate: '2026-05-15',
                supplier: 'S001',
                description: 'Statin for cholesterol management',
                createdAt: new Date().toISOString()
            },
            {
                id: 'M009',
                sku: 'DER-001',
                name: 'Hydrocortisone Cream',
                genericName: 'Hydrocortisone',
                category: 'Dermatology',
                dosage: '1%',
                form: 'Cream',
                price: 11.99,
                cost: 5.50,
                quantity: 45,
                reorderLevel: 10,
                expiryDate: '2026-11-01',
                supplier: 'S004',
                description: 'Topical corticosteroid for skin inflammation',
                createdAt: new Date().toISOString()
            },
            {
                id: 'M010',
                sku: 'RES-001',
                name: 'Salbutamol Inhaler',
                genericName: 'Albuterol',
                category: 'Respiratory',
                dosage: '100mcg',
                form: 'Inhaler',
                price: 28.99,
                cost: 15.00,
                quantity: 35,
                reorderLevel: 8,
                expiryDate: '2026-04-20',
                supplier: 'S003',
                description: 'Bronchodilator for asthma relief',
                createdAt: new Date().toISOString()
            },
            {
                id: 'M011',
                sku: 'GAS-001',
                name: 'Omeprazole',
                genericName: 'Omeprazole',
                category: 'Gastrointestinal',
                dosage: '20mg',
                form: 'Capsule',
                price: 19.99,
                cost: 9.00,
                quantity: 90,
                reorderLevel: 15,
                expiryDate: '2026-06-30',
                supplier: 'S001',
                description: 'Proton pump inhibitor for acid reflux',
                createdAt: new Date().toISOString()
            },
            {
                id: 'M012',
                sku: 'ABX-003',
                name: 'Ciprofloxacin',
                genericName: 'Ciprofloxacin',
                category: 'Antibiotics',
                dosage: '500mg',
                form: 'Tablet',
                price: 24.99,
                cost: 12.50,
                quantity: 0,
                reorderLevel: 15,
                expiryDate: '2026-08-01',
                supplier: 'S001',
                description: 'Fluoroquinolone antibiotic',
                createdAt: new Date().toISOString()
            }
        ];

        // Initialize customers
        const customers = [
            {
                id: 'C001',
                name: 'Sarah Johnson',
                phone: '555-1001',
                email: 'sarah.j@email.com',
                dob: '1985-03-15',
                address: '123 Main St, City, ST 12345',
                allergies: 'Penicillin',
                insurance: 'BlueCross',
                insuranceNumber: 'BC123456',
                notes: 'Prefers generic medications',
                totalVisits: 15,
                lastVisit: '2026-01-08',
                createdAt: '2025-06-15T10:30:00Z'
            },
            {
                id: 'C002',
                name: 'Michael Brown',
                phone: '555-1002',
                email: 'mbrown@email.com',
                dob: '1972-08-22',
                address: '456 Oak Ave, Town, ST 67890',
                allergies: '',
                insurance: 'Aetna',
                insuranceNumber: 'AE789012',
                notes: '',
                totalVisits: 8,
                lastVisit: '2026-01-05',
                createdAt: '2025-08-20T14:15:00Z'
            },
            {
                id: 'C003',
                name: 'Emily Davis',
                phone: '555-1003',
                email: 'emily.d@email.com',
                dob: '1990-12-01',
                address: '789 Pine Rd, Village, ST 11111',
                allergies: 'Sulfa drugs',
                insurance: 'UnitedHealth',
                insuranceNumber: 'UH345678',
                notes: 'Regular customer for vitamins',
                totalVisits: 22,
                lastVisit: '2026-01-10',
                createdAt: '2025-01-10T09:00:00Z'
            },
            {
                id: 'C004',
                name: 'Robert Wilson',
                phone: '555-1004',
                email: 'rwilson@email.com',
                dob: '1965-05-30',
                address: '321 Elm St, Metro, ST 22222',
                allergies: 'Aspirin, Ibuprofen',
                insurance: 'Medicare',
                insuranceNumber: 'MC901234',
                notes: 'Requires large print labels',
                totalVisits: 35,
                lastVisit: '2026-01-09',
                createdAt: '2024-03-22T11:45:00Z'
            }
        ];

        // Initialize suppliers
        const suppliers = [
            {
                id: 'S001',
                company: 'PharmaDist Inc.',
                contact: 'David Chen',
                phone: '555-2001',
                email: 'dchen@pharmadist.com',
                address: '100 Industry Blvd, Pharma City, PC 11111',
                paymentTerms: 'Net 30',
                status: 'active',
                notes: 'Primary antibiotic supplier',
                createdAt: '2024-01-15T08:00:00Z'
            },
            {
                id: 'S002',
                company: 'MedSupply Co.',
                contact: 'Maria Garcia',
                phone: '555-2002',
                email: 'mgarcia@medsupply.com',
                address: '200 Commerce Way, Health Town, HT 22222',
                paymentTerms: 'Net 45',
                status: 'active',
                notes: 'Good for pain relief and basic meds',
                createdAt: '2024-02-20T10:30:00Z'
            },
            {
                id: 'S003',
                company: 'Wellness Pharma',
                contact: 'James Miller',
                phone: '555-2003',
                email: 'jmiller@wellnesspharma.com',
                address: '300 Wellness Dr, Fit City, FC 33333',
                paymentTerms: 'Due on Receipt',
                status: 'active',
                notes: 'Specializes in vitamins and respiratory',
                createdAt: '2024-03-10T14:00:00Z'
            },
            {
                id: 'S004',
                company: 'DermaMed Supply',
                contact: 'Lisa Anderson',
                phone: '555-2004',
                email: 'landerson@dermamed.com',
                address: '400 Skin Care Lane, Beauty Bay, BB 44444',
                paymentTerms: 'Net 30',
                status: 'active',
                notes: 'Dermatology products specialist',
                createdAt: '2024-04-05T09:15:00Z'
            }
        ];

        // Initialize transactions
        const today = new Date();
        const transactions = [];
        
        // Generate some demo transactions for the past 7 days
        for (let i = 0; i < 50; i++) {
            const daysAgo = Math.floor(Math.random() * 7);
            const date = new Date(today);
            date.setDate(date.getDate() - daysAgo);
            
            const numItems = Math.floor(Math.random() * 4) + 1;
            const items = [];
            let subtotal = 0;
            
            for (let j = 0; j < numItems; j++) {
                const medicine = medicines[Math.floor(Math.random() * medicines.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                const total = medicine.price * qty;
                subtotal += total;
                
                items.push({
                    medicineId: medicine.id,
                    name: medicine.name,
                    price: medicine.price,
                    quantity: qty,
                    total: total
                });
            }
            
            const tax = subtotal * 0.10;
            const total = subtotal + tax;
            
            transactions.push({
                id: `T${String(1000 + i).padStart(4, '0')}`,
                date: date.toISOString(),
                items: items,
                subtotal: subtotal,
                tax: tax,
                discount: 0,
                total: total,
                paymentMethod: ['cash', 'card', 'insurance'][Math.floor(Math.random() * 3)],
                customerId: Math.random() > 0.5 ? customers[Math.floor(Math.random() * customers.length)].id : null,
                cashierId: 'U003',
                status: 'completed'
            });
        }

        // Save all demo data
        this.setData('users', users);
        this.setData('medicines', medicines);
        this.setData('customers', customers);
        this.setData('suppliers', suppliers);
        this.setData('transactions', transactions);
        this.setData('alerts', []);
        this.setData('initialized', true);
        this.setData('systemSettings', {
            lowStockThreshold: 10,
            expiryWarningDays: 30,
            taxRate: 10
        });
    },

    // User methods
    getUsers() {
        return this.getData('users') || [];
    },

    saveUser(user) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index >= 0) {
            users[index] = user;
        } else {
            user.id = 'U' + String(users.length + 1).padStart(3, '0');
            users.push(user);
        }
        this.setData('users', users);
        return user;
    },

    deleteUser(id) {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== id);
        this.setData('users', filtered);
    },

    // Medicine methods
    getMedicines() {
        return this.getData('medicines') || [];
    },

    saveMedicine(medicine) {
        const medicines = this.getMedicines();
        const index = medicines.findIndex(m => m.id === medicine.id);
        if (index >= 0) {
            medicines[index] = { ...medicines[index], ...medicine };
        } else {
            medicine.id = 'M' + String(medicines.length + 1).padStart(3, '0');
            medicine.createdAt = new Date().toISOString();
            medicines.push(medicine);
        }
        this.setData('medicines', medicines);
        return medicine;
    },

    deleteMedicine(id) {
        const medicines = this.getMedicines();
        const filtered = medicines.filter(m => m.id !== id);
        this.setData('medicines', filtered);
    },

    updateMedicineStock(id, quantity) {
        const medicines = this.getMedicines();
        const index = medicines.findIndex(m => m.id === id);
        if (index >= 0) {
            medicines[index].quantity = parseInt(medicines[index].quantity) + parseInt(quantity);
            this.setData('medicines', medicines);
        }
    },

    // Customer methods
    getCustomers() {
        return this.getData('customers') || [];
    },

    saveCustomer(customer) {
        const customers = this.getCustomers();
        const index = customers.findIndex(c => c.id === customer.id);
        if (index >= 0) {
            customers[index] = { ...customers[index], ...customer };
        } else {
            customer.id = 'C' + String(customers.length + 1).padStart(3, '0');
            customer.totalVisits = 0;
            customer.createdAt = new Date().toISOString();
            customers.push(customer);
        }
        this.setData('customers', customers);
        return customer;
    },

    deleteCustomer(id) {
        const customers = this.getCustomers();
        const filtered = customers.filter(c => c.id !== id);
        this.setData('customers', filtered);
    },

    updateCustomerVisit(customerId) {
        const customers = this.getCustomers();
        const index = customers.findIndex(c => c.id === customerId);
        if (index >= 0) {
            customers[index].totalVisits = parseInt(customers[index].totalVisits) + 1;
            customers[index].lastVisit = new Date().toISOString().split('T')[0];
            this.setData('customers', customers);
        }
    },

    // Supplier methods
    getSuppliers() {
        return this.getData('suppliers') || [];
    },

    saveSupplier(supplier) {
        const suppliers = this.getSuppliers();
        const index = suppliers.findIndex(s => s.id === supplier.id);
        if (index >= 0) {
            suppliers[index] = { ...suppliers[index], ...supplier };
        } else {
            supplier.id = 'S' + String(suppliers.length + 1).padStart(3, '0');
            supplier.createdAt = new Date().toISOString();
            suppliers.push(supplier);
        }
        this.setData('suppliers', suppliers);
        return supplier;
    },

    deleteSupplier(id) {
        const suppliers = this.getSuppliers();
        const filtered = suppliers.filter(s => s.id !== id);
        this.setData('suppliers', filtered);
    },

    // Transaction methods
    getTransactions() {
        return this.getData('transactions') || [];
    },

    saveTransaction(transaction) {
        const transactions = this.getTransactions();
        transaction.id = 'T' + String(transactions.length + 1001);
        transaction.date = new Date().toISOString();
        transaction.cashierId = App.currentUser?.id || 'U003';
        transactions.unshift(transaction);
        this.setData('transactions', transactions);
        
        // Update stock for each item
        transaction.items.forEach(item => {
            this.updateMedicineStock(item.medicineId, -item.quantity);
        });
        
        // Update customer visit if customer selected
        if (transaction.customerId) {
            this.updateCustomerVisit(transaction.customerId);
        }
        
        // Check for low stock alerts
        this.checkAlerts();
        
        return transaction;
    },

    // Alert methods
    getAlerts() {
        return this.getData('alerts') || [];
    },

    addAlert(alert) {
        const alerts = this.getAlerts();
        alert.id = 'A' + String(Date.now());
        alert.date = new Date().toISOString();
        alert.read = false;
        alerts.unshift(alert);
        this.setData('alerts', alerts);
        this.updateAlertBadge();
    },

    markAlertRead(id) {
        const alerts = this.getAlerts();
        const index = alerts.findIndex(a => a.id === id);
        if (index >= 0) {
            alerts[index].read = true;
            this.setData('alerts', alerts);
            this.updateAlertBadge();
        }
    },

    markAllAlertsRead() {
        const alerts = this.getAlerts();
        alerts.forEach(a => a.read = true);
        this.setData('alerts', alerts);
        this.updateAlertBadge();
    },

    checkAlerts() {
        const medicines = this.getMedicines();
        const settings = this.getSystemSettings();
        const alerts = this.getAlerts();
        
        // Clear old low stock and expiry alerts
        const filteredAlerts = alerts.filter(a => {
            const alertDate = new Date(a.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return alertDate > weekAgo && (a.type === 'prescription' || a.type === 'order');
        });
        
        medicines.forEach(medicine => {
            // Check low stock
            if (parseInt(medicine.quantity) <= parseInt(medicine.reorderLevel) && parseInt(medicine.quantity) > 0) {
                const existingAlert = filteredAlerts.find(a => 
                    a.type === 'low_stock' && a.medicineId === medicine.id
                );
                if (!existingAlert) {
                    filteredAlerts.push({
                        id: 'A' + Date.now() + Math.random(),
                        type: 'low_stock',
                        medicineId: medicine.id,
                        medicineName: medicine.name,
                        message: `${medicine.name} is running low (${medicine.quantity} units remaining)`,
                        date: new Date().toISOString(),
                        read: false
                    });
                }
            }
            
            // Check out of stock
            if (parseInt(medicine.quantity) === 0) {
                const existingAlert = filteredAlerts.find(a => 
                    a.type === 'out_of_stock' && a.medicineId === medicine.id
                );
                if (!existingAlert) {
                    filteredAlerts.push({
                        id: 'A' + Date.now() + Math.random(),
                        type: 'out_of_stock',
                        medicineId: medicine.id,
                        medicineName: medicine.name,
                        message: `${medicine.name} is out of stock!`,
                        date: new Date().toISOString(),
                        read: false
                    });
                }
            }
            
            // Check expiry
            const expiryDate = new Date(medicine.expiryDate);
            const warningDate = new Date();
            warningDate.setDate(warningDate.getDate() + parseInt(settings.expiryWarningDays));
            
            if (expiryDate < warningDate) {
                const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                const existingAlert = filteredAlerts.find(a => 
                    a.type === 'expiry' && a.medicineId === medicine.id
                );
                if (!existingAlert) {
                    filteredAlerts.push({
                        id: 'A' + Date.now() + Math.random(),
                        type: 'expiry',
                        medicineId: medicine.id,
                        medicineName: medicine.name,
                        message: `${medicine.name} expires in ${daysUntilExpiry} days`,
                        date: new Date().toISOString(),
                        read: false
                    });
                }
            }
        });
        
        this.setData('alerts', filteredAlerts);
        this.updateAlertBadge();
    },

    updateAlertBadge() {
        const alerts = this.getAlerts();
        const unreadCount = alerts.filter(a => !a.read).length;
        const badge = document.getElementById('alertBadge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    },

    // System settings
    getSystemSettings() {
        return this.getData('systemSettings') || {
            lowStockThreshold: 10,
            expiryWarningDays: 30,
            taxRate: 10
        };
    },

    updateSystemSettings(settings) {
        const current = this.getSystemSettings();
        this.setData('systemSettings', { ...current, ...settings });
    },

    // Current session
    setCurrentUser(user) {
        this.setData('currentUser', user);
    },

    getCurrentUser() {
        return this.getData('currentUser');
    },

    clearCurrentUser() {
        localStorage.removeItem('pharmacare_currentUser');
    }
};

// Initialize data layer
PharmaCare.init();
