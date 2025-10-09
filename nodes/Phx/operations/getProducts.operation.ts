import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PHXFilter } from '../interfaces';
import { genericGetOperation, genericSimplifyOperation } from './generic.operation';

export async function getProductsOperation(
	this: IExecuteFunctions,
	item: INodeExecutionData,
	queryFilter: PHXFilter[] = [],
	inputFilter: PHXFilter[] = [],
  ): Promise<INodeExecutionData[]> {

	const response = await genericGetOperation.call(this, queryFilter, inputFilter, 'getProducts');
	
	const products = response?.data?.getProducts?.items;
	if (!Array.isArray(products))
		return [];

	const simplified: any[] = await genericSimplifyOperation.call(this, products);
	return simplified.map((prod: any) => ({ json: prod }));
}
