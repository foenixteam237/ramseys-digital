"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const services = [
  {
    title: "Installation & mise à jour système",
    description:
      "Installation professionnelle des systèmes d'exploitation et logiciels, maintenance et mises à jour régulières.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="8" rx="1.5" />
        <rect x="4" y="14" width="16" height="6" rx="1.5" />
        <circle cx="7.5" cy="8" r="0.8" fill="#D61F26" stroke="none" />
        <circle cx="7.5" cy="17" r="0.8" fill="#D61F26" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Maintenance & upgrade matériel",
    description:
      "Entretien préventif et correctif, remplacement et optimisation du matériel.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
        <path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7 4.9 19.1M19.1 4.9l-1.4 1.4" />
        <circle cx="12" cy="12" r="4.2" />
      </svg>
    ),
  },
  {
    title: "Solutions digitales",
    description:
      "Développement de solutions numériques, automatisation et optimisation des processus.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
        <path d="M4 17 10 11 14 15 20 7" />
        <path d="M14 7h6v6" />
      </svg>
    ),
  },
  {
    title: "Audit réseaux & systèmes d'information",
    description:
      "Analyse complète des infrastructures, détection des failles et amélioration de la sécurité.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
        <path d="M12 3 4 6.5v5c0 4.7 3.4 8.9 8 10 4.6-1.1 8-5.3 8-10v-5L12 3Z" />
        <path d="M9.5 12.2 11.3 14l3.4-3.6" />
      </svg>
    ),
  },
];

const reasons = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
        <path d="M12 3 4 6.5v5c0 4.7 3.4 8.9 8 10 4.6-1.1 8-5.3 8-10v-5L12 3Z" />
      </svg>
    ),
    title: "Sécurité garantie",
    text: "Des protocoles rigoureux pour protéger vos données et vos infrastructures.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
      </svg>
    ),
    title: "Intervention rapide",
    text: "Une équipe réactive, disponible pour limiter tout impact sur votre activité.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
      </svg>
    ),
    title: "Expertise & professionnalisme",
    text: "Des techniciens formés et rigoureux, à l'écoute de vos contraintes réelles.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
        <path d="M4 12h4l2-5 4 10 2-5h4" />
      </svg>
    ),
    title: "Accompagnement personnalisé",
    text: "Un suivi adapté à chaque client, dans la durée et pas seulement au premier contact.",
  },
];

const testimonials = [
  {
    initials: "A.N.",
    name: "Aïssatou N.",
    role: "Gérante, commerce à Maroua",
    text: "Panne réseau en pleine journée de facturation : l'équipe est arrivée en moins d'une heure et a tout remis en ordre sans que nous perdions une seule donnée.",
  },
  {
    initials: "B.T.",
    name: "Boubakary T.",
    role: "Responsable IT, PME régionale",
    text: "L'audit de notre réseau a révélé des failles que nous ignorions totalement. Le rapport était clair, précis, et les corrections ont été faites sans perturber notre activité.",
  },
  {
    initials: "C.M.",
    name: "Clarisse M.",
    role: "Directrice, cabinet de services",
    text: "Ce qui nous a marqués, c'est le suivi après l'intervention. Ramseys Digital continue de vérifier que tout fonctionne, sans qu'on ait besoin de relancer.",
  },
];

const rackItems: Array<{ label: string; leds: string[] }> = [
  { label: "SRV / core-network", leds: ["on", "on", ""] },
  { label: "SRV / firewall-01", leds: ["red-on", "on", "on"] },
  { label: "SRV / backup-storage", leds: ["on", "", "on"] },
  { label: "SRV / app-cluster", leds: ["on", "on", "on"] },
  { label: "SRV / monitoring", leds: ["red-on", "", "on"] },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    need: "",
  });

  useEffect(() => {
    const revealEls = document.querySelectorAll<HTMLElement>(".reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    const counterEls = document.querySelectorAll<HTMLElement>(".counter");
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target as HTMLElement;
            const target = Number(counter.dataset.target ?? 0);
            let current = 0;
            const step = Math.max(1, Math.floor(target / 60));
            const tick = () => {
              current += step;
              if (current >= target) {
                counter.textContent = String(target);
                return;
              }
              counter.textContent = String(current);
              requestAnimationFrame(tick);
            };
            tick();
            counterObserver.unobserve(counter);
          }
        });
      },
      { threshold: 0.5 },
    );

    revealEls.forEach((el) => revealObserver.observe(el));
    counterEls.forEach((el) => counterObserver.observe(el));

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-rd-deep text-white antialiased">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-rd-deep/70 backdrop-blur-lg">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <a href="#top" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Ramseys Digital logo"
              width={72}
              height={72}
              className="h-9 w-9 rounded-md object-cover"
              priority
            />
            <span className="font-display text-lg font-semibold tracking-tight">
              Ramseys <span className="text-rd-red">Digital</span>
            </span>
          </a>

          <nav className="hidden items-center gap-9 text-sm font-medium text-white/80 md:flex">
            <a href="#services" className="nav-link hover:text-white">
              Services
            </a>
            <a href="#pourquoi" className="nav-link hover:text-white">
              Pourquoi nous
            </a>
            <a href="#stats" className="nav-link hover:text-white">
              Résultats
            </a>
            <a href="#temoignages" className="nav-link hover:text-white">
              Témoignages
            </a>
            <a href="#contact" className="nav-link hover:text-white">
              Contact
            </a>
          </nav>

          <a
            href="#contact"
            className="btn-primary hidden rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] md:inline-flex"
          >
            Demander un devis
          </a>

          <button
            id="burger"
            type="button"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            <span className="h-[2px] w-6 bg-white" />
            <span className="h-[2px] w-6 bg-white" />
            <span className="h-[2px] w-4 self-end bg-white" />
          </button>
        </div>

        <div
          id="mobileMenu"
          className={`${mobileMenuOpen ? "flex" : "hidden"} flex-col gap-1 border-t border-white/5 bg-rd-deep px-6 pb-6 md:hidden`}
        >
          <a href="#services" className="border-b border-white/5 py-3" onClick={() => setMobileMenuOpen(false)}>
            Services
          </a>
          <a href="#pourquoi" className="border-b border-white/5 py-3" onClick={() => setMobileMenuOpen(false)}>
            Pourquoi nous
          </a>
          <a href="#stats" className="border-b border-white/5 py-3" onClick={() => setMobileMenuOpen(false)}>
            Résultats
          </a>
          <a href="#temoignages" className="border-b border-white/5 py-3" onClick={() => setMobileMenuOpen(false)}>
            Témoignages
          </a>
          <a href="#contact" className="py-3" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </a>
        </div>
      </header>

      <main>
        <section id="top" className="relative overflow-hidden pb-28 pt-40 lg:pb-36 lg:pt-48 grid-bg red-glow-radial">
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-10">
            <div className="reveal">
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-rd-red">
                // Solutions IT & services numériques
              </p>
              <h1 className="mb-6 font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
                Des solutions techniques pour <span className="text-rd-red">booster</span> votre activité
              </h1>
              <p className="mb-4 max-w-xl text-lg leading-relaxed text-white/70">
                Ramseys Digital vous accompagne avec des services informatiques fiables, performants et adaptés à vos besoins.
              </p>
              <p className="mb-9 font-display italic text-white/50">« Votre partenaire technologique de confiance »</p>
              <div className="flex flex-wrap gap-4">
                <a href="#contact" className="btn-primary rounded-lg px-7 py-3.5 font-semibold text-white transition-transform hover:scale-[1.03]">
                  Demander un devis
                </a>
                <a href="#contact" className="rounded-lg border border-white/20 px-7 py-3.5 font-semibold transition-colors hover:border-white/50">
                  Nous contacter
                </a>
              </div>
              <div className="mt-12 flex items-center gap-8 text-sm font-mono text-white/50">
                <span>24/7 support</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>Maroua, Cameroun</span>
              </div>
            </div>

            <div className="reveal relative mx-auto w-full max-w-md">
              <div className="rack relative overflow-hidden rounded-2xl p-5">
                <div className="scanline" />
                <div className="mb-4 flex items-center justify-between px-1">
                  <span className="font-mono text-[11px] tracking-widest text-white/40">RACK-01 / DATACENTER</span>
                  <span className="font-mono text-[11px] text-rd-redlight">● ONLINE</span>
                </div>
                <div className="space-y-3">
                  {rackItems.map((item) => (
                    <div key={item.label} className="rack-unit flex items-center justify-between rounded-lg px-4 py-3.5">
                      <span className="font-mono text-xs text-white/50">{item.label}</span>
                      <div className="flex gap-1.5">
                        {item.leds.map((state, index) => (
                          <span key={`${item.label}-${index}`} className={`led ${state}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-mono text-[11px] text-white/30">uptime</span>
                  <span className="font-mono text-[11px] text-white/70">99.98%</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-rd-red/20 blur-3xl" />
            </div>
          </div>
        </section>

        <section id="services" className="border-t border-white/5 py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="reveal mb-16 max-w-2xl">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-rd-red">Nos services</p>
              <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Une expertise technique complète, du poste de travail à l'infrastructure
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <div key={service.title} className="reveal card-hover rounded-2xl border border-rd-line bg-rd-graphite p-7">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-rd-red/10">
                    {service.icon}
                  </div>
                  <h3 className="mb-3 font-display text-lg font-semibold">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-white/60">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pourquoi" className="relative grid-bg border-t border-white/5 py-28">
          <div className="absolute inset-0 bg-rd-deep/60" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <div className="reveal mb-16 max-w-2xl">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-rd-red">Pourquoi Ramseys Digital</p>
              <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">Quatre engagements qui font la différence</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {reasons.map((reason) => (
                <div key={reason.title} className="reveal rounded-2xl border border-rd-line p-7 transition-colors hover:border-rd-red/50">
                  <div className="mb-5">{reason.icon}</div>
                  <h3 className="mb-2 font-display font-semibold">{reason.title}</h3>
                  <p className="text-sm leading-relaxed text-white/60">{reason.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="stats" className="border-t border-white/5 bg-gradient-to-b from-rd-deep to-[#140506] py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
              <div className="reveal">
                <p className="mono-num font-display text-4xl font-bold lg:text-5xl"><span className="counter" data-target="100">0</span>+</p>
                <p className="mt-2 text-sm font-mono text-white/50">clients accompagnés</p>
              </div>
              <div className="reveal">
                <p className="mono-num font-display text-4xl font-bold lg:text-5xl"><span className="counter" data-target="200">0</span>+</p>
                <p className="mt-2 text-sm font-mono text-white/50">interventions réalisées</p>
              </div>
              <div className="reveal">
                <p className="mono-num font-display text-4xl font-bold lg:text-5xl">24/7</p>
                <p className="mt-2 text-sm font-mono text-white/50">disponibilité</p>
              </div>
              <div className="reveal">
                <p className="mono-num font-display text-4xl font-bold lg:text-5xl"><span className="counter" data-target="98">0</span>%</p>
                <p className="mt-2 text-sm font-mono text-white/50">taux de satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        <section id="temoignages" className="border-t border-white/5 py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="reveal mb-16 max-w-2xl">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-rd-red">Témoignages</p>
              <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">Ce que nos clients retiennent de nous</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.initials} className="reveal rounded-2xl border border-rd-line bg-rd-graphite p-7">
                  <p className="mb-4 font-display text-2xl text-rd-red">"</p>
                  <p className="mb-6 text-sm leading-relaxed text-white/70">{testimonial.text}</p>
                  <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rd-red/20 font-display text-sm">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-white/40">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="relative grid-bg overflow-hidden border-t border-white/5 py-28">
          <div className="absolute inset-0 red-glow-radial" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
            <div className="reveal">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-rd-red">Contact</p>
              <h2 className="mb-6 font-display text-3xl font-semibold leading-tight sm:text-4xl">Parlons de votre projet</h2>
              <p className="mb-10 max-w-md text-white/60">
                Une question, un besoin urgent ou un projet à cadrer ? Notre équipe vous répond rapidement.
              </p>

              <div className="space-y-5">
                <a href="tel:+237657828457" className="group flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors group-hover:border-rd-red/60">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
                      <path d="M6 3h4l2 5-2.5 2a12 12 0 0 0 6 6l2-2.5 5 2v4a2 2 0 0 1-2 2C10.5 21.5 2.5 13.5 4 4a2 2 0 0 1 2-1Z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-mono text-xs text-white/40">Téléphone / WhatsApp</p>
                    <p className="font-semibold">+237 657 828 457</p>
                  </div>
                </a>
                <a href="mailto:ramseysdigital@gmail.com" className="group flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors group-hover:border-rd-red/60">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m4 6.5 8 6 8-6" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-mono text-xs text-white/40">Email</p>
                    <p className="font-semibold">ramseysdigital@gmail.com</p>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
                      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z" />
                      <circle cx="12" cy="10" r="2.3" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-mono text-xs text-white/40">Adresse</p>
                    <p className="font-semibold">Maroua, Cameroun</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-4">
                <a href="https://www.facebook.com/share/1Cga7KWbce/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors hover:border-rd-red/60 hover:text-rd-red">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V5.5h-3C11.8 5.5 10 7.3 10 9.5V12H8v3.5h2V21h3.5v-5.5H16l.5-3.5h-3V9.7c0-.5.3-.7.5-.7Z" /></svg>
                </a>
                <a href="https://wa.me/237657828457" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors hover:border-rd-red/60 hover:text-rd-red">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.3c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.1.6.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1l1.7.8c.2.1.4.2.4.3.1.2.1.8-.1 1.3Z" /></svg>
                </a>
                <a href="#" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors hover:border-rd-red/60 hover:text-rd-red">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6v6.3h-4v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9Z" /></svg>
                </a>
              </div>
            </div>

            <form
              className="reveal space-y-5 rounded-2xl border border-rd-line bg-rd-graphite p-8"
              onSubmit={(event) => {
                event.preventDefault();

                const subject = encodeURIComponent(`Demande de devis - ${formData.name}`);
                const body = encodeURIComponent(
                  `Nom complet : ${formData.name}\nEmail ou téléphone : ${formData.contact}\n\nVotre besoin :\n${formData.need}`,
                );

                window.location.href = `mailto:ramseysdigital@gmail.com?subject=${subject}&body=${body}`;
                setSubmitted(true);
              }}
            >
              <div>
                <label className="mb-2 block text-xs font-mono text-white/40">Nom complet</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-lg border border-rd-line bg-rd-deep px-4 py-3 text-sm transition-colors focus:border-rd-red focus:outline-none"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-mono text-white/40">Email ou téléphone</label>
                <input
                  required
                  type="text"
                  value={formData.contact}
                  onChange={(event) => setFormData((current) => ({ ...current, contact: event.target.value }))}
                  className="w-full rounded-lg border border-rd-line bg-rd-deep px-4 py-3 text-sm transition-colors focus:border-rd-red focus:outline-none"
                  placeholder="vous@exemple.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-mono text-white/40">Votre besoin</label>
                <textarea
                  required
                  rows={4}
                  value={formData.need}
                  onChange={(event) => setFormData((current) => ({ ...current, need: event.target.value }))}
                  className="w-full rounded-lg border border-rd-line bg-rd-deep px-4 py-3 text-sm transition-colors focus:border-rd-red focus:outline-none"
                  placeholder="Décrivez votre projet ou votre demande"
                />
              </div>
              <button type="submit" className="btn-primary w-full rounded-lg py-3.5 font-semibold text-white transition-transform hover:scale-[1.02]">
                Envoyer la demande
              </button>
              {submitted ? (
                <p className="text-center text-sm font-mono text-emerald-400">✓ Message prêt — contactez-nous aussi par WhatsApp pour une réponse immédiate.</p>
              ) : null}
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 pt-16 pb-8">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <div>
            <a href="#top" className="mb-4 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Ramseys Digital logo"
                width={72}
                height={72}
                className="h-9 w-9 rounded-md object-cover"
              />
              <span className="font-display text-lg font-semibold">
                Ramseys <span className="text-rd-red">Digital</span>
              </span>
            </a>
            <p className="text-sm leading-relaxed text-white/50">Votre partenaire technologique de confiance.</p>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/40">Liens rapides</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#services" className="transition-colors hover:text-rd-red">Nos services</a></li>
              <li><a href="#pourquoi" className="transition-colors hover:text-rd-red">Pourquoi nous</a></li>
              <li><a href="#temoignages" className="transition-colors hover:text-rd-red">Témoignages</a></li>
              <li><a href="#contact" className="transition-colors hover:text-rd-red">Contact</a></li>
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/40">Coordonnées</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li>+237 657 828 457</li>
              <li>ramseysdigital@gmail.com</li>
              <li>Maroua, Cameroun</li>
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/40">Suivez-nous</p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/share/1Cga7KWbce/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors hover:border-rd-red/60">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V5.5h-3C11.8 5.5 10 7.3 10 9.5V12H8v3.5h2V21h3.5v-5.5H16l.5-3.5h-3V9.7c0-.5.3-.7.5-.7Z" /></svg>
              </a>
              <a href="https://wa.me/237657828457" className="flex h-9 w-9 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors hover:border-rd-red/60">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.3c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.1.6.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1l1.7.8c.2.1.4.2.4.3.1.2.1.8-.1 1.3Z" /></svg>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite transition-colors hover:border-rd-red/60">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6v6.3h-4v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9Z" /></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-white/5 px-6 pt-6 text-center text-xs font-mono text-white/40 lg:px-10">
          © 2026 Ramseys Digital – Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
