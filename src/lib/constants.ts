/**
 * Weights for the Custom Trend Score.
 * Documented in README, Viva, and project report.
 * Velocity (50%), Engagement (20%), Recency (15%), Reach/Popularity (15%).
 */
export const WEIGHTS = {
  velocity: 0.5,   // how fast views are climbing right now
  engagement: 0.2, // likes + comments relative to views
  recency: 0.15,   // newer videos score higher
  popularity: 0.15,// absolute reach
} as const;

/** A video must clear this many views before it can be called "rising". */
export const RISING_MIN_VIEWS = 10_000;

/** …and must be gaining at least this many views per hour. */
export const RISING_MIN_VELOCITY = 5_000;
