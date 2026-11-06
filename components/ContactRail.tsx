import { MessageCircle, Send } from "lucide-react";
import { contactLinks } from "../lib/contact";

export default function ContactRail() {
  const links = [
    { href: contactLinks.whatsapp || "/#contact", label: "WhatsApp", icon: MessageCircle, external: Boolean(contactLinks.whatsapp) },
    { href: contactLinks.telegram || "/#contact", label: "Telegram", icon: Send, external: Boolean(contactLinks.telegram) },
    { href: contactLinks.facebook || "/#contact", label: "Facebook", icon: null, external: Boolean(contactLinks.facebook) },
  ];
  return <aside aria-label="Social media" className="fixed right-0 top-1/2 z-40 grid -translate-y-1/2 border border-r-0 border-[#343438] bg-[#171719] shadow-xl">{links.map(({ href, label, icon: Icon, external }) => <a key={label} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} aria-label={label} title={label} className="group grid size-11 place-items-center border-b border-[#343438] text-white/70 transition last:border-b-0 hover:bg-[#f54449] hover:text-white sm:size-12">{Icon ? <Icon size={18} /> : <span className="text-xl font-black lowercase">f</span>}<span className="sr-only">{label}</span></a>)}</aside>;
}
