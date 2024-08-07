import { Contract } from '@ethersproject/contracts';
import { ContractAddresses } from './contractAddress';
import AmbassadorsABI from './abi/Ambassadors.json';
import BaseERC20ABI from './abi/BaseERC20.json';
import BigNumber from 'bignumber.js';
import CommunityAdminABI from './abi/CommunityAdminABI.json';
import DepositRedirectABI from './abi/DepositRedirectABI.json';
import DonationMinerABI from './abi/DonationMiner.json';
import ImpactMarketCouncilABI from './abi/ImpactMarketCouncil.json';
import LearnAndEarnABI from './abi/LearnAndEarnABI.json';
import MerkleDistributorABI from './abi/MerkleDistributor.json';
import MicroCreditABI from './abi/MicroCreditABI.json';
import MicroCreditABIOld from './abi/MicroCreditABIOld.json';
import PACTDelegateABI from './abi/PACTDelegate.json';
import PACTTokenABI from './abi/PACTToken.json';
import StakingABI from './abi/Staking.json';
import TreasuryABI from './abi/TreasuryABI.json';
import type { BaseProvider } from '@ethersproject/providers';

export interface ILearnAndEarn extends Contract {
    fundLevel(levelId: number, amount: number): Promise<void>;
    claimRewardForLevels(
        beneficiary: string,
        levelIds: number[],
        rewardAmounts: number[],
        signatures: string[]
    ): Promise<void>;
}
export interface IDepositRedirect extends Contract {
    tokenListLength(): Promise<BigNumber>;
    tokenListAt(index: number): Promise<string>;
    tokenDepositor(
        tokenAddress: string,
        depositorAddress: string
    ): Promise<{ amount: BigNumber; scaledBalance: BigNumber }>;
    deposit(tokenAddress: string, amount: string): Promise<void>;
    withdraw(tokenAddress: string, amount: string): Promise<void>;
    donateInterest(depositorAddress: string, tokenAddress: string, amount: string): Promise<void>;
    interest(depositorAddress: string, tokenAddress: string, amount: string): Promise<any>;
}

export type UserLoans = {
    amountBorrowed: BigNumber;
    period: BigNumber;
    dailyInterest: BigNumber;
    claimDeadline: BigNumber;
    startDate: BigNumber;
    currentDebt: BigNumber;
    lastComputedDebt: BigNumber;
    amountRepayed: BigNumber;
    repaymentsLength: BigNumber;
    lastComputedDate: BigNumber;
    managerAddress: string;
    tokenAddress?: string;
    tokenAmountBorrowed?: BigNumber;
    tokenAmountRepayed?: BigNumber;
    tokenLastComputedDebt?: BigNumber;
    tokenCurrentDebt?: BigNumber;
};

export interface IMicroCredit extends Contract {
    approve(loanId: string, amount: string): Promise<void>;
    userLoans(userAddress: string, loanId: number | string): Promise<UserLoans>;
    claimLoan(loanId: string): Promise<void>;
    repayLoan(loanId: string, amount: string): Promise<void>;
    addLoans(
        userAddresses: string[],
        tokenAddresses: string[],
        amounts: number[],
        periods: number[],
        dailyInterests: number[],
        claimDeadlines: number[]
    ): Promise<void>;
    cancelLoans(userAddresses: string[], loansIds: number[]): Promise<void>;
    changeUserAddress(oldWalletAddress: string, newWalletAddress: string): Promise<void>;
    managers(address: string): Promise<{
        lentAmountLimit: BigNumber;
        lentAmount: BigNumber;
    }>;
    getVersion(): Promise<BigNumber>;
}

export const getContracts = (provider: BaseProvider, networkId: number) => {
    const contractAddresses = ContractAddresses[networkId];

    const {
        Ambassadors,
        CommunityAdmin,
        LearnAndEarn,
        DepositRedirect,
        cUSD,
        cEUR,
        CELO,
        PACTDelegate,
        PACTDelegator,
        PACTToken,
        SPACTToken,
        DonationMiner,
        MicroCredit,
        MerkleDistributor,
        Staking,
        ImpactMarketCouncil,
        Treasury
    } = contractAddresses;

    const addresses = {
        ambassadors: Ambassadors || '',
        celo: CELO || '',
        ceur: cEUR || '',
        communityAdmin: CommunityAdmin || '',
        cusd: cUSD || '',
        delegate: PACTDelegate || '',
        delegator: PACTDelegator || '',
        depositRedirect: DepositRedirect || '',
        donationMiner: DonationMiner || '',
        impactMarketCouncil: ImpactMarketCouncil || '',
        learnAndEarn: LearnAndEarn || '',
        merkleDistributor: MerkleDistributor || '',
        microCredit: MicroCredit || '',
        microCreditOld: MicroCredit || '',
        pactToken: PACTToken || '',
        spactToken: SPACTToken || '',
        staking: Staking || '',
        treasury: Treasury || ''
    };

    const ambassadors = new Contract(addresses.ambassadors, AmbassadorsABI, provider);

    const merkleDistributor = new Contract(addresses.merkleDistributor, MerkleDistributorABI, provider);

    const microCredit = new Contract(addresses.microCredit, MicroCreditABI, provider) as IMicroCredit;
    const microCreditOld = new Contract(addresses.microCreditOld, MicroCreditABIOld, provider) as IMicroCredit;

    const donationMiner = new Contract(addresses.donationMiner, DonationMinerABI, provider);

    const cusd = new Contract(addresses.cusd, BaseERC20ABI, provider);

    const ceur = new Contract(addresses.ceur, BaseERC20ABI, provider);

    const celo = new Contract(addresses.celo, BaseERC20ABI, provider);

    const pact = new Contract(addresses.pactToken, PACTTokenABI, provider);

    const spact = new Contract(addresses.spactToken, BaseERC20ABI, provider);

    const staking = new Contract(addresses.staking, StakingABI, provider);

    const delegate = new Contract(addresses.delegate, PACTDelegateABI, provider).attach(addresses.delegator);

    const impactMarketCouncil = new Contract(addresses.impactMarketCouncil, ImpactMarketCouncilABI, provider);

    const learnAndEarn = new Contract(addresses.learnAndEarn, LearnAndEarnABI, provider) as ILearnAndEarn;

    const depositRedirect = new Contract(addresses.depositRedirect, DepositRedirectABI, provider) as IDepositRedirect;

    const treasury = new Contract(addresses.treasury, TreasuryABI, provider);

    const communityAdmin = new Contract(addresses.communityAdmin, CommunityAdminABI, provider);

    return {
        addresses,
        ambassadors,
        celo,
        ceur,
        communityAdmin,
        cusd,
        delegate,
        depositRedirect,
        donationMiner,
        impactMarketCouncil,
        learnAndEarn,
        merkleDistributor,
        microCredit,
        microCreditOld,
        pact,
        spact,
        staking,
        treasury
    };
};
