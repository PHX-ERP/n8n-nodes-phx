import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { PHXFilter, PHXModifier } from '../interfaces';
import { fetchAxios, getAllColumnsOfType } from '../helper/helper';
import { AxiosResponse } from 'axios';

export async function genericGetOperation(
	this: IExecuteFunctions,
	queryFilter: PHXFilter[] = [],
	inputFilter: PHXFilter[] = [],
    queryFnName: string
  ): Promise<AxiosResponse<any>> {

	const safeQueryFilters = Array.isArray(queryFilter) ? queryFilter : [];
	const safeInputFilters = Array.isArray(inputFilter) ? inputFilter : [];
	
	const columnsOfType: INodePropertyOptions[] = await getAllColumnsOfType.call(this);
	let query = ``;

	query = 
	`query {
		${queryFnName}(input: {
			${safeInputFilters.map(f => `${f.field}: ${f.value}`).join(", ")}
			searchFilter: {
				rules: [${safeQueryFilters
					.map(f => `{field: "${f.field}", operator: ${f.operator?.toLowerCase()}, value: "${f.value}"}`)
					.join(", ")}]
			}
		}) {
			totalItems
			items {
				${columnsOfType.map((column) => `\n${column.name}`)}
			}
		}
	}`
	
	const response = await fetchAxios.call(this, query);
	if (response.status === 408)
		throw new Error('Request timed out');

    return response.data;
}

export async function genericUpsertOperation(
	this: IExecuteFunctions,
	modifiers: PHXModifier[] = [],
    queryFnName: string,
    inputTypeName: string,
	inputFieldName: string,
	item: INodeExecutionData
  ): Promise<AxiosResponse<any>> {

	const safeModifiers = Array.isArray(modifiers) ? modifiers : [];
	
	// Build input object from modifiers
	const inputObj: Record<string, any> = {};
	safeModifiers.forEach(modifier => {
		inputObj[modifier.modifier] = modifier.value;
	});

	// Add item data to input if available
	if (safeModifiers.length === 0 && item && item.json)
		Object.assign(inputObj, item.json);

	const mutation = 
	`mutation UpsertOperation($input: ${inputTypeName}) {
		${queryFnName}(${inputFieldName}: $input) {	
			id
		}
	}`;

	const variables = {
		input: inputObj
	};

	const response = await fetchAxios.call(this, mutation, variables);
	if (response?.status === 408)
		throw new Error('Request timed out');

	if (response?.data?.errors && response?.data?.errors.length > 0)
		throw new Error(response?.data?.errors[0]?.message);

    return response?.data;
}