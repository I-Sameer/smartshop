import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UploadCloud, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Database,
  RefreshCw,
  Cpu,
  FileText,
  FileCode,
  FileCheck,
  Search,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight,
  Download,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api.js';
import { useStore } from '../store/useStore.jsx';

// Pre-configured templates for all 8 required Knowledge Sources
const KNOWLEDGE_SOURCE_TEMPLATES = [
  {
    id: 'return-policy',
    name: 'Return Policy',
    category: 'Returns & Refunds',
    doc_type: 'MD',
    version: '2026.1',
    description: '30-day unopened returns, 7-day opened laptop restocking terms, DOA replacements.',
    template: `# Laptop & Electronics Return Policy (Version 2026.1)

## Section 1: General Return Eligibility
Customers may return brand-new, unopened electronic items within 30 calendar days of delivery for a 100% full refund to their original payment method. Proof of purchase or Order ID is required.

## Section 2: Opened Products
Opened laptops can be returned within 7 days of delivery if no physical damage is present. A restocking fee of 10% applies. Devices must be deregistered from all cloud accounts and factory reset.

## Section 3: Defective & DOA Products
Devices that are Dead On Arrival (DOA) or exhibit hardware defects within 14 days of delivery are eligible for immediate zero-cost replacement or priority refund with prepaid shipping labels.`
  },
  {
    id: 'shipping-policy',
    name: 'Shipping Policy',
    category: 'Shipping & Delivery',
    doc_type: 'MD',
    version: '2026.1',
    description: 'Delivery timelines, flat rates, express transit guarantees, order cancellation window.',
    template: `# Express Shipping Policy & Guarantees (Version 2026.1)

## Section 1: Shipping Methods and Timelines
Basic orders ship via ground freight in 3 to 5 business days with complimentary shipping on orders over $50. Prime orders receive Guaranteed Next-Day Delivery when ordered before 2:00 PM EST.

## Section 2: On-Time Delivery Guarantee
If a guaranteed delivery date is missed due to carrier transit delays, customers automatically receive a $15 ShopSmart Marketplace Credit.

## Section 3: Order Cancellation Window
Orders can be canceled autonomously through the Customer Portal within 60 minutes of placement, or anytime prior to reaching the 'SHIPPED' status.`
  },
  {
    id: 'refund-policy',
    name: 'Refund Policy',
    category: 'Refund Policy',
    doc_type: 'JSON',
    version: '2026.1',
    description: 'Payment settlement schedules, restocking waivers, non-refundable services.',
    template: JSON.stringify({
      title: "ShopSmart Enterprise Refund & Reimbursement Policy",
      category: "Refund Policy",
      version: "2026.1",
      sections: [
        {
          heading: "Section 1: Refund Methods and Settlement Timelines",
          content: "Approved refunds are credited back to the original method of payment (Visa, Mastercard, AMEX, Apple Pay, PayPal). Card refunds post within 3 to 5 business days after warehouse inspection approval. Instant Marketplace Credit posts within 60 seconds."
        },
        {
          heading: "Section 2: Restocking Fee Waivers",
          content: "The 10% restocking fee on opened laptops is 100% waived for Prime and Premium members, or if the return was initiated due to hardware defect, order fulfillment error, or courier transit damage."
        },
        {
          heading: "Section 3: Non-Refundable Items",
          content: "Expedited shipping fees, custom engraved devices, and digital software activation codes are non-refundable once dispatched."
        }
      ]
    }, null, 2)
  },
  {
    id: 'warranty-docs',
    name: 'Warranty Documents',
    category: 'Warranty & Protection',
    doc_type: 'MD',
    version: '2026.2',
    description: 'OEM standard 1-year coverage, Care+ accidental damage, battery health guarantees.',
    template: `# Extended Warranty & Accidental Damage Protection (Version 2026.2)

## Section 1: Standard Manufacturer Warranty
All laptops and consumer electronics sold by ShopSmart AI include a 1-year standard manufacturer warranty covering internal hardware defects, motherboard malfunctions, and power supply failures.

## Section 2: ShopSmart Care+ Accidental Damage
ShopSmart Care+ extends coverage to 2 or 3 years. It covers liquid spills, accidental drops, cracked displays, and surge damage. Deductible for screen repair is $49, while full unit replacement carries a $99 deductible.

## Section 3: Battery Health Guarantee
If the laptop or smartphone battery degrades below 80% maximum capacity within the first 24 months under Care+, an OEM battery replacement is supplied free of charge.`
  },
  {
    id: 'membership-benefits',
    name: 'Membership Benefits',
    category: 'Membership Benefits',
    doc_type: 'MD',
    version: '2026.1',
    description: 'Tier comparison across Basic, Prime, and Premium VIP Concierge benefits.',
    template: `# Customer Membership Tiers & Benefit Privileges (Version 2026.1)

## Section 1: Prime Member Privileges
Prime members ($99/year) receive complimentary Guaranteed Next-Day Delivery on eligible electronics when ordered prior to 2:00 PM EST. Prime members enjoy an extended 45-day return window, priority technical triage, exclusive access to flash drops, and zero restocking fees on opened returns.

## Section 2: Premium VIP Concierge Tier
Premium VIP tier ($199/year) unlocks complimentary Same-Day Delivery in metropolitan zones, dedicated 24/7 dedicated hardware concierge support, $25 quarterly marketplace credit, and complimentary annual Care+ accidental damage diagnostics.

## Section 3: Basic Tier Services
Basic membership is free with standard account creation. Basic members receive standard 3-5 day ground shipping (free on qualifying orders over $50, flat $4.99 otherwise) and standard 30-day return eligibility.`
  },
  {
    id: 'product-manuals',
    name: 'Product Manuals',
    category: 'Product Manuals',
    doc_type: 'MD',
    version: '2026.1',
    description: 'Hardware initial setup, thermal workstation guidelines, onboard diagnostics.',
    template: `# Hardware Operations, Setup & Diagnostic Manual (Version 2026.1)

## Section 1: Initial Power Setup and Battery Calibration
Upon unboxing your laptop or mobile workstation, connect the OEM power adapter and charge the battery uninterrupted until 100% capacity is reached. For optimal lithium-ion longevity, enable Optimized Battery Charging in system settings to prevent prolonged 100% voltage saturation.

## Section 2: High-Performance Workstation Thermal Guidelines
Ensure ventilation intake and exhaust vents remain unobstructed by placing devices on rigid, flat surfaces. During sustained compiler builds, PyTorch machine learning training, or 3D rendering workloads, internal cooling fans automatically adjust RPM curves to maintain silicon temperatures below 85°C.

## Section 3: Hardware Diagnostics & Recovery Mode
To run native hardware diagnostics on Apple silicon devices, power off and hold the Power button until 'Loading startup options' appears, then press Command+D. For Dell and Lenovo workstations, press F12 during POST boot sequence to enter ePSA diagnostic testing.`
  },
  {
    id: 'seller-guidelines',
    name: 'Seller Guidelines',
    category: 'Seller Guidelines',
    doc_type: 'MD',
    version: '2026.1',
    description: 'Merchant dispatch SLA (< 24 hours), OEM hardware certification, returns handling.',
    template: `# Marketplace Merchant & Seller Compliance Guidelines (Version 2026.1)

## Section 1: Merchant Dispatch and Fulfillment SLA
Approved third-party marketplace merchants must fulfill and register tracking carrier milestones within 24 business hours of order placement. Failure to maintain an on-time dispatch rate above 98.5% results in temporary catalog suppression.

## Section 2: Genuine OEM Hardware Certification
All electronics listed on ShopSmart AI must be 100% authentic OEM products with verifiable serial numbers. Counterfeit, grey-market, or uncertified refurbished hardware is strictly prohibited and subject to immediate account termination and merchant escrow forfeiture.

## Section 3: Merchant Returns & Customer Reimbursement
Merchants must honor ShopSmart AI's standard return policies and process customer return inspections within 48 business hours of intake delivery.`
  },
  {
    id: 'delivery-sla-docs',
    name: 'Delivery SLA Documents',
    category: 'Delivery SLAs',
    doc_type: 'MD',
    version: '2026.1',
    description: 'Carrier transit SLAs for FedEx Priority and UPS Ground, delivery delay claims.',
    template: `# Carrier Transit SLAs & Delivery Performance Standards (Version 2026.1)

## Section 1: FedEx Priority Next-Day SLA
FedEx Priority Next-Day packages are dispatched from regional logistics centers by 6:00 PM EST and guaranteed for delivery by 10:30 AM or 12:00 PM local time the following business day. Real-time GPS telemetry and chain-of-custody milestones are updated hourly.

## Section 2: Standard Ground Transit Commitments
Standard ground shipments through UPS and regional couriers are guaranteed for delivery within 3 to 5 business days across the continental United States. All packages valued over $500 require direct adult signature upon delivery.

## Section 3: Transit Delays and Service Guarantee Claims
In the event of an unexcused carrier transit delay exceeding the committed delivery window by more than 2 hours, customers are eligible for automated shipping fee refunds and a $15 marketplace courtesy credit.`
  }
];

export const AdminDashboard = () => {
  const { showToast } = useStore();
  const [activeTab, setActiveTab] = useState('ingestion'); // 'ingestion' | 'inventory' | 'audit'

  const [inventory, setInventory] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ingestion form state
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Returns & Refunds',
    doc_type: 'MD',
    version: '2026.1',
    region: 'GLOBAL',
    raw_content: ''
  });
  const [isIngesting, setIsIngesting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Vector Search Test state
  const [searchQuery, setSearchQuery] = useState('What is the return policy for opened laptops?');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inventory') {
        const data = await api.getAdminInventory();
        setInventory(data);
      } else if (activeTab === 'ingestion') {
        const data = await api.getKnowledgeDocs();
        setKnowledgeDocs(data.documents || []);
      } else if (activeTab === 'audit') {
        const data = await api.getAdminAuditLogs();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (tmpl) => {
    setDocForm({
      title: tmpl.name,
      category: tmpl.category,
      doc_type: tmpl.doc_type,
      version: tmpl.version,
      region: 'GLOBAL',
      raw_content: tmpl.template
    });
    setSelectedFile(null);
    showToast(`Loaded template for "${tmpl.name}"`, 'info');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      let detectedType = 'MD';
      if (file.name.endsWith('.pdf')) detectedType = 'PDF';
      else if (file.name.endsWith('.json')) detectedType = 'JSON';

      setDocForm(prev => ({
        ...prev,
        title: nameWithoutExt,
        doc_type: detectedType
      }));
      showToast(`Selected file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'info');
    }
  };

  const handleIngestDocument = async (e) => {
    e.preventDefault();
    setIsIngesting(true);

    try {
      if (selectedFile) {
        // Multi-format File Ingestion (PDF, MD, JSON, TXT)
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', docForm.title || selectedFile.name);
        formData.append('category', docForm.category);
        formData.append('version', docForm.version);
        formData.append('region', docForm.region);
        formData.append('doc_type', docForm.doc_type);

        const res = await api.uploadKnowledgeFile(formData);
        showToast(res.message || 'File ingested and vectorized successfully!', 'success');
        setSelectedFile(null);
      } else {
        // Structured Text / Markdown / JSON Ingestion
        if (!docForm.title || !docForm.raw_content) {
          showToast('Please provide a document title and content', 'warning');
          setIsIngesting(false);
          return;
        }
        const res = await api.uploadKnowledgeDoc(docForm);
        showToast(`Vectorized "${docForm.title}" into ${res.chunksCreated} pgvector chunks!`, 'success');
      }

      // Reload document list
      const docsData = await api.getKnowledgeDocs();
      setKnowledgeDocs(docsData.documents || []);

      // Reset form
      setDocForm({
        title: '',
        category: 'Returns & Refunds',
        doc_type: 'MD',
        version: '2026.1',
        region: 'GLOBAL',
        raw_content: ''
      });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleRunVectorSearchTest = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const [vectorData, ragData] = await Promise.all([
        api.testVectorSearch(searchQuery, 4),
        api.aiAskPolicy(searchQuery)
      ]);

      setSearchResult({
        vector: vectorData,
        rag: ragData
      });
      showToast(`Retrieved ${vectorData.retrievedCount} chunks with cosine ranking`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-[13px] text-[#1d1d1f]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e5e5ea]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f5f5f7] text-[#86868b] border border-[#d2d2d7]">
              Operations Console
            </span>
            <span className="text-[11px] font-semibold text-[#0071e3] flex items-center gap-1">
              <Database className="w-3 h-3" />
              LangChain &amp; pgvector (1536-D)
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#1d1d1f] tracking-tight mt-1.5">
            Knowledge Ingestion &amp; Operations
          </h1>
          <p className="text-[14px] text-[#6e6e73] mt-1 font-normal">
            Multi-format document ingestion (PDF, Markdown, JSON), recursive chunking, 1536-D vector search, and grounded RAG.
          </p>
        </div>

        {/* macOS Style Segmented Tab Control */}
        <div className="inline-flex items-center bg-[#e5e5ea]/80 p-1 rounded-xl text-[13px] border border-black/5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('ingestion')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all font-medium ${
              activeTab === 'ingestion' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-[#0071e3]" />
            <span>Vector Ingestion Hub</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all font-medium ${
              activeTab === 'inventory' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#0071e3]" />
            <span>Warehouses ({inventory?.lowStockAlertsCount || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all font-medium ${
              activeTab === 'audit' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <Activity className="w-4 h-4 text-[#0071e3]" />
            <span>AI Audit Trail</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Vector Ingestion & Knowledge Sources Hub */}
      {activeTab === 'ingestion' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* 1. All 8 Knowledge Sources Taxonomy Grid */}
          <div className="rounded-2xl p-6 sm:p-7 border border-[#e5e5ea] bg-white shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e5e5ea]">
              <div>
                <h3 className="text-base font-semibold text-[#1d1d1f] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0071e3]" />
                  <span>Verified Knowledge Sources (8 Document Categories)</span>
                </h3>
                <p className="text-[12px] text-[#86868b] mt-0.5">
                  Click any template to quickly inspect, modify, or re-vectorize that domain policy.
                </p>
              </div>
              <span className="text-[11px] bg-[#0071e3]/10 text-[#0071e3] px-2.5 py-1 rounded-full font-medium self-start sm:self-auto">
                {knowledgeDocs.length} Active Documents Indexed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {KNOWLEDGE_SOURCE_TEMPLATES.map(tmpl => {
                const isLoaded = knowledgeDocs.some(d => d.title.toLowerCase().includes(tmpl.name.toLowerCase()));
                return (
                  <div
                    key={tmpl.id}
                    className="p-3.5 rounded-xl border border-[#e5e5ea] hover:border-[#0071e3] bg-[#fbfbfd] hover:bg-white transition-all flex flex-col justify-between group cursor-pointer"
                    onClick={() => handleApplyTemplate(tmpl)}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#0071e3]">
                          {tmpl.category}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#e5e5ea] text-[#515154] font-mono">
                          {tmpl.doc_type}
                        </span>
                      </div>
                      <h4 className="font-semibold text-[#1d1d1f] text-[13px] group-hover:text-[#0071e3] transition-colors">
                        {tmpl.name}
                      </h4>
                      <p className="text-[11px] text-[#86868b] line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-[#f0f0f2] flex items-center justify-between text-[11px]">
                      <span className="text-[#86868b]">v{tmpl.version}</span>
                      <span className="text-[#0071e3] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Use Template &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Multi-Format Ingestion Station */}
          <div className="rounded-2xl p-6 sm:p-7 border border-[#e5e5ea] bg-white shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#e5e5ea]">
              <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1d1d1f]">
                  Multi-Format Document Ingestion &amp; Chunking
                </h3>
                <p className="text-[12px] text-[#86868b] mt-0.5">
                  Supports <strong>PDF ingestion</strong> (pdf-parse), <strong>Markdown (.md)</strong>, and <strong>Structured JSON (.json)</strong> with recursive 1000-char windowing.
                </p>
              </div>
            </div>

            <form onSubmit={handleIngestDocument} className="space-y-5">
              
              {/* File Drop / Picker Component */}
              <div className="p-4 rounded-xl border-2 border-dashed border-[#d2d2d7] bg-[#fbfbfd] hover:bg-white transition-all text-center space-y-2">
                <input
                  type="file"
                  id="doc-file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.md,.markdown,.json,.txt"
                  className="hidden"
                />
                <label 
                  htmlFor="doc-file-upload" 
                  className="cursor-pointer flex flex-col items-center justify-center gap-2 py-3"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#d2d2d7] flex items-center justify-center text-[#0071e3]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-[#0071e3] hover:underline">
                      {selectedFile ? selectedFile.name : 'Choose a PDF, Markdown, or JSON document'}
                    </span>
                    <span className="text-[12px] text-[#86868b] block mt-0.5">
                      {selectedFile 
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB ready for chunking & embedding` 
                        : 'or drag and drop .pdf, .md, .json files up to 10MB'}
                    </span>
                  </div>
                </label>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Clear selected file
                  </button>
                )}
              </div>

              {/* Form Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={docForm.title}
                    onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                    placeholder="e.g. Return Policy 2026"
                    className="w-full px-3 py-2 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] text-[13px] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1">Knowledge Category</label>
                  <select
                    value={docForm.category}
                    onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] text-[13px] focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="Returns & Refunds">Returns &amp; Refunds</option>
                    <option value="Shipping & Delivery">Shipping &amp; Delivery</option>
                    <option value="Refund Policy">Refund Policy</option>
                    <option value="Warranty & Protection">Warranty &amp; Protection</option>
                    <option value="Membership Benefits">Membership Benefits</option>
                    <option value="Product Manuals">Product Manuals</option>
                    <option value="Seller Guidelines">Seller Guidelines</option>
                    <option value="Delivery SLAs">Delivery SLAs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6e6e73] mb-1">Format Type</label>
                  <select
                    value={docForm.doc_type}
                    onChange={(e) => setDocForm({ ...docForm, doc_type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] text-[13px] focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="MD">Markdown (.md)</option>
                    <option value="PDF">PDF (.pdf)</option>
                    <option value="JSON">Structured JSON (.json)</option>
                  </select>
                </div>
              </div>

              {/* Text / Markdown / JSON Editor (if no file chosen) */}
              {!selectedFile && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[12px] font-medium text-[#6e6e73]">
                      Raw Content (Markdown / Text / JSON)
                    </label>
                    <span className="text-[11px] text-[#86868b] font-mono">
                      {docForm.raw_content ? `${docForm.raw_content.length} characters` : '0 characters'}
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    value={docForm.raw_content}
                    onChange={(e) => setDocForm({ ...docForm, raw_content: e.target.value })}
                    placeholder="Enter document text or click a template above..."
                    className="w-full p-3.5 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] font-mono text-[12px] leading-relaxed focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-[#86868b] flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#0071e3]" />
                  <span>1000-char sliding window · 200-char overlap · 1536-D Unit Vector</span>
                </div>

                <button
                  type="submit"
                  disabled={isIngesting}
                  className="apple-btn-primary text-[13px] py-2 px-5 gap-2 shadow-xs"
                >
                  <Database className="w-4 h-4" />
                  <span>{isIngesting ? 'Generating 1536-D Vectors...' : 'Vectorize & Store in pgvector'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* 3. Interactive Vector Search, Retrieval & Grounded RAG Tester */}
          <div className="rounded-2xl p-6 sm:p-7 border border-[#e5e5ea] bg-white shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e5ea]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">
                    Live Vector Search, Retrieval &amp; LangChain RAG Tester
                  </h3>
                  <p className="text-[12px] text-[#86868b] mt-0.5">
                    Test hybrid vector similarity (<span className="font-mono">cosine distance</span>) and zero-hallucination LangChain policy response.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleRunVectorSearchTest} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask any policy question (e.g. opened laptops, shipping delay credit, Care+ deductible)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#fbfbfd] border border-[#d2d2d7] rounded-xl text-[13px] text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3]"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="apple-btn-primary text-[13px] py-2.5 px-5 gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{searchLoading ? 'Retrieving...' : 'Test Retrieval & RAG'}</span>
              </button>
            </form>

            {/* Sample Queries Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-[#86868b] mr-1">Quick Test Prompts:</span>
              {[
                "What is the return policy for opened laptops?",
                "What benefits do Prime members get?",
                "What is covered under AppleCare+ warranty?",
                "What is the FedEx Next-Day delivery SLA?",
                "What are seller dispatch time requirements?"
              ].map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setSearchQuery(prompt);
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#515154] hover:text-[#1d1d1f] transition-colors border border-black/5"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Results Display */}
            {searchResult && (
              <div className="space-y-4 pt-4 border-t border-[#e5e5ea] animate-fade-in">
                
                {/* Grounded LangChain Response Card */}
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Grounded LangChain Response (Zero-Hallucination)
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      Confidence: {searchResult.rag.confidence}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#1d1d1f] font-medium leading-relaxed">
                    "{searchResult.rag.answer}"
                  </p>
                  {searchResult.rag.sources?.[0] && (
                    <div className="text-[11px] text-purple-800/80 pt-1 flex items-center gap-2">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>
                        Verified Citation: <strong>{searchResult.rag.sources[0].document}</strong> — {searchResult.rag.sources[0].section} (Score: {searchResult.rag.sources[0].relevanceScore})
                      </span>
                    </div>
                  )}
                </div>

                {/* Retrieved Vector Chunks */}
                <div>
                  <h4 className="text-[12px] font-semibold text-[#1d1d1f] mb-2 uppercase tracking-wider text-[#86868b]">
                    Retrieved Chunks via pgvector Cosine Retrieval ({searchResult.vector.retrievedCount} Chunks)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResult.vector.chunks?.map((chunk, idx) => (
                      <div key={chunk.id} className="p-3.5 rounded-xl border border-[#e5e5ea] bg-[#fafafc] space-y-1.5 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#0071e3] text-[11px] truncate">
                            #{idx + 1} {chunk.documentTitle}
                          </span>
                          <span className="text-[10px] font-mono bg-blue-50 text-[#0071e3] px-2 py-0.5 rounded-md font-semibold">
                            Sim: {chunk.relevanceScore}
                          </span>
                        </div>
                        <div className="text-[11px] font-medium text-[#515154]">
                          {chunk.section}
                        </div>
                        <p className="text-[#6e6e73] text-[11px] line-clamp-3 font-mono bg-white p-2 rounded-lg border border-[#f0f0f2]">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: Multi-Warehouse Inventory Monitor */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl border border-[#e5e5ea] bg-white shadow-xs space-y-1">
              <span className="text-[12px] text-[#86868b] font-medium block">Monitored Logistics Hubs</span>
              <div className="text-3xl font-semibold text-[#1d1d1f]">4 Facilities</div>
              <span className="text-[12px] text-[#34c759] font-medium">WH-EAST, WH-WEST, WH-CENTRAL, WH-SOUTH</span>
            </div>

            <div className="p-6 rounded-2xl border border-[#e5e5ea] bg-white shadow-xs space-y-1">
              <span className="text-[12px] text-[#86868b] font-medium block">Active Catalog SKUs</span>
              <div className="text-3xl font-semibold text-[#1d1d1f]">{inventory?.totalSKUs || 8} SKUs</div>
              <span className="text-[12px] text-[#86868b]">Real-time balance across warehouses</span>
            </div>

            <div className="p-6 rounded-2xl border border-[#e5e5ea] bg-white shadow-xs space-y-1">
              <span className="text-[12px] text-[#86868b] font-medium block">Low-Stock Autonomous Alerts</span>
              <div className="text-3xl font-semibold text-[#d70015]">{inventory?.lowStockAlertsCount || 0} Alerts</div>
              <span className="text-[12px] text-[#d70015] font-medium">Threshold &le; reorder trigger</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e5ea] bg-white overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-[#fafafc] border-b border-[#e5e5ea] flex justify-between items-center">
              <span className="font-semibold text-[#1d1d1f] text-[14px]">
                Multi-Warehouse Stock Telemetry &amp; Isolation Grid
              </span>
              <button
                onClick={loadDashboardData}
                className="text-[#0071e3] hover:text-[#0077ed] flex items-center gap-1.5 font-medium text-[13px] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Telemetry</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e5ea] bg-[#fafafc] text-[#86868b] text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-5">Warehouse</th>
                    <th className="py-3 px-5">SKU Code</th>
                    <th className="py-3 px-5">Hardware Model</th>
                    <th className="py-3 px-5">Total</th>
                    <th className="py-3 px-5">Reserved</th>
                    <th className="py-3 px-5">Reorder Threshold</th>
                    <th className="py-3 px-5">Diagnostic Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f7]">
                  {inventory?.records?.map(record => (
                    <tr key={record.id} className="hover:bg-[#f5f5f7]/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-[#0071e3]">{record.warehouse_code}</td>
                      <td className="py-3.5 px-5 text-[#6e6e73] font-mono text-[12px]">{record.product_code}</td>
                      <td className="py-3.5 px-5 font-medium text-[#1d1d1f]">{record.product_name}</td>
                      <td className="py-3.5 px-5 text-[#1d1d1f]">{record.quantity} units</td>
                      <td className="py-3.5 px-5 text-[#86868b]">{record.reserved_quantity} units</td>
                      <td className="py-3.5 px-5 text-[#86868b]">{record.reorder_threshold} units</td>
                      <td className="py-3.5 px-5">
                        {record.is_low_stock ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#ff3b30]/10 text-[#d70015] border border-[#ff3b30]/20 font-medium text-[11px] inline-flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />
                            Restock Required
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-[#34c759]/10 text-[#248a3d] border border-[#34c759]/20 font-medium text-[11px] inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Optimal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI Audit Trail */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-[#e5e5ea] bg-white overflow-hidden shadow-xs animate-fade-in">
          <div className="px-6 py-4 bg-[#fafafc] border-b border-[#e5e5ea] flex justify-between items-center">
            <div>
              <span className="font-semibold text-[#1d1d1f] text-[14px]">
                AI Governance &amp; Explainability Audit Ledger
              </span>
              <p className="text-[12px] text-[#86868b] mt-0.5">
                Full transparency log: confidence score, latency breakdown, and citation grounding.
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              className="text-[#0071e3] hover:text-[#0077ed] flex items-center gap-1.5 font-medium text-[13px] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Poll Ledger</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5ea] bg-[#fafafc] text-[#86868b] text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Agent</th>
                  <th className="py-3 px-5">User Prompt</th>
                  <th className="py-3 px-5">Confidence</th>
                  <th className="py-3 px-5">Latency</th>
                  <th className="py-3 px-5">Explainability Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f7]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#86868b]">
                      No AI interactions recorded in this session. Ask the Shopping Agent or Policy RAG to view real-time audit rows.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#f5f5f7]/60 transition-colors">
                      <td className="py-3.5 px-5 text-[#86868b] whitespace-nowrap text-[12px]">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-md bg-[#f5f5f7] border border-[#d2d2d7] font-semibold text-[11px] text-[#0071e3]">
                          {log.interaction_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-[#1d1d1f] max-w-xs truncate">
                        "{log.user_query}"
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-mono text-[12px] font-semibold text-[#34c759]">
                          {(log.confidence_score * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[#86868b] font-mono text-[12px]">
                        {log.latency_ms} ms
                      </td>
                      <td className="py-3.5 px-5 text-[#515154] text-[12px] max-w-sm">
                        <div className="line-clamp-2">
                          {log.ai_response?.answer || log.ai_response?.interpretedRequirement || JSON.stringify(log.ai_response)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
