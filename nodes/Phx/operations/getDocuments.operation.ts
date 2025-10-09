import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PHXFilter } from '../interfaces';
import { genericGetOperation, genericSimplifyOperation } from './generic.operation';

export async function getDocumentsOperation(
	this: IExecuteFunctions,
	item: INodeExecutionData,
	queryFilter: PHXFilter[] = [],
	inputFilter: PHXFilter[] = [],
  ): Promise<INodeExecutionData[]> {

	const response = await genericGetOperation.call(this, queryFilter, inputFilter, 'getDocuments');

	const documents = response?.data?.getDocuments?.items;
	if (!Array.isArray(documents))
		return [];

	const simplified: any[] = await genericSimplifyOperation.call(this, documents);
	return simplified.map((doc: any) => ({ json: doc }));
}
