export const contactLinks = {
  whatsapp: process.env.NEXT_PUBLIC_RENT4SET_WHATSAPP_URL ?? "",
  telegram: process.env.NEXT_PUBLIC_RENT4SET_TELEGRAM_URL ?? "",
  facebook: process.env.NEXT_PUBLIC_RENT4SET_FACEBOOK_URL ?? "",
  email: process.env.NEXT_PUBLIC_RENT4SET_EMAIL ?? "",
  phone: process.env.NEXT_PUBLIC_RENT4SET_PHONE ?? "",
};

export const hasContactLinks = Boolean(contactLinks.whatsapp || contactLinks.telegram || contactLinks.facebook);
