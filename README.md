# ShopSmart AI — Autonomous E-Commerce Assistant & Intelligent Operations Platform

An enterprise-grade, multi-agent e-commerce marketplace platform implementing **Retrieval-Augmented Generation (RAG)**, **pgvector semantic similarity retrieval (1536-D)**, and **autonomous multi-agent workflows** built with **Node.js, Express, React 19, and Vite**.

---

## 🚀 Core Mandates Implemented

### 1. Module 1: AI-Powered Product Discovery Flow
- **Semantic Intent Extraction**: Identifies product category, budget ceiling (e.g. `$1000`), and targeted hardware use cases (Java Development, AI/Machine Learning, Gaming).
- **Specification Filtering**: Enforces mandatory hardware baselines (RAM >= 16GB, multi-core CPU, dedicated SSD storage).
- **Hybrid Multi-Factor Ranking**: Ranks items using vector cosine distance, price-to-budget ratio, customer rating, review volume, and in-stock inventory status.
- **Explainable Response Contract**: Generates exact structured JSON payloads with human-readable justifications tied to verified hardware specifications.

### 2. Module 2: Grounded Knowledge RAG Assistant (Zero-Hallucination Policy)
- **Multi-Format Ingestion**: Ingests enterprise Markdown, PDF, and JSON policy documents with version and domain metadata.
- **Semantic Text Chunking**: Recursive character chunker with 1000-character windows and 200-character overlap.
- **pgvector Vector Retrieval**: Computes Cosine Distance (`<=>`) across 1536-dimensional semantic embeddings.
- **Grounded Prompting & Hallucination Guard**: Answers strictly from verified context with verbatim audit citations (Document Title, Section Heading, Version, Relevance Score).

### 3. Autonomous Multi-Agent Collaboration Framework
- **Master AI Router**: Intent classification, session memory retention, and inter-agent task delegation.
- **Shopping Agent**: Evaluates user budget, extracts technical specifications, runs hybrid ranking.
- **Knowledge RAG Agent**: Executes semantic retrieval across approved enterprise policies with citations.
- **Logistics & Order Agent**: Simulates carrier lifecycle states (FedEx, UPS) and milestone tracking timelines.
- **Operations Agent**: Monitors multi-warehouse stock levels across `WH-EAST`, `WH-WEST`, `WH-CENTRAL`, and `WH-SOUTH` and alerts on reorder thresholds.

### 4. Enterprise Architecture & Security Governance
- **Stateless JWT & bcrypt (12 rounds)** authentication with Role-Based Access Control (Customer vs Admin).
- **Multi-Warehouse Inventory Control**: Tracks quantities, reserved units, and reorder thresholds.
- **Side-by-Side Comparison Matrix**: Compare 2 to 4 products across hardware specs.
- **AI Audit Trail**: Every AI response logs query, latency in ms, confidence score, and model response to the `ai_interactions` table.

---

## 🛠️ Tech Stack

- **Client**: React 19, Vite, Tailwind CSS, Lucide Icons
- **Server**: Node.js, Express, Helmet, CORS, Zod validation, JWT, bcrypt
- **Storage**: Dual-Engine Architecture:
  - Full PostgreSQL 16 + pgvector DDL migration (`server/src/migrations/001_initial_schema.sql`)
  - Embedded in-memory vector & relational store for immediate zero-config local execution
- **Vector Embeddings**: 1536-dimensional semantic projection engine with Cosine Similarity

---

## ⚡ Quickstart

### 1. Install & Run Everything
```bash
# Start backend (port 5050) & frontend (port 5173) concurrently
npm run dev
```

Visit the application in your browser:
👉 **http://localhost:5173**

### 2. Run Test Suite
```bash
npm test
```
*Executes all 9 automated end-to-end API and contract verification tests.*

---

## 👥 Demo Accounts (Preloaded)

| Role | Email | Password | Tier |
| :--- | :--- | :--- | :--- |
| **Prime Customer** | `customer@shopsmart.ai` | `password123` | PRIME (Next-Day Delivery) |
| **Admin Operations**| `admin@shopsmart.ai` | `admin123` | PREMIUM (Admin RBAC) |
| **Basic Customer** | `basic@shopsmart.ai` | `password123` | BASIC |

*(Use the 1-Click Quick Demo Switcher in the top-right navbar to toggle profiles instantly.)*

---

## 📡 Key API Endpoints

- `GET /api/health` — Service health & AI capabilities
- `POST /api/ai/recommend` — Module 1 Explainable Product Discovery
- `POST /api/knowledge/ask` — Module 2 Grounded Policy RAG
- `POST /api/ai/chat` — Multi-Agent Conversational Copilot
- `GET /api/products` — Catalog with faceted filters & full-text search
- `GET /api/products/compare?ids=LAP101,LAP102` — Specification comparison matrix
- `GET /api/orders/:id/track` — Carrier milestone tracking telemetry
- `GET /api/admin/inventory` — Multi-warehouse stock balances & restock alerts
- `GET /api/admin/audit-logs` — AI governance and latency audit trail
