// app/api/claude/route.js - Clean, simplified version
import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleSheetsService } from '../../../lib/google-sheets-service';
import { QueryProcessor } from '../../../lib/query-processor';
import { ENHANCED_SYSTEM_PROMPT } from '../../../lib/business-context';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize services once
let sheetsService;
let queryProcessor;

async function initializeServices() {
  if (!sheetsService) {
    sheetsService = new GoogleSheetsService();
    queryProcessor = new QueryProcessor(sheetsService);
  }
}

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const { message } = await request.json();
    
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }

    console.log('🎤 Processing query:', message);
    
    // Initialize services
    await initializeServices();
    
    // Process query to get structured data
    let queryResult;
    try {
      queryResult = await queryProcessor.processQuery(message);
      console.log('✅ Query processed successfully:', {
        intent: queryResult.queryContext.intent,
        language: queryResult.queryContext.language,
        dataType: queryResult.analysis.type
      });
      
    } catch (processingError) {
      console.error('⚠️ Query processing failed, using fallback:', processingError);
      
      // Fallback: Get all data and basic classification
      const basicData = await sheetsService.getAllBusinessData();
      queryResult = {
        queryContext: { intent: 'general_inquiry', language: 'english' },
        claudeContext: {
          query: { original: message, language: 'english', type: 'general' },
          data: {
            summary: {
              inventoryItems: basicData.inventory?.length || 0,
              transactions: basicData.transactions?.length || 0,
              expenses: basicData.expenses?.length || 0
            },
            inventory: basicData.inventory || [],
            transactions: basicData.transactions || [],
            expenses: basicData.expenses || []
          },
          business_context: {
            company: "Bucket Manufacturing/Trading Business",
            currency: "INR"
          },
          fallbackMode: true
        }
      };
    }

    // Create enhanced prompt with real business data
    const businessDataPrompt = `${ENHANCED_SYSTEM_PROMPT}

## CURRENT BUSINESS DATA ANALYSIS:
${JSON.stringify(queryResult.claudeContext, null, 2)}

## KEY INSTRUCTIONS FOR YOUR RESPONSE:
1. **Language**: Respond in ${queryResult.claudeContext.query.language} 
2. **Data Analysis**: Use the REAL data provided above to answer the question
3. **Specific Numbers**: Include actual figures from the data
4. **Business Insights**: Provide actionable recommendations
5. **Currency**: Format amounts in Indian Rupees (₹)
6. **Professional**: Be helpful but concise

## USER'S QUESTION: "${message}"

Analyze the data and provide a comprehensive, data-driven response that helps make informed business decisions.`;

    // Send to Claude for intelligent analysis
    console.log('🤖 Sending to Claude for analysis...');
    
    const response = await anthropic.messages.create({
    //   model: 'claude-sonnet-4-20250514',
    //   model: 'claude-3-5-sonnet-20241022',
      model: 'claude-3-5-haiku-latest',
      max_tokens: 2000,
      system: businessDataPrompt,
      messages: [{ 
        role: 'user', 
        content: message 
      }]
    });

    const claudeResponse = response.content[0].text;
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Response generated in ${processingTime}ms`);

    return NextResponse.json({ 
      response: claudeResponse,
      metadata: {
        processingTime,
        queryType: queryResult.analysis?.type || 'general',
        language: queryResult.queryContext.language,
        dataUsed: {
          inventory: queryResult.claudeContext.data.summary.inventoryItems,
          transactions: queryResult.claudeContext.data.summary.transactions,
          expenses: queryResult.claudeContext.data.summary.expenses
        },
        fallbackMode: queryResult.claudeContext.fallbackMode || false
      }
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    
    const processingTime = Date.now() - startTime;
    let errorMessage = '😔 कुछ तकनीकी समस्या है। कृपया दोबारा कोशिश करें।';
    
    if (error.message?.includes('Google')) {
      errorMessage = '📊 डेटा लेने में समस्या है। कृपया बाद में कोशिश करें।';
    } else if (error.message?.includes('Claude') || error.message?.includes('Anthropic')) {
      errorMessage = '🤖 AI सेवा में समस्या है। कृपया बाद में कोशिश करें।';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        processingTime,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

// Simple test endpoint
export async function GET(request) {
  try {
    await initializeServices();
    
    const { searchParams } = new URL(request.url);
    const testQuery = searchParams.get('query') || 'current stock status';
    
    console.log('🧪 Testing with query:', testQuery);
    
    // Test the simplified pipeline
    const testResult = await queryProcessor.testQuery(testQuery);
    
    // Test sheets connection
    const connectionTest = await sheetsService.testConnection();
    
    return NextResponse.json({
      status: 'success',
      connection: connectionTest.success,
      testQuery: {
        query: testQuery,
        intent: testResult.queryContext.intent,
        language: testResult.queryContext.language,
        dataType: testResult.analysis.type,
        dataCounts: testResult.claudeContext.data.summary
      },
      systemHealth: {
        sheets: connectionTest.success,
        queryProcessing: true,
        dataAccess: testResult.claudeContext.data.summary.inventoryItems > 0
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}