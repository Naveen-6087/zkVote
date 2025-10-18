#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting Trusted Setup for zkVote...${NC}\n"

# Create setup directory
mkdir -p build/setup

# Powers of Tau - Phase 1 (Circuit Independent)
echo -e "${GREEN}Phase 1: Powers of Tau Ceremony${NC}"

# Start new powers of tau ceremony
echo "Starting new powers of tau ceremony..."
snarkjs powersoftau new bn128 14 build/setup/pot14_0000.ptau -v

# Contribute to the ceremony
echo "Contributing to powers of tau..."
snarkjs powersoftau contribute build/setup/pot14_0000.ptau \
    build/setup/pot14_0001.ptau \
    --name="First contribution" -v

# Prepare phase 2
echo "Preparing phase 2..."
snarkjs powersoftau prepare phase2 build/setup/pot14_0001.ptau \
    build/setup/pot14_final.ptau -v

echo -e "${GREEN}✓ Phase 1 complete${NC}\n"

# Phase 2 - Age Verification Circuit
echo -e "${GREEN}Phase 2a: Age Verification Circuit Setup${NC}"

# Generate .zkey file
snarkjs groth16 setup build/ageVerification/ageVerification.r1cs \
    build/setup/pot14_final.ptau \
    build/ageVerification/ageVerification_0000.zkey

# Contribute to phase 2
snarkjs zkey contribute build/ageVerification/ageVerification_0000.zkey \
    build/ageVerification/ageVerification_final.zkey \
    --name="Age Verification Contributor" -v

# Export verification key
snarkjs zkey export verificationkey build/ageVerification/ageVerification_final.zkey \
    build/ageVerification/verification_key.json

echo -e "${GREEN}✓ Age Verification setup complete${NC}\n"

# Phase 2 - Vote Commitment Circuit
echo -e "${GREEN}Phase 2b: Vote Commitment Circuit Setup${NC}"

# Generate .zkey file
snarkjs groth16 setup build/voteCommitment/voteCommitment.r1cs \
    build/setup/pot14_final.ptau \
    build/voteCommitment/voteCommitment_0000.zkey

# Contribute to phase 2
snarkjs zkey contribute build/voteCommitment/voteCommitment_0000.zkey \
    build/voteCommitment/voteCommitment_final.zkey \
    --name="Vote Commitment Contributor" -v

# Export verification key
snarkjs zkey export verificationkey build/voteCommitment/voteCommitment_final.zkey \
    build/voteCommitment/verification_key.json

echo -e "${GREEN}✓ Vote Commitment setup complete${NC}\n"

# Generate Solidity verifiers
echo -e "${GREEN}Generating Solidity Verifiers...${NC}"

mkdir -p contracts

snarkjs zkey export solidityverifier \
    build/ageVerification/ageVerification_final.zkey \
    contracts/AgeVerifier.sol

snarkjs zkey export solidityverifier \
    build/voteCommitment/voteCommitment_final.zkey \
    contracts/VoteVerifier.sol

echo -e "${GREEN}✓ Solidity verifiers generated${NC}\n"

echo -e "${GREEN}Trusted Setup Complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Use scripts/generateProof.js to generate proofs"
echo -e "2. Use scripts/verifyProof.js to verify proofs"
echo -e "3. Deploy verifier contracts to blockchain"