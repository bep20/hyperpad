export const getMode = connection => {
  return connection.rpcEndpoint.indexOf('devnet') > -1 ? 'devnet' : 'mainnet';
};

export const BOT_MIN_RATE = 3;
export const BOT_MAX_RATE = 100;
