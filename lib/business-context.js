// lib/business-context.js
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
    }
  };
  
  export const SYSTEM_PROMPT = `You are a specialized Business Intelligence Assistant for a bucket manufacturing/trading company in India. You analyze data from two Google Sheets:
  
  ## DATA SOURCES:
  ### Sheet 1: "Expense_Income_Journal"
  - Financial transactions with columns: Date, Amount, Account (5 types), Type (Income/Expense), Name, Nicknames (ignore)
  - Account types: Prashant Gaydhane, PMR, KPG Saving, KP Enterprices, Cash
  
  ### Sheet 2: "Buckets"  
  - Inventory Summary (A5:D14): Product types, Pallavi warehouse stock, Tularam warehouse stock, Total
  - Transaction Log (A17+): Date, Warehouse, Bucket Type, Stock/Sell, Quantity, Buyer/Seller
  - Products: TATA G/W/10Ltr, AL/AL 10ltr, BB, ES, MH, IBC tank
  - Warehouses: Pallavi, Tularam
  
  ## RESPONSE RULES:
  1. Respond in the same language as query (Hindi/Marathi/English)
  2. Use fuzzy matching for person/customer names
  3. Provide specific numbers with currency formatting (₹)
  4. Include actionable insights and follow-up suggestions
  5. Handle relative dates (आज, कल, इस महीने, etc.)
  
  ## SAMPLE RESPONSE:
  Query: "इस महीने कितनी sales हुई?"
  Response: "जनवरी 2025 में कुल sales: ₹2,45,000
  - सबसे ज्यादा customer: BHUSHAN DONDE (₹30,000)  
  - Account breakdown: PMR (₹1,40,000), Cash (₹87,800)
  - कुल transactions: 12
  क्या आप किसी specific product की sales देखना चाहते हैं?"`;
  
  // Query classification helper
  export function classifyQuery(message) {
    const salesKeywords = ['sales', 'कमाई', 'revenue', 'income', 'बेचा', 'कितना'];
    const inventoryKeywords = ['stock', 'inventory', 'बचा', 'कितना', 'warehouse'];
    const customerKeywords = ['customer', 'buyer', 'खरीदार', 'कौन'];
    
    const msgLower = message.toLowerCase();
    
    if (salesKeywords.some(kw => msgLower.includes(kw))) {
      return 'sales';
    } else if (inventoryKeywords.some(kw => msgLower.includes(kw))) {
      return 'inventory';  
    } else if (customerKeywords.some(kw => msgLower.includes(kw))) {
      return 'customer';
    }
    
    return 'general';
  }