import axios from 'axios';

const apiBaseUrl = 'https://impactmarket-api-staging.herokuapp.com';

export const impactMarket = {
    getPendingCommunities: async () => {
        const url = `${apiBaseUrl}/api/community/list?status=pending&fields=id;requestByAddress;name;description;country;city;cover.*;contract.maxClaim;contract.baseInterval;contract.claimAmount;contract.incrementInterval`;

        try {
            const response = await axios.get(url);

            return response?.data;
        } catch (error) {
            console.log('Error getting pending communities:\n', error);
        }
    }
}