import fetch from 'node-fetch';

const MAGIC_EDEN_PROGRAM_ID = 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K';
const SOLANA_RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

async function fetchTransactions(url) {
  const requestBody = {
    method: 'getConfirmedSignaturesForAddress2',
    params: [MAGIC_EDEN_PROGRAM_ID, { limit: 1000 }],
    jsonrpc: '2.0',
    id: 'magic-eden',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (data.error) {
    console.error('API error:', data.error);
    throw new Error('API error: ' + data.error.message);
  }

  console.log('API response:', data);

  return data.result.transactions;
}


async function getMagicEdenTransactions(minutes) {
  const now = new Date();
  const startTime = new Date(now.getTime() - minutes * 60 * 1000).toISOString();

  const response = await fetch(SOLANA_RPC_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getConfirmedSignaturesForAddress2',
      params: [MAGIC_EDEN_PROGRAM_ID, { limit: 1000, until: startTime }],
    }),
  });

  const data = await response.json();
  return data.result;
}

async function getProjectInfo(transactionSignature) {
  const response = await fetch(SOLANA_RPC_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getConfirmedTransaction',
      params: [transactionSignature, { encoding: 'jsonParsed' }],
    }),
  });

  const data = await response.json();
  const transaction = data.result;

  // トランザクションからプロジェクト情報を抽出
  // 実際の情報はトランザクションの構造に依存します
  const project = {
    id: 'SAMPLE_PROJECT_ID',
    amount: 1, // 取引量を示す仮の値
  };

  return project;
}

async function main() {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 5 * 60 * 1000);
  const url = `https://api.mainnet-beta.solana.com/v2/transactions?before=${endTime.toISOString()}&after=${startTime.toISOString()}&limit=1000`;

  const transactions = await fetchTransactions(url);
  console.log('Fetched transactions:', transactions);


  const projectStats = new Map();

  for (const transaction of transactions) {
    const projectInfo = await getProjectInfo(transaction.signature);

    if (projectStats.has(projectInfo.id)) {
      const currentAmount = projectStats.get(projectInfo.id);
      projectStats.set(projectInfo.id, currentAmount + projectInfo.amount);
    } else {
      projectStats.set(projectInfo.id, projectInfo.amount);
    }
  }

  const topProjects = Array.from(projectStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([projectId, amount]) => ({ projectId, amount }));

  console.table(topProjects);
}

main().catch((error) => console.error('Error:', error));

