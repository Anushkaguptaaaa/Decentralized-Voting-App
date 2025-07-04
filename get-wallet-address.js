// Script to get wallet address from private key
const { ethers } = require('ethers');
require('dotenv').config();

// Create wallet from private key
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

console.log('🔑 Private Key:', process.env.PRIVATE_KEY);
console.log('📍 Wallet Address:', wallet.address);
console.log('');
console.log('✅ Use this address to get test funds from the Volta faucet!');
