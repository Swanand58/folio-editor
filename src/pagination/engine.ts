/**
 * Re-export pagination types.
 * The actual pagination logic lives in PaginationPlugin.ts — it measures
 * real DOM on each animation frame and makes single-step corrections.
 */
export type { PaginationEngineOptions } from './PaginationPlugin';
