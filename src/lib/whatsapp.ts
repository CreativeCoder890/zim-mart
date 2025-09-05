const GRAPH_BASE = 'https://graph.facebook.com/v17.0';

type SendWhatsAppArgs = {
	toE164: string; // e.g. 2637XXXXXXXX
	message: string;
};

export async function sendWhatsAppMessage({ toE164, message }: SendWhatsAppArgs) {
	const token = process.env.WHATSAPP_TOKEN;
	const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
	if (!token || !phoneNumberId) {
		console.warn('WhatsApp env not configured; skipping send');
		return { skipped: true } as const;
	}
	const url = `${GRAPH_BASE}/${phoneNumberId}/messages`;
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			messaging_product: 'whatsapp',
			to: toE164,
			type: 'text',
			text: { body: message },
		}),
	});
	if (!res.ok) {
		const errTxt = await res.text();
		console.error('WhatsApp send error', res.status, errTxt);
		throw new Error(`WhatsApp send failed: ${res.status}`);
	}
	return await res.json();
}


