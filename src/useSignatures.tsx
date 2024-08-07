import { ContractAddresses } from './contractAddress';
import { ImpactProviderContext } from './ImpactProvider';
import { TypedDataField } from '@ethersproject/abstract-signer';
import { networksId } from './config';
import React from 'react';

/**
 * Signature options
 */
type SignatureOptions = {
    /**
     * Expiry time of the signature
     * @default 30 days
     */
    expiry?: number;
    /**
     * Smart contract name to verify the signature
     * @default impactMarket
     */
    name?: string;
    /**
     * Smart contract address to verify the signature
     * @default 0x0 PACTDelegator address on each network
     */
    verifyingContract?: string;
    /**
     * Smart contract veersion
     * @default 1
     */
    version?: string;
};

/**
 * Typed signature response
 */
type TypedSignatureResponse = {
    /**
     * Message being signed
     */
    message: Record<string, any>;
    /**
     * Sinature hash
     */
    signature: string;
};

export const useSignatures = () => {
    const { signer, networkId } = React.useContext(ImpactProviderContext);

    /**
     * Signs a given message.
     * ***DO NOT HASH IT***
     * @param {string} message plaintext readable string
     * @returns {Promise<string>} signature
     * @deprecated use `signTypedData` instead
     */
    const signMessage = (message: string): Promise<string> => {
        // const connectionProvider = signer.web3.currentProvider as unknown as {
        //     existingProvider: { isDesktop: boolean; _metamask?: unknown };
        // };

        // // it is not yet clear why, but metamask is not working with hexlify/toUtf8Bytes

        // if (connectionProvider.existingProvider.isDesktop || connectionProvider.existingProvider._metamask) {
        //     return signer.signMessage(hashMessage(message));
        // }

        if (!signer) {
            throw new Error('no valid signer connected');
        }

        return signer.signMessage({ message });
    };

    /**
     * Sign a message using EIP-712
     * @param {string} message Message to sign
     * @param {SignatureOptions} options Signature options
     * @returns {Promise<TypedSignatureResponse>} Sigature hash
     */
    const signTypedData = async (message: string, options?: SignatureOptions): Promise<TypedSignatureResponse> => {
        if (!signer) {
            throw new Error('no valid signer connected');
        }

        const expiry = options?.expiry || Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
        const name = options?.name || 'impactMarket';
        const verifyingContract = (options?.verifyingContract ||
            ContractAddresses[networkId || networksId.CeloMainnet].PACTDelegator) as `0x${string}`;
        const version = options?.version || '1';

        const domain = {
            chainId: networkId,
            name,
            verifyingContract,
            version
        };
        const types: Record<string, TypedDataField[]> = {
            Auth: [
                { name: 'message', type: 'string' },
                { name: 'expiry', type: 'uint256' }
            ]
        };
        const value: Record<string, any> = {
            expiry,
            message
        };

        const signature = await signer.signTypedData({ domain, message: value, primaryType: 'Auth', types });

        return { message: value, signature };
    };

    return { signMessage, signTypedData };
};
