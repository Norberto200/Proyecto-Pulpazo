import { Phone, Mail, User } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/image.png";

export default function MasInformacion() {
  return (
    <div className="p-8 h-full overflow-auto">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Nuestra Historia */}
        <div className="border border-primary/60 rounded-xl bg-[#111111] overflow-hidden">
          {/* Logo centrado en header de la tarjeta */}
          <div className="flex justify-center pt-8 pb-4">
            <ImageWithFallback
              src={logoImg}
              alt="El Pulpazo logo"
              className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]"
            />
          </div>

          <div className="px-10 pb-10">
            <h2 className="text-2xl text-primary text-center tracking-[0.25em] mb-8">
              NUESTRA HISTORIA
            </h2>
            <div className="space-y-4 text-gray-300 text-justify leading-relaxed text-sm">
              <p>
                Nacido de la pasión inquebrantable por el mar y sus tesoros culinarios,{" "}
                <span className="text-primary">El Pulpazo</span> abrió sus puertas con una visión clara:
                ofrecer la experiencia de mariscos más auténtica y sublime de la región.
              </p>
              <p>
                Lo que comenzó como un simple rincón para conocedores, se ha transformado en un santuario gastronómico legendario.
                Cada platillo cuenta la historia de generaciones de pescadores y recetas celosamente guardadas, perfeccionadas con un
                toque de sofisticación moderna.
              </p>
              <p>
                Nuestro compromiso es simple pero riguroso: solo los ingredientes más frescos del océano llegan a nuestras mesas,
                preparados por maestros culinarios que entienden que cada especie requiere un respeto y técnica particular. Bienvenidos a
                la leyenda del mar. Bienvenidos a <span className="text-primary">El Pulpazo</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Contacto Ejecutivo */}
        <div className="border border-primary/40 rounded-xl bg-[#111111] p-6">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h2 className="text-sm tracking-[0.2em] text-primary uppercase">Contacto Ejecutivo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Director General */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-gray-500 tracking-wider uppercase mb-1">Director General</p>
                <p className="text-white font-medium mb-2">Alejandro Montenegro</p>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                  <span className="text-xs">a.montenegro@elpulpazo.com</span>
                </div>
              </div>
            </div>

            {/* Línea Directa */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-gray-500 tracking-wider uppercase mb-1">Línea Directa Gerencia</p>
                <p className="text-white font-medium mb-2">+52 (55) 5555-0199</p>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                  <span className="text-xs">gerencia@elpulpazo.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
