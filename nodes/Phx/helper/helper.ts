import type { IExecuteFunctions, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import axios, { AxiosResponse } from 'axios';
import https from 'https';

function isPrimitive(typeStr: string): boolean {
	if (typeStr === undefined || typeStr === null) return false;
	return ["string", "number", "boolean", "float", "date", "int"].includes(typeStr.toLowerCase());
}

export async function fetchAxios(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	query: string,
	variables?: Record<string, any>
): Promise<AxiosResponse<any>> {
	const credentials = await this.getCredentials('phxApi');

	let webUrl = credentials.webUrl as string;
	if (webUrl.endsWith('/'))
		webUrl = webUrl.slice(0, -1);
	webUrl = webUrl + '/backend-api/admin-api';

	const apiKey = credentials.apiKey as string;

	let httpsAgent = new https.Agent({ rejectUnauthorized: false });
	let response;

	try {
		const requestBody: any = { query };
		if (variables)
			requestBody.variables = variables;

		response = await axios.post(
			`${webUrl}`,
			requestBody,
			{
				headers: { Authorization: `Bearer ${apiKey}` },
				httpsAgent,
			},
		);
		
		return response;

	} catch (error: any) {
		throw new Error(error.message);
	}
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

	const response = await fetchAxios.call(this, searchInputQuery);
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

	const response = await fetchAxios.call(this, getAllColumnsOfTypeQuery);
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
