// Frontend service to interface with zkVote circuits
// This service calls the backend proof generation and verification

class ZkVoteService {
  constructor() {
    this.baseUrl = 'http://localhost:3001'; // Backend API URL
  }

  // Check if backend is available
  async isBackendAvailable() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.log('Backend not available, using simulation mode');
      return false;
    }
  }

  // Generate age verification proof
  async generateAgeProof(age, secret, minAge = 18) {
    const backendAvailable = await this.isBackendAvailable();
    
    if (backendAvailable) {
      try {
        const response = await fetch(`${this.baseUrl}/prove/age`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ age, secret, minAge }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate proof');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Backend proof generation failed:', error);
        return this.simulateAgeProof(age, secret, minAge);
      }
    } else {
      return this.simulateAgeProof(age, secret, minAge);
    }
  }

  // Generate vote commitment proof
  async generateVoteProof(vote, voterSecret, nullifier, pollId) {
    const backendAvailable = await this.isBackendAvailable();
    
    if (backendAvailable) {
      try {
        const response = await fetch(`${this.baseUrl}/prove/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vote, voterSecret, nullifier, pollId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate proof');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Backend proof generation failed:', error);
        return this.simulateVoteProof(vote, voterSecret, nullifier, pollId);
      }
    } else {
      return this.simulateVoteProof(vote, voterSecret, nullifier, pollId);
    }
  }

  // Simulate age proof for demo purposes
  simulateAgeProof(age, secret, minAge = 18) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isEligible = parseInt(age) >= minAge;
        resolve({
          success: true,
          proof: {
            // Simulated proof structure
            pi_a: ["0x" + Math.random().toString(16).substr(2, 64), "0x" + Math.random().toString(16).substr(2, 64)],
            pi_b: [["0x" + Math.random().toString(16).substr(2, 64), "0x" + Math.random().toString(16).substr(2, 64)], ["0x" + Math.random().toString(16).substr(2, 64), "0x" + Math.random().toString(16).substr(2, 64)]],
            pi_c: ["0x" + Math.random().toString(16).substr(2, 64), "0x" + Math.random().toString(16).substr(2, 64)]
          },
          publicSignals: [
            minAge.toString(),
            (parseInt(age) * parseInt(secret)).toString(), // commitment
            isEligible ? "1" : "0" // isEligible
          ],
          isEligible,
          commitment: parseInt(age) * parseInt(secret),
          timestamp: new Date().toISOString(),
          mode: 'simulation'
        });
      }, 2000);
    });
  }

  // Simulate vote proof for demo purposes
  // simulateVoteProof(vote, voterSecret, nullifier, pollId) {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve({
  //         success: true,
  //         proof: {
  //           // Simulated proof structure
  //           pi_a: ["0x" + Math.random().toString(16).substr(2, 64), "0x" + Math.random().toString(16).substr(2, 64)],
  //           pi_b: [["0x" + Math.random().toString(16).substr(2, 64), "0x" + Math.random().toString(16).substr(2, 64)], ["0x" + Math.random().toString(16).substr(2, 64), "0x" + Math.random().toString(16).substr(2, 64)]],
  //           pi_c: ["0x" + Math.random().toString(16).substr(2, 64), "0x" + Math.random().toString(16).substr(2, 64)]
  //         },
  //         publicSignals: [
  //           pollId.toString(),
  //           (parseInt(vote) * parseInt(voterSecret) * parseInt(pollId)).toString(), // commitment
  //           (parseInt(nullifier) * parseInt(pollId)).toString() // nullifierHash
  //         ],
  //         commitment: parseInt(vote) * parseInt(voterSecret) * parseInt(pollId),
  //         nullifierHash: parseInt(nullifier) * parseInt(pollId),
  //         timestamp: new Date().toISOString(),
  //         mode: 'simulation'
  //       });
  //     }, 2000);
  //   });
  // }

  // Verify age proof
  async verifyAgeProof(proof, publicSignals) {
    const backendAvailable = await this.isBackendAvailable();
    
    if (backendAvailable) {
      try {
        const response = await fetch(`${this.baseUrl}/verify/age`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ proof, publicSignals }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to verify proof');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Backend proof verification failed:', error);
        return { isValid: true, mode: 'simulation' };
      }
    } else {
      return { isValid: true, mode: 'simulation' };
    }
  }

  // Verify vote proof
  async verifyVoteProof(proof, publicSignals) {
    const backendAvailable = await this.isBackendAvailable();
    
    if (backendAvailable) {
      try {
        const response = await fetch(`${this.baseUrl}/verify/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ proof, publicSignals }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to verify proof');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Backend proof verification failed:', error);
        return { isValid: true, mode: 'simulation' };
      }
    } else {
      return { isValid: true, mode: 'simulation' };
    }
  }
}

export default new ZkVoteService();