/** Shared cash calculation for the standalone pricing page and project cockpit. */
export function calculate(option, settings, capture) {
  const bounds = { days: [1, 60], dayRate: [0, 10000], discount: [0, 100], contingency: [0, 100], taxAllowance: [0, 100000], credit: [0, 1000000] };
  for (const [key, [low, high]] of Object.entries(bounds)) {
    if (!Number.isFinite(settings[key]) || settings[key] < low || settings[key] > high) throw new RangeError(`Invalid ${key}`);
  }
  if (!Number.isInteger(settings.days) || !Number.isInteger(option.projectors) || option.projectors < 0) throw new RangeError("Invalid count");
  const rent = option.projectors * settings.days * settings.dayRate * (1 - settings.discount / 100);
  let low = rent;
  let high = rent;
  for (const item of option.items) {
    if (!Number.isFinite(item.low) || !Number.isFinite(item.high) || item.low < 0 || item.high < item.low) throw new RangeError("Each allowance needs 0 ≤ low ≤ high");
    low += item.low;
    high += item.high;
  }
  const liveCapture = settings.capture && option.projectors > 0;
  if (liveCapture) { low += capture.low; high += capture.high; }
  const subtotal = [Math.max(0, low - settings.credit), Math.max(0, high - settings.credit)];
  const contingency = subtotal.map(value => value * settings.contingency / 100);
  return { rent, liveCapture, gross: [low, high], subtotal, contingency, total: subtotal.map((value, index) => value + contingency[index] + settings.taxAllowance), creditCapped: settings.credit > low };
}
