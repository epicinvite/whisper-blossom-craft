import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Sparkles,
  CalendarDays,
  Clock,
  MapPin,
  Shirt,
  Gem,
  Heart,
  Star,
  Flower2,
  PartyPopper,
  Send,
  Check,
  Feather,
} from "lucide-react";
import GoldConfetti from "@/components/GoldConfetti";
import Footer from "@/components/Footer";
import { getSheetConfig, submitRsvpToSheet, type RsvpAttendance } from "@/lib/rsvp-sheet";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
});

const EVENT_DATE = new Date("2026-08-22T18:00:00+08:00");

const perfumes = [
  "Lyka Santos", "Charlene Malavega", "Iriesh Ebrada", "Lena Tolentino",
  "Trisha Acob", "Gail Bacsa", "Kytelyn Sison", "Paola Marco",
  "Cazzandra Seno", "Jade Carandang", "Paris Selda", "Alexandra Nardo",
  "Khey Cabral", "Jennifer Cruz", "Roswell Salazar", "Tita Jessa Mae Sison",
  "Ate Irish Kaye Macatangay", "Trisha Kate Suarez",
];

const treasures = [
  "Althea Espino", "Jhasmine Antenor", "Benedict Dimaano", "Earl Jhon Mhar",
  "Cymon Cerda", "Dj Hernandez", "Bench Evangelista", "Christine Guda",
  "Chrisma Abuan", "Ma'am Yvonna", "Ma'am Annalouse Noble", "Ma'am Marife Agdan",
  "Ma'am Emmaruth Castillo", "Zeus bisa", "Ryle Zariel", "Kristelle Macalood",
  "Laumar Recaro", "Aaliyah Noreen Alejandro",
];

const bills = [
  "Tita Zelle Montiano", "Tita Beng Montiano", "Tita Maricel Pineda", "Daddy Joseph Pintor",
  "Ninang Maureen Pintor", "Ninong Edelwin Pintor", "Ninong Mike Pintor", "Tito We Pintor",
  "Tito Jaypee Pintor", "Tita Jane Rubia", "Ate Ruth Ann Araman", "Papa Aeron Dreje",
  "Ate Khei Alambra", "Tita Krizel Pangan", "Tito Nico Gutrriez", "Tita Laila Macatangay",
  "Ka (tito) Henry Alamag", "Papa John john Alejandro",
];

const roses = [
  "Tito Ado Montiano", "Tito Mak Montiano", "Daddy Joseph Pintor", "Tito JE Sison",
  "Papa Hernando Alejandro", "Kuya Makmak Montiano", "Papito Dante Pangan", "Allan Jay Araman",
  "Kuya Jano Casihan", "Bamboo Realo", "Vhon Neijhel Sison", "Shen Jawili",
  "Aeron Alejandro", "Kuya Andrew Mabunga", "Lolo Eddie Sison", "Gave Pineda",
  "Tatay Boy Montiano", "Papa John john Alejandro",
];

const galleryImgs = [
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/f89f2d04-f5c1-4c46-a054-918a981edab0/gallery-1.jpg",
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/0e111283-cf00-4e3c-917a-32e0b539840e/gallery-2.jpg",
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/8046e75d-329e-4dbb-86b3-e23eaea78404/gallery-3.jpg",
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/18688388-ca67-4cb7-a0b4-7ee1038255ec/gallery-4.jpg",
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/4a7cf609-d1ae-4569-b0d1-671560627398/gallery-5.jpg",
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/cc51bfc8-4373-407c-8bed-90c8afd962bc/gallery-6.jpg",
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/4e331b1b-321f-44fd-8c1b-eca11b3820c6/gallery-7.jpg",
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/7f926543-089f-4b14-97bd-47a7d5c1b84c/gallery-8.jpg",
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/ea3e832d-9c88-4e58-a958-af235de43215/gallery-9.jpg",
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/0596f5a2-c1be-409e-8955-98e5e42de4fb/gallery-10.jpg",
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/acf00d22-98e9-44fe-8032-f23d6e86e2b4/gallery-11.jpg",
  "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/e8e0fdcc-46f5-4571-bd29-8a4476890f2a/gallery-12.jpg",
];

const wishIconMap = { Heart, Sparkles, Star, Flower2, Gem, PartyPopper, Feather, Send } as const;
type WishIconName = keyof typeof wishIconMap;
const wishIconPalette: WishIconName[] = ["Heart", "Sparkles", "Star", "Flower2", "Gem", "PartyPopper", "Feather", "Send"];

type WishRow = { id: string; name: string; message: string; icon: string; created_at: string };
type ChatRow = { id: string; user_name: string; text: string; created_at: string };

function formatWishDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}
function formatChatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

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
      <Sparkles className="w-4 h-4" strokeWidth={1.5} />
      <span className="h-px w-16 bg-primary/40" />
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-primary/80 tracking-[0.35em] uppercase text-xs mb-3 inline-flex items-center gap-2 justify-center">
      <Sparkles className="w-3 h-3" strokeWidth={1.5} />
      <span>{children}</span>
      <Sparkles className="w-3 h-3" strokeWidth={1.5} />
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
    ["RSVP", "#rsvp"], ["Wishes", "#wishes"], ["Chat", "#minichat"], ["Gallery", "#gallery"], ["Gift", "#gift"],
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/30 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center md:justify-end gap-6 text-xs tracking-[0.3em] uppercase">
        {items.map(([l, h]) => (
          <a key={h} href={h} className="text-foreground/70 hover:text-primary transition-colors">{l}</a>
        ))}
        <a href="/rsvp-console" className="text-primary hover:brightness-125 transition-colors inline-flex items-center gap-2">
          <span>Dashboard</span>
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  const c = useCountdown();
  const boxes = [
    ["Days", c.days], ["Hours", c.hours], ["Minutes", c.minutes], ["Seconds", c.seconds],
  ] as const;
  const pills = [
    { Icon: CalendarDays, label: "August 22, 2026" },
    { Icon: Clock, label: "6:00 PM Onwards" },
    { Icon: MapPin, label: "Green Coral, Batangas City" },
  ];
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
          {pills.map(({ Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card backdrop-blur-sm">
              <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
              {label}
            </span>
          ))}
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
              src="/celebrant.png"
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
    { Icon: CalendarDays, label: "Date", primary: "August 22, 2026", sub: "Saturday" },
    { Icon: Clock, label: "Time", primary: "6:00 PM", sub: "Doors open at 5:30 PM" },
    { Icon: MapPin, label: "Venue", primary: "Green Coral", sub: "351 Quino, Batangas City" },
    { Icon: Shirt, label: "Dress Code", primary: "Formal", sub: "With a Touch of Blue" },
  ];
  return (
    <section id="details" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="The Evening Awaits" title="Event Details" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(i => (
            <div key={i.label} className="rounded-2xl border border-border bg-card backdrop-blur-md p-8 text-center hover:border-primary/50 transition">
              <div className="mb-4 flex justify-center">
                <i.Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
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

        <div className="mt-14 max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border bg-card backdrop-blur-md shadow-lg">
          <iframe
            title="Green Coral Resort Map"
            src="https://maps.google.com/maps?q=Green+Coral+Resort,+351+Quino,+Batangas+City,+Batangas,+Philippines&t=m&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

function Outfits() {
  const palette = ["#D9E6F7", "#AFC9E9", "#6FA8DC", "#4B7AA5", "#2F4054"];
  return (
    <section id="outfits" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Dress to Impress" title="Dress Code" />
        <p className="text-center text-foreground/75 max-w-2xl mx-auto -mt-6 mb-12 leading-relaxed">
          Formal attire with a touch of blue. Please dress in one of the shades from our palette below to keep the evening beautifully cohesive.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mb-16">
          {palette.map((c) => (
            <div key={c} className="flex flex-col items-center gap-3">
              <span
                className="block rounded-full ring-1 ring-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]"
                style={{ backgroundColor: c, width: 84, height: 84 }}
                aria-label={`Palette color ${c}`}
              />
              <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/60">{c}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 md:gap-10 max-w-3xl mx-auto">
          {[
            { img: "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/261bf55f-337c-4c8c-83c4-b626e299ce49/dress-male.png", label: "Gentlemen" },
            { img: "https://whisper-blossom-craft.lovable.app/__l5e/assets-v1/64a8bee5-fa51-43d2-8ffc-65bda965e17f/dress-female.png", label: "Ladies" },
          ].map((d) => (
            <div key={d.label} className="rounded-2xl border border-border bg-card backdrop-blur-md overflow-hidden">
              <div className="aspect-[3/4] flex items-end justify-center bg-gradient-to-b from-primary/5 to-transparent p-4">
                <img
                  src={d.img}
                  alt={`${d.label} formal attire illustration`}
                  loading="lazy"
                  className="max-h-full w-auto object-contain"
                />
              </div>
              <div className="text-center py-4 border-t border-border">
                <div className="text-xs tracking-[0.35em] uppercase text-primary">{d.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CeremonyColumn({ title, description, names }: { title: string; description: string; names: string[] }) {
  return (
    <div className="text-center px-2">
      <h3 className="font-serif text-3xl md:text-4xl text-primary mb-3">{title}</h3>
      <p className="italic text-foreground/70 text-sm leading-relaxed max-w-xs mx-auto mb-4">
        {description}
      </p>
      <div className="font-script text-2xl text-primary/80 tracking-widest mb-5">~ ~ ~ ~ ~ ~ ~</div>
      <ul className="space-y-1.5">
        {names.map((name) => (
          <li key={name} className="font-serif text-base md:text-lg text-foreground/90">{name}</li>
        ))}
      </ul>
    </div>
  );
}

function Ceremonies() {
  const ceremonies = [
    {
      title: "18 Perfume",
      description: "Eighteen special ladies who will each offer a spritz of fragrance, representing the sweet memories and well-wishes that will follow the debutante into womanhood.",
      names: perfumes,
    },
    {
      title: "18 Treasure",
      description: "Eighteen cherished friends and family who will present meaningful gifts, symbolizing love, support, and treasured blessings for the debutante's journey ahead.",
      names: treasures,
    },
    {
      title: "18 Bills",
      description: "Eighteen significant loved ones who will share bills as a token of prosperity, abundance, and practical blessings for the debutante's bright future.",
      names: bills,
    },
    {
      title: "18 Roses",
      description: "Eighteen special men who will each present a single rose to the debutante, symbolizing respect, admiration, and love.",
      names: roses,
    },
  ];

  return (
    <section id="ceremonies" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Sacred Traditions" title="The 18 Ceremonies" />
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {ceremonies.map((c) => (
            <CeremonyColumn key={c.title} title={c.title} description={c.description} names={c.names} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Rsvp() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("1");
  const [attendance, setAttendance] = useState<RsvpAttendance>("attending");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState("");

  const resetForm = () => {
    setName("");
    setPhone("");
    setGuests("1");
    setAttendance("attending");
    setMessage("");
  };

  const saveRsvpToSupabase = async (payload: {
    name: string;
    phone: string;
    guests: string;
    message: string;
    attendance: RsvpAttendance;
  }) => {
    const { error } = await supabase.from("rsvp_submissions").insert({
      name: payload.name,
      phone: payload.phone,
      guests: payload.guests,
      message: payload.message,
      status: payload.attendance,
      can_attend: payload.attendance === "attending" ? "Yes" : "",
      cant_attend: payload.attendance === "declined" ? "Yes" : "",
    });

    if (error) {
      throw error;
    }
  };

  // Save submission to localStorage so the dashboard console sees it
  const saveToLocalStorage = (payload: {
    name: string;
    status: string;
    guests: string;
    phone: string;
    message: string;
  }) => {
    try {
      const stored = JSON.parse(localStorage.getItem("rsvp_submissions") || "[]");
      stored.push({
        ...payload,
        id: crypto.randomUUID(),
        addedAt: new Date().toISOString(),
        canAttend: payload.status === "attending" ? "Yes" : "",
        cantAttend: payload.status === "declined" ? "Yes" : "",
      });
      localStorage.setItem("rsvp_submissions", JSON.stringify(stored));
    } catch {
      // localStorage unavailable — silently skip
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setStatus("error");
      setNotice("Please add your name and contact number.");
      setTimeout(() => setNotice(""), 3000);
      return;
    }

    const entry = {
      name: name.trim(),
      phone: phone.trim(),
      guests: attendance === "attending" ? guests : "0",
      message: message.trim(),
      attendance,
    };

    // Always save to localStorage for the dashboard console
    saveToLocalStorage({
      name: entry.name,
      status: entry.attendance,
      guests: entry.guests,
      phone: entry.phone,
      message: entry.message,
    });

    try {
      await saveRsvpToSupabase(entry);
    } catch (_error) {
      console.error("Supabase RSVP submission failed");
    }

    // Write to Google Sheet via the deployed Apps Script
    try {
      await submitRsvpToSheet(entry);
    } catch (_error) {
      // silently ignore sheet errors — attendance is still confirmed
    }

    setStatus("sent");
    setNotice("");
    resetForm();
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <section id="rsvp" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionHeading eyebrow="Reserve Your Seat" title="RSVP" />
        <form
          onSubmit={submit}
          className="rounded-2xl border border-border bg-card backdrop-blur-md p-8 md:p-10 space-y-5"
        >
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Full Name *</span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary"
                placeholder="Your full name"
              />
            </label>
            <label className="block">
              <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Contact Number *</span>
              <input
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary"
                placeholder="Mobile or phone number"
              />
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Number of Seats</span>
              <select
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
                className="mt-2 w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Seat{n>1?"s":""}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Attendance *</span>
              <select
                required
                value={attendance}
                onChange={(event) => setAttendance(event.target.value as RsvpAttendance)}
                className="mt-2 w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary"
              >
                <option value="attending">Yes, I’ll be there</option>
                <option value="declined">Unable to attend</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Message to Celebrant</span>
            <textarea
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-2 w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary"
              placeholder="Share a message for Sheintel"
            />
          </label>
          <button className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium tracking-[0.25em] uppercase text-xs hover:brightness-110 transition inline-flex items-center justify-center gap-2 disabled:opacity-70" disabled={status === "sending"}>
            {status === "sent" ? (
              <>
                <Check className="w-4 h-4" strokeWidth={2} />
                Thank You — See You There!
              </>
            ) : status === "sending" ? (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" strokeWidth={2} />
                Sending RSVP...
              </>
            ) : (
              "Confirm Attendance"
            )}
          </button>
          <p className={`text-sm ${status === "error" ? "text-destructive" : "text-foreground/70"}`}>
            {notice}
          </p>
        </form>
      </div>
    </section>
  );
}

function Wishes() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState<WishIconName>("Heart");
  const [sending, setSending] = useState(false);
  const [items, setItems] = useState<WishRow[]>([]);

  useEffect(() => {
    supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60)
      .then(({ data }) => { if (data) setItems(data as WishRow[]); });

    const channel = supabase
      .channel("wishes-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "wishes" }, (payload) => {
        setItems((prev) => {
          const row = payload.new as WishRow;
          if (prev.some((p) => p.id === row.id)) return prev;
          return [row, ...prev].slice(0, 60);
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || sending) return;
    setSending(true);
    const { error } = await supabase.from("wishes").insert({ name: name.trim(), message: message.trim(), icon });
    setSending(false);
    if (!error) { setMessage(""); }
  };

  return (
    <section id="wishes" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeading eyebrow="Leave Your Love" title="Birthday Wishes" />
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card backdrop-blur-md p-8 mb-10">
          <h3 className="font-serif text-2xl mb-4 inline-flex items-center gap-2">
            Leave Your Wish
            <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary" />
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Choose Icon</span>
              <div className="flex flex-wrap gap-1">
                {wishIconPalette.map((iconName) => {
                  const Ic = wishIconMap[iconName];
                  const active = icon === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      aria-label={`Choose ${iconName} icon`}
                      aria-pressed={active}
                      className={`w-9 h-9 rounded-full border transition inline-flex items-center justify-center text-primary ${active ? "border-primary bg-primary/15" : "border-border hover:border-primary hover:bg-primary/10"}`}
                    >
                      <Ic className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Write your wish for Sheintel..." className="w-full rounded-lg bg-input border border-border px-4 py-3 outline-none focus:border-primary mb-4" />
          <button type="submit" disabled={sending || !name.trim() || !message.trim()} className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium tracking-[0.25em] uppercase text-xs hover:brightness-110 transition inline-flex items-center gap-2 disabled:opacity-50">
            <Send className="w-4 h-4" strokeWidth={1.5} />
            {sending ? "Sending…" : "Send My Wish"}
          </button>
        </form>
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((w) => {
            const Ic = wishIconMap[(w.icon as WishIconName)] ?? Heart;
            return (
              <div key={w.id} className="rounded-2xl border border-border bg-card backdrop-blur-md p-6">
                <div className="mb-3 inline-flex w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Ic className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="font-serif text-xl mb-2">{w.name}</div>
                <p className="text-foreground/75 text-sm leading-relaxed mb-4">{w.message}</p>
                <div className="text-[10px] tracking-[0.3em] uppercase text-primary/70">{formatWishDate(w.created_at)}</div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="md:col-span-3 text-center text-foreground/60 text-sm py-8">
              Be the first to leave a birthday wish for Sheintel.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const imgs = galleryImgs.slice(0, 8);
  return (
    <section id="gallery" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Cherished Memories" title="Celebrant Gallery" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {imgs.map((src, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-border bg-card backdrop-blur-md group relative aspect-[3/4] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] transition duration-500 hover:shadow-[0_20px_50px_-20px_rgba(212,175,55,0.35)] hover:border-primary/50"
            >
              <img
                src={src}
                alt={`Sheintel memory ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition duration-700 group-hover:scale-[1.08]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gift() {
  return (
    <section id="gift" className="relative py-24 px-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/celebrant.png)", backgroundPosition: "center 20%" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-background/45" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/25 to-background/70" aria-hidden />
      <div className="relative max-w-3xl mx-auto text-center">
        <SectionHeading eyebrow="A Generous Gesture" title="Monetary Gift" />
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-md p-10">
          <p className="font-serif italic text-foreground/80 text-lg mb-8">
            "Your presence is the greatest gift of all. However, if you wish to bless the celebrant with a monetary gift, you may conveniently do so using the QR code below."
          </p>
          <div className="mx-auto w-48 h-48 rounded-2xl bg-white border border-border grid place-items-center overflow-hidden mb-6">
            <img src="/qr-michelle.jpg" alt="QR code for monetary gift" className="w-full h-full object-cover" />
          </div>
          <div className="font-serif text-2xl mb-1">Michelle M.</div>
          <div className="text-foreground/60 mb-6">+63 908 083 XXXX</div>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/qr-michelle.jpg"
              download="sheintel-monetary-gift-qr.jpg"
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-xs tracking-[0.25em] uppercase hover:brightness-110 transition"
            >
              Download QR
            </a>
          </div>
        </div>
        <p className="mt-14 text-foreground/70 text-xs tracking-[0.3em] uppercase">
          With love · Sheintel · August 22, 2026
        </p>
      </div>
    </section>
  );
}

function MiniChat() {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<ChatRow[]>([]);
  const [sending, setSending] = useState(false);
  const [selfIds, setSelfIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => { if (data) setMsgs(data as ChatRow[]); });

    const channel = supabase
      .channel("chat-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        setMsgs((prev) => {
          const row = payload.new as ChatRow;
          if (prev.some((p) => p.id === row.id)) return prev;
          return [...prev, row];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const userName = (name.trim() || "Guest").slice(0, 60);
    const body = text.trim().slice(0, 500);
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ user_name: userName, text: body })
      .select()
      .single();
    setSending(false);
    if (!error && data) {
      const row = data as ChatRow;
      setSelfIds((s) => new Set(s).add(row.id));
      setMsgs((prev) => (prev.some((p) => p.id === row.id) ? prev : [...prev, row]));
      setText("");
    }
  };

  return (
    <section id="minichat" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeading eyebrow="Chat With Fellow Guests" title="Mini Chat" />
        <div className="rounded-3xl border border-border bg-card backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-serif text-lg">S</div>
              <div>
                <div className="font-serif text-lg leading-tight">Sheintel's Soirée Lounge</div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-primary/80 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live guest chat
                </div>
              </div>
            </div>
            <span className="hidden sm:inline text-[10px] tracking-[0.3em] uppercase text-primary/70">Live</span>
          </div>

          <div ref={scrollRef} className="h-[380px] overflow-y-auto px-5 py-6 space-y-4 bg-background/40">
            {msgs.length === 0 && (
              <div className="text-center text-foreground/60 text-sm py-8">
                Say something lovely — you'll be the first message in the lounge.
              </div>
            )}
            {msgs.map((m) => {
              const self = selfIds.has(m.id);
              return (
                <div key={m.id} className={`flex ${self ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 border ${
                    self
                      ? "bg-primary text-primary-foreground border-primary rounded-br-sm"
                      : "bg-card text-foreground border-border rounded-bl-sm"
                  }`}>
                    <div className={`text-[10px] tracking-[0.25em] uppercase mb-1 ${self ? "text-primary-foreground/70" : "text-primary/80"}`}>
                      {m.user_name} · {formatChatTime(m.created_at)}
                    </div>
                    <div className="text-sm leading-relaxed">{m.text}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={send} className="border-t border-border p-4 bg-card/60 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="sm:w-40 rounded-full bg-input border border-border px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Say something lovely to Sheintel & guests…"
                className="flex-1 rounded-full bg-input border border-border px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium tracking-[0.25em] uppercase text-xs hover:brightness-110 transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" strokeWidth={1.5} />
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/50 mt-3 text-center inline-flex items-center gap-2 justify-center w-full">
              Be kind · Keep it classy · Midnight blue vibes only
              <Heart className="w-3 h-3 text-primary" strokeWidth={1.5} />
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <main className="min-h-screen text-foreground overflow-x-hidden relative">
      <GoldConfetti />
      <Nav />
      <Hero />
      <About />
      <Details />
      <Outfits />
      <Ceremonies />
      <Rsvp />
      <Wishes />
      <MiniChat />
      <Gallery />
      <Gift />
      <Footer />
    </main>
  );
}
