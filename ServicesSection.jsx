import { Laptop, Palette, Users } from "lucide-react";

const services = [
  {
    id: "connect",
    title: "CONNECT",
    emphasis: "K",
    description:
      "Recrutement & Professionnalisation. Integrez des forces commerciales et marketing au sein de votre club. Via notre structure partenaire, nous placons des alternants experts pour piloter votre developpement sans impacter votre tresorerie.",
    Icon: Users,
    className: "md:col-span-2",
  },
  {
    id: "dev",
    title: "DEV",
    emphasis: "V",
    description:
      "Ecosysteme Digital & Conversion. Votre site web doit etre votre premier commercial. Developpement de plateformes sur-mesure, billetteries simplifiees et outils de visibilite sponsor pour maximiser votre ROI.",
    Icon: Laptop,
  },
  {
    id: "studio",
    title: "STUDIO",
    emphasis: "O",
    description:
      "Identite Visuelle & Branding. Donnez a votre club l'image qu'il merite. Creation de chartes graphiques, design de maillots et supports de communication premium pour seduire les plus gros mecènes.",
    Icon: Palette,
    className: "lg:col-span-2",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-[#0a0a0a] px-6 py-24 md:py-32 lg:py-40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">
            Nos 3 piliers de performance
          </p>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-widest text-white md:text-4xl">
            NOS 3 PILIERS DE PERFORMANCE
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map(({ id, title, emphasis, description, Icon, className }) => (
            <article
              key={id}
              className={`group relative flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 transition duration-300 hover:border-blue-500/40 hover:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.35)] ${
                className ?? ""
              }`}
            >
              <div className="absolute right-6 top-6 opacity-20">
                <Icon className="h-10 w-10 text-blue-400" strokeWidth={1.2} />
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold uppercase tracking-widest text-white">
                  {title.slice(0, -1)}
                  <span className="font-black text-blue-400">{emphasis}</span>
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
