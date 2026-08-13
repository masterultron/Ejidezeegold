import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface PickupAddress {
  name: string;
  line1: string;
  line2: string;
  area: string;
  city: string;
}

const formatAddressHtml = (a: PickupAddress) => `
  <div style="background: #fafafa; border-left: 4px solid #b8860b; padding: 16px 20px; margin: 16px 0; line-height: 1.7;">
    <strong>${a.name}</strong><br/>
    ${a.line1}<br/>
    ${a.line2}<br/>
    ${a.area}<br/>
    ${a.city}
  </div>
`;

const formatAddressText = (a: PickupAddress) =>
  `${a.name}, ${a.line1}, ${a.line2}, ${a.area}, ${a.city}`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const {
      reference,
      buyerName,
      buyerEmail,
      buyerPhone,
      items,
      currency,
      fulfillment,        // 'pickup' | 'delivery'
      pickupAddress,      // PickupAddress | null
      deliveryAddress,    // string | null
    } = JSON.parse(event.body || '{}');

    const isPickup = fulfillment === 'pickup';

    // Build items table rows (shared by both emails)
    const itemRows =
      items
        ?.map(
          (item: { name: string; quantity: number; price: string }) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px;">${item.name}</td>
          <td style="padding: 10px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; text-align: right;">${item.price}</td>
        </tr>`
        )
        .join('') ?? '';

    // ─── 1. EMAIL TO VENDOR (store owner) ─────────────────────────────────
    const vendorEmail = resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.STORE_OWNER_EMAIL!,
      subject: `💍 New ${isPickup ? 'Pickup' : 'Delivery'} Order from ${buyerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b8860b;">💍 New Order on Ejidezee Gold!</h2>

          <div style="background: ${isPickup ? '#fff8e1' : '#fff3cd'}; border: 1px solid ${isPickup ? '#b8860b' : '#ffc107'}; padding: 12px 16px; margin: 16px 0;">
            <strong>Fulfillment:</strong> ${isPickup ? '🏬 Pickup' : '🚚 Delivery'}
            ${
              !isPickup
                ? `<br/><strong style="color: #b00;">⚠️ Action required:</strong> Contact the customer to quote a delivery fee and arrange payment.`
                : ''
            }
          </div>

          ${
            !isPickup && deliveryAddress
              ? `
          <h3 style="color: #555; margin-top: 24px;">Delivery Address</h3>
          <div style="background: #fafafa; border-left: 4px solid #b8860b; padding: 16px 20px; margin: 16px 0; line-height: 1.7;">
            ${deliveryAddress.replace(/\n/g, '<br/>')}
          </div>
          `
              : ''
          }

          <h3 style="color: #555; margin-top: 24px;">Customer Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold; width: 40%;">Name</td>
              <td style="padding: 10px;">${buyerName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold;">Email</td>
              <td style="padding: 10px;">${buyerEmail}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold;">Phone</td>
              <td style="padding: 10px;">${buyerPhone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Payment Reference</td>
              <td style="padding: 10px; color: #888; font-size: 12px;">${reference}</td>
            </tr>
          </table>

          <h3 style="color: #555; margin-top: 24px;">Items Ordered (${currency})</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <p style="margin-top: 24px; color: #555;">
            Reach out to the customer at <strong>${buyerEmail}</strong> or
            <strong>${buyerPhone}</strong> to confirm
            ${isPickup ? 'pickup timing' : 'and arrange delivery + fee'}.
          </p>
        </div>
      `,
    });

    // ─── 2. EMAIL TO BUYER (varies by fulfillment) ────────────────────────
    const buyerSubject = isPickup
      ? '💍 Your Ejidezee Gold Order — Pickup Details'
      : '💍 Your Ejidezee Gold Order — Delivery Update Coming Soon';

    const buyerHtml = isPickup
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b8860b;">Thank you for your order, ${buyerName}!</h2>
          <p>Your payment has been received. You can pick up your order at the address below:</p>
          ${pickupAddress ? formatAddressHtml(pickupAddress) : '<p>(Pickup address will follow shortly.)</p>'}

          <h3 style="color: #555; margin-top: 24px;">Items Ordered (${currency})</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <p style="margin-top: 24px; color: #555; font-size: 13px;">
            Payment Reference: <span style="color: #888;">${reference}</span>
          </p>
          <p style="margin-top: 16px; color: #555;">
            If you have any questions, just reply to this email.
          </p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b8860b;">Thank you for your order, ${buyerName}!</h2>
          <p>Your payment has been received. You chose <strong>delivery</strong>, so the next step is:</p>

          <div style="background: #fff8e1; border-left: 4px solid #b8860b; padding: 16px 20px; margin: 16px 0; line-height: 1.6;">
            We will contact you shortly at <strong>${buyerEmail}</strong> or <strong>${buyerPhone}</strong>
            to confirm your delivery address and the applicable <strong>delivery fee</strong>.
            The delivery fee is paid separately, after this confirmation.
          </div>

          ${
            deliveryAddress
              ? `
          <h3 style="color: #555; margin-top: 24px;">Delivery Address You Provided</h3>
          <div style="background: #fafafa; border-left: 4px solid #b8860b; padding: 16px 20px; margin: 16px 0; line-height: 1.7;">
            ${deliveryAddress.replace(/\n/g, '<br/>')}
          </div>
          `
              : ''
          }

          <h3 style="color: #555; margin-top: 24px;">Items Ordered (${currency})</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <p style="margin-top: 24px; color: #555; font-size: 13px;">
            Payment Reference: <span style="color: #888;">${reference}</span>
          </p>
          <p style="margin-top: 16px; color: #555;">
            If you have any questions, just reply to this email.
          </p>
        </div>
      `;

    const customerEmail = resend.emails.send({
      from: 'onboarding@resend.dev',
      to: buyerEmail,
      subject: buyerSubject,
      html: buyerHtml,
    });

    // Send both in parallel
    const [vendorRes, buyerRes] = await Promise.allSettled([vendorEmail, customerEmail]);

    // Log any failures (don't block the response — payment already succeeded)
    if (vendorRes.status === 'rejected') {
      console.error('Vendor email failed:', vendorRes.reason);
    }
    if (buyerRes.status === 'rejected') {
      console.error('Buyer email failed:', buyerRes.reason);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        vendorSent: vendorRes.status === 'fulfilled',
        buyerSent: buyerRes.status === 'fulfilled',
      }),
    };
  } catch (err) {
    console.error('order-notify error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};