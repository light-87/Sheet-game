// scripts/simple-test.js
// Simplified test to get better error details
require('dotenv').config({ path: '.env.local' });

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

async function simpleTest() {
  console.log('🔍 Simple Connection Test\n');
  
  try {
    // Parse service account key
    console.log('1️⃣ Parsing service account key...');
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    console.log(`✅ Service account email: ${serviceAccountKey.client_email}`);
    console.log(`✅ Project ID: ${serviceAccountKey.project_id}\n`);
    
    // Create auth
    console.log('2️⃣ Creating authentication...');
    const auth = new GoogleAuth({
      credentials: serviceAccountKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Authentication created\n');
    
    // Test simple read first
    console.log('3️⃣ Testing simple data read...');
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    console.log(`📊 Spreadsheet ID: ${spreadsheetId}`);
    
    try {
      // Try to read just one cell to test basic access
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'A1',
      });
      
      console.log('✅ Basic read successful!');
      console.log(`📄 Data found: ${response.data.values ? 'Yes' : 'No'}`);
      
      if (response.data.values) {
        console.log(`📝 Cell A1 content: ${JSON.stringify(response.data.values[0])}`);
      }
      
    } catch (readError) {
      console.error('❌ Read failed with detailed error:');
      
      if (readError.response && readError.response.data) {
        console.error('Error details:', JSON.stringify(readError.response.data, null, 2));
      } else {
        console.error('Error message:', readError.message);
      }
      
      // Check specific error types
      if (readError.code === 403) {
        console.error('\n🔒 PERMISSION ISSUE:');
        console.error('1. Make sure you shared the sheet with:');
        console.error(`   ${serviceAccountKey.client_email}`);
        console.error('2. Give the service account Editor permissions');
        console.error('3. Make sure the sheet is not restricted');
      } else if (readError.code === 404) {
        console.error('\n📄 SHEET NOT FOUND:');
        console.error('1. Check the spreadsheet ID is correct');
        console.error('2. Make sure the sheet exists and is accessible');
      } else if (readError.code === 400) {
        console.error('\n⚠️ BAD REQUEST:');
        console.error('1. Check if the range/sheet name is correct');
        console.error('2. Verify the spreadsheet ID format');
        console.error('3. Check if the sheet is shared properly');
      }
      
      return;
    }
    
    // If basic read works, try getting sheet info
    console.log('\n4️⃣ Testing spreadsheet metadata...');
    try {
      const metaResponse = await sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
        fields: 'properties.title,sheets.properties.title'
      });
      
      console.log('✅ Metadata read successful!');
      console.log(`📊 Spreadsheet title: ${metaResponse.data.properties.title}`);
      console.log(`📋 Available sheets: ${metaResponse.data.sheets.map(s => s.properties.title).join(', ')}`);
      
    } catch (metaError) {
      console.error('❌ Metadata read failed:', metaError.message);
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('JSON')) {
      console.error('\n🔧 JSON Error - Check your .env.local file format');
    }
  }
}

simpleTest().catch(console.error);