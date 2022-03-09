/* eslint-disable */
import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber, providers, utils } from "ethers";
import { parseCeloTransaction } from "./transactions";

export class CeloProvider extends JsonRpcProvider {
  constructor(
    url?: utils.ConnectionInfo | string,
    network?: providers.Networkish
  ) {
    super(url, network);

    // Override certain block formatting properties that don't exist on Celo blocks
    // Reaches into https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/formatter.ts
    const blockFormat = this.formatter.formats.block;
    blockFormat.gasLimit = () => BigNumber.from(0);
    blockFormat.nonce = () => "";
    blockFormat.difficulty = () => 0;
  }

  /**
   * Override to parse transaction correctly
   * https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/base-provider.ts
   */
  async sendTransaction(
    signedTransaction: string | Promise<string>
  ): Promise<providers.TransactionResponse> {
    await this.getNetwork();
    const signedTx = await Promise.resolve(signedTransaction);
    const hexTx = utils.hexlify(signedTx);
    const tx = parseCeloTransaction(signedTx);
    try {
      const hash = await this.perform("sendTransaction", {
        signedTransaction: hexTx,
      });
      return this._wrapTransaction(tx, hash);
    } catch (error: any) {
      error.transaction = tx;
      error.transactionHash = tx.hash;
      throw error;
    }
  }

  /**
   * Override to handle alternative gas currencies
   * getGasPrice in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/base-provider.ts
   */
  async getGasPrice(feeCurrencyAddress?: string) {
    await this.getNetwork();
    const params = feeCurrencyAddress ? { feeCurrencyAddress } : {};
    return BigNumber.from(await this.perform("getGasPrice", params));
  }

  /**
   * Override to handle alternative gas currencies
   * prepareRequest in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
   */
  prepareRequest(method: any, params: any): [string, Array<any>] {
    if (method === "getGasPrice") {
      const param = params.feeCurrencyAddress
        ? [params.feeCurrencyAddress]
        : [];
      return ["eth_gasPrice", param];
    }

    return super.prepareRequest(method, params);
  }
}
