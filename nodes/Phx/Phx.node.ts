import type { IDataObject, IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';


// Functions to add:
// ✅ getProductByIdentifier-> Identifier
// ✅ getAddressByDebitorIdentifier -> Identifier
// ✅ getAddressByCreditorIdentifier -> Identifier
// ✅ getDocumentByIdentifier -> DocumentDefinitionIdentifier, DocumentIdentifier
// ❌ customGraphQlCall -> Have the regular ceritifate field and only query and variables
// V2 -> Define what fields should be returned

import { getAllColumnsOfType, fetchSearchInputFields } from './helper/helper';
import { getProductsOperation } from './operations/getProducts.operation';
import { getAddressesOperation } from './operations/getAddresses.operation';
import { getDocumentsOperation } from './operations/getDocuments.operation';
import { PHXFilter, PHXModifier } from './interfaces';
import { upsertDocumentsOperation } from './operations/upsertDocuments.operation';
import { upsertProductsOperation } from './operations/upsertProducts.operation';
import { upsertAddressesOperation } from './operations/upsertAddresses.operation';

export class Phx implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PHX',
		name: 'phx',
		group: ['transform'],
		icon: 'file:phx.svg',
		version: 16,
		description: 'This is a node to control PHX',
		defaults: {
			name: 'PHX',
		},
		inputs: ['main'] as any,
		outputs: ['main'] as any,
		usableAsTool: true,
		credentials: [
			{
				name: 'phxApi',
				required: true,
			},
		],
		properties: [
			// Step 1: Resource
			{
				displayName: 'Resource',
				noDataExpression: true,
				name: 'resource',
				type: 'options',
				options: [
					{ name: 'Product', value: 'product' },
					{ name: 'Address', value: 'address' },
					{ name: 'Document', value: 'document' },
				],
				default: 'product',
			},
		
			// Step 2: Product operations
			{
				displayName: 'Product Operation',
				noDataExpression: true,
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: { resource: ['product'] },
				},
			options: [
				{ name: 'Get Products', value: 'getProducts', action: 'Get products' },
				{ name: 'Upsert Products', value: 'upsertProducts', action: 'Upsert a product' },
			],
				default: 'getProducts',
			},
		
			// Step 3: Address operations
			{
				displayName: 'Address Operation',
				noDataExpression: true,
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: { resource: ['address'] },
				},
			options: [
				{ name: 'Get Addresses', value: 'getAddresses', action: 'Get addresses' },
				{ name: 'Upsert Addresses', value: 'upsertAddresses', action: 'Upsert an address' },
			],
				default: 'getAddresses',
			},
		
			// Step 4: Document operations
			{
				displayName: 'Document Operation',
				noDataExpression: true,
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: { resource: ['document'] },
				},
			options: [
				{ name: 'Get Documents', value: 'getDocuments', action: 'Get documents' },
				{ name: 'Upsert Documents', value: 'upsertDocuments', action: 'Upsert documents' },
			],
				default: 'getDocuments',
			},
	
			// Query Builder (only visible for the getAll functions)
			{
				displayName: 'Query Builder',
				name: 'queryBuilder',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Query',
				options: [
					{
						displayName: 'Query',
						name: 'query',
						values: [
							{
								displayName: 'Query Name or ID',
								name: 'query',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getAllColumnsOfType',
								},
								description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
								default: '',
							},
							{
								displayName: 'Operator',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Between', value: 'between' },
									{ name: 'Contains', value: 'contains' },
									{ name: 'Endswith', value: 'endswith' },
									{ name: 'Equal', value: 'equal' },
									{ name: 'Greaterthan', value: 'greaterthan' },
									{ name: 'Greaterthanorequal', value: 'greaterthanorequal' },
									{ name: 'In', value: 'in' },
									{ name: 'Isnotnull', value: 'isnotnull' },
									{ name: 'Isnull', value: 'isnull' },
									{ name: 'Lessthan', value: 'lessthan' },
									{ name: 'Lessthanorequal', value: 'lessthanorequal' },
									{ name: 'Notbetween', value: 'notbetween' },
									{ name: 'Notequal', value: 'notequal' },
									{ name: 'Notin', value: 'notin' },
									{ name: 'Numberstartswith', value: 'numberstartswith' },
									{ name: 'Startswith', value: 'startswith' },
								],
								default: 'contains',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
				default: {},
				description: 'Add query for any field',
				displayOptions: {
					show: {
						operation: ["getProducts", "getAddresses", "getDocuments"],
					},
				},
			},

			{
				displayName: 'Input Filter',
				name: 'inputFilters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Filter',
				options: [
					{
						displayName: 'Filter',
						name: 'filter',
						values: [
							{
								displayName: 'Field Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'fetchSearchInputFields',
								},
								description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
								default: '',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							}
						]
					},
				],
				default: {},
				description: 'Add filters for any field',
				displayOptions: {
					show: {
						operation: ["getProducts", "getAddresses", "getDocuments"],
					},
				},
			},
	
			{
				displayName: 'Modifiers',
				name: 'modifiers',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Modifier',
				options: [
					{
						displayName: 'Modifiers',
						name: 'modifier',
						values: [
						{
							displayName: 'Modifiers Name or ID',
							name: 'modifiers',
							type: 'options',
							typeOptions: {
								loadOptionsMethod: 'getAllColumnsOfType',
							},
							description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
							default: '',
						},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
				default: {},
				description: 'Add modifiers for any field',
				displayOptions: {
					show: {
						operation: ["upsertProducts", "upsertAddresses", "upsertDocuments"],
					},
				},
			},

			{
				displayName: 'Identifier',
				name: 'identifier',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['product', 'address'],
						operation: ['getProductByIdentifier', 'getAddressByDebitorIdentifier', 'getAddressByCreditorIdentifier'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {

			// Get operation and process filters
			const operation = this.getNodeParameter('operation', itemIndex) as string;
			
			// Get Query Builder filters
			const rawQueryFilters = (this.getNodeParameter('queryBuilder', itemIndex, { query: [] }) as IDataObject)?.query as IDataObject[] || [];
			const rawInputFilters = (this.getNodeParameter('inputFilters', itemIndex, { filter: [] }) as IDataObject)?.filter as IDataObject[] || [];
			const rawModifiers = (this.getNodeParameter('modifiers', itemIndex, { modifier: [] }) as IDataObject)?.modifier as IDataObject[] || [];

			const queryFilter: PHXFilter[] = rawQueryFilters.map(f => ({
				field: f.query as string,
				operator: f.operator as string,
				value: f.value as string,
			}));

			const inputFilter: PHXFilter[] = rawInputFilters.map(f => ({
				field: f.field as string,
				value: f.value as string,
			}));

			const modifiers: PHXModifier[] = rawModifiers.map(m => ({
				modifier: m.modifiers as string,
				value: m.value as string,
			}));

			try {
				switch (operation) {
					case 'getProducts': 
					
						returnItems.push(
							...await getProductsOperation.call(
							this,
							items[itemIndex],
							queryFilter,
							inputFilter
							)
						);
						break;

					case 'getAddresses': 
						returnItems.push(
							...await getAddressesOperation.call(
							this,
							items[itemIndex],
							queryFilter,
							inputFilter
							)
						);
						break;

					case 'getDocuments': 
						returnItems.push(
							...await getDocumentsOperation.call(
							this,
							items[itemIndex],
							queryFilter,
							inputFilter
							)
						);
						break;

					case 'upsertDocuments':
						returnItems.push(
							...await upsertDocumentsOperation.call(
							this,
							items[itemIndex],
							modifiers
							)
						);
						break;

					case 'upsertProducts':
						returnItems.push(
							...await upsertProductsOperation.call(
							this,
							items[itemIndex],
							modifiers
							)
						);
						break;

					case 'upsertAddresses':
						returnItems.push(
							...await upsertAddressesOperation.call(
							this,
							items[itemIndex],
							modifiers
							)
						);
						break;

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex });
			}
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnItems.push({ json: { error: (error as Error).message }, pairedItem: itemIndex });
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
				}
			}
		}
		return [returnItems];
	}

	methods = {
		loadOptions: {
			async getAllColumnsOfType(this: ILoadOptionsFunctions) {
				return getAllColumnsOfType.call(this);
			},
			async fetchSearchInputFields(this: ILoadOptionsFunctions) {
				return fetchSearchInputFields.call(this);
			}
		}
	}
}
