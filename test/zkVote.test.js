const { generateAgeProof, generateVoteProof } = require('../scripts/generateProof');
const { verifyAgeProof, verifyVoteProof } = require('../scripts/verifyProof');

describe('zkVote System Tests', () => {
  describe('Age Verification', () => {
    it('should generate and verify age proof for eligible voter', async function() {
      this.timeout(10000);
      
      const age = 25;
      const secret = 12345;
      const minAge = 18;
      
      // Generate proof
      const { proof, publicSignals } = await generateAgeProof(age, secret, minAge);
      
      // Verify proof
      const isValid = await verifyAgeProof();
      
      expect(isValid).to.be.true;
      expect(publicSignals[1]).to.equal('1'); // isEligible should be 1
    });

    it('should reject age proof for underage voter', async function() {
      this.timeout(10000);
      
      const age = 16;
      const secret = 12345;
      const minAge = 18;
      
      // Generate proof
      const { proof, publicSignals } = await generateAgeProof(age, secret, minAge);
      
      // Should show ineligible
      expect(publicSignals[1]).to.equal('0'); // isEligible should be 0
    });
  });

  describe('Vote Commitment', () => {
    it('should generate and verify vote commitment', async function() {
      this.timeout(10000);
      
      const vote = 1;
      const voterSecret = 98765;
      const nullifier = 54321;
      const pollId = 1;
      
      // Generate proof
      const { proof, publicSignals } = await generateVoteProof(vote, voterSecret, nullifier, pollId);
      
      // Verify proof
      const isValid = await verifyVoteProof();
      
      expect(isValid).to.be.true;
      expect(publicSignals[0]).to.equal(pollId.toString()); // pollId should match
    });
  });
});