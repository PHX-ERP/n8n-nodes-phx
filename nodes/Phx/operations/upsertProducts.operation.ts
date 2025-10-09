import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PHXModifier } from '../interfaces';
import { genericUpsertOperation } from './generic.operation';

export async function upsertProductsOperation(
	this: IExecuteFunctions,
	item: INodeExecutionData,
	modifiers: PHXModifier[] = [],
  ): Promise<INodeExecutionData[]> {

    const response: any = await genericUpsertOperation.call(this, modifiers, 'saveProduct', 'ProductInput!', "input", item);
    return [
		{
			json: {
                id: response.saveProduct.id
            }
		},
	];
}
