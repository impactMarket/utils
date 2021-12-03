import { toNumber, frequencyToText, toToken, useDAO } from '@impact-market/utils';
import React, { useEffect, useState } from 'react';
import { impactMarket } from '../../services/impactMarket';

const Community = props => {
    const { id, name, contract, requestByAddress } = props;
    const { addCommunity } = useDAO();
    const [isLoading, setIsLoading] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddCommunity = async () => {
        setIsLoading(true);

        const data = {
            ...contract,
            decreaseStep: toToken(0.01),
            managers: [requestByAddress],
            maxTranche: toToken(0.1, { EXPONENTIAL_AT: 25 }),
            minTranche: toToken(0.01),
            proposalDescription: `${name} |\nclaim amount: ${toNumber(contract.claimAmount)}\nmax claim: ${toNumber(contract.maxClaim)}\nbase interval: ${frequencyToText(contract.baseInterval)}\n${process.env.BASE_URL}/communities/${id}`
        };

        const response = await addCommunity(data)

        console.log(response);

        if (response?.status) {
            setIsAdded(true);
        }

        setIsLoading(false);
    }

    return (
        <li>
            <h5 style={{ display: 'flex', width: 600 }}>
                <span>{name} - {requestByAddress}</span>
                {isLoading && <span>...is loading!</span>}
                {!isAdded && <button disabled={isLoading} onClick={handleAddCommunity} style={{ marginLeft: 'auto' }}>Add</button>}
            </h5>
        </li>
    )
}

const AddCommunity = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [communities, setCommunities] = useState([]);

    useEffect(() => {
        const getCommunities = async () => {
            setIsLoading(true);
            const response = await impactMarket.getPendingCommunities();

            setCommunities(response?.data || []);
            setIsLoading(false);
        }

        getCommunities();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!communities && !isLoading) {
        return (
            <div>
                <h3>No communities</h3>
            </div>
        )
    }

    return (
        <div>
            <h3>Add Community</h3>
            <h4>Communities</h4>
            <ul style={{ marginTop: 32 }}>
                {communities.map((community, index) => <Community key={index} {...community} />)}
            </ul>
        </div>
    )
};

export default AddCommunity;
