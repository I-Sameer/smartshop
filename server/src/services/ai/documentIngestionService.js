import { createRequire } from 'module';
import { VectorEngine } from './vectorEngine.js';
import { db } from '../../config/db.js';

const require = createRequire(import.meta.url);
let pdfModule = null;
try {
  pdfModule = require('pdf-parse');
} catch (e) {
  // pdf-parse fallback
}

/**
 * DocumentIngestionService
 * Handles multi-format ingestion for:
 * - PDF documents (via pdf-parse)
 * - Markdown documents (.md)
 * - Structured JSON policy files (.json)
 * - Semantic chunking, 1536-D vector embedding, and database storage.
 */
export class DocumentIngestionService {
  /**
   * Extracts clean text from PDF buffer
   */
  static async extractPdfText(buffer) {
    if (!buffer) return '';
    try {
      if (pdfModule) {
        if (typeof pdfModule === 'function') {
          const res = await pdfModule(buffer);
          if (res && res.text) return res.text.trim();
        } else if (pdfModule.PDFParse) {
          const parser = new pdfModule.PDFParse({ data: buffer });
          await parser.load();
          const text = await parser.getText();
          if (typeof text === 'string') return text.trim();
          if (text && text.text) return text.text.trim();
        }
      }
    } catch (err) {
      console.warn('PDF parsing exception, falling back to stream reader:', err.message);
    }

    // Fallback: sanitized stream text extraction
    return buffer.toString('utf-8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').trim();
  }

  /**
   * Ingest a document from raw text, JSON string/object, or PDF Buffer.
   */
  static async ingest({
    title,
    doc_type = 'MD',
    category = 'General Policy',
    version = '2026.1',
    region = 'GLOBAL',
    raw_content,
    fileBuffer = null,
    filename = null
  }) {
    let extractedText = '';
    let detectedType = (doc_type || 'MD').toUpperCase();

    // 1. Process PDF file buffer if supplied
    if (fileBuffer || detectedType === 'PDF') {
      if (fileBuffer) {
        extractedText = await this.extractPdfText(fileBuffer);
        detectedType = 'PDF';
      } else if (raw_content) {
        extractedText = raw_content;
      }
    }

    // 2. Process Structured JSON
    else if (detectedType === 'JSON' || (typeof raw_content === 'string' && raw_content.trim().startsWith('{'))) {
      detectedType = 'JSON';
      try {
        const parsed = typeof raw_content === 'string' ? JSON.parse(raw_content) : raw_content;
        extractedText = this.flattenJsonToMarkdown(parsed);
      } catch (err) {
        extractedText = typeof raw_content === 'string' ? raw_content : JSON.stringify(raw_content, null, 2);
      }
    }

    // 3. Process Markdown / Plain Text
    else {
      extractedText = (raw_content || '').trim();
      detectedType = 'MD';
    }

    if (!extractedText || extractedText.length < 10) {
      throw new Error('Extracted document content is empty or too short for vectorization.');
    }

    // 4. Ingest and vectorize through database store
    const docRecord = {
      title: title || (filename ? filename.replace(/\.[^/.]+$/, '') : 'Ingested Policy Document'),
      filename: filename || `${(title || 'policy').toLowerCase().replace(/\s+/g, '_')}.${detectedType.toLowerCase()}`,
      doc_type: detectedType,
      category: category || 'Enterprise Policy',
      version: version || '2026.1',
      region: region || 'GLOBAL',
      raw_content: extractedText
    };

    const result = await db.addKnowledgeDocument(docRecord);
    return {
      success: true,
      document: result.document,
      chunksCreated: result.chunksCreated,
      docType: detectedType,
      characterCount: extractedText.length
    };
  }

  /**
   * Converts structured JSON policy or manual format into readable structured text for chunking
   */
  static flattenJsonToMarkdown(data) {
    if (Array.isArray(data)) {
      return data.map((item, idx) => {
        const title = item.title || item.heading || item.section || `Clause ${idx + 1}`;
        const content = item.content || item.description || item.text || JSON.stringify(item);
        return `## ${title}\n${content}`;
      }).join('\n\n');
    }

    let result = '';
    if (data.title) {
      result += `# ${data.title}\n\n`;
    }

    if (data.sections && Array.isArray(data.sections)) {
      result += data.sections.map(s => `## ${s.heading || s.title || 'Section'}\n${s.content || s.text || ''}`).join('\n\n');
    } else if (data.policies && Array.isArray(data.policies)) {
      result += data.policies.map(p => `## ${p.name || p.topic || 'Policy'}\n${p.rule || p.details || ''}`).join('\n\n');
    } else {
      for (const [key, val] of Object.entries(data)) {
        const heading = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (typeof val === 'object') {
          result += `## ${heading}\n${JSON.stringify(val, null, 2)}\n\n`;
        } else {
          result += `## ${heading}\n${val}\n\n`;
        }
      }
    }

    return result.trim();
  }
}
