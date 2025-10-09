import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { genericDeleteOperation } from './generic.operation';

export async function deleteAddressOperation(
    this: IExecuteFunctions,
    item: INodeExecutionData,
): Promise<INodeExecutionData[]> {
    await genericDeleteOperation.call(this, 'deleteAddress', 'id', item);
    return[{ json: { "deleted": true } }];
}
