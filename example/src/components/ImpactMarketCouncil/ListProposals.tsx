import React, { useEffect, useState } from 'react';
import { useImpactMarketCouncil } from '@impact-market/utils/useImpactMarketCouncil';

const ListProposals = () => {
    const { cancel, execute, getProposals, vote, quorumVotes, isReady } = useImpactMarketCouncil();
    const [proposals, setProposals] = useState<
        {
            id: number;
            createdAt: number;
            proposer: string;
            signatures: string[];
            endBlock: number;
            description: string;
            votesAgainst: number;
            votesFor: number;
            votesAbstain: number;
            userVoted: number;
            status: 'canceled' | 'executed' | 'ready' | 'defeated' | 'expired' | 'active';
        }[]
    >([]);

    useEffect(() => {
        if (isReady) {
            getProposals(10, 0).then(p => setProposals(p));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady]);

    const proposalComponent = (p: {
        id: number;
        createdAt: number;
        proposer: string;
        signatures: string[];
        endBlock: number;
        description: string;
        votesAgainst: number;
        votesFor: number;
        votesAbstain: number;
        userVoted: number;
        status: 'canceled' | 'executed' | 'ready' | 'defeated' | 'expired' | 'active';
    }) => {
        return (
            <div key={p.id}>
                <p>
                    {p.id} [{p.votesFor}, {p.votesAgainst}, {p.votesAbstain}] | {p.proposer}: {p.description}
                </p>
                {p.status === 'canceled' ? (
                    <p>canceled</p>
                ) : p.status === 'executed' ? (
                    <p>executed - userVoted: {p.userVoted.toString()}</p>
                ) : p.status === 'ready' ? (
                    <>
                        <button onClick={() => execute(p.id)}>execute</button>
                        <button onClick={() => cancel(p.id)}>cancel</button>
                    </>
                ) : p.status === 'defeated' ? (
                    <p>defeated</p>
                ) : p.status === 'expired' ? (
                    <p>expired</p>
                ) : (
                    <>
                        <button onClick={() => vote(p.id, 1)}>vote for</button>
                        <button onClick={() => vote(p.id, 0)}>vote against</button>
                        <button onClick={() => cancel(p.id)}>cancel</button>
                    </>
                )}
            </div>
        );
    };

    return (
        <div>
            <h3>Proposals ({quorumVotes} quorumVotes)</h3>
            {proposals.map(p => proposalComponent(p))}
        </div>
    );
};

export default ListProposals;
