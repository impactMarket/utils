import React, { useState } from 'react';
import { useStaking } from '@impact-market/utils/useStaking';

const ClaimUnstaked = () => {
    const staking = useStaking();
    const [claimUnstakedIsLoading, setClaimUnstakedIsLoading] = useState(false);

    const executeClaimUnstaked = async () => {
        setClaimUnstakedIsLoading(true);

        await staking.claim();

        setClaimUnstakedIsLoading(false);
    };

    return (
        <>
            <h3>Claim Unstaked</h3>
            <div style={{ marginTop: 8 }}>
                {staking.unstakedClaimable} PACT are able to be claimed from unstaking.
                <button disabled={claimUnstakedIsLoading} onClick={executeClaimUnstaked}>
                    Claim Unstaked
                </button>
                {claimUnstakedIsLoading && <span> Loading...</span>}
            </div>
        </>
    );
};

export default ClaimUnstaked;
