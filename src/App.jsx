import { useState } from "react";

export default function App() {
  const [patient, setPatient] = useState({ name: "", dob: "" });
  const [meds, setMeds] = useState([
    { name: "", qty: "", dose: "", variable: false, prn: false }
  ]);
  const [medsText, setMedsText] = useState("");

  const handleChange = (index, field, value) => {
    const updated = [...meds];
    updated[index][field] = value;
    setMeds(updated);
  };

  const addMed = () => {
    setMeds([
      ...meds,
      { name: "", qty: "", dose: "", variable: false, prn: false }
    ]);
  };

  const importMeds = () => {
    const list = medsText
      .split(/\n|,/)
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const formatted = list.map((name) => ({
      name,
      qty: "",
      dose: "1",
      variable: false,
      prn: false
    }));

    if (formatted.length > 0) setMeds(formatted);
  };

  const calculate = () => {
    const days = meds.map((m) => Number(m.qty) / Number(m.dose));

    const validDays = days.filter(
      (d, i) =>
        !isNaN(d) && d > 0 && !meds[i].variable && !meds[i].prn
    );

    const minDays = validDays.length ? Math.min(...validDays) : 0;

    return meds.map((m) => {
      const d = Number(m.qty) / Number(m.dose);
      const valid = !isNaN(d) && d > 0;

      return {
        ...m,
        daysRemaining: valid ? d.toFixed(1) : "-",
        syncTo: minDays ? minDays.toFixed(1) : "-",
        suggestedIssue:
          valid && !m.variable && !m.prn && minDays
            ? Math.round(minDays * Number(m.dose))
            : "review"
      };
    });
  };

  const results = calculate();

  const summary = results
    .map((r) => {
      if (r.variable || r.prn) {
        return `${r.name}: NOT synchronised (variable/PRN)`;
      }
      return `${r.name}: issue ~${r.suggestedIssue} tablets (${r.syncTo} days)`;
    })
    .join("\\n");

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    alert("Copied to clipboard ✅");
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h2>Medication Synchronisation Tool</h2>

      <p style={{ fontSize: "14px" }}>
        This tool helps us align your medicines. A clinician will review this
        before any changes are made.
      </p>

      <h3>Your details</h3>
      <input
        placeholder="Full name"
        value={patient.name}
        onChange={(e) =>
          setPatient({ ...patient, name: e.target.value })
        }
      />
      <br /><br />
      <input
        placeholder="Date of birth"
        value={patient.dob}
        onChange={(e) =>
          setPatient({ ...patient, dob: e.target.value })
        }
      />

      <h3>Import medicines (optional)</h3>
      <textarea
        placeholder="Paste list (one per line or comma separated)"
        value={medsText}
        onChange={(e) => setMedsText(e.target.value)}
        rows={4}
        style={{ width: "100%" }}
      />
      <br />
      <button onClick={importMeds}>Import</button>

      <h3>Your medicines</h3>

      {meds.map((med, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <input
            placeholder="Medication name"
            value={med.name}
            onChange={(e) =>
              handleChange(i, "name", e.target.value)
            }
          />{" "}
          <input
            placeholder="Tablets left"
            type="number"
            value={med.qty}
            onChange={(e) =>
              handleChange(i, "qty", e.target.value)
            }
          />{" "}
          <input
            placeholder="Per day"
            type="number"
            value={med.dose}
            onChange={(e) =>
              handleChange(i, "dose", e.target.value)
            }
          />{" "}
          <label>
            <input
              type="checkbox"
              checked={med.prn}
              onChange={(e) =>
                handleChange(i, "prn", e.target.checked)
              }
            />
            PRN
          </label>{" "}
          <label>
            <input
              type="checkbox"
              checked={med.variable}
              onChange={(e) =>
                handleChange(i, "variable", e.target.checked)
              }
            />
            Variable dose
          </label>
        </div>
      ))}

      <button onClick={addMed}>+ Add another medicine</button>

      <h3>Recommended plan</h3>

      {results.map((r, i) => (
        <div key={i}>
          <strong>{r.name || "Medication"}</strong>:{" "}
          {r.daysRemaining} days → align to {r.syncTo} days
        </div>
      ))}

      <textarea
        value={summary}
        readOnly
        rows={6}
        style={{ width: "100%", marginTop: 10 }}
      />

      <br />
      <button onClick={copySummary}>Copy for EMIS</button>

      <p style={{ fontSize: "12px", marginTop: 10 }}>
        Do not use this tool for urgent medication issues.
      </p>
    </div>
  );
}
