const steps = ['Purchase requested', 'Payment submitted', 'Payment confirmed', 'Artwork being prepared', 'Delivery', 'Completed'];

export function StatusTimeline({ activeIndex = 3 }: { activeIndex?: number }) {
  return (
    <ol className="timeline">
      {steps.map((step, index) => {
        const state = index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'upcoming';
        return (
          <li key={step} className={`timeline-item ${state}`}>
            <span className="timeline-dot">{index < activeIndex ? '✓' : ''}</span>
            <div>
              <strong>{step}</strong>
              <span>{state === 'complete' ? 'Done' : state === 'active' ? 'Current step' : 'Next'}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
