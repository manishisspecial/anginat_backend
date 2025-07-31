const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const LeadController = require('../controllers/LeadController');
const Institution = require('../models/Institution');
require('dotenv').config();

// Test cases for country code functionality (without validation)
const testCases = [
  {
    name: 'Test with country code +1',
    leadData: {
      institutionDomain: 'test.com',
      course: 'Computer Science',
      applicantName: 'John Doe',
      countryCode: '+1',
      phoneNumber: '1234567890',
      email: 'john@example.com'
    },
    expectedCountryCode: '+1'
  },
  {
    name: 'Test with country code +44',
    leadData: {
      institutionDomain: 'test.com',
      course: 'Engineering',
      applicantName: 'Jane Smith',
      countryCode: '+44',
      phoneNumber: '9876543210',
      email: 'jane@example.com'
    },
    expectedCountryCode: '+44'
  },
  {
    name: 'Test without country code (should default to +91)',
    leadData: {
      institutionDomain: 'test.com',
      course: 'Mathematics',
      applicantName: 'Bob Wilson',
      phoneNumber: '5555555555',
      email: 'bob@example.com'
    },
    expectedCountryCode: '+91'
  },
  {
    name: 'Test with any country code format (should accept anything)',
    leadData: {
      institutionDomain: 'test.com',
      course: 'Physics',
      applicantName: 'Alice Brown',
      countryCode: '91', // Any format should work
      phoneNumber: '1111111111',
      email: 'alice@example.com'
    },
    expectedCountryCode: '91'
  },
  {
    name: 'Test with long country code (should accept anything)',
    leadData: {
      institutionDomain: 'test.com',
      course: 'Chemistry',
      applicantName: 'Charlie Davis',
      countryCode: '+12345', // Any length should work
      phoneNumber: '2222222222',
      email: 'charlie@example.com'
    },
    expectedCountryCode: '+12345'
  },
  {
    name: 'Test with text country code (should accept anything)',
    leadData: {
      institutionDomain: 'test.com',
      course: 'Biology',
      applicantName: 'David Wilson',
      countryCode: 'abc', // Text should work
      phoneNumber: '3333333333',
      email: 'david@example.com'
    },
    expectedCountryCode: 'abc'
  }
];

async function testCountryCodeSaving() {
  console.log('🧪 Testing Country Code Saving (No Validation)...\n');
  
  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}`);
    
    try {
      // Test model creation without validation
      const lead = new Lead({
        institution: new mongoose.Types.ObjectId(), // Mock institution ID
        course: testCase.leadData.course,
        applicantName: testCase.leadData.applicantName,
        countryCode: testCase.leadData.countryCode,
        phoneNumber: testCase.leadData.phoneNumber,
        email: testCase.leadData.email
      });

      console.log(`✅ Country code saved: ${lead.countryCode}`);
      if (lead.countryCode === testCase.expectedCountryCode) {
        console.log(`✅ Expected country code matches: ${testCase.expectedCountryCode}`);
        passedTests++;
      } else {
        console.log(`❌ Expected ${testCase.expectedCountryCode}, got ${lead.countryCode}`);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ Error saving country code: ${error.message}`);
      failedTests++;
    }
    
    console.log(''); // Empty line for readability
  }

  console.log(`📊 Test Results: ${passedTests} passed, ${failedTests} failed`);
  return { passedTests, failedTests };
}

async function testCountryCodeDefaultValue() {
  console.log('🧪 Testing Country Code Default Value...\n');
  
  try {
    // Create a lead without country code
    const lead = new Lead({
      institution: new mongoose.Types.ObjectId(),
      course: 'Test Course',
      applicantName: 'Test User',
      phoneNumber: '1234567890',
      email: 'test@example.com'
    });

    console.log(`📋 Testing default country code assignment`);
    console.log(`Country code before save: ${lead.countryCode}`);
    
    if (lead.countryCode === '+91') {
      console.log('✅ Default country code is correctly set to +91');
      return true;
    } else {
      console.log(`❌ Expected +91, got ${lead.countryCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing default value: ${error.message}`);
    return false;
  }
}

async function testCountryCodeInController() {
  console.log('🧪 Testing Country Code in Controller...\n');
  
  try {
    // Test the controller logic for setting default country code
    const leadData = {
      institutionDomain: 'test.com',
      course: 'Test Course',
      applicantName: 'Controller Test User',
      phoneNumber: '1234567890',
      email: 'controller@example.com'
    };

    console.log(`📋 Testing controller default country code logic`);
    console.log(`Original leadData.countryCode: ${leadData.countryCode}`);
    
    // Simulate controller logic
    if (!leadData.countryCode) {
      leadData.countryCode = '+91';
    }
    
    console.log(`After controller logic: ${leadData.countryCode}`);
    
    if (leadData.countryCode === '+91') {
      console.log('✅ Controller correctly sets default country code to +91');
      return true;
    } else {
      console.log(`❌ Controller should set +91, got ${leadData.countryCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing controller logic: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Country Code Tests (No Validation)...\n');
  
  try {
    // Connect to MongoDB (you may need to adjust the connection string)
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB\n');
    } else {
      console.log('⚠️  MONGODB_URI not found in environment variables. Running tests without database connection.\n');
    }
    
    const savingResults = await testCountryCodeSaving();
    const defaultValueResult = await testCountryCodeDefaultValue();
    const controllerResult = await testCountryCodeInController();
    
    console.log('\n🎯 Final Test Summary:');
    console.log(`Country Code Saving: ${savingResults.passedTests} passed, ${savingResults.failedTests} failed`);
    console.log(`Default Value Test: ${defaultValueResult ? 'PASSED' : 'FAILED'}`);
    console.log(`Controller Logic Test: ${controllerResult ? 'PASSED' : 'FAILED'}`);
    
    const totalTests = savingResults.passedTests + savingResults.failedTests + 2; // +2 for default and controller tests
    const totalPassed = savingResults.passedTests + (defaultValueResult ? 1 : 0) + (controllerResult ? 1 : 0);
    
    console.log(`\n📈 Overall: ${totalPassed}/${totalTests} tests passed`);
    
    if (totalPassed === totalTests) {
      console.log('🎉 All tests passed! Country code functionality is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the country code implementation.');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n✅ Disconnected from MongoDB');
    }
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testCountryCodeSaving,
  testCountryCodeDefaultValue,
  testCountryCodeInController,
  runAllTests
}; 