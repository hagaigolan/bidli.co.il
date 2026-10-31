// מכרז מקודם — קידום מאושר על ידי בעל האתר, או קידום ששולם בעבר ותוקפו עוד בתוקף
export const isPromoted = (product) =>
  !!product && (
    product.promotionStatus === "approved" ||
    (!!product.featured && (!product.featured_until || new Date(product.featured_until) > new Date()))
  );

// מיון רשימת מכרזים — המקודמים ראשונים (לפי זמן הסיום הקרוב), אחר כך שאר המכרזים בסדר המקורי
export const promotedFirst = (items) => {
  const promoted = items.filter(isPromoted).sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at));
  return [...promoted, ...items.filter(p => !isPromoted(p))];
};