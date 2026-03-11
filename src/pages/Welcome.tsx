import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, BookOpen, ChevronRight, ExternalLink } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎰</span>
          <span className="text-lg font-bold text-foreground">Stake Engine Builder</span>
        </div>
        <a
          href="https://stakeengine.github.io/math-sdk/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          📚 Documentation <ExternalLink className="h-3 w-3" />
        </a>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Créez votre <span className="text-primary">Slot Game</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Construisez, simulez et exportez votre jeu de machine à sous compatible avec le SDK Stake Engine.
          </p>
        </motion.div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* Amateur Mode */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate("/amateur")}
            className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 text-left transition-all hover:border-primary hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Mode Amateur</h2>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Recommandé</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Guidé pas à pas avec des templates prêts à l'emploi. Choisissez un modèle de jeu (Lines, Ways, Cluster, Scatter) et personnalisez-le simplement.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> 4 templates SDK prêts à l'emploi
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Explications à chaque étape
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Presets d'effets visuels
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Export simplifié
              </li>
            </ul>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
              Commencer <ChevronRight className="h-4 w-4" />
            </div>
          </motion.button>

          {/* Pro Mode */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => navigate("/pro")}
            className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 text-left transition-all hover:border-accent-foreground/50 hover:shadow-[0_0_40px_-10px_hsl(var(--accent)/0.3)]"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-bl-full -z-10 group-hover:bg-accent/10 transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent-foreground">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Mode Pro</h2>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Avancé</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Accès complet à tous les paramètres du builder. Configurez chaque détail : paytable, symboles, effets, animations, audio et contrôles UX.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <span className="text-foreground">✓</span> Contrôle total sur la configuration
              </li>
              <li className="flex items-center gap-2">
                <span className="text-foreground">✓</span> Éditeur de paytable avancé
              </li>
              <li className="flex items-center gap-2">
                <span className="text-foreground">✓</span> Math SDK & simulations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-foreground">✓</span> Export game_config.py complet
              </li>
            </ul>
            <div className="flex items-center gap-2 text-muted-foreground font-semibold text-sm group-hover:gap-3 group-hover:text-foreground transition-all">
              Ouvrir le Builder <ChevronRight className="h-4 w-4" />
            </div>
          </motion.button>
        </div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-xs text-muted-foreground text-center max-w-lg"
        >
          Propulsé par le <a href="https://stakeengine.github.io/math-sdk/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stake Development Kit</a> — Framework Python pour la création, simulation et optimisation de jeux de slots.
        </motion.p>
      </div>
    </div>
  );
}
