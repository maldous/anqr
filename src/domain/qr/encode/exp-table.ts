// Galois field exponent table
const EXP_TABLE = new Uint16Array(256);

// Galois field log table
const LOG_TABLE = new Uint16Array(256);

// Initialize Galois field tables
// Using polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
for (let i = 0; i < 8; i += 1) {
  EXP_TABLE[i] = 1 << i;
}

for (let i = 8; i < 256; i += 1) {
  EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
}

for (let i = 0; i < 255; i += 1) {
  LOG_TABLE[EXP_TABLE[i]] = i;
}

export { EXP_TABLE, LOG_TABLE };
