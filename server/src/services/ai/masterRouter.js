import { ShoppingAgent } from './shoppingAgent.js';
import { KnowledgeRagAgent } from './knowledgeRagAgent.js';
import { LogisticsAgent } from './logisticsAgent.js';
import { OperationsAgent } from './operationsAgent.js';
import { db } from '../../config/db.js';

export class MasterRouter {
  /**
   * Master AI Router: Intent classification, delegation, audit logging,
   * and individual customer conversation history persistence
   */
  static async routeQuery({ query, userId = null, userPreferences = {}, sessionId = null, conversationHistory = null }) {
    const startTime = Date.now();
    const cleanQuery = query.trim();
    const queryLower = cleanQuery.toLowerCase();

    // Resolve individual identity for chat history isolation
    const individualKey = userId ? `user:${userId}` : `session:${sessionId || 'guest'}`;
    const history = (Array.isArray(conversationHistory) && conversationHistory.length > 0)
      ? conversationHistory
      : db.getChatHistory(individualKey);

    let routedAgent = 'Shopping Agent';
    let interactionType = 'SHOPPING_RECOMMENDATION';
    let agentResult = null;
    let confidence = 0.92;

    // Conversational follow-up detection based on recent individual history
    const lastAiMsg = history.slice().reverse().find(m => m.sender === 'ai');
    const isFollowUpPattern = /what about|how about|does this apply|does it apply|can i still|what if|how long|any fee|who pays/i.test(queryLower) || cleanQuery.split(/\s+/).length <= 5;
    const isKnowledgeFollowUp = lastAiMsg?.agent === 'Knowledge RAG Agent' && isFollowUpPattern;

    // Intent Heuristics
    const isLogistics = /track|order status|where is my|shipment|delivery status|order #|trk-|ord-/i.test(queryLower);
    const isKnowledge = isKnowledgeFollowUp || /return|policy|refund|warranty|guarantee|sla|fee|days of delivery|opened laptop|accidental damage/i.test(queryLower);
    const isOperations = /warehouse|stock alert|reorder|inventory health|restock/i.test(queryLower);

    if (isLogistics) {
      routedAgent = 'Logistics & Order Agent';
      interactionType = 'ORDER_INQUIRY';
      agentResult = await LogisticsAgent.handleTrackingInquiry(cleanQuery, userId);
      confidence = agentResult.order ? 0.95 : 0.70;
    } else if (isKnowledge) {
      routedAgent = 'Knowledge RAG Agent';
      interactionType = 'KNOWLEDGE_RAG';
      agentResult = await KnowledgeRagAgent.askPolicy(cleanQuery, {
        chatHistory: history,
        userId,
        sessionId
      });
      confidence = agentResult.confidence === 'HIGH' ? 0.94 : 0.65;
    } else if (isOperations) {
      routedAgent = 'Operations Agent';
      interactionType = 'WAREHOUSE_OPS';
      agentResult = await OperationsAgent.checkInventoryHealth();
      confidence = 0.98;
    } else {
      // Default to Shopping Discovery Agent
      routedAgent = 'Shopping Agent';
      interactionType = 'SHOPPING_RECOMMENDATION';
      agentResult = await ShoppingAgent.evaluateDiscovery(cleanQuery, userPreferences);
      confidence = agentResult.recommendations.length > 0 ? (agentResult.recommendations[0].matchScore || 0.90) : 0.60;
    }

    const latencyMs = Date.now() - startTime;

    // Record individual chat history entries
    db.appendChatMessage(individualKey, {
      sender: 'user',
      text: cleanQuery
    });

    const aiSummaryText = agentResult?.answer 
      || agentResult?.aiCommentary
      || (agentResult?.recommendations ? `Found ${agentResult.recommendations.length} tailored recommendations.` : agentResult?.message || '');

    db.appendChatMessage(individualKey, {
      sender: 'ai',
      text: aiSummaryText,
      agent: routedAgent,
      confidence,
      latencyMs,
      data: agentResult
    });

    // Record audit trail in database
    await db.logAiInteraction({
      userId,
      interactionType,
      userQuery: cleanQuery,
      aiResponse: {
        routedAgent,
        data: agentResult
      },
      confidenceScore: confidence,
      latencyMs
    });

    return {
      agent: routedAgent,
      interactionType,
      confidence,
      latencyMs,
      result: agentResult,
      individualKey
    };
  }
}
