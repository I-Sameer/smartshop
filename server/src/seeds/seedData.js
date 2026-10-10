import bcrypt from 'bcryptjs';
import { VectorEngine } from '../services/ai/vectorEngine.js';

export const getSeedData = async () => {
  const customerPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const users = [
    {
      id: 'u1111111-1111-1111-1111-111111111111',
      email: 'customer@shopsmart.ai',
      password_hash: customerPasswordHash,
      full_name: 'Alex Mercer',
      membership_tier: 'PRIME',
      role: 'CUSTOMER',
      preferences: {
        preferred_categories: ['Laptops & Computers', 'Audio & Headphones'],
        budget_alert: 1200
      }
    },
    {
      id: 'u2222222-2222-2222-2222-222222222222',
      email: 'admin@shopsmart.ai',
      password_hash: adminPasswordHash,
      full_name: 'Sarah Connor',
      membership_tier: 'PREMIUM',
      role: 'ADMIN',
      preferences: {
        preferred_categories: [],
        budget_alert: null
      }
    },
    {
      id: 'u3333333-3333-3333-3333-333333333333',
      email: 'basic@shopsmart.ai',
      password_hash: customerPasswordHash,
      full_name: 'David Miller',
      membership_tier: 'BASIC',
      role: 'CUSTOMER',
      preferences: {
        preferred_categories: ['Smartphones & Tablets'],
        budget_alert: 800
      }
    }
  ];

  const categories = [
    {
      id: 'c1000000-0000-0000-0000-000000000001',
      parent_id: null,
      name: 'Electronics',
      slug: 'electronics',
      display_order: 1,
      icon_url: 'Laptop'
    },
    {
      id: 'c1000000-0000-0000-0000-000000000002',
      parent_id: 'c1000000-0000-0000-0000-000000000001',
      name: 'Laptops & Computers',
      slug: 'laptops-computers',
      display_order: 2,
      icon_url: 'Cpu'
    },
    {
      id: 'c1000000-0000-0000-0000-000000000003',
      parent_id: 'c1000000-0000-0000-0000-000000000001',
      name: 'Audio & Headphones',
      slug: 'audio-headphones',
      display_order: 3,
      icon_url: 'Headphones'
    },
    {
      id: 'c1000000-0000-0000-0000-000000000004',
      parent_id: 'c1000000-0000-0000-0000-000000000001',
      name: 'Smartphones & Tablets',
      slug: 'smartphones-tablets',
      display_order: 4,
      icon_url: 'Smartphone'
    },
    {
      id: 'c2000000-0000-0000-0000-000000000001',
      parent_id: null,
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      display_order: 5,
      icon_url: 'Home'
    },
    {
      id: 'c2000000-0000-0000-0000-000000000002',
      parent_id: 'c2000000-0000-0000-0000-000000000001',
      name: 'Smart Kitchen & Appliances',
      slug: 'smart-kitchen',
      display_order: 6,
      icon_url: 'Coffee'
    }
  ];

  const rawProducts = [
    {
      id: 'p1010000-0000-0000-0000-000000000101',
      category_id: 'c1000000-0000-0000-0000-000000000002',
      product_code: 'LAP101',
      name: 'Dell Inspiron 15 3530',
      brand: 'Dell',
      price: 899.99,
      rating: 4.5,
      review_count: 342,
      stock_status: 'IN_STOCK',
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=60',
      specifications: {
        processor: 'Intel Core i7-1355U (10 Cores, up to 5.0 GHz)',
        ram: '16GB DDR4 3200MHz',
        ram_gb: 16,
        storage: '512GB PCIe NVMe M.2 SSD',
        storage_gb: 512,
        graphics: 'Intel Iris Xe Graphics',
        display: '15.6-inch FHD (1920 x 1080) 120Hz Anti-Glare',
        battery: '54 Wh, ExpressCharge 80% in 60 mins',
        os: 'Windows 11 Home',
        weight: '1.65 kg',
        use_cases: ['Java Development', 'AI/ML Prototyping', 'Productivity', 'Student Coding']
      }
    },
    {
      id: 'p1020000-0000-0000-0000-000000000102',
      category_id: 'c1000000-0000-0000-0000-000000000002',
      product_code: 'LAP102',
      name: 'Lenovo ThinkPad E16 Gen 1',
      brand: 'Lenovo',
      price: 949.00,
      rating: 4.6,
      review_count: 218,
      stock_status: 'IN_STOCK',
      image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=60',
      specifications: {
        processor: 'AMD Ryzen 7 7730U (8 Cores, 16 Threads)',
        ram: '16GB DDR4 3200MHz (Upgradable to 40GB)',
        ram_gb: 16,
        storage: '1TB PCIe Gen4 SSD',
        storage_gb: 1024,
        graphics: 'AMD Radeon Graphics',
        display: '16.0-inch WUXGA (1920 x 1200) IPS Anti-Glare',
        battery: '57 Wh, up to 11 hours',
        os: 'Windows 11 Pro',
        weight: '1.77 kg',
        use_cases: ['Software Engineering', 'Java Enterprise', 'Docker/Containers', 'Data Analysis']
      }
    },
    {
      id: 'p1030000-0000-0000-0000-000000000103',
      category_id: 'c1000000-0000-0000-0000-000000000002',
      product_code: 'LAP103',
      name: 'ASUS ROG Zephyrus G14',
      brand: 'ASUS',
      price: 1449.99,
      rating: 4.8,
      review_count: 512,
      stock_status: 'IN_STOCK',
      image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=60',
      specifications: {
        processor: 'AMD Ryzen 9 8945HS (8 Cores, AI NPU up to 39 TOPS)',
        ram: '32GB LPDDR5X 6400MHz',
        ram_gb: 32,
        storage: '1TB PCIe Gen4 M.2 SSD',
        storage_gb: 1024,
        graphics: 'NVIDIA GeForce RTX 4070 8GB GDDR6',
        display: '14.0-inch 3K (2880 x 1800) OLED 120Hz 0.2ms',
        battery: '73 Wh, 100W USB-C fast charging',
        os: 'Windows 11 Pro',
        weight: '1.50 kg',
        use_cases: ['Deep Learning', 'PyTorch/CUDA Acceleration', '3D Graphics', 'Gaming']
      }
    },
    {
      id: 'p1040000-0000-0000-0000-000000000104',
      category_id: 'c1000000-0000-0000-0000-000000000002',
      product_code: 'LAP104',
      name: 'Apple MacBook Air 15" M3',
      brand: 'Apple',
      price: 1299.00,
      rating: 4.9,
      review_count: 890,
      stock_status: 'IN_STOCK',
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60',
      specifications: {
        processor: 'Apple M3 Chip (8-core CPU, 10-core GPU, 16-core Neural Engine)',
        ram: '16GB Unified Memory',
        ram_gb: 16,
        storage: '512GB High-Speed SSD',
        storage_gb: 512,
        graphics: '10-core Integrated GPU',
        display: '15.3-inch Liquid Retina with True Tone',
        battery: '66.5 Wh, up to 18 hours battery life',
        os: 'macOS Sequoia',
        weight: '1.51 kg',
        use_cases: ['Full-Stack Web Dev', 'Python Data Science', 'Video Editing', 'Silent Workstation']
      }
    },
    {
      id: 'p1050000-0000-0000-0000-000000000105',
      category_id: 'c1000000-0000-0000-0000-000000000002',
      product_code: 'LAP105',
      name: 'HP Pavilion 15 Everyday Edition',
      brand: 'HP',
      price: 649.99,
      rating: 4.2,
      review_count: 140,
      stock_status: 'LOW_STOCK',
      image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=60',
      specifications: {
        processor: 'Intel Core i5-1235U (10 Cores, up to 4.4 GHz)',
        ram: '8GB DDR4 3200MHz',
        ram_gb: 8,
        storage: '256GB PCIe NVMe SSD',
        storage_gb: 256,
        graphics: 'Intel UHD Graphics',
        display: '15.6-inch Micro-Edge FHD',
        battery: '41 Wh',
        os: 'Windows 11 Home',
        weight: '1.74 kg',
        use_cases: ['Basic Coding', 'Web Browsing', 'Office Apps', 'Media Streaming']
      }
    },
    {
      id: 'p2010000-0000-0000-0000-000000000201',
      category_id: 'c1000000-0000-0000-0000-000000000003',
      product_code: 'AUD201',
      name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
      brand: 'Sony',
      price: 398.00,
      rating: 4.8,
      review_count: 1240,
      stock_status: 'IN_STOCK',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
      specifications: {
        driver: '30mm Carbon Fiber composite drivers',
        noise_cancelling: 'Dual Processor V1 + HD Noise Cancelling Processor QN1 (8 Microphones)',
        battery: '30 Hours with ANC on, 3 mins quick charge for 3 hours',
        connectivity: 'Bluetooth 5.2, Multipoint connection, LDAC Hi-Res Audio',
        weight: '250g',
        use_cases: ['Coding Focus', 'Travel', 'Conference Calls', 'Audiophile Listening']
      }
    },
    {
      id: 'p3010000-0000-0000-0000-000000000301',
      category_id: 'c1000000-0000-0000-0000-000000000004',
      product_code: 'PHN301',
      name: 'Samsung Galaxy S24 Ultra 5G',
      brand: 'Samsung',
      price: 1199.99,
      rating: 4.7,
      review_count: 670,
      stock_status: 'IN_STOCK',
      image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=60',
      specifications: {
        processor: 'Snapdragon 8 Gen 3 for Galaxy',
        ram: '12GB LPDDR5X',
        ram_gb: 12,
        storage: '256GB UFS 4.0',
        display: '6.8-inch Dynamic AMOLED 2X, 120Hz, 2600 nits, Gorilla Armor',
        camera: '200MP Main + 50MP Periscope (5x optical) + 10MP Telephoto + 12MP Ultrawide',
        battery: '5000 mAh with 45W Fast Charging',
        special_features: ['S-Pen Included', 'Galaxy AI Live Translate', 'Circle to Search']
      }
    },
    {
      id: 'p4010000-0000-0000-0000-000000000401',
      category_id: 'c2000000-0000-0000-0000-000000000002',
      product_code: 'KIT401',
      name: 'Breville Barista Touch Impress Espresso Machine',
      brand: 'Breville',
      price: 1499.95,
      rating: 4.9,
      review_count: 185,
      stock_status: 'LOW_STOCK',
      image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=60',
      specifications: {
        pressure: '15 Bar Italian Pump',
        grinder: 'Precision Baratza European Precision Burrs with 30 settings',
        display: 'Touchscreen with step-by-step barista guidance',
        steam_wand: 'Auto MilQ hands-free microfoam with oat, almond, soy settings',
        heat_up: 'ThermoJet heating system (3 seconds to temperature)'
      }
    }
  ];

  const products = [];
  for (const prod of rawProducts) {
    const textToEmbed = `${prod.name} ${prod.brand} ${prod.product_code} ${JSON.stringify(prod.specifications)} price ${prod.price}`;
    const embedding = await VectorEngine.generateEmbedding(textToEmbed);
    products.push({
      ...prod,
      embedding
    });
  }

  const inventory = [
    { id: 'i101-1', product_id: 'p1010000-0000-0000-0000-000000000101', warehouse_code: 'WH-EAST', quantity: 45, reserved_quantity: 3, reorder_threshold: 15 },
    { id: 'i101-2', product_id: 'p1010000-0000-0000-0000-000000000101', warehouse_code: 'WH-WEST', quantity: 38, reserved_quantity: 2, reorder_threshold: 15 },
    { id: 'i101-3', product_id: 'p1010000-0000-0000-0000-000000000101', warehouse_code: 'WH-CENTRAL', quantity: 22, reserved_quantity: 1, reorder_threshold: 10 },
    { id: 'i102-1', product_id: 'p1020000-0000-0000-0000-000000000102', warehouse_code: 'WH-EAST', quantity: 28, reserved_quantity: 4, reorder_threshold: 12 },
    { id: 'i102-2', product_id: 'p1020000-0000-0000-0000-000000000102', warehouse_code: 'WH-WEST', quantity: 19, reserved_quantity: 0, reorder_threshold: 10 },
    { id: 'i103-1', product_id: 'p1030000-0000-0000-0000-000000000103', warehouse_code: 'WH-WEST', quantity: 14, reserved_quantity: 2, reorder_threshold: 8 },
    { id: 'i103-2', product_id: 'p1030000-0000-0000-0000-000000000103', warehouse_code: 'WH-CENTRAL', quantity: 9, reserved_quantity: 1, reorder_threshold: 10 },
    { id: 'i104-1', product_id: 'p1040000-0000-0000-0000-000000000104', warehouse_code: 'WH-EAST', quantity: 50, reserved_quantity: 5, reorder_threshold: 20 },
    { id: 'i104-2', product_id: 'p1040000-0000-0000-0000-000000000104', warehouse_code: 'WH-WEST', quantity: 42, reserved_quantity: 2, reorder_threshold: 15 },
    { id: 'i105-1', product_id: 'p1050000-0000-0000-0000-000000000105', warehouse_code: 'WH-EAST', quantity: 4, reserved_quantity: 1, reorder_threshold: 15 },
    { id: 'i105-2', product_id: 'p1050000-0000-0000-0000-000000000105', warehouse_code: 'WH-SOUTH', quantity: 3, reserved_quantity: 0, reorder_threshold: 10 },
    { id: 'i201-1', product_id: 'p2010000-0000-0000-0000-000000000201', warehouse_code: 'WH-EAST', quantity: 80, reserved_quantity: 8, reorder_threshold: 25 },
    { id: 'i201-2', product_id: 'p2010000-0000-0000-0000-000000000201', warehouse_code: 'WH-WEST', quantity: 65, reserved_quantity: 5, reorder_threshold: 20 },
    { id: 'i301-1', product_id: 'p3010000-0000-0000-0000-000000000301', warehouse_code: 'WH-CENTRAL', quantity: 34, reserved_quantity: 2, reorder_threshold: 15 },
    { id: 'i401-1', product_id: 'p4010000-0000-0000-0000-000000000401', warehouse_code: 'WH-WEST', quantity: 6, reserved_quantity: 1, reorder_threshold: 10 }
  ];

  const rawDocuments = [
    {
      id: 'd1000000-0000-0000-0000-000000000001',
      title: 'Laptop & Electronics Return Policy',
      filename: 'Laptop_Return_Policy_2026.1.md',
      doc_type: 'MD',
      category: 'Returns & Refunds',
      version: '2026.1',
      region: 'GLOBAL',
      status: 'ACTIVE',
      raw_content: `# Laptop & Electronics Return Policy (Version 2026.1)

## Section 1: General Return Eligibility
Customers may return brand-new, unopened electronic items within 30 calendar days of delivery for a 100% full refund to their original payment method. Proof of purchase or Order ID is required.

## Section 2: Condition Requirements & Packaging
All items must be returned with their original manufacturer retail box, factory accessories, charging brick, manuals, and warranty documentation. Serial numbers on the device must match our fulfillment registry.

## Section 3.1 — Defective & DOA Products
Devices that are Dead On Arrival (DOA) or exhibit hardware defects within 14 days of delivery are eligible for immediate zero-cost replacement or priority refund. ShopSmart AI provides a prepaid return shipping label and courier pick-up service.

## Section 3.2 — Opened Products
Opened laptops can be returned within 7 days of delivery if no physical damage is present. A restocking fee of 10% applies. Devices must be deregistered from all cloud accounts (Apple ID, Microsoft Account, Google Device Manager) and factory reset prior to carrier dispatch.

## Section 4: Refund Processing Timelines
Once received at our central intake warehouse (WH-CENTRAL), returns are inspected within 48 business hours. Approved refunds are released back to credit/debit cards within 3-5 business days.`
    },
    {
      id: 'd2000000-0000-0000-0000-000000000002',
      title: 'Express Shipping Guarantees & Carrier SLAs',
      filename: 'Shipping_Guarantees_2026.1.md',
      doc_type: 'MD',
      category: 'Shipping & Delivery',
      version: '2026.1',
      region: 'GLOBAL',
      status: 'ACTIVE',
      raw_content: `# Express Shipping Guarantees & Carrier SLAs (Version 2026.1)

## Section 1: Membership Delivery Benefits
- Prime Members: Enjoy complimentary Guaranteed Next-Day Delivery on eligible electronics and accessories when ordered before 2:00 PM EST.
- Premium Members: Enjoy complimentary Same-Day Delivery in metropolitan coverage zones and VIP carrier priority.
- Basic Members: Standard ground shipping takes 3 to 5 business days, with flat-rate shipping of $4.99 on orders under $50.

## Section 2: On-Time Delivery Guarantee
If a guaranteed delivery date is missed due to carrier transit delays, Prime and Premium members automatically receive a $15 ShopSmart Marketplace Credit.

## Section 3: Order Cancellation Window
Orders can be canceled autonomously through the Customer Portal within 60 minutes of placement, or anytime prior to reaching the 'SHIPPED' status. Once an order is labeled 'SHIPPED', dispatch lock takes effect and standard return procedures apply.`
    },
    {
      id: 'd3000000-0000-0000-0000-000000000003',
      title: 'Extended Warranty & Accidental Damage Protection',
      filename: 'Warranty_Protection_2026.2.md',
      doc_type: 'MD',
      category: 'Warranty & Protection',
      version: '2026.2',
      region: 'GLOBAL',
      status: 'ACTIVE',
      raw_content: `# Extended Warranty & Accidental Damage Protection (Version 2026.2)

## Section 1: Standard Manufacturer Warranty
All laptops and consumer electronics sold by ShopSmart AI include a 1-year standard manufacturer warranty covering internal hardware defects, motherboard malfunctions, and power supply failures.

## Section 2: ShopSmart Care+ Accidental Damage
ShopSmart Care+ extends coverage to 2 or 3 years. It covers liquid spills, accidental drops, cracked displays, and surge damage. Deductible for screen repair is $49, while full unit replacement carries a $99 deductible.

## Section 3: Battery Health Guarantee
If the laptop or smartphone battery degrades below 80% maximum capacity within the first 24 months under Care+, an OEM battery replacement is supplied free of charge.`
    },
    {
      id: 'd4000000-0000-0000-0000-000000000004',
      title: 'ShopSmart Enterprise Refund & Reimbursement Policy',
      filename: 'Refund_Policy_2026.1.json',
      doc_type: 'JSON',
      category: 'Refund Policy',
      version: '2026.1',
      region: 'GLOBAL',
      status: 'ACTIVE',
      raw_content: `# ShopSmart Enterprise Refund & Reimbursement Policy (Version 2026.1)

## Section 1: Refund Methods and Processing Channels
Approved refunds are credited directly back to the original method of payment (Visa, MasterCard, American Express, Apple Pay, PayPal). For bank cards, the settlement cycle typically posts within 3 to 5 business days after warehouse inspection approval. Customers may alternatively elect for Instant Marketplace Credit, which is credited within 60 seconds of return label scan.

## Section 2: Restocking Fee Structure and Waivers
A standard 10% restocking fee applies to opened, non-defective electronics and laptops. The restocking fee is 100% waived for Prime and Premium members, or if the product was returned due to an order fulfillment error, Dead On Arrival defect, or carrier shipping damage.

## Section 3: Non-Refundable Items & Services
Expedited shipping fees (such as Same-Day VIP courier dispatch), custom engraved devices, and activated software licenses are non-refundable once dispatched and confirmed by the customer.`
    },
    {
      id: 'd5000000-0000-0000-0000-000000000005',
      title: 'Customer Membership Tiers & Benefit Privileges',
      filename: 'Membership_Benefits_2026.1.md',
      doc_type: 'MD',
      category: 'Membership Benefits',
      version: '2026.1',
      region: 'GLOBAL',
      status: 'ACTIVE',
      raw_content: `# Customer Membership Tiers & Benefit Privileges (Version 2026.1)

## Section 1: Prime Membership Privileges
Prime members ($99/year) receive complimentary Guaranteed Next-Day Delivery on eligible electronics when ordered prior to 2:00 PM EST. Prime members enjoy an extended 45-day return window, priority technical triage, exclusive access to flash drops, and zero restocking fees on opened returns.

## Section 2: Premium VIP Concierge Tier
Premium VIP tier ($199/year) unlocks complimentary Same-Day Delivery in metropolitan zones, dedicated 24/7 dedicated hardware concierge support, $25 quarterly marketplace credit, and complimentary annual Care+ accidental damage diagnostics.

## Section 3: Basic Tier Services
Basic membership is free with standard account creation. Basic members receive standard 3-5 day ground shipping (free on qualifying orders over $50, flat $4.99 otherwise) and standard 30-day return eligibility.`
    },
    {
      id: 'd6000000-0000-0000-0000-000000000006',
      title: 'Hardware Operations, Setup & Diagnostic Manual',
      filename: 'Product_Manual_Hardware_2026.1.md',
      doc_type: 'MD',
      category: 'Product Manuals',
      version: '2026.1',
      region: 'GLOBAL',
      status: 'ACTIVE',
      raw_content: `# Hardware Operations, Setup & Diagnostic Manual (Version 2026.1)

## Section 1: Initial Power Setup and Battery Calibration
Upon unboxing your laptop or mobile workstation, connect the OEM power adapter and charge the battery uninterrupted until 100% capacity is reached. For optimal lithium-ion longevity, enable Optimized Battery Charging in system settings to prevent prolonged 100% voltage saturation.

## Section 2: High-Performance Workstation Thermal Guidelines
Ensure ventilation intake and exhaust vents remain unobstructed by placing devices on rigid, flat surfaces. During sustained compiler builds, PyTorch machine learning training, or 3D rendering workloads, internal cooling fans automatically adjust RPM curves to maintain silicon temperatures below 85°C.

## Section 3: Hardware Diagnostics & Recovery Mode
To run native hardware diagnostics on Apple silicon devices, power off and hold the Power button until 'Loading startup options' appears, then press Command+D. For Dell and Lenovo workstations, press F12 during POST boot sequence to enter ePSA diagnostic testing.`
    },
    {
      id: 'd7000000-0000-0000-0000-000000000007',
      title: 'Marketplace Merchant & Seller Compliance Guidelines',
      filename: 'Seller_Guidelines_2026.1.md',
      doc_type: 'MD',
      category: 'Seller Guidelines',
      version: '2026.1',
      region: 'GLOBAL',
      status: 'ACTIVE',
      raw_content: `# Marketplace Merchant & Seller Compliance Guidelines (Version 2026.1)

## Section 1: Merchant Dispatch and Fulfillment SLA
Approved third-party marketplace merchants must fulfill and register tracking carrier milestones within 24 business hours of order placement. Failure to maintain an on-time dispatch rate above 98.5% results in temporary catalog suppression.

## Section 2: Genuine OEM Hardware Certification
All electronics listed on ShopSmart AI must be 100% authentic OEM products with verifiable serial numbers. Counterfeit, grey-market, or uncertified refurbished hardware is strictly prohibited and subject to immediate account termination and merchant escrow forfeiture.

## Section 3: Merchant Returns & Customer Reimbursement
Merchants must honor ShopSmart AI's standard return policies and process customer return inspections within 48 business hours of intake delivery.`
    },
    {
      id: 'd8000000-0000-0000-0000-000000000008',
      title: 'Carrier Transit SLAs & Delivery Performance Standards',
      filename: 'Carrier_Delivery_SLAs_2026.1.md',
      doc_type: 'MD',
      category: 'Delivery SLAs',
      version: '2026.1',
      region: 'GLOBAL',
      status: 'ACTIVE',
      raw_content: `# Carrier Transit SLAs & Delivery Performance Standards (Version 2026.1)

## Section 1: FedEx Priority Next-Day SLA
FedEx Priority Next-Day packages are dispatched from regional logistics centers by 6:00 PM EST and guaranteed for delivery by 10:30 AM or 12:00 PM local time the following business day. Real-time GPS telemetry and chain-of-custody milestones are updated hourly.

## Section 2: Standard Ground Transit Commitments
Standard ground shipments through UPS and regional couriers are guaranteed for delivery within 3 to 5 business days across the continental United States. All packages valued over $500 require direct adult signature upon delivery.

## Section 3: Transit Delays and Service Guarantee Claims
In the event of an unexcused carrier transit delay exceeding the committed delivery window by more than 2 hours, customers are eligible for automated shipping fee refunds and a $15 marketplace courtesy credit.`
    }
  ];

  const knowledge_documents = [];
  const document_chunks = [];

  for (const doc of rawDocuments) {
    knowledge_documents.push(doc);
    const chunks = VectorEngine.chunkDocument(doc.raw_content, 1000, 200);

    for (let idx = 0; idx < chunks.length; idx++) {
      const chunkText = chunks[idx];
      const embedding = await VectorEngine.generateEmbedding(chunkText);

      let sectionMatch = chunkText.match(/##\s+([^#\n]+)/);
      let section = sectionMatch ? sectionMatch[1].trim() : `Section ${idx + 1}`;

      document_chunks.push({
        id: `chk-${doc.id.slice(1, 8)}-${idx + 1}`,
        document_id: doc.id,
        chunk_index: idx,
        content: chunkText,
        embedding,
        metadata: {
          documentTitle: doc.title,
          section: section,
          version: doc.version,
          category: doc.category
        }
      });
    }
  }

  const orders = [
    {
      id: 'o1000000-0000-0000-0000-000000000001',
      user_id: 'u1111111-1111-1111-1111-111111111111',
      order_number: 'ORD-2026-89412',
      total_amount: 899.99,
      status: 'SHIPPED',
      shipping_address: {
        street: '742 Evergreen Terrace',
        city: 'Seattle',
        state: 'WA',
        zip: '98101',
        country: 'USA'
      },
      tracking_number: 'TRK-FX-99482104',
      carrier: 'FedEx Priority',
      estimated_delivery: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      items: [
        {
          product_id: 'p1010000-0000-0000-0000-000000000101',
          product_name: 'Dell Inspiron 15 3530',
          quantity: 1,
          unit_price: 899.99,
          total_price: 899.99
        }
      ],
      tracking_events: [
        { status: 'PLACED', title: 'Order Placed & Verified', timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), location: 'Seattle, WA', detail: 'Payment confirmed via Stripe. Order routed to automated fulfillment.' },
        { status: 'CONFIRMED', title: 'Allocated at Warehouse', timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), location: 'WH-WEST (Reno, NV)', detail: 'Serial number verified and packaged in anti-static protective container.' },
        { status: 'SHIPPED', title: 'In Transit with FedEx', timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), location: 'Portland Carrier Hub, OR', detail: 'Departed sorting facility en route to local distribution facility.' }
      ]
    },
    {
      id: 'o2000000-0000-0000-0000-000000000002',
      user_id: 'u1111111-1111-1111-1111-111111111111',
      order_number: 'ORD-2026-88190',
      total_amount: 398.00,
      status: 'DELIVERED',
      shipping_address: {
        street: '742 Evergreen Terrace',
        city: 'Seattle',
        state: 'WA',
        zip: '98101',
        country: 'USA'
      },
      tracking_number: 'TRK-UPS-77182931',
      carrier: 'UPS 2nd Day Air',
      estimated_delivery: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      items: [
        {
          product_id: 'p2010000-0000-0000-0000-000000000201',
          product_name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
          quantity: 1,
          unit_price: 398.00,
          total_price: 398.00
        }
      ],
      tracking_events: [
        { status: 'PLACED', title: 'Order Placed', timestamp: new Date(Date.now() - 96 * 3600 * 1000).toISOString(), location: 'Online', detail: 'Order received.' },
        { status: 'CONFIRMED', title: 'Packaged & Checked', timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), location: 'WH-EAST', detail: 'Passed quality assurance scan.' },
        { status: 'SHIPPED', title: 'Picked Up by UPS', timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), location: 'Seattle Hub', detail: 'Out for final delivery.' },
        { status: 'DELIVERED', title: 'Delivered at Front Porch', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), location: 'Customer Residence', detail: 'Signed and delivered successfully.' }
      ]
    }
  ];

  return {
    users,
    categories,
    products,
    inventory,
    knowledge_documents,
    document_chunks,
    orders
  };
};
