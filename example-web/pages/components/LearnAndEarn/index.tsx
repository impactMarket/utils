import React from 'react';
import { useLearnAndEarn } from '@impact-market/utils/useLearnAndEarn';
import WalletConnection from '../WalletConnection';
import { defaultAbiCoder } from '@ethersproject/abi';
import { Wallet } from '@ethersproject/wallet';
import { arrayify } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/keccak256';

const AddLevel = () => {
    const { addLevel } = useLearnAndEarn();
    const [levelId, setLevelId] = React.useState('');
    const [token, setToken] = React.useState('');

    const handleAddLevel = (event: any) => {
        addLevel(parseInt(levelId, 10), token);
        event.preventDefault();
    };

    const handleChangeLevelId = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLevelId(event.target.value);
    };

    const handleChangeToken = (event: React.ChangeEvent<HTMLInputElement>) => {
        setToken(event.target.value);
    };

    return (
        <form onSubmit={handleAddLevel}>
            <label>
                Level ID:
                <input type="text" value={levelId} onChange={handleChangeLevelId} />
            </label>
            <label>
                Token Address:
                <input type="text" value={token} onChange={handleChangeToken} />
            </label>
            <input type="submit" value="Submit" />
        </form>
    );
};

const ApproveToken = () => {
    const { approveToken } = useLearnAndEarn();
    const [token, setToken] = React.useState('');
    const [amount, setAmount] = React.useState('');

    const handleApproveToken = (event: any) => {
        approveToken(token, amount);
        event.preventDefault();
    };

    const handleChangeToken = (event: React.ChangeEvent<HTMLInputElement>) => {
        setToken(event.target.value);
    };

    const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value);
    };

    return (
        <form onSubmit={handleApproveToken}>
            <label>
                Token Address:
                <input type="text" value={token} onChange={handleChangeToken} />
            </label>
            <label>
                Amount:
                <input type="text" value={amount} onChange={handleChangeAmount} />
            </label>
            <input type="submit" value="Submit" />
        </form>
    );
};

const FundLevel = () => {
    const { fundLevel } = useLearnAndEarn();
    const [levelId, setLevelId] = React.useState('');
    const [amount, setAmount] = React.useState('');

    const handleFundLevel = (event: any) => {
        fundLevel(parseInt(levelId, 10), amount);
        event.preventDefault();
    };

    const handleChangeLevelId = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLevelId(event.target.value);
    };

    const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value);
    };

    return (
        <form onSubmit={handleFundLevel}>
            <label>
                Level ID:
                <input type="text" value={levelId} onChange={handleChangeLevelId} />
            </label>
            <label>
                Amount:
                <input type="text" value={amount} onChange={handleChangeAmount} />
            </label>
            <input type="submit" value="Submit" />
        </form>
    );
};

const LearnAndEarn = () => {
    const { claimRewardForLevels } = useLearnAndEarn();

    async function signParams(): Promise<string> {
        const wallet = new Wallet('----');
		const encoded = defaultAbiCoder.encode(
			["address", "uint256", "uint256"],
			['0x7110b4df915cb92f53bc01cc9ab15f51e5dbb52f', 11, '175000000000000000000']
		);
		const hash = keccak256(encoded);

		return wallet.signMessage(arrayify(hash));
	}

    const handleClaim = async (event: any) => {
        // change values at will. Test purposes only
        const signature = await signParams();
        await claimRewardForLevels('0x7110b4Df915cb92F53Bc01cC9Ab15F51e5DBb52F', [11], [175], [signature]);
        event.preventDefault();
    };

    return (
        <WalletConnection title="Signatures">
            <h3>Learn and Earn - Council</h3>
            <p>add level</p>
            <AddLevel />
            <p>approve token</p>
            <ApproveToken />
            <p>fund level</p>
            <FundLevel />

            <h3>Learn and Earn - User</h3>
            <button onClick={handleClaim}>claim</button>
        </WalletConnection>
    );
};

export default LearnAndEarn;
