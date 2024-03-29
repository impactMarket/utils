import { CUSDBalanceContext, ImpactProviderContext } from './ImpactProvider';
import { getContracts } from './contracts';
import { toNumber } from './toNumber';
import React, { useEffect } from 'react';
import type { BaseProvider } from '@ethersproject/providers';

export const updateCUSDBalance = async (provider: BaseProvider, networkId: number, address: string) => {
    const { cusd } = getContracts(provider, networkId);

    if (!address || !cusd?.provider) {
        return 0;
    }

    try {
        const cUSDBalance = await cusd?.balanceOf(address);

        return toNumber(cUSDBalance);
    } catch (error) {
        console.log(`Error getting balance...\n${error}`);

        return 0;
    }
};

export const useCUSDBalance = () => {
    const { provider, address, networkId } = React.useContext(ImpactProviderContext);
    const { balance, setBalance } = React.useContext(CUSDBalanceContext);

    useEffect(() => {
        if (address) {
            updateCUSDBalance(provider, networkId, address).then(b => setBalance(b));
        }
    }, [address]);

    return balance;
};
