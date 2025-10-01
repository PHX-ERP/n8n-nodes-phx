import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PHXFilter } from '../interfaces';
import { genericGetOperation } from './generic.operation';

export async function getProductsOperation(
	this: IExecuteFunctions,
	item: INodeExecutionData,
	queryFilter: PHXFilter[] = [],
	inputFilter: PHXFilter[] = [],
  ): Promise<INodeExecutionData[]> {

	const response = await genericGetOperation.call(this, queryFilter, inputFilter, 'getProducts');

	// Check if data exists
	if (response?.data) {
		const products = response?.data?.getProducts?.items;
		return products.map((product: any) => ({
			json: {
				...item.json,
				...products,
			},
		}));
	} else {
		const error = response?.data?.errors[0]?.message;
		if (error) {
			throw new Error(error);
		} else {
			throw new Error(response.statusText);
		}
	}
}
