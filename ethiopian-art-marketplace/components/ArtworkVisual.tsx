export function ArtworkVisual({ tone, title, large = false }: { tone: string; title: string; large?: boolean }) {
  return (
    <div className={`art-visual art-${tone} ${large ? 'art-visual-large' : ''}`} role="img" aria-label={`Abstract placeholder for ${title}`}>
      <span className="art-mark mark-a" />
      <span className="art-mark mark-b" />
      <span className="art-mark mark-c" />
      <span className="art-grain" />
    </div>
  );
}
