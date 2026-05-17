// Only tabs backed by current event data are exposed here. If admin-authored
// agenda/FAQ fields are added later, reintroduce those tabs from backend data
// rather than showing one fake template for every event.
export type EventTabKey = 'about' | 'venue';

export const EVENT_TABS: { key: EventTabKey; label: string }[] = [
  { key: 'about',   label: 'Giới thiệu' },
  { key: 'venue',   label: 'Địa điểm' },
];
