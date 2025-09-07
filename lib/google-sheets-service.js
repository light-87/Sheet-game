// lib/google-sheets-service.js
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

export class GoogleSheetsService {
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