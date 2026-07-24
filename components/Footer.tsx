import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 pt-16 pb-8 bg-rd-deep">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <Link href="/#top" className="mb-4 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Ramseys Digital logo"
              width={72}
              height={72}
              className="h-9 w-9 rounded-md object-cover"
            />
            <span className="font-display text-lg font-semibold text-white">
              Ramseys <span className="text-rd-red">Digital</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-white/50">
            Votre partenaire technologique de confiance.
          </p>
        </div>

        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/40">
            Liens rapides
          </p>
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <Link href="/#services" className="transition-colors hover:text-rd-red">
                Nos services
              </Link>
            </li>
            <li>
              <Link href="/#pourquoi" className="transition-colors hover:text-rd-red">
                Pourquoi nous
              </Link>
            </li>
            <li>
              <Link href="/#temoignages" className="transition-colors hover:text-rd-red">
                Témoignages
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="transition-colors hover:text-rd-red">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/blog" className="transition-colors hover:text-rd-red">
                Notre Blog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/40">
            Coordonnées
          </p>
          <ul className="space-y-2 text-sm text-white/60">
            <li>+237 657 828 457</li>
            <li>ramseysdigital@gmail.com</li>
            <li>Maroua, Cameroun</li>
          </ul>
        </div>

        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/40">
            Suivez-nous
          </p>
          <div className="flex gap-3">
            <a
              href="https://www.facebook.com/share/1Cga7KWbce/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors hover:border-rd-red/60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 9h3V5.5h-3C11.8 5.5 10 7.3 10 9.5V12H8v3.5h2V21h3.5v-5.5H16l.5-3.5h-3V9.7c0-.5.3-.7.5-.7Z" />
              </svg>
            </a>
            <a
              href="https://wa.me/237657828457"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors hover:border-rd-red/60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.3c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.1.6.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1l1.7.8c.2.1.4.2.4.3.1.2.1.8-.1 1.3Z" />
              </svg>
            </a>
                        <a
              href="https://www.linkedin.com/in/dilane-aanopelba-diebalbe-8167aa274"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors hover:border-rd-red/60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6v6.3h-4v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9Z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/channel/UCZ7oJA0u6vjhtNCXqerWMtQ"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors hover:border-rd-red/60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@ramseys_digital?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors hover:border-rd-red/60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 3c.3 2 1.7 3.6 3.7 3.9v3a7 7 0 0 1-3.7-1.1v6.8a5.8 5.8 0 1 1-5-5.7v3.1a2.7 2.7 0 1 0 1.9 2.6V3h3.1Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-white/5 px-6 pt-6 text-center text-xs font-mono text-white/40 lg:px-10">
        © 2026 Ramseys Digital – Tous droits réservés.
      </div>
    </footer>
  );
}
