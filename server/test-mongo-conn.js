import mongoose from 'mongoose';

const candidateUris = [
  // Candidate 1: Stripped < and >, percent-encoded @ as %40 + campusflow db
  'mongodb+srv://santhoshdesu23_Db:Santhosh%4023Db@mango-cluster0.uchxflq.mongodb.net/campusflow?retryWrites=true&w=majority&appName=mango-Cluster0',
  // Candidate 2: Encoded angle brackets + campusflow db
  'mongodb+srv://santhoshdesu23_Db:%3CSanthosh%4023Db%3E@mango-cluster0.uchxflq.mongodb.net/campusflow?retryWrites=true&w=majority&appName=mango-Cluster0',
  // Candidate 3: As in env without db path
  'mongodb+srv://santhoshdesu23_Db:Santhosh%4023Db@mango-cluster0.uchxflq.mongodb.net/?retryWrites=true&w=majority&appName=mango-Cluster0'
];

async function testConnection() {
  for (let i = 0; i < candidateUris.length; i++) {
    const uri = candidateUris[i];
    console.log(`Testing candidate ${i + 1}...`);
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(`✅ SUCCESS WITH CANDIDATE ${i + 1}!`);
      console.log(`Connected to host: ${mongoose.connection.host}`);
      console.log(`Connected to database: ${mongoose.connection.name}`);
      await mongoose.disconnect();
      return;
    } catch (err) {
      console.log(`❌ Candidate ${i + 1} failed: ${err.message}`);
      try { await mongoose.disconnect(); } catch (e) {}
    }
  }
}

testConnection();
