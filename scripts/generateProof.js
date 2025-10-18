const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
};

async function generateAgeProof(age, secret, minAge = 18) {
    console.log(`${colors.yellow}Generating Age Verification Proof...${colors.reset}`);
    
    const input = {
        age: age.toString(),
        secret: secret.toString(),
        minAge: minAge.toString(),
    };

    // Ensure build directory exists
    if (!fs.existsSync("build/ageVerification")) {
        console.log(`${colors.red}Error: Circuits not compiled. Run 'npm run compile' first.${colors.reset}`);
        throw new Error("Circuits not compiled");
    }

    // Save input to file
    fs.writeFileSync(
        "build/ageVerification/input.json",
        JSON.stringify(input, null, 2)
    );

    // Generate witness
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "build/ageVerification/ageVerification_js/ageVerification.wasm",
        "build/ageVerification/ageVerification_final.zkey"
    );

    // Save proof and public signals
    fs.writeFileSync(
        "build/ageVerification/proof.json",
        JSON.stringify(proof, null, 2)
    );
    fs.writeFileSync(
        "build/ageVerification/public.json",
        JSON.stringify(publicSignals, null, 2)
    );

    console.log(`${colors.green}✓ Age Verification Proof Generated${colors.reset}`);
    console.log(`Public Signals: ${JSON.stringify(publicSignals)}`);
    
    return { proof, publicSignals };
}

async function generateVoteProof(vote, voterSecret, nullifier, pollId) {
    console.log(`${colors.yellow}Generating Vote Commitment Proof...${colors.reset}`);
    
    const input = {
        vote: vote.toString(),
        voterSecret: voterSecret.toString(),
        nullifier: nullifier.toString(),
        pollId: pollId.toString(),
    };

    // Ensure build directory exists
    if (!fs.existsSync("build/voteCommitment")) {
        console.log(`${colors.red}Error: Circuits not compiled. Run 'npm run compile' first.${colors.reset}`);
        throw new Error("Circuits not compiled");
    }

    // Save input to file
    fs.writeFileSync(
        "build/voteCommitment/input.json",
        JSON.stringify(input, null, 2)
    );

    // Generate witness
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "build/voteCommitment/voteCommitment_js/voteCommitment.wasm",
        "build/voteCommitment/voteCommitment_final.zkey"
    );

    // Save proof and public signals
    fs.writeFileSync(
        "build/voteCommitment/proof.json",
        JSON.stringify(proof, null, 2)
    );
    fs.writeFileSync(
        "build/voteCommitment/public.json",
        JSON.stringify(publicSignals, null, 2)
    );

    console.log(`${colors.green}✓ Vote Commitment Proof Generated${colors.reset}`);
    console.log(`Public Signals: ${JSON.stringify(publicSignals)}`);
    
    return { proof, publicSignals };
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
        if (command === "age") {
            const age = parseInt(args[1]) || 25;
            const secret = parseInt(args[2]) || Math.floor(Math.random() * 1000000);
            const minAge = parseInt(args[3]) || 18;
            
            await generateAgeProof(age, secret, minAge);
        } else if (command === "vote") {
            const vote = parseInt(args[1]) || 1;
            const voterSecret = parseInt(args[2]) || Math.floor(Math.random() * 1000000);
            const nullifier = parseInt(args[3]) || Math.floor(Math.random() * 1000000);
            const pollId = parseInt(args[4]) || 1;
            
            await generateVoteProof(vote, voterSecret, nullifier, pollId);
        } else {
            console.log(`${colors.yellow}Usage:${colors.reset}`);
            console.log("  node generateProof.js age [age] [secret] [minAge]");
            console.log("  node generateProof.js vote [vote] [voterSecret] [nullifier] [pollId]");
            console.log("\nExamples:");
            console.log("  node generateProof.js age 25 12345 18");
            console.log("  node generateProof.js vote 1 98765 54321 1");
        }
    } catch (error) {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Export functions for use in other scripts
module.exports = { generateAgeProof, generateVoteProof };

// Run main if called directly
if (require.main === module) {
    main();
}