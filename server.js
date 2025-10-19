const express = require('express');
const cors = require('cors');
const { generateAgeProof, generateVoteProof } = require('./scripts/generateProof');
const { verifyAgeProof, verifyVoteProof } = require('./scripts/verifyProof');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'zkVote backend is running' });
});

// Generate age verification proof
app.post('/prove/age', async (req, res) => {
  try {
    const { age, secret, minAge } = req.body;
    
    if (!age || !secret) {
      return res.status(400).json({ 
        success: false, 
        error: 'Age and secret are required' 
      });
    }

    const result = await generateAgeProof(
      parseInt(age), 
      parseInt(secret), 
      parseInt(minAge) || 18
    );

    // Read the generated files
    const proof = JSON.parse(fs.readFileSync('build/ageVerification/proof.json'));
    const publicSignals = JSON.parse(fs.readFileSync('build/ageVerification/public.json'));

    res.json({
      success: true,
      proof,
      publicSignals,
      isEligible: publicSignals[1] === "1", // isEligible is at index 1
      commitment: publicSignals[0], // commitment is at index 0
      minAge: publicSignals[2], // minAge is at index 2
      timestamp: new Date().toISOString(),
      mode: 'circuit'
    });
  } catch (error) {
    console.error('Age proof generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Generate vote commitment proof
app.post('/prove/vote', async (req, res) => {
  try {
    const { vote, voterSecret, nullifier, pollId } = req.body;
    
    if (vote === undefined || !voterSecret || !nullifier || !pollId) {
      return res.status(400).json({ 
        success: false, 
        error: 'All vote parameters are required' 
      });
    }

    const result = await generateVoteProof(
      parseInt(vote),
      parseInt(voterSecret),
      parseInt(nullifier),
      parseInt(pollId)
    );

    // Read the generated files
    const proof = JSON.parse(fs.readFileSync('build/voteCommitment/proof.json'));
    const publicSignals = JSON.parse(fs.readFileSync('build/voteCommitment/public.json'));

    res.json({
      success: true,
      proof,
      publicSignals,
      commitment: publicSignals[1],
      nullifierHash: publicSignals[2],
      timestamp: new Date().toISOString(),
      mode: 'circuit'
    });
  } catch (error) {
    console.error('Vote proof generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Verify age proof
app.post('/verify/age', async (req, res) => {
  try {
    const { proof, publicSignals } = req.body;
    
    // Save proof and public signals for verification
    fs.writeFileSync('build/ageVerification/proof.json', JSON.stringify(proof, null, 2));
    fs.writeFileSync('build/ageVerification/public.json', JSON.stringify(publicSignals, null, 2));
    
    const isValid = await verifyAgeProof();
    
    res.json({
      isValid,
      mode: 'circuit'
    });
  } catch (error) {
    console.error('Age proof verification error:', error);
    res.status(500).json({ 
      isValid: false, 
      error: error.message 
    });
  }
});

// Verify vote proof
app.post('/verify/vote', async (req, res) => {
  try {
    const { proof, publicSignals } = req.body;
    
    // Save proof and public signals for verification
    fs.writeFileSync('build/voteCommitment/proof.json', JSON.stringify(proof, null, 2));
    fs.writeFileSync('build/voteCommitment/public.json', JSON.stringify(publicSignals, null, 2));
    
    const isValid = await verifyVoteProof();
    
    res.json({
      isValid,
      mode: 'circuit'
    });
  } catch (error) {
    console.error('Vote proof verification error:', error);
    res.status(500).json({ 
      isValid: false, 
      error: error.message 
    });
  }
});

// Check if circuits are compiled
app.get('/status', (req, res) => {
  const ageCircuitExists = fs.existsSync('build/ageVerification/ageVerification.wasm');
  const voteCircuitExists = fs.existsSync('build/voteCommitment/voteCommitment.wasm');
  const setupComplete = fs.existsSync('build/ageVerification/ageVerification_final.zkey') && 
                       fs.existsSync('build/voteCommitment/voteCommitment_final.zkey');

  res.json({
    circuitsCompiled: ageCircuitExists && voteCircuitExists,
    setupComplete,
    ready: ageCircuitExists && voteCircuitExists && setupComplete
  });
});

app.listen(PORT, () => {
  console.log(`zkVote backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;