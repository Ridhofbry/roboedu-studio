const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = import.meta.env.VITE_ONESIGNAL_REST_API_KEY;

export const sendNotification = async (message, targetGroup = "All") => {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    console.warn("OneSignal Config missing");
    return;
  }

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Basic ${ONESIGNAL_API_KEY}`
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      contents: { en: message },
      headings: { en: "RoboEdu Studio Update" },
      // Dalam produksi nyata, gunakan 'include_external_user_ids' atau 'segments'
      included_segments: ["All"] 
    })
  };

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', options);
    const data = await response.json();
    console.log("Notifikasi Terkirim:", data);
    return data;
  } catch (err) {
    console.error("Gagal kirim notif:", err);
  }
};
