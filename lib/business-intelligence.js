// lib/business-intelligence.js - Simplified version without complex calculations
export class BusinessIntelligence {
    constructor(sheetsService) {
      this.sheets = sheetsService;
    }
  
    // Main analysis dispatcher - now simplified
    async analyzeQuery(query, data) {
      const queryLower = query.toLowerCase();
      
      // Simple data preparation based on query type
      if (this.isSalesQuery(queryLower)) {
        return this.prepareSalesData(query, data);
      }
      
      if (this.isInventoryQuery(queryLower)) {
        return this.prepareInventoryData(query, data);
      }
      
      if (this.isCustomerQuery(queryLower)) {
        return this.prepareCustomerData(query, data);
      }
      
      if (this.isFinancialQuery(queryLower)) {
        return this.prepareFinancialData(query, data);
      }
      
      // Default: return all data with basic structure
      return this.prepareComprehensiveData(query, data);
    }
  
    // Simple data preparation methods (no complex calculations)
    prepareSalesData(query, data) {
      const { transactions = [], expenses = [] } = data;
      
      return {
        type: 'sales_analysis',
        query: query,
        data: {
          transactions: this.parseTransactionData(transactions),
          expenses: this.parseExpenseData(expenses)
        },
        metadata: {
          transactionCount: transactions.length,
          expenseCount: expenses.length,
          timeframe: this.extractTimeframe(query),
          language: this.detectLanguage(query)
        }
      };
    }
  
    prepareInventoryData(query, data) {
      const { inventory = [], transactions = [] } = data;
      
      return {
        type: 'inventory_analysis',
        query: query,
        data: {
          inventory: this.parseInventoryData(inventory),
          recentTransactions: this.parseTransactionData(transactions)
        },
        metadata: {
          inventoryCount: inventory.length,
          transactionCount: transactions.length,
          timeframe: this.extractTimeframe(query),
          language: this.detectLanguage(query)
        }
      };
    }
  
    prepareCustomerData(query, data) {
      const { transactions = [], expenses = [] } = data;
      
      return {
        type: 'customer_analysis',
        query: query,
        data: {
          transactions: this.parseTransactionData(transactions),
          expenses: this.parseExpenseData(expenses)
        },
        metadata: {
          transactionCount: transactions.length,
          timeframe: this.extractTimeframe(query),
          language: this.detectLanguage(query)
        }
      };
    }
  
    prepareFinancialData(query, data) {
      const { expenses = [], transactions = [] } = data;
      
      return {
        type: 'financial_analysis',
        query: query,
        data: {
          expenses: this.parseExpenseData(expenses),
          transactions: this.parseTransactionData(transactions)
        },
        metadata: {
          expenseCount: expenses.length,
          transactionCount: transactions.length,
          timeframe: this.extractTimeframe(query),
          language: this.detectLanguage(query)
        }
      };
    }
  
    prepareComprehensiveData(query, data) {
      return {
        type: 'comprehensive_analysis',
        query: query,
        data: {
          inventory: this.parseInventoryData(data.inventory || []),
          transactions: this.parseTransactionData(data.transactions || []),
          expenses: this.parseExpenseData(data.expenses || [])
        },
        metadata: {
          inventoryCount: (data.inventory || []).length,
          transactionCount: (data.transactions || []).length,
          expenseCount: (data.expenses || []).length,
          language: this.detectLanguage(query)
        }
      };
    }
  
    // Helper methods for query classification
    isSalesQuery(query) {
      const salesKeywords = ['sales', 'sell', 'revenue', 'income', 'कमाई', 'बिक्री', 'बेचा', 'earning'];
      return salesKeywords.some(keyword => query.includes(keyword));
    }
  
    isInventoryQuery(query) {
      const inventoryKeywords = ['stock', 'inventory', 'warehouse', 'bucket', 'product', 'स्टॉक', 'माल', 'भंडार'];
      return inventoryKeywords.some(keyword => query.includes(keyword));
    }
  
    isCustomerQuery(query) {
      const customerKeywords = ['customer', 'buyer', 'client', 'ग्राहक', 'खरीदार', 'कस्टमर'];
      return customerKeywords.some(keyword => query.includes(keyword));
    }
  
    isFinancialQuery(query) {
      const financialKeywords = ['profit', 'expense', 'cost', 'financial', 'money', 'cash', 'मुनाफा', 'खर्च', 'पैसा'];
      return financialKeywords.some(keyword => query.includes(keyword));
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
  
    extractTimeframe(query) {
      const queryLower = query.toLowerCase();
      
      if (queryLower.includes('today') || queryLower.includes('आज')) {
        return 'today';
      }
      if (queryLower.includes('week') || queryLower.includes('सप्ताह') || queryLower.includes('हफ्ता')) {
        return 'week';
      }
      if (queryLower.includes('month') || queryLower.includes('महीना') || queryLower.includes('महिना')) {
        return 'month';
      }
      if (queryLower.includes('year') || queryLower.includes('साल') || queryLower.includes('वर्ष')) {
        return 'year';
      }
      
      return 'general';
    }
  
    // Simple data parsing methods
    parseTransactionData(transactions) {
      if (!transactions || transactions.length <= 1) return [];
      
      const headers = transactions[0];
      const data = transactions.slice(1);
      
      return data.map((row, index) => {
        try {
          return {
            id: index,
            date: row[0] || '',
            warehouse: row[1] || '',
            product: row[2] || '',
            type: row[3] || '',
            quantity: parseInt(row[4]) || 0,
            customer: row[5] || ''
          };
        } catch (error) {
          console.warn('Error parsing transaction row:', row);
          return null;
        }
      }).filter(Boolean);
    }
  
    parseInventoryData(inventory) {
      if (!inventory || inventory.length <= 1) return [];
      
      const headers = inventory[0];
      const data = inventory.slice(1);
      
      return data.map((row, index) => {
        try {
          return {
            id: index,
            product: row[0] || '',
            pallavi: parseInt(row[1]) || 0,
            tularam: parseInt(row[2]) || 0,
            total: parseInt(row[3]) || (parseInt(row[1]) || 0) + (parseInt(row[2]) || 0)
          };
        } catch (error) {
          console.warn('Error parsing inventory row:', row);
          return null;
        }
      }).filter(Boolean);
    }
  
    parseExpenseData(expenses) {
      if (!expenses || expenses.length <= 1) return [];
      
      const headers = expenses[0];
      const data = expenses.slice(1);
      
      return data.map((row, index) => {
        try {
          return {
            id: index,
            date: row[0] || '',
            amount: parseFloat(row[1]) || 0,
            account: row[2] || '',
            type: row[3] || '',
            description: row[4] || ''
          };
        } catch (error) {
          console.warn('Error parsing expense row:', row);
          return null;
        }
      }).filter(Boolean);
    }
  
    // Generate basic insights (no complex calculations)
    generateBasicInsights(analysisResult) {
      const insights = [];
      
      if (analysisResult.data.transactions) {
        insights.push(`Found ${analysisResult.data.transactions.length} transactions`);
      }
      
      if (analysisResult.data.inventory) {
        insights.push(`Found ${analysisResult.data.inventory.length} products in inventory`);
      }
      
      if (analysisResult.data.expenses) {
        insights.push(`Found ${analysisResult.data.expenses.length} expense records`);
      }
      
      return insights;
    }
  }