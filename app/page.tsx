import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, PackageCheck, Search, UsersRound } from "lucide-react";
import ContactRail from "../components/ContactRail";
import HomeHeader from "../components/HomeHeader";
import HomeEquipmentCard from "./components/HomeEquipmentCard";
import RentalFooter from "../components/RentalFooter";
import { Button } from "../components/ui/button";
import { getPublicCatalog } from "../lib/catalog";
import { getViewer } from "../lib/viewer";

const capabilities = [
  { number: "01", title: "Camera and lenses", body: "Cinema bodies, lens sets, monitoring and production media." },
  { number: "02", title: "Lighting and grip", body: "Fixtures, modifiers, stands and location-ready support." },
  { number: "03", title: "Transport and power", body: "Plan pickup, delivery requirements and demanding locations." },
  { number: "04", title: "Production support", body: "Build a clear request for equipment, logistics and crew needs." },
];

export default async function Home() {
  const [{ items }, viewer] = await Promise.all([getPublicCatalog(), getViewer()]);
  const featured = items.slice(0, 4);
  const categories = Array.from(new Set(items.map((item) => item.category.trim()))).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const heroImage = items.find((item) => item.featured_media || item.media?.[0]);
  const heroImageUrl = heroImage?.featured_media || heroImage?.media?.[0];

  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white">
    <HomeHeader role={viewer.role} quoteCount={viewer.quoteCount} favoriteCount={viewer.favoriteCount} />
    <ContactRail />

    <section
      className="relative isolate min-h-[540px] overflow-hidden bg-[#171719] bg-cover bg-center sm:min-h-[620px]"
      style={heroImageUrl ? { backgroundImage: `url("${heroImageUrl}")` } : undefined}
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,8,9,.94)_0%,rgba(8,8,9,.78)_43%,rgba(8,8,9,.4)_72%,rgba(8,8,9,.58)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="mx-auto flex min-h-[540px] max-w-7xl flex-col justify-center px-4 py-16 sm:min-h-[620px] sm:px-6">
        <div className="max-w-3xl text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff555a]">Cambodia film equipment rental</p>
          <h1 className="mt-5 text-5xl font-black leading-[.95] tracking-[-0.04em] drop-shadow-lg sm:text-7xl lg:text-8xl">Find the gear.<br />Build the set.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">Search cameras, lenses, lighting, grip and production equipment for your next shoot.</p>
        </div>

        <form action="/catalog" className="mt-10 grid max-w-5xl overflow-hidden bg-white shadow-2xl sm:grid-cols-[1fr_210px_150px]">
          <label className="flex h-16 items-center gap-3 px-6">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input name="q" className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-500" placeholder="Search cameras, lenses, lighting or support…" />
          </label>
          <select name="category" className="h-16 border-y border-slate-200 bg-white px-5 text-xs font-bold uppercase text-slate-900 outline-none sm:border-x sm:border-y-0">
            <option value="all">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <button className="h-16 bg-[#f54449] text-sm font-bold uppercase text-white transition hover:bg-[#ff5a5f]">Search</button>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/65">
          <span className="mr-1 font-bold uppercase">Popular:</span>
          {categories.slice(0, 4).map((category) => <Link key={category} href={`/catalog?category=${encodeURIComponent(category)}`} className="rounded-full border border-white/25 bg-black/25 px-4 py-2 text-white backdrop-blur-sm transition hover:border-[#f54449] hover:bg-[#f54449]">{category}</Link>)}
        </div>
      </div>
    </section>

    <nav aria-label="Equipment categories" className="border-y border-[#303034] bg-[#171719] text-white">
      <div className="w-full overflow-x-auto">
        <div className="mx-auto flex min-w-max w-fit items-stretch">
          <Link href="/catalog" className="shrink-0 border-x border-[#303034] bg-[#f54449] px-5 py-5 text-[11px] font-bold uppercase tracking-wide text-white">All equipment</Link>
          {categories.map((category) => <Link key={category} href={`/catalog?category=${encodeURIComponent(category)}`} className="shrink-0 border-r border-[#303034] px-5 py-5 text-[11px] font-bold uppercase tracking-wide text-white/75 transition hover:bg-[#242427] hover:text-white">{category}</Link>)}
        </div>
      </div>
    </nav>

    <section className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6">
      <div className="flex items-end justify-between">
        <div><p className="text-xs font-bold uppercase text-[#f54449]">Equipment catalog</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Ready for your next shoot</h2></div>
        <Link href="/catalog" className="hidden items-center gap-2 text-xs font-bold uppercase hover:text-[#f54449] sm:flex">View all gear <ArrowRight size={14} /></Link>
      </div>
      {featured.length ? <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((item) => <HomeEquipmentCard key={item.id} item={item} userId={viewer.role === "customer" ? viewer.user?.id : undefined} allowQuote={viewer.role !== "admin"} />)}
      </div> : <div className="mt-6 border border-dashed border-slate-300 px-6 py-14 text-center text-sm text-slate-500 dark:border-[#3a3a3e] dark:text-[#929299]">Published equipment will appear here.</div>}

      <div className="mt-10 grid bg-[#f4f3ef] text-slate-950 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6"><p className="text-[11px] font-bold uppercase text-[#f54449]">Built around the shoot</p><h3 className="mt-4 text-lg font-bold">Phnom Penh pickup</h3><p className="mt-2 text-xs text-slate-500">Plan dates and handover details in one request.</p></div>
        <div className="p-6"><MapPin size={18} /><h3 className="mt-4 text-lg font-bold">Location planning</h3><p className="mt-2 text-xs text-slate-500">Share the shoot location and logistics requirements.</p></div>
        <div className="p-6"><UsersRound size={18} /><h3 className="mt-4 text-lg font-bold">Production context</h3><p className="mt-2 text-xs text-slate-500">Include crew, delivery and special production notes.</p></div>
        <div className="p-6"><PackageCheck size={18} /><h3 className="mt-4 text-lg font-bold">One complete request</h3><p className="mt-2 text-xs text-slate-500">Dates, equipment and project details stay together.</p></div>
      </div>
    </section>

    <section id="how-it-works" className="bg-slate-100 dark:bg-[#1a1a1d]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-xs font-bold uppercase text-[#f54449]">A faster rental workflow</p>
        <h2 className="mt-4 text-3xl font-black sm:text-4xl">From equipment list to quote-ready set.</h2>
        <p className="mt-3 text-slate-600 dark:text-[#a5a5ac]">Build one request and give KUDU the context needed to coordinate availability and logistics.</p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">{["Choose equipment", "Share the production plan", "Copy the quote request"].map((title, index) => <div key={title} className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f54449] font-bold text-white">{index + 1}</span><div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-[#96969d]">{index === 0 ? "Browse by category and add the gear your shoot needs." : index === 1 ? "Add dates, location and any special production requirements." : "Review one complete message and send it through your preferred channel."}</p></div></div>)}</div>
      </div>
    </section>

    <section id="support" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex items-end justify-between gap-6"><div><p className="text-xs font-bold uppercase text-[#f54449]">Equipment and support</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">Everything the production needs.</h2></div><Link href="/catalog" className="hidden text-xs font-bold uppercase hover:text-[#f54449] sm:block">Explore catalog →</Link></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{capabilities.map((item) => <div key={item.number} className="border border-slate-200 bg-white p-6 dark:border-[#343438] dark:bg-[#1a1a1d]"><p className="text-xs font-bold text-[#f54449]">{item.number}</p><h3 className="mt-6 text-xl font-bold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500 dark:text-[#9999a0]">{item.body}</p></div>)}</div>
      <div className="mt-12 grid gap-6 bg-slate-100 p-7 text-slate-950 dark:bg-[#f4f3ef] md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs font-bold uppercase text-[#f54449]">Build around the production</p><h2 className="mt-3 text-2xl font-black sm:text-3xl">Start with the equipment. Add the context.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Create a saved quote list, share it with collaborators and prepare a complete rental request when the shoot is ready.</p></div><Button asChild size="lg"><Link href={viewer.role === "customer" ? "/account" : "/register"}><CheckCircle2 size={17} />Start a quote</Link></Button></div>
    </section>

    <RentalFooter />
  </main>;
}
