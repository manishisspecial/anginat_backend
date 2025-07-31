const fs = require('fs');
const path = require('path');
const { S3Service, S3_CONFIG, initBuckets } = require('../src/config/aws_s3');
require('dotenv').config();

(async () => {
  try {
    console.log('Initializing S3 buckets...');
    await initBuckets(); // Ensure buckets exist before testing
    console.log('Buckets initialized');
    
    const userId = 'test-user';
    
    // Load an audio file for transcription
    console.log('Loading audio file...');
    const audioFilePath = path.join(__dirname, 'test-audio.mp3'); // Make sure this file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Test audio file not found at: ${audioFilePath}`);
    }
    
    const audioBuffer = fs.readFileSync(audioFilePath);
    console.log(`Loaded audio file: ${audioFilePath} (${audioBuffer.length} bytes)`);
    
    // Upload the audio file to S3 for STT processing
    console.log('Uploading audio file to S3...');
    const result = await S3Service.uploadSTTAudio(
      userId, 
      audioBuffer,
      'test-audio.mp3' // Original filename
    );

    console.log('Upload successful:', result);

    // Generate a signed URL to access the uploaded audio
    console.log('Generating signed URL...');
    const signedUrl = await S3Service.getSTTSignedUrl(result.key);
    console.log('Signed URL:', signedUrl);

    // In a real application, you would now call the STT service to transcribe the audio
    console.log('\nNext steps for transcription:');
    console.log('1. Use the uploaded file with your STT service');
    console.log('2. Call STTService.transcribeAudio() with:');
    console.log(`   - userId: ${userId}`);
    console.log(`   - audioBuffer: <buffer>`);
    console.log(`   - audioConfig: {`);
    console.log(`       originalFilename: "test-audio.mp3",`);
    console.log(`       mimetype: "audio/mpeg",`);
    console.log(`       languageCode: "en-US",`);
    console.log(`       sampleRate: 16000`);
    console.log(`     }`);

    // Example call to STT service (not executed)
    console.log('\nExample code for transcription:');
    console.log(`
    const STTService = require('./src/service/STTService');
    const sttService = new STTService();
    
    const transcriptionResult = await sttService.transcribeAudio(
      userId,
      audioBuffer,
      {
        originalFilename: "test-audio.mp3",
        mimetype: "audio/mpeg",
        languageCode: "en-US",
        sampleRate: 16000
      }
    );
    
    console.log('Transcription:', transcriptionResult.text);
    `);

  } catch (err) {
    console.error('Test failed:', err);
  }
})();