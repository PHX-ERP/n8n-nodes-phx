import type { IExecuteFunctions, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

function isPrimitive(typeStr: string): boolean {
	if (typeStr === undefined || typeStr === null) return false;
	return ["string", "number", "boolean", "float", "date", "int"].includes(typeStr.toLowerCase());
}

export async function fetchPHX(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	query: string,
	variables?: Record<string, any>
): Promise<any> {
	const credentials = await this.getCredentials('phxApi');

	let webUrl = credentials.webUrl as string;
	if (webUrl.endsWith('/'))
		webUrl = webUrl.slice(0, -1);
	webUrl = webUrl + '/backend-api/admin-api';

	const apiKey = credentials.apiKey as string;

	const requestBody: any = { query };
	if (variables)
		requestBody.variables = variables;

	const response = await fetch(webUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify(requestBody),
		// disable TLS verification
		agent: new (require('https').Agent)({ rejectUnauthorized: false }),
	} as any); // `agent` not typed in fetch yet

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${await response.text()}`);
	}

	return response.json();
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
		throw new Error("Failed to get fields via searchInputQuery");

	const fields = response.data?.data?.__type?.inputFields.filter((field: any) => isPrimitive(field.type.name));
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
		throw new Error("Failed to get fields via getAllColumnsOfTypeQuery");

	const fields = response.data?.data?.getAllColumnsOfType.filter((field: any) => isPrimitive(field.dataType));
	return fields.map(
		(field: any) => (
			{ 
				name: field.prop || field.field,
				value: field.prop || field.field
			}
		)
	);
}
