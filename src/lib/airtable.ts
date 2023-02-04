import { AIRTABLE_API_TOKEN, AIRTABLE_APP_ID } from '@/config';

export async function insertDonationIntoAirtable(
	name: string,
	message: string,
	amount: number
) {
	const url = `https://api.airtable.com/v0/${AIRTABLE_APP_ID}/Donations`;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${AIRTABLE_API_TOKEN}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			records: [
				{
					fields: {
						name,
						message,
						amount
					}
				}
			]
		})
	});

	return response.json();
}
