export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get OneSignal credentials from environment
    const ONESIGNAL_APP_ID = process.env.VITE_ONESIGNAL_APP_ID;
    const ONESIGNAL_API_KEY = process.env.VITE_ONESIGNAL_REST_API_KEY;

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
        console.error('OneSignal credentials missing');
        return res.status(500).json({ error: 'OneSignal not configured' });
    }

    // Get notification data from request body
    const { targetRole, message, teamName } = req.body;

    if (!targetRole || !message) {
        return res.status(400).json({ error: 'Missing required fields: targetRole, message' });
    }

    // Prepare notification heading
    const heading = targetRole === 'supervisor'
        ? `📋 Laporan: ${teamName}`
        : `🔔 Update: ${teamName}`;

    // Call OneSignal API
    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONESIGNAL_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                headings: { en: heading },
                contents: { en: message },
                filters: [
                    { field: 'tag', key: 'role', relation: '=', value: targetRole }
                ]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Notification sent via API:', message);
            return res.status(200).json({ success: true, data });
        } else {
            console.error('❌ OneSignal API error:', data);
            return res.status(response.status).json({ error: 'OneSignal API error', details: data });
        }
    } catch (error) {
        console.error('❌ Notification error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
