import { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class PHXApi implements ICredentialType {
	name = 'phxApi';
	displayName = 'PHX API';
	documentationUrl = 'https://github.com/PHX-ERP/phx-n8n-node';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'webUrl',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://your-phx-instance.com',
			description: 'Base URL of your PHX API',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
			description: 'Your PHX API Key',
			typeOptions: {
				password: true,
			},
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.webUrl}}',
			url: '/backend-api/admin-api',
		},
	};
}



