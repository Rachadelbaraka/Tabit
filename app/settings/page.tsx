"use client";

import { Download, RefreshCcw, Upload } from "lucide-react";

import { ProtectedShell } from "@/components/protected-shell";
import { useApp } from "@/components/app-provider";

export default function SettingsPage() {
  const { exportData, importData, refreshRemote, snapshot, syncState, updatePreferences } = useApp();

  async function handleExport() {
    const content = await exportData();
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tabit-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    await importData(text);
  }

  return (
    <ProtectedShell title="Paramètres" subtitle="Personnalisez le thème, gérez vos sauvegardes JSON et surveillez l’état de synchronisation.">
      <section className="settings-grid">
        <article className="panel form-card">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Apparence</span>
              <h2>Thème</h2>
            </div>
          </div>
          <div className="theme-grid">
            {[
              { value: "light", label: "Clair" },
              { value: "dark", label: "Sombre" },
              { value: "system", label: "Système" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={`theme-option ${snapshot.preferences.theme === option.value ? "active" : ""}`}
                onClick={() => updatePreferences({ theme: option.value as "light" | "dark" | "system" })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </article>

        <article className="panel form-card">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Rappels</span>
              <h2>Notifications</h2>
            </div>
          </div>
          <label className="toggle-row">
            <span>Activer les rappels</span>
            <input
              type="checkbox"
              checked={snapshot.preferences.reminders}
              onChange={(event) => updatePreferences({ reminders: event.target.checked })}
            />
          </label>
          <label>
            <span>Heure du rappel</span>
            <input
              type="time"
              value={snapshot.preferences.reminderTime}
              onChange={(event) => updatePreferences({ reminderTime: event.target.value })}
            />
          </label>
        </article>

        <article className="panel form-card">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Sauvegardes</span>
              <h2>Import / export JSON</h2>
            </div>
          </div>
          <div className="form-actions vertical">
            <button type="button" className="primary-button" onClick={handleExport}>
              <Download size={16} />
              Exporter les données
            </button>
            <label className="upload-button">
              <Upload size={16} />
              Importer un JSON
              <input type="file" accept="application/json" onChange={handleImport} />
            </label>
          </div>
        </article>

        <article className="panel sync-card">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Synchronisation</span>
              <h2>État du backend</h2>
            </div>
          </div>
          <div className="status-panel">
            <span className={`status-badge ${syncState}`}>{syncState === "online" ? "En ligne" : syncState === "syncing" ? "Synchronisation" : "Mode hors ligne"}</span>
            <p>Vos données restent utilisables localement même si l’API ou la base ne répondent plus.</p>
          </div>
          <button type="button" className="ghost-button" onClick={() => void refreshRemote()}>
            <RefreshCcw size={16} />
            Forcer une resynchronisation
          </button>
        </article>
      </section>
    </ProtectedShell>
  );
}
