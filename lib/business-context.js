// lib/business-context.js - Enhanced version
export const BUSINESS_CONTEXT = {
  sheets: {
    expense_income: {
      name: "Expense_Income_Journal",
      columns: {
        A: { name: "Date", type: "date", format: "d-MMM-yyyy" },
        B: { name: "Amount", type: "number", currency: "INR" },
        C: { name: "Account", type: "dropdown", values: ["Prashant Gaydhane", "PMR", "KPG Saving", "KP Enterprices", "Cash"] },
        D: { name: "Type", type: "dropdown", values: ["Income", "Expense"] },
        E: { name: "Name", type: "text", fuzzyMatch: true },
        F: { name: "Nicknames", type: "text", ignore: true }
      }
    },
    buckets: {
      name: "Buckets",
      sections: {
        inventory: {
          range: "A5:D14",
          columns: {
            A: { name: "Bucket Type", type: "text" },
            B: { name: "Pallavi", type: "number" },
            C: { name: "Tularam", type: "number" },
            D: { name: "Total", type: "number" }
          }
        },
        transactions: {
          range: "A17:F",
          columns: {
            A: { name: "Date", type: "date" },
            B: { name: "Warehouse", type: "dropdown", values: ["Pallavi", "Tularam"] },
            C: { name: "Bucket Type", type: "text" },
            D: { name: "Stock/Sell", type: "dropdown", values: ["Stock", "Sell"] },
            E: { name: "No. of Buckets", type: "number" },
            F: { name: "Buyer/Seller", type: "text", fuzzyMatch: true }
          }
        }
      }
    }
  },

  products: {
    tata: ["TATA G", "TATA W", "TATA 10 Ltr"],
    al: ["AL", "AL 10 ltr"],
    others: ["BB", "ES", "MH", "IBC tank"]
  },

  warehouses: ["Pallavi", "Tularam"],

  queryTypes: {
    sales: ["monthly_sales", "daily_sales", "customer_sales", "account_sales"],
    inventory: ["current_stock", "low_stock", "warehouse_stock", "product_stock"],
    transactions: ["recent_sales", "customer_purchases", "product_performance"],
    financial: ["revenue_analysis", "expense_breakdown", "account_summary"]
  },

  // New: Analytics configuration
  analytics: {
    lowStockThreshold: 10,
    highValueCustomerThreshold: 50000,
    profitMarginTargets: {
      excellent: 30,
      good: 20,
      acceptable: 10
    },
    timeframes: {
      recent: 7,     // days
      monthly: 30,   // days
      quarterly: 90  // days
    }
  },

  // New: Business rules for calculations
  businessRules: {
    workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    currencies: {
      default: "INR",
      symbol: "₹"
    },
    estimatedPrices: {
      "TATA G": 150,
      "TATA W": 140, 
      "TATA 10 Ltr": 200,
      "AL": 130,
      "AL 10 ltr": 180,
      "BB": 120,
      "ES": 110,
      "MH": 100,
      "IBC tank": 5000
    }
  }
};

export const ENHANCED_SYSTEM_PROMPT = `You are a specialized Business Intelligence Assistant for a bucket manufacturing/trading company in India. You have access to REAL-TIME data from Google Sheets and advanced analytics.

## YOUR CAPABILITIES:
🔍 **Data Analysis**: Real-time inventory, sales, and financial data
📊 **Business Intelligence**: Trends, insights, and predictive analytics
💡 **Smart Recommendations**: Data-driven business suggestions
🎯 **Multi-language Support**: Hindi, Marathi, and English

## DATA SOURCES:
### Sheet 1: "Expense_Income_Journal"
- Financial transactions: Date, Amount, Account, Type (Income/Expense), Description
- Accounts: Prashant Gaydhane, PMR, KPG Saving, KP Enterprices, Cash

### Sheet 2: "Buckets" 
- **Inventory Summary (A5:D14)**: Product types, Pallavi warehouse, Tularam warehouse, Total
- **Transaction Log (A17+)**: Date, Warehouse, Bucket Type, Stock/Sell, Quantity, Buyer/Seller
- **Products**: TATA G/W/10Ltr, AL/AL 10ltr, BB, ES, MH, IBC tank
- **Warehouses**: Pallavi, Tularam

## BUSINESS INTELLIGENCE FEATURES:
### 📈 Sales Analytics
- Revenue trends and forecasting
- Product performance analysis
- Customer segmentation and retention
- Sales team performance metrics

### 📦 Inventory Intelligence  
- Stock level optimization
- Low stock alerts and recommendations
- Warehouse efficiency analysis
- Product turnover rates

### 👥 Customer Analytics
- Customer lifetime value
- Purchase pattern analysis
- Customer segmentation (VIP, Regular, New)
- Churn risk identification

### 💰 Financial Intelligence
- Profit margin analysis
- Expense categorization and trends
- Cash flow forecasting
- Account performance tracking

## RESPONSE GUIDELINES:
1. **Language Matching**: Always respond in the same language as the query
2. **Data-Driven**: Use specific numbers from real data
3. **Actionable Insights**: Provide clear recommendations
4. **Cultural Context**: Use Indian business terminology and currency (₹)
5. **Visual Clarity**: Use emojis and formatting for better readability

## ADVANCED FEATURES:
- **Trend Analysis**: Identify growth patterns and seasonal trends
- **Predictive Insights**: Forecast based on historical data
- **Anomaly Detection**: Highlight unusual patterns or outliers
- **Comparative Analysis**: Compare periods, products, or customers
- **Risk Assessment**: Identify potential business risks

## SAMPLE INTERACTIONS:

**Query**: "इस महीने की sales कैसी रही?"
**Response**: "जनवरी 2025 में excellent performance! 📈
- कुल Sales: ₹2,45,000 (↑15% from last month)
- Top Product: TATA G (₹65,000)
- Best Customer: BHUSHAN DONDE (₹30,000)
- Profit Margin: 22.5% (Good range!)

🎯 **Recommendations**: 
- TATA G stock बढ़ाएं - high demand
- AL products पर focus करें - growing trend"

**Query**: "Which warehouse needs attention?"
**Response**: "⚠️ **Tularam Warehouse Alert**
- Stock Level: 45% below optimal
- Recent Sales: 60% increase 
- Low Stock Items: 3 products

🔧 **Action Required**:
1. Restock TATA G immediately
2. Transfer excess AL from Pallavi
3. Review delivery schedules"

Remember: You're not just reporting data - you're providing business intelligence that drives decisions! 🚀`;

// Enhanced query classification with confidence scoring
export function classifyQuery(message) {
  const classifications = {
    sales: {
      keywords: ['sales', 'sell', 'revenue', 'income', 'कमाई', 'बिक्री', 'बेचा', 'earning', 'कितनी', 'कितना'],
      weight: 1.0
    },
    inventory: {
      keywords: ['stock', 'inventory', 'warehouse', 'bucket', 'product', 'स्टॉक', 'माल', 'भंडार', 'बचा'],
      weight: 1.0
    },
    customer: {
      keywords: ['customer', 'buyer', 'client', 'ग्राहक', 'खरीदार', 'कस्टमर', 'कौन', 'top', 'best'],
      weight: 1.0
    },
    financial: {
      keywords: ['profit', 'expense', 'cost', 'financial', 'money', 'cash', 'मुनाफा', 'खर्च', 'पैसा'],
      weight: 1.0
    },
    performance: {
      keywords: ['performance', 'analysis', 'trend', 'growth', 'compare', 'report'],
      weight: 0.8
    }
  };

  const msgLower = message.toLowerCase();
  const scores = {};

  // Calculate confidence scores for each classification
  Object.entries(classifications).forEach(([type, config]) => {
    const matches = config.keywords.filter(keyword => msgLower.includes(keyword));
    scores[type] = (matches.length / config.keywords.length) * config.weight;
  });

  // Find the classification with highest score
  const topMatch = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0];

  // Return classification if confidence is above threshold
  return topMatch[1] > 0.1 ? topMatch[0] : 'general';
}

// New: Enhanced entity extraction
export function extractBusinessEntities(message) {
  const entities = {
    products: [],
    warehouses: [],
    accounts: [],
    timeframes: [],
    metrics: [],
    amounts: []
  };

  const msgUpper = message.toUpperCase();

  // Extract products
  Object.values(BUSINESS_CONTEXT.products).flat().forEach(product => {
    if (msgUpper.includes(product)) {
      entities.products.push(product);
    }
  });

  // Extract warehouses
  BUSINESS_CONTEXT.warehouses.forEach(warehouse => {
    if (message.includes(warehouse)) {
      entities.warehouses.push(warehouse);
    }
  });

  // Extract accounts
  BUSINESS_CONTEXT.sheets.expense_income.columns.C.values.forEach(account => {
    if (message.includes(account)) {
      entities.accounts.push(account);
    }
  });

  // Extract timeframes
  const timePatterns = {
    today: ['today', 'आज'],
    week: ['week', 'सप्ताह', 'हफ्ता'],
    month: ['month', 'महीना', 'महिना'],
    year: ['year', 'साल', 'वर्ष']
  };

  Object.entries(timePatterns).forEach(([timeframe, patterns]) => {
    if (patterns.some(pattern => message.toLowerCase().includes(pattern))) {
      entities.timeframes.push(timeframe);
    }
  });

  // Extract monetary amounts
  const amountPattern = /₹?(\d+(?:,\d+)*(?:\.\d+)?)/g;
  const amounts = message.match(amountPattern);
  if (amounts) {
    entities.amounts = amounts.map(amount => parseFloat(amount.replace(/[₹,]/g, '')));
  }

  return entities;
}

// New: Business intelligence query templates
export const QUERY_TEMPLATES = {
  hindi: {
    sales: [
      "इस महीने कितनी sales हुई?",
      "आज कितना बेचा?",
      "सबसे ज्यादा कौन सा product बिका?",
      "कुल revenue कितना है?"
    ],
    inventory: [
      "कितना stock बचा है?",
      "कम stock वाले products कौन से हैं?",
      "Pallavi warehouse में क्या है?",
      "कौन सा bucket कम है?"
    ],
    customer: [
      "सबसे बड़ा customer कौन है?",
      "नए customers कितने आए?",
      "repeat customers कौन हैं?",
      "top buyers की list दो"
    ]
  },
  english: [
    "What are today's sales?",
    "Show me inventory status",
    "Who are my top customers?",
    "What's my profit margin?",
    "Which products are low in stock?",
    "Compare this month vs last month"
  ]
};