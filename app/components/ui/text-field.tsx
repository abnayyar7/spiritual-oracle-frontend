"use client";

import styles from "./text-field.module.css";

/*
 * Floating-label text field. One implementation shared by every form in the
 * app (auth, password reset, contact) so the interaction stays identical.
 */

export default function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  disabled = false,
  error,
  autoComplete,
  minLength,
  multiline = false,
  rows = 5,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: string;
  autoComplete?: string;
  minLength?: number;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
}) {
  const shared = {
    id,
    name: id,
    value,
    placeholder: " ", // drives :placeholder-shown — see the stylesheet
    required,
    disabled,
    minLength,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as const;

  return (
    <div className={styles.field}>
      {multiline ? (
        <textarea
          {...shared}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className={`${styles.input} ${styles.textarea}`}
        />
      ) : (
        <input
          {...shared}
          type={type}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
        />
      )}
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
