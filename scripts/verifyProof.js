const snarkjs = require("snarkjs");
const fs = require("fs");

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
};

async function verifyAgeProof() {
    console.log(`${colors.yellow}Verifying Age Verification Proof...${colors.reset}`);
    
    const verificationKey = JSON.parse(
        fs.readFileSync("build/ageVerification/verification_key.json")
    );
    const proof = JSON.parse(
        fs.readFileSync("build/ageVerification/proof.json")
    );
    const publicSignals = JSON.parse(
        fs.readFileSync("build/ageVerification/public.json")
    );

    const isValid = await snarkjs.groth16.verify(
        verificationKey,
        publicSignals,
        proof
    );

    if (isValid) {
        console.log(`${colors.green}✓ Age Verification Proof is VALID${colors.reset}`);
        console.log(`Public Signals: ${JSON.stringify(publicSignals)}`);
        return true;
    } else {
        console.log(`${colors.red}✗ Age Verification Proof is INVALID${colors.reset}`);
        return false;
    }
}

async function verifyVoteProof() {
    console.log(`${colors.yellow}Verifying Vote Commitment Proof...${colors.reset}`);
    
    const verificationKey = JSON.parse(
        fs.readFileSync("build/voteCommitment/verification_key.json")
    );
    const proof = JSON.parse(
        fs.readFileSync("build/voteCommitment/proof.json")
    );
    const publicSignals = JSON.parse(
        fs.readFileSync("build/voteCommitment/public.json")
    );

    const isValid = await snarkjs.groth16.verify(
        verificationKey,
        publicSignals,
        proof
    );

    if (isValid) {
        console.log(`${colors.green}✓ Vote Commitment Proof is VALID${colors.reset}`);
        console.log(`Public Signals: ${JSON.stringify(publicSignals)}`);
        return true;
    } else {
        console.log(`${colors.red}✗ Vote Commitment Proof is INVALID${colors.reset}`);
        return false;
    }
}

async function generateCallData(circuitType) {
    const proof = JSON.parse(
        fs.readFileSync(`build/${circuitType}/proof.json`)
    );
    const publicSignals = JSON.parse(
        fs.readFileSync(`build/${circuitType}/public.json`)
    );

    const calldata = await snarkjs.groth16.exportSolidityCallData(
        proof,
        publicSignals
    );

    console.log(`${colors.yellow}Solidity Call Data:${colors.reset}`);
    console.log(calldata);

    return calldata;
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
        if (command === "age") {
            const isValid = await verifyAgeProof();
            process.exit(isValid ? 0 : 1);
        } else if (command === "vote") {
            const isValid = await verifyVoteProof();
            process.exit(isValid ? 0 : 1);
        } else if (command === "calldata") {
            const circuitType = args[1];
            if (!circuitType || !["ageVerification", "voteCommitment"].includes(circuitType)) {
                console.log(`${colors.red}Invalid circuit type. Use: ageVerification or voteCommitment${colors.reset}`);
                process.exit(1);
            }
            await generateCallData(circuitType);
        } else {
            console.log(`${colors.yellow}Usage:${colors.reset}`);
            console.log("  node verifyProof.js age");
            console.log("  node verifyProof.js vote");
            console.log("  node verifyProof.js calldata [ageVerification|voteCommitment]");
        }
    } catch (error) {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

module.exports = { verifyAgeProof, verifyVoteProof, generateCallData };

if (require.main === module) {
    main();
}