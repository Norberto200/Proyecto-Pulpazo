import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Lock, ArrowRight, Facebook, Instagram, Eye, EyeOff } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/image.png";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    navigate("/dashboard/mapa-mesas");
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "radial-gradient(ellipse at 60% 40%, #1a1500 0%, #0d0d0d 55%, #080808 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      <div
        className="relative w-full max-w-md rounded-2xl px-10 py-10"
        style={{
          background: "rgba(22, 18, 8, 0.72)",
          border: "1px solid rgba(212, 175, 55, 0.18)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.08)",
          backdropFilter: "blur(18px)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="rounded-full overflow-hidden border-2 border-[#D4AF37]/60 w-28 h-28 flex-shrink-0"
            style={{ boxShadow: "0 0 28px rgba(212,175,55,0.45)" }}
          >
            <ImageWithFallback
              src={logoImg}
              alt="El Pulpazo logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-[0.22em] mt-4" style={{ color: "#D4AF37" }}>
            EL PULPAZO
          </h1>
          <p className="text-sm tracking-wider text-gray-400 mt-1">Management System Access</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5 mt-8">
          <div>
            <label className="block text-[10px] tracking-[0.18em] text-gray-400 uppercase mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
              </div>
              <input
                type="email"
                required
                placeholder="admin@elpulpazo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d0d0d]/60 border border-[#D4AF37]/25 rounded-lg py-3.5 pl-11 pr-4 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-[#D4AF37]/70 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.18em] text-gray-400 uppercase mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d0d0d]/60 border border-[#D4AF37]/25 rounded-lg py-3.5 pl-11 pr-12 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-[#D4AF37]/70 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D4AF37] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] hover:bg-[#C9A830] disabled:bg-gray-600 text-black py-3.5 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 group mt-2"
          >
            <span className="tracking-[0.18em] text-sm font-semibold">
              {loading ? "INICIANDO..." : "INICIAR SESIÓN"}
            </span>
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  );
}
