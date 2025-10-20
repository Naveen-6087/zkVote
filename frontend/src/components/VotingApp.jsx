import React, { useState } from 'react';
import { Shield, Vote, CheckCircle, XCircle, Loader, User, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import zkVoteService from '../services/zkVoteService';

const VotingApp = () => {
  const [activeTab, setActiveTab] = useState('verify');
  const [loading, setLoading] = useState(false);
  
  // Age verification state
  const [age, setAge] = useState('');
  const [ageSecret, setAgeSecret] = useState('');
  const [ageVerified, setAgeVerified] = useState(null);
  const [ageProofData, setAgeProofData] = useState(null);
  const [simulationMode, setSimulationMode] = useState(false);
  
  // Vote state
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [voterSecret, setVoterSecret] = useState('');
  const [nullifier, setNullifier] = useState('');
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [voteProofData, setVoteProofData] = useState(null);

  const candidates = [
    { id: 0, name: 'Candidate A', description: 'Focus on education and healthcare' },
    { id: 1, name: 'Candidate B', description: 'Focus on economy and jobs' },
  ];

  const generateRandomSecret = () => {
    return Math.floor(Math.random() * 1000000).toString();
  };

  const handleAgeVerification = async () => {
    setLoading(true);
    
    // Validate age input before sending to circuit
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      setAgeVerified(false);
      setAgeProofData({
        error: 'Please enter a valid age between 0 and 150 years',
        timestamp: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }
    
    try {
      const result = await zkVoteService.generateAgeProof(age, ageSecret, 18);
      
      if (result.success) {
        setAgeVerified(result.isEligible);
        setAgeProofData({
          commitment: result.commitment,
          isEligible: result.isEligible,
          timestamp: result.timestamp,
          proof: result.proof,
          publicSignals: result.publicSignals,
          mode: result.mode
        });
        setSimulationMode(result.mode === 'simulation');
      } else {
        setAgeVerified(false);
        setAgeProofData({
          error: result.error || 'Age verification failed. Please check your input.',
          timestamp: new Date().toISOString(),
        });
        console.error('Proof generation failed:', result.error);
      }
    } catch (error) {
      console.error('Age verification failed:', error);
      setAgeVerified(false);
      setAgeProofData({
        error: 'Circuit validation failed. Please enter a valid age (0-150).',
        timestamp: new Date().toISOString(),
      });
    }
    
    setLoading(false);
  };

  const handleVoteSubmission = async () => {
    if (!ageVerified) {
      alert('Please verify your age first!');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await zkVoteService.generateVoteProof(
        selectedCandidate, 
        voterSecret, 
        nullifier, 
        1 // pollId
      );
      
      if (result.success) {
        setVoteProofData({
          commitment: result.commitment,
          nullifierHash: result.nullifierHash,
          pollId: 1,
          timestamp: result.timestamp,
          proof: result.proof,
          publicSignals: result.publicSignals,
          mode: result.mode
        });
        setVoteSubmitted(true);
      } else {
        console.error('Vote proof generation failed:', result.error);
      }
    } catch (error) {
      console.error('Vote submission failed:', error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">zkVote</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Anonymous & Secure Voting with Zero-Knowledge Proofs
          </p>
          {simulationMode && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              <AlertCircle className="w-4 h-4" />
              Running in Simulation Mode
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Age Verification:</span>
              {ageVerified === null ? (
                <span className="text-yellow-600">Pending</span>
              ) : ageVerified ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Failed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Vote Status:</span>
              {voteSubmitted ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Submitted
                </span>
              ) : (
                <span className="text-gray-400">Not Voted</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('verify')}
              className={`flex-1 py-4 px-6 text-center font-medium rounded-tl-lg transition-colors ${
                activeTab === 'verify'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                Age Verification
              </div>
            </button>
            <button
              onClick={() => setActiveTab('vote')}
              className={`flex-1 py-4 px-6 text-center font-medium rounded-tr-lg transition-colors ${
                activeTab === 'vote'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
              disabled={!ageVerified}
            >
              <div className="flex items-center justify-center gap-2">
                <Vote className="w-5 h-5" />
                Cast Vote
              </div>
            </button>
          </div>

          <div className="p-8">
            {/* Age Verification Tab */}
            {activeTab === 'verify' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    Verify Your Age
                  </h3>
                  <p className="text-gray-600">
                    Prove you're eligible to vote without revealing your exact age
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Age (Private)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your age (0-150)"
                      min="0"
                      max="150"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valid range: 0-150 years. This value remains private and is not stored.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret Key (Private)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ageSecret}
                        onChange={(e) => setAgeSecret(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter secret or generate random"
                      />
                      <Button
                        onClick={() => setAgeSecret(generateRandomSecret())}
                        variant="outline"
                        size="sm"
                      >
                        Random
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Used to generate your unique commitment
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Verification Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Minimum age: 18 years</li>
                    <li>• Maximum age: 150 years (circuit constraint)</li>
                    <li>• Your exact age is never revealed</li>
                    <li>• Only eligibility (yes/no) is proven</li>
                    <li>• Secret key ensures privacy and uniqueness</li>
                  </ul>
                </div>

                <Button
                  onClick={handleAgeVerification}
                  disabled={!age || !ageSecret || loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Generating Proof...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Generate Age Proof
                    </>
                  )}
                </Button>

                {ageVerified !== null && (
                  <div className={`p-4 rounded-lg ${
                    ageVerified 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {ageVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <h4 className={`font-medium ${
                        ageVerified ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {ageVerified ? 'Age Verification Successful!' : 'Age Verification Failed'}
                      </h4>
                    </div>
                    <p className={`text-sm ${
                      ageVerified ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {ageVerified 
                        ? 'You are eligible to vote. You can now proceed to cast your vote.'
                        : ageProofData?.error || 'You must be at least 18 years old to participate in voting.'
                      }
                    </p>
                    {ageProofData && ageVerified && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-xs font-mono text-gray-600">
                          Proof Generated: {ageProofData.timestamp}
                        </p>
                        <p className="text-xs font-mono text-gray-600">
                          Commitment: {ageProofData.commitment}
                        </p>
                        {ageProofData.mode === 'simulation' && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⚠️ Simulation mode - not a real cryptographic proof
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Vote Tab */}
            {activeTab === 'vote' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    Cast Your Vote
                  </h3>
                  <p className="text-gray-600">
                    Your vote is anonymous and cannot be traced back to you
                  </p>
                </div>

                {!ageVerified && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-yellow-800">
                        Please verify your age first to enable voting.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Select Candidate:</h4>
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedCandidate === candidate.id.toString()
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!ageVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => ageVerified && setSelectedCandidate(candidate.id.toString())}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={selectedCandidate === candidate.id.toString()}
                          onChange={() => setSelectedCandidate(candidate.id.toString())}
                          disabled={!ageVerified}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <div>
                          <h5 className="font-medium text-gray-800">{candidate.name}</h5>
                          <p className="text-sm text-gray-600">{candidate.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voter Secret (Private)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voterSecret}
                        onChange={(e) => setVoterSecret(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter or generate secret"
                        disabled={!ageVerified}
                      />
                      <Button
                        onClick={() => setVoterSecret(generateRandomSecret())}
                        disabled={!ageVerified}
                        variant="outline"
                        size="sm"
                      >
                        Random
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nullifier (Private)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={nullifier}
                        onChange={(e) => setNullifier(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Prevents double voting"
                        disabled={!ageVerified}
                      />
                      <Button
                        onClick={() => setNullifier(generateRandomSecret())}
                        disabled={!ageVerified}
                        variant="outline"
                        size="sm"
                      >
                        Random
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Vote Privacy:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Your vote choice is encrypted and anonymous</li>
                    <li>• Nullifier prevents voting twice with the same identity</li>
                    <li>• No one can determine how you voted</li>
                    <li>• Vote commitment is publicly verifiable</li>
                  </ul>
                </div>

                <Button
                  onClick={handleVoteSubmission}
                  disabled={!ageVerified || !selectedCandidate || !voterSecret || !nullifier || loading || voteSubmitted}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Submitting Vote...
                    </>
                  ) : voteSubmitted ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Vote Submitted
                    </>
                  ) : (
                    <>
                      <Vote className="w-5 h-5 mr-2" />
                      Submit Anonymous Vote
                    </>
                  )}
                </Button>

                {voteProofData && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-green-800">Vote Successfully Submitted!</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Your anonymous vote has been recorded. Thank you for participating!
                    </p>
                    <div className="p-3 bg-white rounded border">
                      <p className="text-xs font-mono text-gray-600">
                        Vote Timestamp: {voteProofData.timestamp}
                      </p>
                      <p className="text-xs font-mono text-gray-600">
                        Vote Commitment: {voteProofData.commitment}
                      </p>
                      <p className="text-xs font-mono text-gray-600">
                        Nullifier Hash: {voteProofData.nullifierHash}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            How zkVote Works
          </h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-gray-800">Age Verification</p>
                <p>Prove you're over 18 without revealing your exact age using zero-knowledge proofs.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-gray-800">Anonymous Voting</p>
                <p>Cast your vote anonymously. Your choice is encrypted and cannot be traced back to your identity.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-gray-800">Verifiable Results</p>
                <p>All votes are publicly verifiable while maintaining voter privacy through cryptographic proofs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingApp;