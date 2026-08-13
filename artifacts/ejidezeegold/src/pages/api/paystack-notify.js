import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference, buyerName, buyerEmail, buyerPhone } = req.body;

  const { error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: process.env.STORE_OWNER_EMAIL,
    subject: `💍 New Order from ${buyerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b8860b;">💍 New Order on Ejidezee Gold!</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold; width: 40%;">Customer Name</td>
            <td style="padding: 10px;">${buyerName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Customer Email</td>
            <td style="padding: 10px;">${buyerEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Customer Phone</td>
            <td style="padding: 10px;">${buyerPhone}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Payment Reference</td>
            <td style="padding: 10px; color: #888; font-size: 12px;">${reference}</td>
          </tr>
        </table>
        <p style="margin-top: 24px; color: #555;">
          Reach out to the customer at <strong>${buyerEmail}</strong> or <strong>${buyerPhone}</strong> to confirm and arrange delivery.
        </p>
      </div>
    `,
  });

  if (error) {
    return res.status(500).json({ error });
  }

  return res.status(200).json({ ok: true });
}