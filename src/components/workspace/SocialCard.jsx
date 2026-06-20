import { Card, Input } from './formKit.jsx'

export default function SocialCard({ business, set }) {
  return (
    <Card title="🔗 Social" defaultOpen={false}>
      <Input label="Facebook URL" value={business.facebook || ''} onChange={e => set('facebook', e.target.value)} />
      <Input label="Instagram URL" value={business.instagram || ''} onChange={e => set('instagram', e.target.value)} />
      <Input label="Google Business URL" value={business.google || ''} onChange={e => set('google', e.target.value)} />
    </Card>
  )
}
