import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { genericDeleteOperation } from './generic.operation';

export async function deleteProductOperation(
    this: IExecuteFunctions,
    item: INodeExecutionData,
): Promise<INodeExecutionData[]> {
    await genericDeleteOperation.call(this, 'deleteProduct', 'id', item);
    return[{ json: { "deleted": true } }];
}
