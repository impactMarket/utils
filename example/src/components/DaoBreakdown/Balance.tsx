import React from 'react';
import { useCUSDBalance } from '@impact-market/utils/useCUSDBalance';
import { usePACTBalance } from '@impact-market/utils/usePACTBalance';

const Balance = () => {
    const balanceCUSD = useCUSDBalance();
    const balancePACT = usePACTBalance();

    return (
        <>
            <h3>Balance</h3>
            <div style={{ marginTop: 8 }}>
                <ul>
                    <li key='balanceCUSD'>
                        <b>balanceCUSD:</b><span style={{ marginLeft: 8 }}>{balanceCUSD}</span>
                    </li>
                    <li key='balancePACT'>
                        <b>balancePACT:</b><span style={{ marginLeft: 8 }}>{balancePACT}</span>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default Balance;
