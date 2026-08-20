export type VentureEvent =
  | 'diagnostic_started'
  | 'question_answered'
  | 'diagnostic_25'
  | 'diagnostic_50'
  | 'diagnostic_75'
  | 'diagnostic_completed'
  | 'quote_generated'
  | 'lead_save_failed'
  | 'pdf_requested'
  | 'whatsapp_clicked'
  | 'meeting_clicked';
export function trackEvent(name: VentureEvent, payload: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('venture:analytics', {
      detail: { name, payload, timestamp: new Date().toISOString() }
    })
  );
  const dataLayer = (window as Window & { dataLayer?: Record<string, unknown>[] }).dataLayer;
  dataLayer?.push({ event: name, ...payload });
}
