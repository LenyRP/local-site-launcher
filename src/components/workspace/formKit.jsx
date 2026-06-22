import { useState, useRef } from 'react'

export const S = {
  label: { display: 'block', fontSize: 14, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 600 },
  input: { width: '100%', background: 'var(--surface2)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '11px 13px', color: 'var(--text)', fontSize: 16, outline: 'none' },
  sectionTitle: { color: 'var(--accent)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  row: { marginBottom: 14 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 },
  btnPrimary: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 16 },
  btnGhost: { background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--input-border)', borderRadius: 9, padding: '12px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 15 },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 14 },
}

export function Field({ label, hint, children }) {
  return (
    <div style={S.row}>
      <label style={S.label}>{label}{hint && <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}> {hint}</span>}</label>
      {children}
    </div>
  )
}

export function Input({ label, hint, ...props }) {
  return <Field label={label} hint={hint}><input style={S.input} {...props} /></Field>
}

export function Card({ title, badge, defaultOpen = true, accent, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ ...S.card, ...(accent ? { borderColor: accent } : {}) }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 17, fontWeight: 800 }}>
        <span>{title}</span>
        {badge && <span style={{ color: 'var(--ok)', fontSize: 14, fontWeight: 700 }}>{badge}</span>}
        <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: 14 }}>{open ? '▾' : '▸'}</span>
      </div>
      {open && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  )
}

export function compressImage(file, maxDim) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.78))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export function ImageUpload({ label, value, onChange, maxDim = 1200, compact = false }) {
  const ref = useRef()
  const pick = async (e) => { if (e.target.files[0]) onChange(await compressImage(e.target.files[0], maxDim)) }

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} title={label}>
        {value
          ? <img src={value} style={{ height: 36, width: 36, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} alt={label} />
          : <div style={{ height: 36, width: 36, background: 'var(--surface2)', border: '1px dashed var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-dim)' }}>🖼</div>}
        <button onClick={() => ref.current.click()} style={{ background: 'transparent', border: '1px solid var(--input-border)', borderRadius: 4, color: 'var(--text-dim)', cursor: 'pointer', padding: '6px 10px', fontSize: 12, whiteSpace: 'nowrap' }}>{value ? 'Change' : '+ Photo'}</button>
        {value && <button onClick={() => onChange(undefined)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-dim)', cursor: 'pointer', padding: '6px 9px', fontSize: 12 }} title="Remove photo">✕</button>}
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} />
      </div>
    )
  }

  return (
    <Field label={label}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {value
          ? <img src={value} style={{ height: 48, borderRadius: 4, border: '1px solid var(--border)' }} alt={label} />
          : <div style={{ height: 48, width: 80, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-dim)' }}>No image</div>}
        <button style={S.btnGhost} onClick={() => ref.current.click()}>{value ? 'Change' : 'Upload'}</button>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} />
      </div>
    </Field>
  )
}
