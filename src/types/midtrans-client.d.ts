declare module "midtrans-client" {
  type ClientOptions = {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  };

  type TransactionApi = {
    status(orderIdOrTransactionId: string): Promise<Record<string, unknown>>;
  };

  export class Snap {
    constructor(options: ClientOptions);
    transaction: TransactionApi;
    createTransaction(parameter: Record<string, unknown>): Promise<Record<string, unknown>>;
    createTransactionToken(parameter: Record<string, unknown>): Promise<string>;
    createTransactionRedirectUrl(parameter: Record<string, unknown>): Promise<string>;
  }

  export class CoreApi {
    constructor(options: ClientOptions);
    transaction: TransactionApi;
  }

  const midtransClient: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
  };

  export default midtransClient;
}
