// lib/query-processor.js - Simplified version focusing on data preparation
import { BusinessIntelligence } from './business-intelligence.js';

export class QueryProcessor {
  constructor(sheetsService) {
    this.sheets = sheetsService;
    this.businessIntelligence = new BusinessIntelligence(sheetsService);
  }

  async processQuery(userMessage) {
    console.log('🔍 Processing query:', userMessage);
    
    try {
      // Step 1: Analyze query and determine data requirements
      const queryContext = this.analyzeQuery(userMessage);
      console.log('📊 Query context:', queryContext);
      
      // Step 2: Fetch relevant data based on query type
      const businessData = await this.fetchRelevantData(queryContext);
      console.log('📦 Data fetched for:', Object.keys(businessData));
      
      // Step 3: Prepare data for Claude (no complex calculations)
      const analysis = await this.businessIntelligence.analyzeQuery(userMessage, businessData);
      console.log('🧠 Data preparation completed:', analysis.type);
      
      // Step 4: Format everything for Claude
      const claudeContext = this.formatForClaude(analysis, businessData, userMessage);
      
      return {
        queryContext,
        businessData,
        analysis,
        claudeContext
      };
      
    } catch (error) {
      console.error('❌ Query processing error:', error);
      throw error;
    }
  }

  analyzeQuery(message) {
    const messageLower = message.toLowerCase();
    
    return {
      language: this.detectLanguage(message),
      intent: this.classifyIntent(messageLower),
      entities: this.extractEntities(message),
      timeframe: this.extractTimeIndicators(messageLower),
      confidence: 0.9 // High confidence since we're keeping it simple
    };
  }

  detectLanguage(message) {
    const hindiPattern = /[\u0900-\u097F]/;
    const marathiWords = ['आहे', 'काय', 'कसे', 'कधी', 'कुठे'];
    
    if (hindiPattern.test(message)) {
      if (marathiWords.some(word => message.includes(word))) {
        return 'marathi';
      }
      return 'hindi';
    }
    return 'english';
  }

  classifyIntent(messageLower) {
    const intents = {
      sales_inquiry: ['sales', 'sell', 'revenue', 'income', 'कमाई', 'बिक्री', 'बेचा', 'earning'],
      inventory_check: ['stock', 'inventory', 'warehouse', 'bucket', 'product', 'स्टॉक', 'माल', 'भंडार'],
      customer_analysis: ['customer', 'buyer', 'client', 'ग्राहक', 'खरीदार', 'कस्टमर'],
      financial_analysis: ['profit', 'expense', 'cost', 'financial', 'money', 'cash', 'मुनाफा', 'खर्च', 'पैसा'],
      status_check: ['status', 'current', 'now', 'today', 'अभी', 'आज', 'हाल']
    };
    
    // Find intent with most keyword matches
    let bestIntent = 'general_inquiry';
    let bestScore = 0;
    
    for (const [intent, keywords] of Object.entries(intents)) {
      const score = keywords.filter(keyword => messageLower.includes(keyword)).length;
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }
    
    return bestIntent;
  }

  extractEntities(message) {
    const entities = {
      products: [],
      warehouses: [],
      accounts: []
    };
    
    // Product entities
    const products = ['TATA G', 'TATA W', 'TATA', 'AL', 'BB', 'ES', 'MH', 'IBC tank'];
    entities.products = products.filter(product => 
      message.toUpperCase().includes(product)
    );
    
    // Warehouse entities
    const warehouses = ['Pallavi', 'Tularam'];
    entities.warehouses = warehouses.filter(warehouse => 
      message.includes(warehouse)
    );
    
    // Account entities  
    const accounts = ['Prashant Gaydhane', 'PMR', 'KPG Saving', 'KP Enterprices', 'Cash'];
    entities.accounts = accounts.filter(account => 
      message.includes(account)
    );
    
    return entities;
  }

  extractTimeIndicators(messageLower) {
    const timeIndicators = {
      today: ['today', 'आज'],
      week: ['week', 'सप्ताह', 'हफ्ता'],
      month: ['month', 'महीना', 'महिना'],
      year: ['year', 'साल', 'वर्ष']
    };
    
    const found = [];
    for (const [period, keywords] of Object.entries(timeIndicators)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        found.push(period);
      }
    }
    
    return found;
  }

  async fetchRelevantData(queryContext) {
    const { intent } = queryContext;
    
    try {
      switch (intent) {
        case 'sales_inquiry':
        case 'financial_analysis':
          console.log('💰 Fetching sales and financial data...');
          return {
            transactions: await this.sheets.getTransactionData(),
            expenses: await this.sheets.getExpenseData()
          };
          
        case 'inventory_check':
          console.log('📦 Fetching inventory data...');
          return {
            inventory: await this.sheets.getInventoryData(),
            transactions: await this.sheets.getTransactionData()
          };
          
        case 'customer_analysis':
          console.log('👥 Fetching customer data...');
          return {
            transactions: await this.sheets.getTransactionData(),
            expenses: await this.sheets.getExpenseData()
          };
          
        default:
          console.log('📊 Fetching comprehensive data...');
          return await this.sheets.getAllBusinessData();
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      return { error: 'Data fetch failed' };
    }
  }

  formatForClaude(analysis, businessData, originalQuery) {
    // Create clean, structured context for Claude
    const context = {
      query: {
        original: originalQuery,
        language: analysis.metadata?.language || 'english',
        type: analysis.type,
        timeframe: analysis.metadata?.timeframe || 'general'
      },
      
      data: {
        summary: {
          inventoryItems: analysis.data?.inventory?.length || 0,
          transactions: analysis.data?.transactions?.length || 0,
          expenses: analysis.data?.expenses?.length || 0
        },
        
        // Include actual data for Claude to analyze
        inventory: analysis.data?.inventory || [],
        transactions: analysis.data?.transactions || [],
        expenses: analysis.data?.expenses || []
      },
      
      business_context: {
        company: "Bucket Manufacturing/Trading Business",
        products: ["TATA G", "TATA W", "TATA 10 Ltr", "AL", "AL 10 ltr", "BB", "ES", "MH", "IBC tank"],
        warehouses: ["Pallavi", "Tularam"],
        accounts: ["Prashant Gaydhane", "PMR", "KPG Saving", "KP Enterprices", "Cash"],
        currency: "INR"
      },
      
      instructions: {
        response_language: analysis.metadata?.language || 'english',
        include_specific_numbers: true,
        provide_insights: true,
        format_currency: "₹",
        be_actionable: true
      }
    };
    
    return context;
  }

  // Simple test method
  async testQuery(query) {
    console.log('🧪 Testing simplified query processing for:', query);
    
    try {
      const result = await this.processQuery(query);
      console.log('✅ Simplified query processing test successful');
      console.log('📊 Results:', {
        intent: result.queryContext.intent,
        language: result.queryContext.language,
        dataType: result.analysis.type,
        dataSourcesUsed: Object.keys(result.businessData)
      });
      
      return result;
    } catch (error) {
      console.error('❌ Simplified query processing test failed:', error);
      throw error;
    }
  }
}