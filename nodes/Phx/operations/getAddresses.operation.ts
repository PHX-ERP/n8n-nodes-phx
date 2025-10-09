import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PHXFilter } from '../interfaces';
import { genericGetOperation, genericSimplifyOperation } from './generic.operation';

export async function getAddressesOperation(
	this: IExecuteFunctions,
	item: INodeExecutionData,
	queryFilter: PHXFilter[] = [],
	inputFilter: PHXFilter[] = [],
  ): Promise<INodeExecutionData[]> {

	const response = await genericGetOperation.call(this, queryFilter, inputFilter, 'getAddresses');
	const items = response?.data?.getAddresses?.items;

	if (!Array.isArray(items)) return [];

	const simplified: any[] = await genericSimplifyOperation.call(this, items);
	return simplified.map((addr: any) => ({ json: addr }));
}
