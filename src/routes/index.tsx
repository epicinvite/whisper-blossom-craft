import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import gallery1 from "@/assets/gallery-1.jpg.asset.json";
import gallery2 from "@/assets/gallery-2.jpg.asset.json";
import gallery3 from "@/assets/gallery-3.jpg.asset.json";
import celebrantAsset from "@/assets/celebrant.jpg.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
});

const EVENT_DATE = new Date("2026-08-22T18:00:00+08:00");

const roses = [
  "Tito Ado Montiano", "Tito Mak Montiano", "Daddy Joseph Pintor", "Tito JE Sison",
  "Papa Hernando Alejandro", "Kuya Makmak Montiano", "Jhayden Pintor", "Allan Jay Araman",
  "Kuya Jano Casihan", "Bamboo Realo", "Vhon Neijhel Sison", "Shen Jawili",
  "Aeron Alejandro", "Kuya Andrew Mabunga", "Zeus Bisa", "Gave Pineda",
  "Tatay Boy Montiano", "Papa John John Alejandro",
];

const galleryImgs = [
  gallery1.url,
  gallery2.url,
  gallery3.url,
  gallery1.url,
  gallery2.url,
  gallery3.url,
];

const wishes = [
  { emoji: "🌹", name: "Maria Santos", msg: "Happy 18th, Sheintel! Wishing you a lifetime of joy, adventure, and love. You deserve every beautiful thing this world has to offer! 🌟", date: "June 30, 2026" },
  { emoji: "✨", name: "Ana Reyes", msg: "You have blossomed into the most incredible young woman. May your 18th year be the most magical chapter yet! ✨", date: "July 2, 2026" },
  { emoji: "💫", name: "Carlo Dela Cruz", msg: "Happy 18th! May your dreams soar like butterflies, free and beautiful. So proud of the person you have become! 🦋", date: "July 4, 2026" },
];

function useCountdown() {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, EVENT_DATE.getTime() - now);
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-3 text-primary/70">
      <span className="h-px w-16 bg-primary/40" />
      <span className="text-sm">✦</span>
      <span className="h-px w-16 bg-primary/40" />
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-primary/80 tracking-[0.35em] uppercase text-xs mb-3">
      ✦ {children} ✦
    </p>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center mb-14">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-serif text-5xl md:text-6xl font-light tracking-wide text-foreground mb-4">
        {title}
      </h2>
      <Divider />
    </div>
  );
}

function Nav() {
  const items = [
    ["About", "#about"], ["Details", "#details"], ["Ceremonies", "#ceremonies"],
    ["RSVP", "#rsvp"], ["Wishes", "#wishes"], ["Gallery", "#gallery"], ["Gift", "#gift"],
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/30 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center md:justify-end gap-6 text-xs tracking-[0.3em] uppercase">
        {items.map(([l, h]) => (
          <a key={h} href={h} className="text-foreground/70 hover:text-primary transition-colors">{l}</a>
        ))}
      </div>
    </nav>
  );
}

function Hero() {
  const c = useCountdown();
  const boxes = [
    ["Days", c.days], ["Hours", c.hours], ["Minutes", c.minutes], ["Seconds", c.seconds],
  ] as const;
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 text-center">
      <div className="max-w-4xl mx-auto">
        <p className="text-primary/80 tracking-[0.4em] uppercase text-xs mb-6">You Are Cordially Invited To</p>
        <Divider />
        <h1 className="font-serif text-7xl md:text-9xl font-light tracking-[0.05em] mt-8 mb-4 text-foreground">
          SHEINTEL
        </h1>
        <p className="text-primary tracking-[0.5em] uppercase text-sm md:text-base mb-6">Turns Eighteen</p>
        <p className="font-serif italic text-foreground/70 text-xl md:text-2xl mb-10">
          "A New Chapter Begins"
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-12 text-sm">
          <span className="px-4 py-2 rounded-full border border-border bg-card backdrop-blur-sm">📅 August 22, 2026</span>
          <span className="px-4 py-2 rounded-full border border-border bg-card backdrop-blur-sm">🕕 6:00 PM Onwards</span>
          <span className="px-4 py-2 rounded-full border border-border bg-card backdrop-blur-sm">📍 Green Coral, Batangas City</span>
        </div>
        <p className="text-primary/80 tracking-[0.35em] uppercase text-xs mb-6">Counting Down To The Celebration</p>
        <div className="grid grid-cols-4 gap-3 md:gap-5 max-w-2xl mx-auto mb-12">
          {boxes.map(([label, val]) => (
            <div key={label} className="rounded-xl border border-border bg-card backdrop-blur-md py-5 px-2">
              <div className="font-serif text-4xl md:text-5xl text-primary">{String(val).padStart(2, "0")}</div>
              <div className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-foreground/60 mt-2">{label}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#rsvp" className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium tracking-[0.2em] uppercase text-xs hover:brightness-110 transition">
            Reserve Your Seat
          </a>
          <a href="#about" className="px-8 py-3 rounded-full border border-primary/60 text-primary font-medium tracking-[0.2em] uppercase text-xs hover:bg-primary/10 transition">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Meet the Birthday Girl" title="The Celebrant" />
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />
            <img
              src={celebrantAsset.url}
              alt="Portrait of Sheintel"
              className="relative rounded-2xl w-full object-cover aspect-[3/4] border border-border"
            />
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-primary text-primary-foreground text-xs tracking-[0.3em] uppercase whitespace-nowrap">
              Sheintel · Turning 18
            </div>
          </div>
          <div>
            <Eyebrow>A Beautiful Soul</Eyebrow>
            <h3 className="font-serif text-4xl md:text-5xl font-light mb-6">Welcome to Sheintel's Grand Soirée</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              With hearts full of joy and gratitude, we joyfully announce the 18th birthday celebration of{" "}
              <span className="text-primary font-medium">Sheintel</span> — a young woman of grace, warmth, and boundless spirit.
            </p>
            <p className="text-foreground/80 leading-relaxed mb-6">
              This evening marks not just the turn of eighteen, but the dawn of a magnificent new chapter. Join us as we celebrate the extraordinary person she has become and the limitless horizons that await her.
            </p>
            <blockquote className="border-l-2 border-primary pl-5 italic font-serif text-foreground/70 text-lg">
              "She is clothed in strength and dignity, and she laughs without fear of the future."
              <footer className="not-italic text-primary/80 text-sm mt-2 tracking-widest">— Proverbs 31:25</footer>
            </blockquote>
            <div className="flex flex-wrap gap-2 mt-8 text-xs">
              {["Midnight Blue", "Gold Accents", "Formal Elegance", "August 22, 2026"].map(t => (
                <span key={t} className="px-3 py-1 rounded-full border border-primary/40 text-primary/90">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Details() {
  const items = [
    { icon: "📅", label: "Date", primary: "August 22, 2026", sub: "Saturday" },
    { icon: "🕕", label: "Time", primary: "6:00 PM", sub: "Doors open at 5:30 PM" },
    { icon: "📍", label: "Venue", primary: "Green Coral", sub: "351 Quino, Batangas City" },
    { icon: "🎀", label: "Dress Code", primary: "Formal", sub: "With a Touch of Blue" },
  ];
  return (
    <section id="details" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="The Evening Awaits" title="Event Details" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(i => (
            <div key={i.label} className="rounded-2xl border border-border bg-card backdrop-blur-md p-8 text-center hover:border-primary/50 transition">
              <div className="text-3xl mb-3">{i.icon}</div>
              <div className="text-xs tracking-[0.3em] uppercase text-primary/80 mb-3">{i.label}</div>
              <div className="font-serif text-2xl mb-1">{i.primary}</div>
              <div className="text-sm text-foreground/60">{i.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-foreground/70 mb-4">Green Coral — 351 Quino, Batangas City, Philippines</p>
          <a
            href="https://maps.google.com/?q=Green+Coral+Batangas+City"
            target="_blank" rel="noreferrer"
            className="inline-block px-6 py-2 rounded-full border border-primary/60 text-primary text-xs tracking-[0.25em] uppercase hover:bg-primary/10 transition"
          >
            Get Directions
          </a>
        </div>
      </div>
    </section>
  );
}

function Outfits() {
  const items = [
    { img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=620&fit=crop&auto=format", tag: "Navy Blue Suit", title: "Men's Formal", desc: "A tailored midnight or navy blue suit with crisp white shirt. Add a gold pocket square and sapphire cufflinks for the perfect accent." },
    { img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&h=620&fit=crop&auto=format", tag: "Blue Evening Gown", title: "Women's Elegance", desc: "A floor-length royal blue or cobalt evening gown in satin or chiffon. Let the color speak; keep jewelry minimal and gold." },
    { img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=620&fit=crop&auto=format", tag: "Accessorize Beautifully", title: "Blue Accents", desc: "Prefer neutral gowns or suits? Add navy ties, sapphire earrings, royal blue heels, or a cobalt clutch for the dress code." },
  ];
  return (
    <section id="outfits" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Dress to Impress" title="Outfit Inspiration" />
        <div className="grid md:grid-cols-3 gap-6">
          {items.map(i => (
            <div key={i.title} className="rounded-2xl overflow-hidden border border-border bg-card backdrop-blur-md group">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={i.img} alt={i.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <span className="absolute top-4 left-4 text-xs tracking-[0.25em] uppercase text-primary bg-background/60 px-3 py-1 rounded-full">{i.tag}</span>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl mb-2">{i.title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Ceremonies() {
  return (
    <section id="ceremonies" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Sacred Traditions" title="The 18 Ceremonies" />
        <div className="flex flex-wrap justify-center gap-3 mb-14 text-xs tracking-[0.2em] uppercase">
          {["🌹 18 Roses", "🌸 18 Perfumes", "💎 18 Treasures", "💛 18 Bills"].map(t => (
            <span key={t} className="px-5 py-2 rounded-full border border-primary/40 bg-card">{t}</span>
          ))}
        </div>
        <div className="text-center mb-10">
          <div className="text-3xl mb-3">🌹</div>
          <h3 className="font-serif text-3xl mb-3">18 Roses</h3>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Eighteen special men who will each present a single rose to the debutante, symbolizing respect, admiration, and love.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {roses.map((name, i) => (
            <div key={name} className="rounded-xl border border-border bg-card backdrop-blur-sm p-5 text-center hover:border-primary/50 transition">
              <div className="text-2xl mb-2">🌹</div>
              <div className="text-sm font-medium">{name}</div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-primary/70 mt-2">No. {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Rsvp() {
  const [status, setStatus] = useState<null | "sent">(null);
  return (
    <section id="rsvp" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionHeading eyebrow="Reserve Your Seat" title="RSVP" />
        <form
          onSubmit={(e) => { e.preventDefault(); setStatus("sent"); }}
          className="rounded-2xl border border-border bg-card backdrop-blur-md p-8 md:p-10 space-y-5"
        >
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Full Name *</span>
              <input required className="mt-2 w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Contact Number *</span>
              <input required className="mt-2 w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary" />
            </label>
          </div>
          <label className="block">
            <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Email Address</span>
            <input type="email" className="mt-2 w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary" />
          </label>
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Number of Guests</span>
              <select className="mt-2 w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary">
                {[1,2,3,4,5].map(n => <option key={n}>{n} Guest{n>1?"s":""}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Attendance *</span>
              <select required className="mt-2 w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary">
                <option>✓ Yes, I'll be there!</option>
                <option>✗ Unable to attend</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Message to Celebrant</span>
            <textarea rows={4} className="mt-2 w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary" />
          </label>
          <button className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium tracking-[0.25em] uppercase text-xs hover:brightness-110 transition">
            {status === "sent" ? "Thank You — See You There!" : "Confirm Attendance"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Wishes() {
  return (
    <section id="wishes" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeading eyebrow="Leave Your Love" title="Birthday Wishes" />
        <div className="rounded-2xl border border-border bg-card backdrop-blur-md p-8 mb-10">
          <h3 className="font-serif text-2xl mb-4">Leave Your Wish ✨</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input placeholder="Your name" className="rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary" />
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Choose Emoji</span>
              <div className="flex flex-wrap gap-1">
                {"🎉 🌹 ✨ 💫 🦋 💛 🌸 💎 🎊 ❤️ 🌟 💐".split(" ").map(e => (
                  <button key={e} type="button" className="w-9 h-9 rounded-full border border-border hover:border-primary hover:bg-primary/10 transition">{e}</button>
                ))}
              </div>
            </div>
          </div>
          <textarea rows={3} placeholder="Write your wish for Sheintel..." className="w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary mb-4" />
          <button className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium tracking-[0.25em] uppercase text-xs hover:brightness-110 transition">
            Send My Wish
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {wishes.map(w => (
            <div key={w.name} className="rounded-2xl border border-border bg-card backdrop-blur-md p-6">
              <div className="text-3xl mb-3">{w.emoji}</div>
              <div className="font-serif text-xl mb-2">{w.name}</div>
              <p className="text-foreground/75 text-sm leading-relaxed mb-4">{w.msg}</p>
              <div className="text-[10px] tracking-[0.3em] uppercase text-primary/70">{w.date}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section id="gallery" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Cherished Memories" title="Celebrant Gallery" />
        <div className="columns-1 sm:columns-2 md:columns-3 gap-5 [column-fill:_balance]">
          {galleryImgs.map((src, i) => (
            <div key={i} className="mb-5 break-inside-avoid rounded-2xl overflow-hidden border border-border bg-card backdrop-blur-md">
              <img src={src} alt={`Memory ${i + 1}`} className="w-full object-cover hover:scale-105 transition duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gift() {
  return (
    <section id="gift" className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <SectionHeading eyebrow="A Generous Gesture" title="Monetary Gift" />
        <div className="rounded-2xl border border-border bg-card backdrop-blur-md p-10">
          <p className="font-serif italic text-foreground/80 text-lg mb-8">
            "Your presence is the greatest gift of all. However, if you wish to bless the celebrant with a monetary gift, you may conveniently do so using the QR code below."
          </p>
          <div className="mx-auto w-48 h-48 rounded-2xl bg-foreground/5 border border-border grid place-items-center mb-6">
            <span className="text-6xl">📱</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs tracking-[0.25em] uppercase text-primary/80">
            <span>GCash</span><span>·</span><span>Maya</span><span>·</span><span>Bank Transfer</span>
          </div>
          <div className="font-serif text-2xl mb-1">SHEINTEL A.</div>
          <div className="text-foreground/60 mb-6">09XX XXX XXXX</div>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-xs tracking-[0.25em] uppercase hover:brightness-110 transition">Download QR</button>
            <button className="px-6 py-2 rounded-full border border-primary/60 text-primary text-xs tracking-[0.25em] uppercase hover:bg-primary/10 transition">Copy Number</button>
          </div>
        </div>
        <p className="mt-14 text-foreground/50 text-xs tracking-[0.3em] uppercase">
          With love · Sheintel · August 22, 2026
        </p>
      </div>
    </section>
  );
}

function Index() {
  return (
    <main className="min-h-screen text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <About />
      <Details />
      <Outfits />
      <Ceremonies />
      <Rsvp />
      <Wishes />
      <Gallery />
      <Gift />
    </main>
  );
}
