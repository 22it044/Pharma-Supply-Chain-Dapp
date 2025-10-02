/**
 * Network Configuration and Validation
 * Handles network-specific settings and validations
 */

// Supported networks
export const NETWORKS = {
  GANACHE: {
    id: 5777,
    name: 'Ganache Local',
    rpc: 'http://127.0.0.1:7545',
    currency: 'ETH'
  },
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia Testnet',
    rpc: 'https://sepolia.infura.io/v3/',
    currency: 'SepoliaETH',
    explorer: 'https://sepolia.etherscan.io'
  },
  GOERLI: {
    id: 5,
    name: 'Goerli Testnet',
    rpc: 'https://goerli.infura.io/v3/',
    currency: 'GoerliETH',
    explorer: 'https://goerli.etherscan.io'
  },
  MAINNET: {
    id: 1,
    name: 'Ethereum Mainnet',
    rpc: 'https://mainnet.infura.io/v3/',
    currency: 'ETH',
    explorer: 'https://etherscan.io'
  }
};

// Default network for development
export const DEFAULT_NETWORK = NETWORKS.GANACHE;

/**
 * Get network by ID
 */
export const getNetworkById = (networkId) => {
  return Object.values(NETWORKS).find(network => network.id === networkId);
};

/**
 * Validate current network
 */
export const validateNetwork = async (web3) => {
  try {
    const networkId = await web3.eth.net.getId();
    const currentNetwork = getNetworkById(networkId);
    
    // For development, accept Ganache
    const expectedNetworkId = process.env.REACT_APP_NETWORK_ID 
      ? parseInt(process.env.REACT_APP_NETWORK_ID) 
      : DEFAULT_NETWORK.id;
    
    if (networkId !== expectedNetworkId) {
      const expectedNetwork = getNetworkById(expectedNetworkId);
      throw new Error(
        `Wrong network! Please connect to ${expectedNetwork?.name || `Network ID ${expectedNetworkId}`}. ` +
        `Current network: ${currentNetwork?.name || `Network ID ${networkId}`}`
      );
    }
    
    return {
      isValid: true,
      networkId,
      network: currentNetwork
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
};

/**
 * Check if MetaMask is installed
 */
export const checkMetaMask = () => {
  if (!window.ethereum) {
    return {
      installed: false,
      message: 'MetaMask is not installed. Please install MetaMask extension to use this application.'
    };
  }
  
  return {
    installed: true,
    message: 'MetaMask detected'
  };
};

/**
 * Request account access
 */
export const requestAccounts = async () => {
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return { success: true };
  } catch (error) {
    if (error.code === 4001) {
      return {
        success: false,
        message: 'User denied account access'
      };
    }
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Get current account
 */
export const getCurrentAccount = async (web3) => {
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.');
    }
    return accounts[0];
  } catch (error) {
    throw new Error(`Failed to get account: ${error.message}`);
  }
};

/**
 * Get account balance
 */
export const getAccountBalance = async (web3, account) => {
  try {
    const balance = await web3.eth.getBalance(account);
    return web3.utils.fromWei(balance, 'ether');
  } catch (error) {
    throw new Error(`Failed to get balance: ${error.message}`);
  }
};

/**
 * Estimate gas for transaction
 */
export const estimateGas = async (contractMethod, fromAccount) => {
  try {
    const gasEstimate = await contractMethod.estimateGas({ from: fromAccount });
    // Add 20% buffer
    return Math.floor(gasEstimate * 1.2);
  } catch (error) {
    console.error('Gas estimation failed:', error);
    // Return a safe default
    return 300000;
  }
};

/**
 * Get current gas price
 */
export const getGasPrice = async (web3) => {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    return gasPrice;
  } catch (error) {
    console.error('Failed to get gas price:', error);
    return web3.utils.toWei('20', 'gwei'); // Default fallback
  }
};

/**
 * Check if account has sufficient balance
 */
export const checkSufficientBalance = async (web3, account, estimatedGas, gasPrice) => {
  try {
    const balance = await web3.eth.getBalance(account);
    const requiredBalance = estimatedGas * gasPrice;
    
    if (BigInt(balance) < BigInt(requiredBalance)) {
      const balanceEth = web3.utils.fromWei(balance, 'ether');
      const requiredEth = web3.utils.fromWei(requiredBalance.toString(), 'ether');
      
      return {
        sufficient: false,
        message: `Insufficient balance. Required: ${requiredEth} ETH, Available: ${balanceEth} ETH`
      };
    }
    
    return { sufficient: true };
  } catch (error) {
    console.error('Balance check failed:', error);
    return { sufficient: true }; // Assume sufficient if check fails
  }
};

/**
 * Setup Web3 with validation
 */
export const setupWeb3 = async () => {
  // Check MetaMask
  const metaMaskCheck = checkMetaMask();
  if (!metaMaskCheck.installed) {
    throw new Error(metaMaskCheck.message);
  }
  
  // Load Web3
  const web3 = new (await import('web3')).default(window.ethereum);
  
  // Request accounts
  const accountsResult = await requestAccounts();
  if (!accountsResult.success) {
    throw new Error(accountsResult.message);
  }
  
  // Validate network
  const networkValidation = await validateNetwork(web3);
  if (!networkValidation.isValid) {
    throw new Error(networkValidation.error);
  }
  
  return {
    web3,
    network: networkValidation.network
  };
};

/**
 * Listen for network changes
 */
export const setupNetworkListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
      const networkId = parseInt(chainId, 16);
      const network = getNetworkById(networkId);
      callback({ networkId, network });
    });
  }
};

/**
 * Listen for account changes
 */
export const setupAccountListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      callback(accounts[0] || null);
    });
  }
};

export default {
  NETWORKS,
  DEFAULT_NETWORK,
  getNetworkById,
  validateNetwork,
  checkMetaMask,
  requestAccounts,
  getCurrentAccount,
  getAccountBalance,
  estimateGas,
  getGasPrice,
  checkSufficientBalance,
  setupWeb3,
  setupNetworkListener,
  setupAccountListener
};
