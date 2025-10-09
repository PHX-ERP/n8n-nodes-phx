import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { PHXFilter, PHXModifier } from '../interfaces';
import { createSimplifyFunction, fetchPHX, getAllColumnsOfType, flattenObject } from '../helper/helper';

export async function genericGetOperation(
	this: IExecuteFunctions,
	queryFilter: PHXFilter[] = [],
	inputFilter: PHXFilter[] = [],
	queryFnName: string
): Promise<any> {

	const safeQueryFilters = Array.isArray(queryFilter) ? queryFilter : [];
	const safeInputFilters = Array.isArray(inputFilter) ? inputFilter : [];

	const columnsOfType: INodePropertyOptions[] = await getAllColumnsOfType.call(this);
	
	const query = `
	query {
		${queryFnName}(input: {
			take: 1000000,
			${safeInputFilters.map(f => `${f.field}: ${f.value}`).join(", ")},
			searchFilter: {
				rules: [
					${safeQueryFilters
						.map(f => `{ field: "${f.field}", operator: ${f.operator?.toLowerCase()}, value: "${f.value}" }`)
						.join(", ")}
				]
			}
		}) {
			totalItems
			items {
				${columnsOfType.map(c => c.name).join("\n")}
			}
		}
	}`;

	let response = await fetchPHX.call(this, query);
	if (response?.status === 408)
		throw new Error("Request timed out. The PHX server took too long to respond. Please try again or check your server performance.");
	
	return response;
}

export async function genericSimplifyOperation(
	this: IExecuteFunctions,
	response: any
): Promise<any> {
	const simplify = this.getNodeParameter('simplify', 0, false);
	if (!simplify)
		return response;
	
	// Get the first 10 most relevant fields from the response
	const allFields = new Set<string>();
	response.forEach((item: any) => {
		if (item && typeof item === 'object') {
			Object.keys(item).forEach(key => allFields.add(key));
		}
	});
	
	// Prioritize common important fields
	const priorityFields = ['id', 'identifier', 'name', 'description', 'title', 'code', 'number', 'email', 'address', 'status'];
	const relevantFields = priorityFields.filter(field => allFields.has(field));
	
	// Add other fields up to 10 total
	const remainingFields = Array.from(allFields).filter(field => !priorityFields.includes(field));
	const finalFields = [...relevantFields, ...remainingFields].slice(0, 10);
	
	const simplifyResponse = createSimplifyFunction(finalFields);
	return response.map((item: any) => {
		const simplified = simplifyResponse(item);
		// Flatten nested objects
		return flattenObject(simplified);
	});
}

export async function genericUpsertOperation(
	this: IExecuteFunctions,
	modifiers: PHXModifier[] = [],
	queryFnName: string,
	inputTypeName: string,
	inputFieldName: string,
	item: INodeExecutionData
): Promise<any> {
	const safeModifiers = Array.isArray(modifiers) ? modifiers : [];
	const inputObj: Record<string, any> = {};

	for (const m of safeModifiers)
		inputObj[m.modifier] = m.value;

	if (safeModifiers.length === 0 && item?.json)
		Object.assign(inputObj, item.json);

	const mutation = `
	mutation UpsertOperation($input: ${inputTypeName}) {
		${queryFnName}(${inputFieldName}: $input) {
			id
		}
	}`;

	const variables = { input: inputObj };

	const response = await fetchPHX.call(this, mutation, variables);
	if (response?.status === 408)
		throw new Error("Request timed out. The PHX server took too long to respond. Please try again or check your server performance.");

	if (response?.data?.errors?.length)
		throw new Error(response.data.errors[0].message);

	return response?.data;
}

export async function genericDeleteOperation(
	this: IExecuteFunctions,
	queryFnName: string,
	idFieldName: string, // usually "id" or similar
	item: INodeExecutionData
): Promise<any> {
	const id = item?.json?.[idFieldName];
	if (!id)
		throw new Error(`The required field '${idFieldName}' is missing from the input data. Please ensure the item contains this field before attempting to delete.`);

	const mutation = `
	mutation DeleteOperation($id: String!) {
		${queryFnName}(id: $id) {
			result
			modelId
			message
		}
	}`;

	const variables = { id };

	const response = await fetchPHX.call(this, mutation, variables);
	if (response?.status === 408)
		throw new Error("Request timed out. The PHX server took too long to respond. Please try again or check your server performance.");

	if (response?.errors?.length)
		throw new Error(response.errors[0].message);

	console.log(response?.data);

	return response?.data;
}