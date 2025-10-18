#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting zkVote Circuit Compilation...${NC}\n"

# Create output directories
mkdir -p build/ageVerification
mkdir -p build/voteCommitment

# Compile Age Verification Circuit
echo -e "${GREEN}Compiling Age Verification Circuit...${NC}"
circom circuits/ageVerification.circom \
    --r1cs \
    --wasm \
    --sym \
    --c \
    -o build/ageVerification

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Age Verification Circuit compiled successfully${NC}\n"
else
    echo -e "${RED}✗ Age Verification Circuit compilation failed${NC}\n"
    exit 1
fi

# Compile Vote Commitment Circuit
echo -e "${GREEN}Compiling Vote Commitment Circuit...${NC}"
circom circuits/voteCommitment.circom \
    --r1cs \
    --wasm \
    --sym \
    --c \
    -o build/voteCommitment

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Vote Commitment Circuit compiled successfully${NC}\n"
else
    echo -e "${RED}✗ Vote Commitment Circuit compilation failed${NC}\n"
    exit 1
fi

# Display circuit info
echo -e "${YELLOW}Circuit Information:${NC}"
snarkjs r1cs info build/ageVerification/ageVerification.r1cs
echo ""
snarkjs r1cs info build/voteCommitment/voteCommitment.r1cs

echo -e "\n${GREEN}All circuits compiled successfully!${NC}"
echo -e "${YELLOW}Next step: Run ./scripts/setup.sh to generate the trusted setup${NC}"