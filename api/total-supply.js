import { ethers } from 'ethers';

export default async function handler(req, res) {
  // Set headers as requested: text/plain, no JSON, HTTP 200
  res.setHeader('Content-Type', 'text/plain');
  // Add a short cache so we don't spam the blockchain on every single request
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  try {
    // Arc network mainnet RPC
    const provider = new ethers.JsonRpcProvider('https://rpc.mainnet.arc.io');
    
    const tokenAddress = '0x258bbb25fB1bc34C87212F8dAB34838854eF2D5D';
    
    // Minimal ABI needed for this endpoint
    const abi = [
      'function totalSupply() view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function balanceOf(address) view returns (uint256)'
    ];
    
    const contract = new ethers.Contract(tokenAddress, abi, provider);
    
    // Fetch total supply, decimals, and balances of common burn addresses concurrently
    const [totalSupply, decimals, burnedDead, burnedZero] = await Promise.all([
      contract.totalSupply(),
      contract.decimals(),
      contract.balanceOf('0x000000000000000000000000000000000000dEaD'),
      contract.balanceOf('0x0000000000000000000000000000000000000000')
    ]);

    // Subtract verifiably burned tokens from total supply
    // BigInt arithmetic (supported natively by ethers v6)
    const actualSupply = totalSupply - burnedDead - burnedZero;
    
    // Convert the supply to normal token units using exact decimal arithmetic
    const formattedSupply = ethers.formatUnits(actualSupply, decimals);
    
    // Send back just the number
    res.status(200).send(formattedSupply);
  } catch (error) {
    console.error('Error fetching total supply:', error);
    // As per requirements: "If the blockchain request fails, return an error instead of an incorrect supply or zero"
    res.status(500).send('Error fetching supply data from blockchain');
  }
}
