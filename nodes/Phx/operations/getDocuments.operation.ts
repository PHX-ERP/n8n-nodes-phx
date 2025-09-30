import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PHXFilter } from '../interfaces';
import { genericGetOperation } from './generic.operation';

export async function getDocumentsOperation(
	this: IExecuteFunctions,
	item: INodeExecutionData,
	queryFilter: PHXFilter[] = [],
	inputFilter: PHXFilter[] = [],
  ): Promise<INodeExecutionData[]> {

	const response = await genericGetOperation.call(this, queryFilter, inputFilter, 'getDocuments');

	// Check if data exists
	if (response?.data) {
		console.log(response?.data);
		const documents = response?.data?.getDocuments?.items;
		return documents.map((document: any) => ({
			json: {
				...item.json,
				...document,
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
