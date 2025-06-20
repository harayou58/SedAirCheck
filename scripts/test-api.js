#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testHealthCheck() {
  console.log('🏥 Testing health check endpoint...');
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testImageAnalysis(imagePath) {
  console.log(`\n📸 Testing image analysis with: ${imagePath}`);
  
  if (!fs.existsSync(imagePath)) {
    console.error('❌ Image file not found:', imagePath);
    return false;
  }

  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(`${API_URL}/api/analyze`, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('✅ Analysis successful!');
    console.log('📊 Results:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Analysis failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting SedAirCheck API tests...\n');

  // Test 1: Health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n⚠️  Server is not running. Please start the backend server first.');
    process.exit(1);
  }

  // Test 2: Image analysis (if test image provided)
  const testImagePath = process.argv[2];
  if (testImagePath) {
    await testImageAnalysis(testImagePath);
  } else {
    console.log('\n💡 Tip: Provide a test image path to test the analysis endpoint:');
    console.log('   node scripts/test-api.js path/to/test-image.jpg');
  }

  console.log('\n✨ Tests completed!');
}

// Run tests
runTests().catch(console.error);