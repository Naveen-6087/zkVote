pragma circom 2.0.0;

// Binary check from documentation
template BinaryCheck() {
    signal input in;
    signal output out;
    
    in * (in - 1) === 0;
    out <== in;
}

// Vote commitment circuit
template VoteCommitment() {
    // Private inputs
    signal input vote;          // 0 or 1 (or candidate ID)
    signal input voterSecret;   // Unique secret for the voter
    signal input nullifier;     // Prevents double voting
    
    // Public inputs
    signal input pollId;        // ID of the poll
    
    // Public outputs
    signal output commitment;   // Vote commitment
    signal output nullifierHash; // Nullifier hash (to prevent double voting)
    
    // Ensure vote is binary (for yes/no votes)
    // For multiple candidates, you'd check vote < numCandidates
    component voteCheck = BinaryCheck();
    voteCheck.in <== vote;
    
    // Create vote commitment
    // commitment = vote * voterSecret * pollId
    signal voteSecret;
    voteSecret <== vote * voterSecret;
    commitment <== voteSecret * pollId;
    
    // Create nullifier hash to prevent double voting
    // nullifierHash = nullifier * pollId
    nullifierHash <== nullifier * pollId;
}

component main {public [pollId]} = VoteCommitment();