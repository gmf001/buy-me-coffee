import type { NextApiRequest, NextApiResponse } from 'next';
import { AIRTABLE_API_TOKEN, AIRTABLE_APP_ID } from '@/config';
import { AirtableRecord } from '@/types';

export const config = {
	runtime: 'edge'
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).end('Method Not Allowed');
	}

	const response = await fetch(
		`https://api.airtable.com/v0/${AIRTABLE_APP_ID}/donations?maxRecords=3&view=Grid%20view`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${AIRTABLE_API_TOKEN}`,
				'Content-Type': 'application/json'
			}
		}
	);

	const data = (await response.json()) as AirtableRecord;

	return new Response(JSON.stringify(data.records), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
