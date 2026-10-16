import { DashboardShell } from '@/components/DashboardShell';
import { requireRole } from '@/lib/auth';

export default async function NewArtworkPage() {
  const { profile } = await requireRole(['artist', 'admin'], '/artist/artworks/new');
  return <div className="page dashboard-page"><DashboardShell mode="artist" displayName={profile.full_name || 'Artist'}>
    <div className="dash-heading"><div><span className="eyebrow">Artwork</span><h1>Add a new artwork.</h1><p>Add artwork → Tell its story → Set price → Submit.</p></div><span className="status status-draft">Draft</span></div>
    <form className="form-card dashboard-form">
      <div className="form-section"><div><span className="step-kicker">01</span><h2>Basic information</h2><p>Help collectors understand what they are looking at.</p></div><div className="form-grid"><label className="field-full"><span>Artwork title</span><input placeholder="Artwork title" /></label><label><span>Category</span><select defaultValue=""><option value="" disabled>Select</option><option>Painting</option><option>Mixed Media</option><option>Photography</option></select></label><label><span>Medium</span><input placeholder="Oil on canvas" /></label><label><span>Creation year</span><input type="number" placeholder="2026" /></label><label className="field-full"><span>Description</span><textarea rows={3} placeholder="Short description" /></label><label className="field-full"><span>Story</span><textarea rows={5} placeholder="What inspired this artwork? What does it represent?" /></label></div></div>
      <div className="form-section"><div><span className="step-kicker">02</span><h2>Physical details</h2><p>Provide enough information for delivery and presentation.</p></div><div className="form-grid"><label><span>Width (cm)</span><input type="number" /></label><label><span>Height (cm)</span><input type="number" /></label><label><span>Depth (cm)</span><input type="number" /></label><label><span>Framing</span><select><option>Unframed</option><option>Framed</option></select></label></div></div>
      <div className="form-section"><div><span className="step-kicker">03</span><h2>Price & earnings</h2><p>Commission is transparent before you submit.</p></div><div><label><span>Artwork price (ETB)</span><input type="number" placeholder="30000" /></label><div className="earnings-preview"><span>Example at 30,000 ETB</span><div><span>Platform commission (10%)</span><strong>3,000 ETB</strong></div><div><span>Estimated artist earnings</span><strong>27,000 ETB</strong></div></div></div></div>
      <div className="form-section"><div><span className="step-kicker">04</span><h2>Artwork images</h2><p>Use clear, well-lit photographs with minimal background distraction.</p></div><div className="upload-box"><strong>Upload main artwork image</strong><span>PNG or JPG · high quality recommended</span><button type="button" className="pill pill-light">Choose image</button></div></div>
      <div className="form-actions sticky-actions"><button type="button" className="pill pill-light">Save draft</button><button type="button" className="pill pill-dark">Submit for review <span>↗</span></button></div>
    </form>
  </DashboardShell></div>
}
