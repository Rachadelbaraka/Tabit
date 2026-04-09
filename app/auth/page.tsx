"use client";

import { ArrowRight, CloudOff, LockKeyhole, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useApp } from "@/components/app-provider";

export default function AuthPage() {
  const router = useRouter();
  const { auth, error, setError, signIn, signUp, syncState } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (auth.user) {
      router.replace("/dashboard");
    }
  }, [auth.user, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "login") {
        await signIn({ email: form.email, password: form.password });
      } else {
        await signUp(form);
      }
      router.replace("/dashboard");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Action impossible");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-hero panel">
        <span className="eyebrow">Habit tracker + journal + calendrier</span>
        <h1>Un rituel quotidien sobre, rapide et vraiment agréable à ouvrir.</h1>
        <p>
          Tabit combine suivi d’habitudes, journal personnel, calendrier de progression et statistiques de régularité dans une
          interface SaaS premium pensée pour desktop et mobile.
        </p>
        <div className="hero-points">
          <div className="hero-point">
            <Sparkles size={18} />
            Autosave du journal, humeur du jour et cartes fluides.
          </div>
          <div className="hero-point">
            <LockKeyhole size={18} />
            Compte personnel, stockage persistant et synchronisation serveur.
          </div>
          <div className="hero-point">
            <CloudOff size={18} />
            Continuité en mode local quand le backend ne répond plus.
          </div>
        </div>
      </section>

      <section className="auth-card panel">
        <div className="segmented-control">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Connexion
          </button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
            Inscription
          </button>
        </div>

        <div>
          <span className="eyebrow">{mode === "login" ? "Ravi de vous revoir" : "Créer votre espace"}</span>
          <h2>{mode === "login" ? "Retrouvez vos routines" : "Lancez votre suivi premium"}</h2>
          <p>Interface en français, design minimaliste et sauvegarde locale automatique.</p>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label>
              <span>Nom</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
          ) : null}

          <label>
            <span>Email</span>
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>

          <label>
            <span>Mot de passe</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              minLength={6}
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Traitement..." : mode === "login" ? "Entrer dans l’espace" : "Créer le compte"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footnote">
          <span className={`status-badge ${syncState}`}>{syncState === "online" ? "Backend disponible" : "Mode local disponible"}</span>
          <p>Si la synchronisation tombe, vos données récentes restent accessibles en local.</p>
        </div>
      </section>
    </div>
  );
}
