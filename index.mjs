import { ethers } from 'ethers';
import { readFileSync, existsSync } from 'fs';
import { ProxyAgent, request } from 'undici';
import readline from 'readline';

// ============================================
// CONFIGURATION
// ============================================
const PROJECT_NAME = 'EVM Balance Checker'; // Change this to your project name
const WALLET_PROXY_FILE = 'walletProxy/walletProxy'; // Path to wallet proxy file
const RPC_CONFIG_FILE = 'rpc-config.json'; // Path to RPC endpoints configuration

// ============================================
// LOAD RPC CONFIGURATION
// ============================================
function loadRpcConfig() {
  try {
    if (existsSync(RPC_CONFIG_FILE)) {
      const rpcConfig = JSON.parse(readFileSync(RPC_CONFIG_FILE, 'utf8'));
      return rpcConfig;
    } else {
      console.warn(`⚠️ RPC config file ${RPC_CONFIG_FILE} not found, using defaults`);
      return {};
    }
  } catch (error) {
    console.warn(`⚠️ Error loading RPC config: ${error.message}, using defaults`);
    return {};
  }
}

function loadCustomNetworks(rpcConfig) {
  const customNetworks = {};
  
  // Look for custom_networks section
  // Only process if it exists, is an array, and is not empty
  if (rpcConfig.custom_networks && Array.isArray(rpcConfig.custom_networks) && rpcConfig.custom_networks.length > 0) {
    for (const network of rpcConfig.custom_networks) {
      if (network.key && network.name && network.chainId && network.rpc && network.symbol) {
        // Validate RPC URL format
        if (!network.rpc.startsWith('https://')) {
          console.warn(`⚠️ Skipping custom network "${network.name}": RPC must use https:// (got: ${network.rpc})`);
          continue;
        }
        
        customNetworks[network.key] = {
          name: network.name,
          chainId: network.chainId,
          rpc: network.rpc,
          symbol: network.symbol
        };
      } else {
        console.warn(`⚠️ Skipping invalid custom network config: missing required fields`);
      }
    }
    
    const loadedCount = Object.keys(customNetworks).length;
    if (loadedCount > 0) {
      console.log(`✅ Loaded ${loadedCount} custom network(s)`);
    }
  }
  
  return customNetworks;
}

const RPC_ENDPOINTS = loadRpcConfig();
const CUSTOM_NETWORKS = loadCustomNetworks(RPC_ENDPOINTS);

// ============================================
// EVM NETWORKS CONFIGURATION (Defaults for reference)
// ============================================
const EVM_NETWORKS_DEFAULTS = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    symbol: 'ETH'
  },
  bsc: {
    name: 'BSC',
    chainId: 56,
    symbol: 'BNB'
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    symbol: 'MATIC'
  },
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    symbol: 'ETH'
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    symbol: 'ETH'
  },
  avalanche: {
    name: 'Avalanche',
    chainId: 43114,
    symbol: 'AVAX'
  },
  base: {
    name: 'Base',
    chainId: 8453,
    symbol: 'ETH'
  },
  linea: {
    name: 'Linea',
    chainId: 59144,
    symbol: 'ETH'
  },
  zksync: {
    name: 'zkSync Era',
    chainId: 324,
    symbol: 'ETH'
  },
  scroll: {
    name: 'Scroll',
    chainId: 534352,
    symbol: 'ETH'
  },
  fantom: {
    name: 'Fantom',
    chainId: 250,
    symbol: 'FTM'
  },
  celo: {
    name: 'Celo',
    chainId: 42220,
    symbol: 'CELO'
  },
  gnosis: {
    name: 'Gnosis',
    chainId: 100,
    symbol: 'xDAI'
  },
  mantle: {
    name: 'Mantle',
    chainId: 5000,
    symbol: 'MNT'
  },
  blast: {
    name: 'Blast',
    chainId: 81457,
    symbol: 'ETH'
  },
  zora: {
    name: 'Zora',
    chainId: 7777777,
    symbol: 'ETH'
  },
  mode: {
    name: 'Mode',
    chainId: 34443,
    symbol: 'ETH'
  },
  opbnb: {
    name: 'opBNB',
    chainId: 204,
    symbol: 'BNB'
  },
  manta: {
    name: 'Manta',
    chainId: 169,
    symbol: 'ETH'
  },
  metis: {
    name: 'Metis',
    chainId: 1088,
    symbol: 'METIS'
  },
  moonbeam: {
    name: 'Moonbeam',
    chainId: 1284,
    symbol: 'GLMR'
  },
  moonriver: {
    name: 'Moonriver',
    chainId: 1285,
    symbol: 'MOVR'
  },
  cronos: {
    name: 'Cronos',
    chainId: 25,
    symbol: 'CRO'
  },
  boba: {
    name: 'Boba',
    chainId: 288,
    symbol: 'ETH'
  },
  aurora: {
    name: 'Aurora',
    chainId: 1313161554,
    symbol: 'ETH'
  },
  fuse: {
    name: 'Fuse',
    chainId: 122,
    symbol: 'FUSE'
  },
  evmos: {
    name: 'Evmos',
    chainId: 9001,
    symbol: 'EVMOS'
  },
  kava: {
    name: 'Kava',
    chainId: 2222,
    symbol: 'KAVA'
  },
  canto: {
    name: 'Canto',
    chainId: 7700,
    symbol: 'CANTO'
  },
  zkfair: {
    name: 'zkFair',
    chainId: 42766,
    symbol: 'USDC'
  },
  merlin: {
    name: 'Merlin',
    chainId: 4200,
    symbol: 'BTC'
  },
  btr: {
    name: 'BTR',
    chainId: 200901,
    symbol: 'BTR'
  }
};

// Build networks list ONLY from rpc-config.json
function buildNetworksFromConfig() {
  const networks = {};
  
  // Add standard networks that are in rpc-config.json
  for (const [key, rpcUrl] of Object.entries(RPC_ENDPOINTS)) {
    // Skip custom_networks section
    if (key === 'custom_networks') continue;
    
    // Check if it's a string (simple RPC URL) and network exists in defaults
    if (typeof rpcUrl === 'string' && EVM_NETWORKS_DEFAULTS[key]) {
      const defaultConfig = EVM_NETWORKS_DEFAULTS[key];
      networks[key] = {
        name: defaultConfig.name,
        chainId: defaultConfig.chainId,
        rpc: rpcUrl,
        symbol: defaultConfig.symbol
      };
    }
  }
  
  // Add custom networks
  Object.assign(networks, CUSTOM_NETWORKS);
  
  return networks;
}

// Only networks from rpc-config.json will be checked
const ALL_NETWORKS = buildNetworksFromConfig();

// ============================================
// UTILITY FUNCTIONS
// ============================================

function parseWalletProxy() {
  if (!existsSync(WALLET_PROXY_FILE)) {
    console.error(`❌ File ${WALLET_PROXY_FILE} not found`);
    console.error(`Create file ${WALLET_PROXY_FILE} with format: privatekey|ip:port:login:pass`);
    return null;
  }
  
  try {
    const content = readFileSync(WALLET_PROXY_FILE, 'utf8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    const wallets = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split('|');
      
      if (parts.length !== 2) {
        console.warn(`⚠️ Skipped line ${i + 1}: invalid format (expected: privatekey|ip:port:login:pass)`);
        continue;
      }
      
      let privateKey = parts[0].trim();
      const proxy = parts[1];
      const proxyParts = proxy.split(':');
      
      if (proxyParts.length !== 4) {
        console.warn(`⚠️ Skipped line ${i + 1}: invalid proxy format (expected: ip:port:login:pass)`);
        continue;
      }
      
      // Normalize private key (remove 0x if present, ethers.js will handle it)
      if (privateKey.startsWith('0x') || privateKey.startsWith('0X')) {
        privateKey = privateKey.slice(2);
      }
      
      const [ip, port, login, password] = proxyParts;
      
      wallets.push({
        privateKey: privateKey,
        proxy: {
          ip,
          port: parseInt(port, 10),
          login,
          password
        }
      });
    }
    
    if (wallets.length === 0) {
      console.error(`❌ No valid entries found in file ${WALLET_PROXY_FILE}`);
      return null;
    }
    
    return wallets;
  } catch (error) {
    console.error(`❌ Error reading file ${WALLET_PROXY_FILE}:`, error.message);
    return null;
  }
}

function createEthersProviderWithProxy(rpcUrl, proxyConfig, chainId) {
  const proxyUrl = `http://${proxyConfig.login}:${proxyConfig.password}@${proxyConfig.ip}:${proxyConfig.port}`;
  const proxyAgent = new ProxyAgent(proxyUrl);
  
  const customFetch = async (url, options = {}) => {
    let timeoutId;
    try {
      const urlObj = typeof url === 'string' ? new URL(url) : url;
      
      // Create timeout promise with cleanup
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Request timeout (30s)')), 30000);
      });
      
      const undiciOptions = {
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        body: options.body,
        dispatcher: proxyAgent,
        requestTimeout: 30000 // Also set timeout in undici options
      };
      
      // Race between request and timeout
      const requestPromise = request(urlObj, undiciOptions);
      const response = await Promise.race([
        requestPromise,
        timeoutPromise
      ]);
      
      // Clear timeout if request completed
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Read body - in undici, body is a Readable stream
      // We need to collect chunks and parse as JSON
      let body;
      let bodyText = '';
      
      try {
        // Check if response.body has json() method (undici v6+)
        if (typeof response.body.json === 'function') {
          body = await response.body.json();
          bodyText = JSON.stringify(body);
        } else if (typeof response.body.text === 'function') {
          // If json() doesn't exist, use text() and parse
          bodyText = await response.body.text();
          body = JSON.parse(bodyText);
        } else {
          // Fallback: collect chunks manually
          const chunks = [];
          for await (const chunk of response.body) {
            chunks.push(chunk);
          }
          bodyText = Buffer.concat(chunks).toString('utf8');
          body = JSON.parse(bodyText);
        }
      } catch (parseError) {
        // If parsing fails, check status code
        if (response.statusCode < 200 || response.statusCode >= 300) {
          const errorMsg = bodyText || parseError.message || 'Unable to read response body';
          throw new Error(`HTTP ${response.statusCode}: ${errorMsg.substring(0, 200)}`);
        }
        throw new Error(`Failed to parse response: ${parseError.message}`);
      }
      
      // Check if response is ok
      if (response.statusCode < 200 || response.statusCode >= 300) {
        const errorMsg = bodyText ? bodyText.substring(0, 200) : 'Unknown error';
        throw new Error(`HTTP ${response.statusCode}: ${errorMsg}`);
      }
      
      // Check for JSON-RPC error
      if (body && body.error) {
        const rpcError = body.error.message || JSON.stringify(body.error);
        throw new Error(`RPC Error: ${rpcError}`);
      }
      
      // Create a Response-like object compatible with ethers.js
      return {
        json: async () => body,
        text: async () => bodyText || JSON.stringify(body),
        ok: true,
        status: response.statusCode,
        statusText: response.statusText || 'OK',
        headers: new Headers(response.headers || {})
      };
    } catch (error) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Re-throw with more context
      const errorMsg = error.message || String(error);
      // Don't wrap timeout errors
      if (errorMsg.includes('timeout')) {
        throw error;
      }
      throw new Error(`Proxy fetch error: ${errorMsg}`);
    }
  };
  
  // Create network object with chainId to avoid network detection errors
  // This prevents ethers.js from trying to auto-detect the network
  const networkConfig = chainId ? ethers.Network.from(chainId) : null;
  
  return new ethers.JsonRpcProvider(rpcUrl, networkConfig, { 
    staticNetwork: true, 
    fetch: customFetch 
  });
}

function getRandomDelay(delayConfig) {
  if (Array.isArray(delayConfig) && delayConfig.length === 2) {
    const [min, max] = delayConfig;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return typeof delayConfig === 'number' ? delayConfig : delayConfig || 5;
}

async function executeWithRetry(action, actionName, retryCount, retryDelayConfig = [3, 5]) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      
      if (attempt < retryCount) {
        const retryDelay = getRandomDelay(retryDelayConfig);
        console.log(`⚠️ Attempt ${attempt}/${retryCount} failed. Retrying in ${retryDelay} seconds...`);
        console.log(`   Error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
      } else {
        console.error(`❌ All ${retryCount} attempts failed for ${actionName}`);
        console.error(`   Last error: ${error.message}`);
      }
    }
  }
  
  throw lastError;
}

function formatBalance(balanceWei) {
  const balance = ethers.formatEther(balanceWei);
  const num = parseFloat(balance);
  if (num === 0) return '0';
  if (num < 0.000001) return num.toExponential(6);
  return num.toFixed(8).replace(/\.?0+$/, '');
}

// ============================================
// PRICE FETCHING
// ============================================

// Mapping of token symbols to CoinGecko IDs
const COINGECKO_IDS = {
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
  'FTM': 'fantom',
  'CELO': 'celo',
  'xDAI': 'dai',
  'MNT': 'mantle',
  'GLMR': 'moonbeam',
  'MOVR': 'moonriver',
  'CRO': 'crypto-com-chain',
  'FUSE': 'fuse-network-token',
  'EVMOS': 'evmos',
  'KAVA': 'kava',
  'CANTO': 'canto',
  'USDC': 'usd-coin',
  'BTC': 'bitcoin',
  'BTR': 'bitlayer',
  'METIS': 'metis-token'
};

async function getTokenPrices(symbols) {
  const prices = {};
  const ids = [];
  
  // Collect unique CoinGecko IDs
  for (const symbol of symbols) {
    const id = COINGECKO_IDS[symbol];
    if (id && !ids.includes(id)) {
      ids.push(id);
    }
  }
  
  if (ids.length === 0) return prices;
  
  try {
    const idsString = ids.join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd`;
    
    // Use undici request for fetch
    const response = await request(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.statusCode !== 200) {
      console.warn('⚠️ Failed to fetch prices from CoinGecko');
      return prices;
    }
    
    const body = await response.body.json();
    const data = body;
    
    // Map back to symbols
    for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
      if (data[id] && data[id].usd) {
        prices[symbol] = data[id].usd;
      }
    }
  } catch (error) {
    console.warn('⚠️ Error fetching prices:', error.message);
  }
  
  return prices;
}

function calculateWalletTotalUSD(walletBalances, prices) {
  let totalUSD = 0;
  
  for (const [symbol, amount] of Object.entries(walletBalances)) {
    if (prices[symbol]) {
      totalUSD += amount * prices[symbol];
    }
  }
  
  return totalUSD;
}

// ============================================
// BALANCE CHECK FUNCTIONS
// ============================================

async function checkBalanceInNetwork(wallet, networkConfig, proxyConfig) {
  let address;
  try {
    // Normalize private key for ethers.js (it accepts both with and without 0x)
    const privateKey = wallet.privateKey.startsWith('0x') ? wallet.privateKey : '0x' + wallet.privateKey;
    
    // Get address first (doesn't require network call)
    const tempWallet = new ethers.Wallet(privateKey);
    address = tempWallet.address;
    
    const provider = createEthersProviderWithProxy(networkConfig.rpc, proxyConfig, networkConfig.chainId);
    
      const balance = await executeWithRetry(
      async () => {
        try {
          return await provider.getBalance(address);
        } catch (err) {
          // More specific error handling with better messages
          const errMsg = err.message || String(err);
          
          if (errMsg.includes('timeout') || errMsg.includes('Timeout')) {
            throw new Error('Request timeout (30s)');
          } else if (errMsg.includes('ECONNREFUSED') || errMsg.includes('ENOTFOUND') || errMsg.includes('getaddrinfo')) {
            throw new Error('Connection failed - check proxy/RPC');
          } else if (errMsg.includes('RPC Error') || errMsg.includes('JSON-RPC')) {
            throw err; // Already formatted
          } else if (errMsg.includes('Proxy fetch error')) {
            throw new Error(errMsg.replace('Proxy fetch error: ', ''));
          } else {
            // Truncate long error messages
            const shortMsg = errMsg.length > 80 ? errMsg.substring(0, 77) + '...' : errMsg;
            throw new Error(shortMsg);
          }
        }
      },
      `Balance check on ${networkConfig.name}`,
      2, // Reduced retries to fail faster
      [1, 2]
    );
    
    return {
      network: networkConfig.name,
      symbol: networkConfig.symbol,
      balance: balance.toString(),
      formatted: formatBalance(balance),
      address: address
    };
  } catch (error) {
    // Ensure we have address even on error
    if (!address) {
      try {
        const privateKey = wallet.privateKey.startsWith('0x') ? wallet.privateKey : '0x' + wallet.privateKey;
        address = new ethers.Wallet(privateKey).address;
      } catch (e) {
        address = 'unknown';
      }
    }
    
    // Extract meaningful error message
    let errorMsg = error.message || String(error);
    if (errorMsg.length > 150) {
      errorMsg = errorMsg.substring(0, 147) + '...';
    }
    
    return {
      network: networkConfig.name,
      symbol: networkConfig.symbol,
      balance: '0',
      formatted: '0',
      address: address,
      error: errorMsg
    };
  }
}

async function checkAllBalances(wallet, proxyConfig) {
  const results = [];
  const networks = Object.entries(ALL_NETWORKS);
  
  if (networks.length === 0) {
    console.error(`\n❌ No networks configured in rpc-config.json`);
    console.error(`   Please add RPC endpoints to rpc-config.json to check balances`);
    return results;
  }
  
  console.log(`\n🔍 Checking balances in ${networks.length} network(s) from rpc-config.json...`);
  
  for (let i = 0; i < networks.length; i++) {
    const [, networkConfig] = networks[i];
    process.stdout.write(`\r   [${i + 1}/${networks.length}] ${networkConfig.name}...`);
    
    const result = await checkBalanceInNetwork(wallet, networkConfig, proxyConfig);
    results.push(result);
    
    // Small delay between networks
    if (i < networks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log('\r' + ' '.repeat(50) + '\r');
  return results;
}

// ============================================
// MENU FUNCTIONS
// ============================================

function showMainMenu(projectName = PROJECT_NAME) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const asciiArt = `
██╗    ██╗██╗  ██╗ ██████╗  █████╗ ███╗   ███╗██╗    ███████╗ ██████╗ ███████╗████████╗    
██║    ██║██║  ██║██╔═══██╗██╔══██╗████╗ ████║██║    ██╔════╝██╔═══██╗██╔════╝╚══██╔══╝    
██║ █╗ ██║███████║██║   ██║███████║██╔████╔██║██║    ███████╗██║   ██║█████╗     ██║       
██║███╗██║██╔══██║██║   ██║██╔══██║██║╚██╔╝██║██║    ╚════██║██║   ██║██╔══╝     ██║       
╚███╔███╔╝██║  ██║╚██████╔╝██║  ██║██║ ╚═╝ ██║██║    ███████║╚██████╔╝██║        ██║       
 ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝    ╚══════╝ ╚═════╝ ╚═╝        ╚═╝       
    `;
    
    console.log('\n' + '='.repeat(60));
    console.log(asciiArt);
    console.log('='.repeat(60));
    const projectNameLine = `                 ${projectName}                   `;
    console.log(projectNameLine);
    console.log('='.repeat(60));
    console.log('\nSelect an action:');
    console.log('  1. Check balances in all EVM networks');
    console.log('  0. Exit - Exit the application');
    console.log('');
    
    const askQuestion = () => {
      rl.question('Enter number (0-1): ', (answer) => {
        const num = parseInt(answer.trim());
        if (num === 0) {
          rl.close();
          resolve('exit');
        } else if (num === 1) {
          rl.close();
          resolve('checkBalances');
        } else {
          console.log('❌ Invalid input. Please enter 0 or 1.\n');
          askQuestion();
        }
      });
    };
    
    askQuestion();
  });
}

// ============================================
// MAIN EXECUTION FUNCTIONS
// ============================================

async function executeBalanceCheck() {
  console.log('\n📋 Starting balance check for all wallets...\n');
  
  const wallets = parseWalletProxy();
  if (!wallets || wallets.length === 0) {
    console.error('❌ No wallets found. Please add wallets to walletProxy/walletProxy file.');
    return;
  }
  
  console.log(`✅ Loaded ${wallets.length} wallet(s)\n`);
  
  const walletDelaySeconds = [5, 10];
  
  // Store all wallet data
  const allWalletsData = [];
  const totalBalance = {};
  const allSymbols = new Set();
  
  // Check all wallets first
  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    
    const privateKey = wallet.privateKey.startsWith('0x') ? wallet.privateKey : '0x' + wallet.privateKey;
    const address = new ethers.Wallet(privateKey).address;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Checking Wallet ${i + 1}/${wallets.length}...`);
    console.log(`Address: ${address}`);
    
    const results = await checkAllBalances(wallet, wallet.proxy);
    
    // Process results for this wallet
    const walletBalances = {};
    const walletErrors = [];
    
    for (const result of results) {
      if (result.error) {
        walletErrors.push(result);
      } else {
        const balance = parseFloat(result.formatted);
        if (balance > 0) {
          if (!walletBalances[result.symbol]) {
            walletBalances[result.symbol] = 0;
          }
          walletBalances[result.symbol] += balance;
          allSymbols.add(result.symbol);
          
          // Add to total
          if (!totalBalance[result.symbol]) {
            totalBalance[result.symbol] = 0;
          }
          totalBalance[result.symbol] += balance;
        }
      }
    }
    
    allWalletsData.push({
      address,
      proxy: `${wallet.proxy.ip}:${wallet.proxy.port}`,
      results,
      balances: walletBalances,
      errors: walletErrors
    });
    
    // Delay between wallets
    if (i < wallets.length - 1) {
      const delay = getRandomDelay(walletDelaySeconds);
      console.log(`⏳ Waiting ${delay} seconds before next wallet...`);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }
  }
  
  // Fetch prices for all symbols
  console.log(`\n📊 Fetching token prices...`);
  const prices = await getTokenPrices(Array.from(allSymbols));
  
  // Display results for each wallet
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 WALLET RESULTS`);
  console.log(`${'='.repeat(80)}\n`);
  
  let walletsWithBalance = 0;
  
  for (let i = 0; i < allWalletsData.length; i++) {
    const walletData = allWalletsData[i];
    
    console.log(`${'═'.repeat(80)}`);
    console.log(`💰 Wallet ${i + 1}/${allWalletsData.length}`);
    console.log(`${'═'.repeat(80)}`);
    console.log(`Address: ${walletData.address}`);
    console.log(`Proxy: ${walletData.proxy}`);
    console.log(`${'─'.repeat(80)}`);
    
    // Show balances by network
    const networksWithBalance = [];
    const networksWithErrors = [];
    
    for (const result of walletData.results) {
      if (result.error) {
        networksWithErrors.push(result);
      } else {
        const balance = parseFloat(result.formatted);
        if (balance > 0) {
          networksWithBalance.push(result);
        }
      }
    }
    
    if (networksWithBalance.length > 0) {
      console.log(`\n📊 Balances by Network:`);
      for (const result of networksWithBalance) {
        const balance = parseFloat(result.formatted);
        const usdValue = prices[result.symbol] ? balance * prices[result.symbol] : 0;
        const usdStr = usdValue > 0 ? ` ($${usdValue.toFixed(2)})` : '';
        console.log(`   ✅ ${result.network.padEnd(20)} | ${result.formatted.padStart(15)} ${result.symbol.padEnd(8)}${usdStr}`);
      }
    } else {
      console.log(`\n   ℹ️  No balances found in any network`);
    }
    
    // Show errors if any
    if (networksWithErrors.length > 0) {
      console.log(`\n⚠️  Networks with errors (${networksWithErrors.length}):`);
      for (const result of networksWithErrors) {
        let errorMsg = result.error;
        if (errorMsg.length > 50) {
          errorMsg = errorMsg.substring(0, 47) + '...';
        }
        console.log(`   ❌ ${result.network.padEnd(20)} | ${errorMsg}`);
      }
    }
    
    // Calculate and show wallet total in USD
    const walletTotalUSD = calculateWalletTotalUSD(walletData.balances, prices);
    if (walletTotalUSD > 0) {
      walletsWithBalance++;
      console.log(`\n   💵 Total Wallet Balance: $${walletTotalUSD.toFixed(2)}`);
    }
    
    console.log('');
  }
  
  // Final Summary
  console.log(`${'='.repeat(80)}`);
  console.log(`📈 FINAL SUMMARY`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Total wallets checked: ${allWalletsData.length}`);
  console.log(`Wallets with balance: ${walletsWithBalance}`);
  
  if (Object.keys(totalBalance).length > 0) {
    console.log(`\n💰 Total Balances Across All Wallets:`);
    let grandTotalUSD = 0;
    
    for (const [symbol, amount] of Object.entries(totalBalance)) {
      const usdValue = prices[symbol] ? amount * prices[symbol] : 0;
      grandTotalUSD += usdValue;
      const usdStr = usdValue > 0 ? ` ($${usdValue.toFixed(2)})` : '';
      console.log(`   ${symbol.padEnd(10)} | ${amount.toFixed(8).padStart(15)}${usdStr}`);
    }
    
    console.log(`\n💵 Grand Total (All Wallets): $${grandTotalUSD.toFixed(2)}`);
  }
  
  console.log(`\n✅ Balance check completed!`);
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  // Load project name from config
  let projectName = PROJECT_NAME;
  try {
    const configFile = readFileSync('config.json', 'utf8');
    const config = JSON.parse(configFile);
    if (config.project_name) {
      projectName = config.project_name;
    }
  } catch (error) {
    // Use default project name if config.json is missing or invalid
  }
  
  try {
    while (true) {
      const action = await showMainMenu(projectName);
      
      if (action === 'exit') {
        console.log('\n👋 Goodbye!');
        break;
      } else if (action === 'checkBalances') {
        await executeBalanceCheck();
        console.log('\nPress Enter to return to menu...');
        await new Promise(resolve => {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          rl.question('', () => {
            rl.close();
            resolve();
          });
        });
      }
    }
  } catch (error) {
    if (error.isTtyError) {
      console.error('❌ Error: Your terminal does not support interactive mode');
    } else {
      console.error('❌ Error:', error.message);
      console.error(error.stack);
    }
  }
}

main().catch(console.error);
