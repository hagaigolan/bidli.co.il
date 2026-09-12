// התראות בתום האתר — יצירת רשומת התראה עבור משתמש, להצגה בפעמון שבכותרת.
// לעולם לא זורק — כשל בהתראה בתוך האתר לא צריך להפיל תהליך קיים.
export async function createAppNotification(base44, data) {
  try {
    await base44.asServiceRole.entities.AppNotification.create({
      recipient_email: (data.recipient_email || "").trim().toLowerCase(),
      recipient_name: data.recipient_name || "",
      type: data.type || "outbid",
      title: data.title || "",
      body: data.body || "",
      product_id: data.product_id || "",
      product_title: data.product_title || "",
      product_image_url: data.product_image_url || "",
      link: data.link || "",
      is_read: false,
    });
    return true;
  } catch {
    return false;
  }
}