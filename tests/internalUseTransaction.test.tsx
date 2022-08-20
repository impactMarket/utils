import * as React from 'react';
import * as contracts from '../src/contracts';
import { ImpactProviderContext } from '../src/ImpactProvider';
import { act, render } from '@testing-library/react';
import { internalUseTransaction } from '../src/internalUseTransaction';
import { toToken } from '../src/toToken';

function TestComponent() {
    const executeTransaction = internalUseTransaction();

    return (
        <div>
            <button id="submit" onClick={() => executeTransaction({ data: 'whatever', from: 'xpto', to: 'ypto' })}>
                submit
            </button>
        </div>
    );
}

describe('internalUseTransaction hook runs correctly', () => {
    let getContractsMock: jest.SpyInstance<any>;

    beforeAll(() => {
        getContractsMock = jest.spyOn(contracts, 'getContracts');
    });
    afterAll(() => getContractsMock.mockRestore());
    afterEach(() => getContractsMock.mockClear());

    it('with cUSD fees', async () => {
        const testEstimatedGas = 10;
        const testGasPrice = 3;
        const cusdMock = { balanceOf: jest.fn(() => Promise.resolve(toToken(0.02))) };
        const connectionMock = {
            estimateGas: jest.fn(() => Promise.resolve(testEstimatedGas)),
            gasPrice: jest.fn(() => Promise.resolve(testGasPrice)),
            sendTransaction: jest.fn(() => Promise.resolve({ waitReceipt: jest.fn(() => Promise.resolve(true)) }))
        };

        getContractsMock.mockReturnValue(Promise.resolve({ cusd: cusdMock } as any));
        // (getContracts as jest.Mock<any, any>).mockReturnValue(() => Promise.resolve({ cusd: 'cusd' }));

        const { getByText } = render(
            <ImpactProviderContext.Provider
                value={{
                    address: 'xpto',
                    connection: connectionMock as any,
                    provider: jest.fn() as any,
                    subgraph: jest.fn() as any,
                    ubiManagementSubgraph: jest.fn() as any
                }}
            >
                <TestComponent />
            </ImpactProviderContext.Provider>
        );
        const submit = getByText('submit');

        // execute action
        submit.click();

        expect(getContractsMock).toBeCalledTimes(1);
        await act(async () => await Promise.resolve());
        expect(connectionMock.gasPrice).toBeCalledTimes(1);
        expect(connectionMock.estimateGas).toBeCalledTimes(1);
        expect(connectionMock.sendTransaction).toBeCalledTimes(1);
        expect(connectionMock.estimateGas).toHaveReturnedWith(Promise.resolve(testEstimatedGas));
        expect(connectionMock.gasPrice).toHaveReturnedWith(Promise.resolve(testGasPrice));
    });

    it('with CELO fees', async () => {
        const testEstimatedGas = 10;
        const testGasPrice = 3;
        const cusdMock = { balanceOf: jest.fn(() => Promise.resolve(toToken(0))) };
        const connectionMock = {
            estimateGas: jest.fn(() => Promise.resolve(testEstimatedGas)),
            gasPrice: jest.fn(() => Promise.resolve(testGasPrice)),
            sendTransaction: jest.fn(() => Promise.resolve({ waitReceipt: jest.fn(() => Promise.resolve(true)) }))
        };

        getContractsMock.mockReturnValue(Promise.resolve({ cusd: cusdMock } as any));
        // (getContracts as jest.Mock<any, any>).mockReturnValue(() => Promise.resolve({ cusd: 'cusd' }));

        const { getByText } = render(
            <ImpactProviderContext.Provider
                value={{
                    address: 'xpto',
                    connection: connectionMock as any,
                    provider: jest.fn() as any,
                    subgraph: jest.fn() as any,
                    ubiManagementSubgraph: jest.fn() as any
                }}
            >
                <TestComponent />
            </ImpactProviderContext.Provider>
        );
        const submit = getByText('submit');

        // execute action
        submit.click();

        expect(getContractsMock).toBeCalledTimes(1);
        await act(async () => await Promise.resolve());
        expect(connectionMock.gasPrice).toBeCalledTimes(0);
        expect(connectionMock.estimateGas).toBeCalledTimes(0);
        expect(connectionMock.sendTransaction).toBeCalledTimes(1);
    });
});
