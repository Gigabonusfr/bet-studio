import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, AlertCircle } from "lucide-react";

const LICENSE_KEY = "123456789";

const License = () => {
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim() === LICENSE_KEY) {
      sessionStorage.setItem("license_valid", "true");
      navigate("/welcome");
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(230,25%,8%)] to-[hsl(230,20%,14%)]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-4 p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-6"
      >
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <KeyRound className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Slot Builder — License</h1>
        <p className="text-sm text-muted-foreground text-center">
          Entrez votre clé de licence pour accéder au builder.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => { setKey(e.target.value); setError(false); }}
          placeholder="Clé de licence"
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest"
          autoFocus
        />
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            Clé invalide. Réessayez.
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          Accéder au Builder
        </button>
      </form>
    </div>
  );
};

export default License;
