import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PHXModifier } from '../interfaces';
import { genericUpsertOperation } from './generic.operation';

export async function upsertAddressesOperation(
	this: IExecuteFunctions,
	item: INodeExecutionData,
	modifiers: PHXModifier[] = [],
  ): Promise<INodeExecutionData[]> {

    const response = await genericUpsertOperation.call(this, modifiers, 'saveAddress', 'AddressInput!', 'address', item);

    return [
        {
            json: {
                ...response.data,
            },
        },
    ];
}
