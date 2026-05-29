import { ethers } from "ethers";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Standard Polygon Mainnet Contract Addresses for Azuro V3
const AZURO_LP_USDT = process.env.AZURO_LP_ADDRESS || "0x7043e4f1130CE2F675D194B431AB87dD96979A08";
const AZURO_CORE_TENNIS = process.env.AZURO_CORE_ADDRESS || "0x204e7DA2909405BcBFF313C5233AF41d3d0f7354";
const POLYGON_USDT = process.env.POLYGON_USDT_ADDRESS || "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

// Minimal ABIs required for high-speed automated betting
const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

const AZURO_LP_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "core", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      {
        "components": [
          { "internalType": "uint256", "name": "conditionId", "type": "uint256" },
          { "internalType": "uint64", "name": "outcomeId", "type": "uint64" },
          { "internalType": "uint64", "name": "minOdds", "type": "uint64" }
        ],
        "internalType": "struct LP.BetData",
        "name": "betData",
        "type": "tuple"
      },
      { "internalType": "address", "name": "affiliate", "type": "address" }
    ],
    "name": "bet",
    "outputs": [{ "internalType": "uint256", "name": "betId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const AZURO_CORE_ABI = [
  "function getCondition(uint256 conditionId) external view returns (uint256 gameId, uint128 payoutLimit, uint128 margin, uint64 startsAt, uint64 endsAt, uint128 rawOdds, uint8 state)"
];

interface BotConfig {
  rpcUrl: string;
  privateKey: string;
  affiliateAddress: string;
  betAmountUsdt: number; // e.g. 10 USDT
  minOddsThreshold: number; // e.g. 1.50
  maxSlippagePercent: number; // e.g. 2% (0.02)
}

/**
 * Normalizes live target odds (e.g., 1.85) to Azuro's fixed-point format (dual-precision scale of 10^12).
 * Azuro uses 12 decimal places for odds representation in its contracts.
 */
function toAzuroOdds(odds: number): bigint {
  return BigInt(Math.floor(odds * 1e12));
}

/**
 * Calculates safety minimum odds after applying maximum slippage tolerance.
 */
function calculateMinOdds(targetOdds: number, maxSlippage: number): bigint {
  const adjustedOdds = targetOdds * (1 - maxSlippage);
  return toAzuroOdds(adjustedOdds);
}

/**
 * Executes a tennis sport bet on the Azuro protocol.
 * Can be imported into cron jobs or a webhook listener for instant event-triggered execution.
 */
export async function executeAzuroBet(
  conditionId: string, 
  outcomeId: string, 
  currentOdds: number,
  config: BotConfig
) {
  console.log(`\n============== AZURO BOT INTERPOLATION RUN ==============`);
  console.log(`[TARGET] Condition ID : ${conditionId}`);
  console.log(`[TARGET] Outcome ID   : ${outcomeId}`);
  console.log(`[TARGET] Current Odds : ${currentOdds}`);
  
  if (!config.rpcUrl || !config.privateKey) {
    throw new Error("Missing RPC URL or Private Key in configuration settings.");
  }

  // 1. Initialize Ethers Provider and Wallet (No manual meta-mask popups)
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);
  console.log(`[WALLET] Node Address : ${wallet.address}`);

  // 2. Instantiate Contracts
  const usdtContract = new ethers.Contract(POLYGON_USDT, ERC20_ABI, wallet);
  const lpContract = new ethers.Contract(AZURO_LP_USDT, AZURO_LP_ABI, wallet);
  const coreContract = new ethers.Contract(AZURO_CORE_TENNIS, AZURO_CORE_ABI, provider);

  // 3. Pre-execution Safety: Speed & Min Odds Constraint Check
  if (currentOdds < config.minOddsThreshold) {
    console.log(`[CANCELLED] Live odds (${currentOdds}) are below your target minOddsThreshold (${config.minOddsThreshold}). Bet aborted.`);
    return { success: false, reason: "Odds below threshold" };
  }

  // 4. Balance & Allowance Checks
  const amountBigInt = ethers.parseUnits(config.betAmountUsdt.toString(), 6); // USDT has 6 decimals on Polygon
  console.log(`[STAKE] Order Size    : ${config.betAmountUsdt} USDT (${amountBigInt.toString()} raw units)`);

  const balance = await usdtContract.balanceOf(wallet.address);
  console.log(`[BALANCE] Wallet Bal  : ${ethers.formatUnits(balance, 6)} USDT`);
  
  if (balance < amountBigInt) {
    console.log(`[CANCELLED] Insufficient USDT balance inside wallet. Aborting bet.`);
    return { success: false, reason: "Insufficient balance" };
  }

  // Verify LP Contract Allowance - Automated Standard Gas-Efficient Pre-Approval
  // Standard child USDT on Polygon does not support EIP-2612 Permit signatures,
  // making a one-time pre-approval both mandatory and the fastest setup to prevent mempool front-running.
  const currentAllowance = await usdtContract.allowance(wallet.address, AZURO_LP_USDT);
  console.log(`[ALLOWANCE] Contract  : ${ethers.formatUnits(currentAllowance, 6)} USDT approved`);

  if (currentAllowance < amountBigInt) {
    console.log(`[PENDING] Allowance too low. Executing on-chain infinite approval transction...`);
    const approveTx = await usdtContract.approve(AZURO_LP_USDT, ethers.MaxUint256);
    console.log(`[PENDING] Waiting for approval transaction confirmations on Polygon... Hash: ${approveTx.hash}`);
    await approveTx.wait(1);
    console.log(`[SUCCESS] Infinite approval secured successfully! Proceeding to immediate bet creation...`);
  } else {
    console.log(`[SUCCESS] Sufficient allowance confirmed. Skipping approval step to save milliseconds.`);
  }

  // 5. Build Slippage and Timeline Deadlines
  const minOddsBigInt = calculateMinOdds(currentOdds, config.maxSlippagePercent);
  console.log(`[SLIPPAGE] Min Odds   : ${currentOdds * (1 - config.maxSlippagePercent)} (Scale ${minOddsBigInt.toString()})`);

  // Set the order expiration block deadline (typically 5-10 minutes from current UTC)
  const txDeadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes expiry window

  // Formulate the target BetData tuple expected by Azuro LP
  const betData = {
    conditionId: BigInt(conditionId),
    outcomeId: BigInt(outcomeId),
    minOdds: minOddsBigInt
  };

  // Explicit Affiliate Parameter configuration for auto cashback and fee sharing
  const affiliateAddress = config.affiliateAddress || ethers.ZeroAddress;
  console.log(`[REBATE] Affiliate ID : ${affiliateAddress === ethers.ZeroAddress ? "None (Zero Address)" : affiliateAddress}`);

  // 6. Programmatic Millisecond Execution
  try {
    console.log(`[MAPPING] Routing Bet to Azuro Core contract at: ${AZURO_CORE_TENNIS}`);
    
    // Fetch live gas specifications directly from Polygon RPC
    const feeData = await provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas ? (feeData.maxFeePerGas * 12n) / 10n : undefined; // Add 20% premium
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 12n) / 10n : undefined; // Add 20% premium

    console.log(`[EXECUTION] Transmitting transaction payload to Polygon RPC...`);
    
    const txResponse = await lpContract.bet(
      AZURO_CORE_TENNIS,
      amountBigInt,
      txDeadline,
      betData,
      affiliateAddress,
      {
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasLimit: 300000 // Average gas limit for placing bets directly on Azuro LP
      }
    );

    console.log(`[SUBMITTED] Bet transaction successfully pushed to the Polygon mempool!`);
    console.log(`[TX HASH] Transaction : ${txResponse.hash}`);
    
    const receipt = await txResponse.wait(1);
    console.log(`[SETTLED] Transaction confirmed in block #${receipt.blockNumber}!`);
    console.log(`[SUCCESS] Automated Bet has been authorized and matched on Azuro Protocol.`);
    
    return { success: true, hash: txResponse.hash, blockNumber: receipt.blockNumber };
  } catch (error: any) {
    console.error(`[EXECUTION ERROR] Transaction failed during transaction relaying:`, error);
    return { success: false, reason: "Transaction failed", error: error.message || error };
  }
}

// Self-Executing CLI execution pattern
const isMain = process.argv[1] && (
  process.argv[1].endsWith("azuro-bot.ts") ||
  process.argv[1].endsWith("azuro-bot.js") ||
  process.argv[1].endsWith("tsx") // triggered via tsx command line
);

if (isMain) {
  const cliArgs = process.argv.slice(2);
  const conditionInput = cliArgs[0] || "465819000000000021"; // Dummy tennis Condition ID
  const outcomeInput = cliArgs[1] || "1401"; // Dummy 6-4 set 1 correct score Outcome ID
  const targetLiveOdds = parseFloat(cliArgs[2] || "1.85");

  const localConfig: BotConfig = {
    rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    privateKey: process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001", // Dummy Key
    affiliateAddress: process.env.AFFILIATE_REBATE_WALLET || "0x0000000000000000000000000000000000000000", // Empty by default
    betAmountUsdt: parseFloat(process.env.BET_AMOUNT_USDT || "10"),
    minOddsThreshold: parseFloat(process.env.MIN_ODDS_THRESHOLD || "1.40"),
    maxSlippagePercent: parseFloat(process.env.MAX_SLIPPAGE_PERCENT || "0.02") // 2%
  };

  executeAzuroBet(conditionInput, outcomeInput, targetLiveOdds, localConfig)
    .then((res) => {
      console.log(`[CLI ENGINE] Bot execution finished. Success: ${res.success}`);
      process.exit(res.success ? 0 : 1);
    })
    .catch((err) => {
      console.error(`[CLI ENGINE] Hard failure detected:`, err);
      process.exit(1);
    });
}
