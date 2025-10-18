pragma circom 2.0.0;

// Template to check if a number is greater than or equal to another
template GreaterEqualThan(n) {
    assert(n <= 252);
    signal input in[2];  // in[0] >= in[1]
    signal output out;

    component num2Bits = Num2Bits(n+1);
    num2Bits.in <== in[0] - in[1] + (1 << n);

    out <== num2Bits.out[n];
}

// Convert number to bits
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    var e2=1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1) === 0;
        lc1 += out[i] * e2;
        e2 = e2+e2;
    }

    lc1 === in;
}

// Main age verification circuit
template AgeVerification() {
    // Private input: actual age
    signal input age;
    
    // Private input: secret (for commitment/nullifier)
    signal input secret;
    
    // Public input: minimum age requirement
    signal input minAge;
    
    // Public output: commitment (hash of age + secret)
    signal output commitment;
    
    // Public output: eligibility flag
    signal output isEligible;
    
    // Check if age >= minAge (18)
    component ageCheck = GreaterEqualThan(8); // 8 bits = 0-255 age range
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== minAge;
    
    // Output eligibility
    isEligible <== ageCheck.out;
    
    // Ensure age is reasonable (0-150)
    component ageUpperBound = GreaterEqualThan(8);
    ageUpperBound.in[0] <== 150;
    ageUpperBound.in[1] <== age;
    ageUpperBound.out === 1;
    
    // Create commitment: simple hash using Poseidon would be better
    // For now, using a simple commitment scheme
    commitment <== age * secret;
}

component main {public [minAge]} = AgeVerification();