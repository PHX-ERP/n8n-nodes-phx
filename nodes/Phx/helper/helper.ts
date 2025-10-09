import type { IDataObject, IExecuteFunctions, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

function isPrimitive(typeStr: string): boolean {
	if (typeStr === undefined || typeStr === null) return false;
	return ["string", "number", "boolean", "float", "date", "int"].includes(typeStr.toLowerCase());
}

import https from 'https';

export async function fetchPHX(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	query: string,
	variables?: Record<string, any>
): Promise<any> {
	const credentials = await this.getCredentials('phxApi');

	let webUrl = (credentials.webUrl as string).replace(/\/$/, '');
	webUrl += '/admin-api';

	const apiKey = credentials.apiKey as string;
	const requestBody = variables ? { query, variables } : { query };

	let response: Response;
	try {
		response = await fetch(webUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(requestBody),
			// Disable TLS verification
			agent: new https.Agent({ rejectUnauthorized: false }),
		} as any);
	} catch (error: any) {
		throw new Error(`Unable to connect to PHX server. Please verify the 'Web URL' in your credentials is correct and the server is accessible.`);
	}

	if (!response.ok) {
		// Check if there is a error obj
		const json: any = await response.json();
		const error = json?.errors?.[0]?.message;
		throw new Error(`PHX server returned an error: ${error}. Please check your request parameters and try again.`);
	}

	return await response.json();
}

export async function fetchSearchInputFields(
	this: IExecuteFunctions | ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {

	let resourceName: string = this.getNodeParameter('resource') as string;
	resourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

	const searchInputQuery = 
	`{ 
		__type(name:"${resourceName}SearchInput") { 
			inputFields { 
				name 
				type {
    				name
				} 
			} 
		} 
	}`;

	const response = await fetchPHX.call(this, searchInputQuery);
	if (!response)
		throw new Error("Unable to retrieve field information from PHX. Please check your connection and try again.");

	const fields = response.data?.__type?.inputFields.filter((field: any) => isPrimitive(field.type.name));
	return fields.map(
		(field: any) => (
			{ 
				name: field.name,
				value: field.name
			}
		)
	);
}

export async function getAllColumnsOfType(
	this: IExecuteFunctions | ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {

	let resourceName: string = this.getNodeParameter('resource') as string;
	resourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

	const getAllColumnsOfTypeQuery = 
	`query GetAllColumnsOfType {
		getAllColumnsOfType(type: "${resourceName}") {
			prop
			field
			dataType
		}
	}`;

	const response = await fetchPHX.call(this, getAllColumnsOfTypeQuery);
	if (!response)
		throw new Error("Unable to retrieve column information from PHX. Please check your connection and try again.");

	const fields = response.data?.getAllColumnsOfType.filter((field: any) => isPrimitive(field.dataType));
	return fields.map(
		(field: any) => (
			{ 
				name: field.prop || field.field,
				value: field.prop || field.field
			}
		)
	);
}

export const createSimplifyFunction =
	(includedFields: string[]) =>
	(item: IDataObject): IDataObject => {
		const result: IDataObject = {};

		for (const field of includedFields) {
			if (item[field] === undefined) continue;

			result[field] = item[field];
		}

		return result;
	};

export const flattenObject = (obj: IDataObject, prefix = ''): IDataObject => {
	const flattened: IDataObject = {};

	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			const newKey = prefix ? `${prefix}.${key}` : key;
			
			if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
				Object.assign(flattened, flattenObject(obj[key] as IDataObject, newKey));
			} else {
				flattened[newKey] = obj[key];
			}
		}
	}

	return flattened;
};