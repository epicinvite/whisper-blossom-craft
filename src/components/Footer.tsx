import { Facebook, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative py-20 px-6 bg-background/50 border-t border-border">
      <div className="max-w-5xl mx-auto text-center">
        {/* Brand Name */}
        <h2 className="font-serif text-4xl md:text-5xl font-light tracking-wide text-primary mb-2">
          Epic Invite Co.
        </h2>
        
        {/* Tagline */}
        <p className="text-foreground/80 text-lg mb-8 tracking-wide">
          Your Event. Your Story 💕
        </p>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <a
            href="https://www.facebook.com/people/Epic-Invite-Co/61579603575352/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/10 transition-all duration-300"
          >
            <Facebook className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-medium tracking-wide text-foreground">Facebook</span>
          </a>
          
          <a
            href="https://www.instagram.com/epicinviteco_/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/10 transition-all duration-300"
          >
            <Instagram className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-medium tracking-wide text-foreground">Instagram</span>
          </a>
          
          <a
            href="mailto:epicinviteco@gmail.com"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/10 transition-all duration-300"
          >
            <Mail className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-medium tracking-wide text-foreground">Email</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border/30">
          <p className="text-foreground/60 text-xs tracking-[0.2em] uppercase">
            © 2026 Epic Invite Co. · Your Event. Your Story.
          </p>
        </div>
      </div>
    </footer>
  );
}
