import { Account, Chain, SendTransactionParameters, TransactionReceipt, createPublicClient, http } from 'viem';
import { ImpactProviderContext } from './ImpactProvider';
import { getContracts } from './contracts';
import { useContext, useMemo } from 'react';
import axios from 'axios';

// some methods copied from walletconnect v2 examples

type TxHashParams = {
    data?: `0x${string}`;
    from?: `0x${string}`;
    to?: `0x${string}`;
};

const apiGetAccountNonce = async (jsonRpcUrl: string, address: string): Promise<number> => {
    const response = await axios.post(jsonRpcUrl, {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [address, 'latest']
    });
    const { result } = response.data;
    const nonce = parseInt(result, 16);

    return nonce;
};

const apiGetGasPrice = async (jsonRpcUrl: string, defaultFeeCurrency: string | undefined): Promise<string> => {
    const response = await axios.post(jsonRpcUrl, {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: defaultFeeCurrency ? [defaultFeeCurrency] : []
    });
    const { result } = response.data;

    return result;
};

export const internalUseTransaction = () => {
    const { signer, address, provider, networkId, defaultFeeCurrency, jsonRpcUrl, connection } =
        useContext(ImpactProviderContext);
    const publicClient = useMemo(
        () =>
            createPublicClient({
                chain: signer?.chain,
                transport: http(jsonRpcUrl || 'https://forno.celo.org')
            }),
        [signer, jsonRpcUrl]
    );

    // internal transaction formatter
    const formatTransaction = async (
        tx: TxHashParams
    ): Promise<SendTransactionParameters<Chain, Account, Chain | undefined>> => {
        if (!address) {
            throw new Error('no valid address connected');
        }

        if (signer) {
            return tx;
        }

        const [_nonce, _gasPrice, _gasLimit, _value] = await Promise.all([
            apiGetAccountNonce(jsonRpcUrl, tx.from || address),
            apiGetGasPrice(jsonRpcUrl, defaultFeeCurrency),
            // ensure basic params are provided
            provider.estimateGas({ ...tx, from: address }),
            0
        ]);

        return {
            ...tx,
            account: (tx.from || address) as `0x${string}`,
            gas: BigInt(_gasLimit.toNumber() * 2),
            gasPrice: BigInt(parseInt(_gasPrice, 16) * 2),
            nonce: _nonce,
            value: BigInt(_value)
        };
    };

    const executeTransaction = async (tx: {
        data?: string;
        from?: string;
        to?: string;
    }): Promise<TransactionReceipt> => {
        if (!address) {
            throw new Error('no valid address connected');
        }

        const { celo } = getContracts(provider, networkId);

        // include fee currency on tx parameters
        let feeTxParams = {};

        if (defaultFeeCurrency && defaultFeeCurrency.toLowerCase() !== celo.address.toLowerCase()) {
            feeTxParams = {
                feeCurrency: defaultFeeCurrency
            };
        }

        // @deprecated: Block deprecated
        if (signer === null && connection) {
            const txResponse = await connection.sendTransaction({
                data: tx.data,
                from: tx.from || address,
                gasPrice: parseInt(await apiGetGasPrice(jsonRpcUrl, defaultFeeCurrency), 16) * 2,
                to: tx.to
            });

            return await publicClient.waitForTransactionReceipt({
                hash: (await txResponse.getHash()) as `0x${string}`
            });
        }

        if (!signer) {
            throw new Error('no valid signer connected');
        }

        const txHash = await signer.sendTransaction({
            ...(await formatTransaction(tx as TxHashParams)),
            ...feeTxParams
        });

        return await publicClient.waitForTransactionReceipt({ hash: txHash });
    };

    return executeTransaction;
};
