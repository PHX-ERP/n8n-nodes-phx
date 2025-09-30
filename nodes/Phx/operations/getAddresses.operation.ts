import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PHXFilter } from '../interfaces';
import { genericGetOperation } from './generic.operation';

export async function getAddressesOperation(
	this: IExecuteFunctions,
	item: INodeExecutionData,
	queryFilter: PHXFilter[] = [],
	inputFilter: PHXFilter[] = [],
  ): Promise<INodeExecutionData[]> {

	const response = await genericGetOperation.call(this, queryFilter, inputFilter, 'getAddresses');

	// Check if data exists
	if (response?.data) {
		console.log(response?.data);
		const addresses = response?.data?.getAddresses?.items;
		return addresses.map((address: any) => ({
			json: {
				...item.json,
				...address,
			},
		}));
	} else {
		const error = response?.data?.errors[0]?.message;
		if (error) {
			throw new Error(error);
		} else {
			throw new Error('No data found');
		}
	}	
}
