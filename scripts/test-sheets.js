// scripts/test-sheets.js
// Fixed version using CommonJS instead of ES modules
// Run this script to test your Google Sheets connection
// Usage: node scripts/test-sheets.js

require('dotenv').config({ path: '.env.local' });

// Since we're using CommonJS, we need to create a CommonJS version of GoogleSheetsService
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.drive = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    
    if (!this.spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_ID environment variable is required');
    }
  }

  async initialize() {
    if (this.sheets) return; // Already initialized

    try {
      // Parse service account key from environment variable
      const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      
      // Create authentication
      this.auth = new GoogleAuth({
        credentials: serviceAccountKey,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets.readonly',
          'https://www.googleapis.com/auth/drive.readonly'
        ]
      });

      // Build services
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      console.log('✅ Google Sheets API initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets API:', error);
      throw error;
    }
  }

  async readRange(range) {
    await this.initialize();
    
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: range,
      });
      
      return response.data.values || [];
    } catch (error) {
      console.error(`❌ Error reading range ${range}:`, error);
      throw new Error(`Failed to read range ${range}: ${error.message}`);
    }
  }

  async batchReadRanges(ranges) {
    await this.initialize();
    
    try {
      const response = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId: this.spreadsheetId,
        ranges: ranges,
      });
      
      const result = {};
      response.data.valueRanges.forEach((valueRange, index) => {
        const rangeName = ranges[index];
        result[rangeName] = valueRange.values || [];
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error in batch read:', error);
      throw new Error(`Failed to batch read ranges: ${error.message}`);
    }
  }

  // Business-specific data reading methods
  async getInventoryData() {
    console.log('📦 Reading inventory data...');
    try {
      const data = await this.readRange('Buckets!A5:D14');
      console.log(`✅ Read ${data.length} inventory rows`);
      return data;
    } catch (error) {
      console.error('❌ Failed to read inventory data:', error);
      throw error;
    }
  }

  async getTransactionData() {
    console.log('💰 Reading transaction data...');
    try {
      const data = await this.readRange('Buckets!A17:F');
      console.log(`✅ Read ${data.length} transaction rows`);
      return data;
    } catch (error) {
      console.error('❌ Failed to read transaction data:', error);
      throw error;
    }
  }

  async getExpenseData() {
    console.log('📊 Reading expense/income data...');
    try {
      const data = await this.readRange('Expense_Income_Journal!A:F');
      console.log(`✅ Read ${data.length} expense rows`);
      return data;
    } catch (error) {
      console.error('❌ Failed to read expense data:', error);
      throw error;
    }
  }

  async getAllBusinessData() {
    console.log('🔄 Reading all business data...');
    
    const ranges = [
      'Buckets!A5:D14',           // Inventory
      'Buckets!A17:F',            // Transactions
      'Expense_Income_Journal!A:F' // Expenses
    ];
    
    try {
      const data = await this.batchReadRanges(ranges);
      
      return {
        inventory: data['Buckets!A5:D14'] || [],
        transactions: data['Buckets!A17:F'] || [],
        expenses: data['Expense_Income_Journal!A:F'] || []
      };
    } catch (error) {
      console.error('❌ Failed to read all business data:', error);
      throw error;
    }
  }

  async getSpreadsheetInfo() {
    await this.initialize();
    
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        fields: 'properties,sheets.properties'
      });
      
      return {
        title: response.data.properties.title,
        sheets: response.data.sheets.map(sheet => ({
          name: sheet.properties.title,
          id: sheet.properties.sheetId,
          rowCount: sheet.properties.gridProperties?.rowCount,
          columnCount: sheet.properties.gridProperties?.columnCount
        }))
      };
    } catch (error) {
      console.error('❌ Failed to get spreadsheet info:', error);
      throw error;
    }
  }

  // Test connection method
  async testConnection() {
    try {
      const info = await this.getSpreadsheetInfo();
      console.log('🎉 Connection test successful!');
      console.log(`📊 Spreadsheet: ${info.title}`);
      console.log(`📋 Sheets: ${info.sheets.map(s => s.name).join(', ')}`);
      return { success: true, info };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

async function testGoogleSheets() {
  console.log('🚀 Testing Google Sheets Connection...\n');
  
  try {
    // Initialize service
    console.log('1️⃣ Initializing Google Sheets Service...');
    const sheetsService = new GoogleSheetsService();
    
    // Test basic connection
    console.log('2️⃣ Testing connection...');
    const connectionTest = await sheetsService.testConnection();
    
    if (!connectionTest.success) {
      console.error('❌ Connection failed:', connectionTest.error);
      return;
    }
    
    console.log('✅ Connection successful!\n');
    
    // Test individual data fetching
    console.log('3️⃣ Testing data fetching...\n');
    
    try {
      console.log('📦 Testing inventory data...');
      const inventory = await sheetsService.getInventoryData();
      console.log(`   → Found ${inventory.length} inventory rows`);
      if (inventory.length > 0) {
        console.log(`   → Sample: ${JSON.stringify(inventory[0])}\n`);
      }
    } catch (error) {
      console.error('   ❌ Inventory fetch failed:', error.message);
    }
    
    try {
      console.log('💰 Testing transaction data...');
      const transactions = await sheetsService.getTransactionData();
      console.log(`   → Found ${transactions.length} transaction rows`);
      if (transactions.length > 0) {
        console.log(`   → Sample: ${JSON.stringify(transactions[0])}\n`);
      }
    } catch (error) {
      console.error('   ❌ Transaction fetch failed:', error.message);
    }
    
    try {
      console.log('📊 Testing expense data...');
      const expenses = await sheetsService.getExpenseData();
      console.log(`   → Found ${expenses.length} expense rows`);
      if (expenses.length > 0) {
        console.log(`   → Sample: ${JSON.stringify(expenses[0])}\n`);
      }
    } catch (error) {
      console.error('   ❌ Expense fetch failed:', error.message);
    }
    
    // Test batch fetching
    console.log('4️⃣ Testing batch data fetch...');
    try {
      const allData = await sheetsService.getAllBusinessData();
      console.log('✅ Batch fetch successful:');
      console.log(`   → Inventory: ${allData.inventory.length} rows`);
      console.log(`   → Transactions: ${allData.transactions.length} rows`);
      console.log(`   → Expenses: ${allData.expenses.length} rows`);
    } catch (error) {
      console.error('   ❌ Batch fetch failed:', error.message);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your .env.local file');
    console.error('2. Verify GOOGLE_SHEETS_ID is correct');
    console.error('3. Ensure service account has access to the sheet');
    console.error('4. Check if sheet names and ranges are correct');
  }
}

// Helper function to validate environment variables
function validateEnvironment() {
  console.log('🔍 Validating environment variables...');
  
  const required = [
    'GOOGLE_SHEETS_ID',
    'GOOGLE_SERVICE_ACCOUNT_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env.local file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated\n');
  
  // Show what we found (masked for security)
  console.log('📋 Configuration:');
  console.log(`   GOOGLE_SHEETS_ID: ${process.env.GOOGLE_SHEETS_ID}`);
  console.log(`   SERVICE_ACCOUNT: ${process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 'Set ✅' : 'Missing ❌'}\n`);
}

// Run the test
validateEnvironment();
testGoogleSheets().catch(console.error);