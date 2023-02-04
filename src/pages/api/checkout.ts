import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { STRIPE_API_KEY, DONATION_IN_CENTS } from '@/config';

const stripe = new Stripe(STRIPE_API_KEY, {
	apiVersion: '2022-08-01'
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).end('Method Not Allowed');
	}

	const quantity = req.body.quantity || 1;
	const message = req.body.message || '';
	const name = req.body.name || 'Anonymous';

	try {
		const session = await stripe.checkout.sessions.create({
			metadata: {
				name,
				message
			},
			payment_method_types: ['card'],
			mode: 'payment',
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: 'Donation'
						},
						unit_amount: DONATION_IN_CENTS
					},
					quantity
				}
			],
			success_url: `${req.headers.origin}/thankyou`,
			cancel_url: `${req.headers.origin}/cancel`
		});

		const url = session.url;

		if (url) {
			return res.status(200).json({ url });
		}

		return res.status(500).end('Something went wrong');
	} catch (e) {
		console.error(`error creating session`, e);
		return res.status(500).end('Something went wrong');
	}
}
