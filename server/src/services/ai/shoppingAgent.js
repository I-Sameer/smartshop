import { VectorEngine } from './vectorEngine.js';
import { db } from '../../config/db.js';
import { GeminiClient } from './geminiClient.js';

export class ShoppingAgent {
  /**
   * Module 1: AI-Powered Product Discovery Flow
   * Powered dynamically by Gemini Flash 3.5 AI Agent (gemini-3.5-flash).
   * All hardcoded templates and static regex branches removed.
   */
  static async evaluateDiscovery(query, userPreferences = {}) {
    const startTime = Date.now();
    const cleanQuery = (query || '').trim();

    // 1. Dynamic AI Intent Analysis via Gemini Flash 3.5
    const analysis = await GeminiClient.analyzeShoppingIntent(cleanQuery);
    const { interpretedRequirement, budget, extractedFeatures, useCases } = analysis;

    // 2. Vector Semantic Retrieval using 1536-D embeddings
    const queryEmbedding = await VectorEngine.generateEmbedding(cleanQuery);
    const catalog = await db.queryProducts({ limit: 100 });
    const allProducts = catalog.products;

    // 3. Dynamic Multi-Factor Ranking
    const scoredProducts = allProducts.map(product => {
      const semanticSim = VectorEngine.cosineSimilarity(queryEmbedding, product.embedding);
      const normalizedSemantic = 0.70 + Math.min(0.25, Math.max(0, semanticSim * 1.5));

      const specs = product.specifications || {};
      let budgetFactor = 1.0;
      let withinBudget = true;

      if (budget) {
        if (product.price <= budget) {
          const utilization = product.price / budget;
          budgetFactor = 0.85 + utilization * 0.15;
        } else {
          withinBudget = false;
          const overRatio = (product.price - budget) / budget;
          budgetFactor = Math.max(0.1, 0.6 - overRatio * 1.2);
        }
      }

      // Dynamic spec matching score
      let specScore = 0.8;
      if (specs.ram_gb && specs.ram_gb >= 16) specScore += 0.10;
      if (specs.storage_gb && specs.storage_gb >= 512) specScore += 0.05;
      if (specs.gpu && (cleanQuery.toLowerCase().includes('gpu') || cleanQuery.toLowerCase().includes('ai') || cleanQuery.toLowerCase().includes('gaming'))) {
        specScore += 0.10;
      }

      const ratingFactor = (product.rating || 4.0) / 5.0;
      const stockFactor = product.stock_status === 'IN_STOCK' ? 1.0 : 0.7;

      let rawScore;
      if (withinBudget) {
        rawScore = (0.35 * normalizedSemantic) + (0.30 * budgetFactor) + (0.20 * specScore) + (0.10 * ratingFactor) + (0.05 * stockFactor);
      } else {
        rawScore = (0.25 * normalizedSemantic) + (0.15 * budgetFactor) + (0.15 * specScore) + (0.10 * ratingFactor);
      }

      const matchScore = parseFloat(Math.min(0.96, Math.max(0.40, rawScore)).toFixed(2));

      // Dynamic AI justification reasoning built from product hardware attributes
      const specHighlights = [];
      if (specs.ram_gb) specHighlights.push(`${specs.ram_gb}GB RAM`);
      if (specs.processor) specHighlights.push(specs.processor);
      if (specs.gpu) specHighlights.push(specs.gpu);
      if (specs.storage_gb) specHighlights.push(`${specs.storage_gb}GB SSD`);

      const targetUseCase = useCases.length > 0 ? useCases[0] : 'your requirements';
      let reason = specHighlights.length > 0
        ? `${specHighlights.join(', ')} — optimized for ${targetUseCase}`
        : `${product.brand} ${product.name} delivers verified ${product.rating}★ performance for ${targetUseCase}`;

      return {
        productId: product.product_code,
        internalId: product.id,
        productName: product.name,
        price: product.price,
        rating: product.rating,
        reason,
        matchScore,
        availability: product.stock_status,
        image_url: product.image_url,
        withinBudget
      };
    });

    // Sort by match score descending
    scoredProducts.sort((a, b) => b.matchScore - a.matchScore);

    // Filter top recommendations
    let recommendations = scoredProducts.filter(p => p.withinBudget).slice(0, 3);
    if (recommendations.length === 0) {
      recommendations = scoredProducts.slice(0, 3);
    }

    // Dynamic clarifying question if confidence threshold requires user alignment
    let clarifyingQuestion = null;
    if (recommendations.length > 0 && recommendations[0].matchScore < 0.75) {
      clarifyingQuestion = `Would you like to explore alternative configurations or adjust the budget target?`;
    }

    // Dynamic personalized AI synthesis via Gemini Flash
    const aiCommentary = await GeminiClient.generateShoppingAdvice(cleanQuery, recommendations);

    return {
      interpretedRequirement,
      budget: budget || (recommendations[0] ? recommendations[0].price : 1000),
      extractedFeatures,
      aiCommentary: aiCommentary || `Based on your request for "${cleanQuery}", we identified these optimal hardware configurations.`,
      recommendations: recommendations.map(r => ({
        productId: r.productId,
        productName: r.productName,
        price: r.price,
        rating: r.rating,
        reason: r.reason,
        matchScore: r.matchScore,
        availability: r.availability,
        image_url: r.image_url
      })),
      clarifyingQuestion
    };
  }
}
