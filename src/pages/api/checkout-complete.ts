import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from '@/config';
import { buffer } from 'micro';
import { STRIPE_WEBHOOK_SECRET } from '../../config/index';
import { insertDonationIntoAirtable } from '@/lib/airtable';

const stripe = new Stripe(STRIPE_API_KEY, {
	apiVersion: '2022-08-01'
});

export const config = {
	api: {
		bodyParser: false
	}
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).end('Method Not Allowed');
	}

	const signature = req.headers['stripe-signature'] as string;

	if (!signature) {
		return res.status(400).json({ message: 'Missing Stripe signature' });
	}

	let event: Stripe.Event;
	const buf = await buffer(req);

	try {
		event = stripe.webhooks.constructEvent(
			buf,
			signature,
			STRIPE_WEBHOOK_SECRET
		);
	} catch (e) {
		console.error(`Webhook signature verification failed.`, e);
		return res.status(400).json({ message: 'Invalid signature' });
	}

	if (event.type !== 'checkout.session.completed') {
		return res.status(400).json({ message: 'Invalid event type' });
	}

	const metadata = (
		event.data.object as { metadata: { name: string; message: string } }
	).metadata;

	console.log({ metadata });
	const amount =
		(event.data.object as { amount_total: number }).amount_total / 100;

	await insertDonationIntoAirtable(metadata.name, metadata.message, amount);

	return res.status(200).json({ message: 'success' });
}
