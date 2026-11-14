import * as React from 'react'

/**
 * Saved jobs — the candidate's bookmarked listings across the jobs
 * workspace. On the backend this is a user preference (a bookmark list on
 * the user record), so this tiny store is the seam: replace the module
 * store with the preferences endpoint when it lands (`GET/PUT /api/users/
 * {id}` preferences) and keep the same hook signatures. Seed marks a couple
 * of the demo listings as already saved so the page has life on first view.
 */

const SAVED_JOB_SEED = ['northwind-frontend', 'greenfield-analyst']

let savedIds: string[] = SAVED_JOB_SEED
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function subscribeToSavedJobs(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Snapshot for `useSyncExternalStore` — a new array only on real changes. */
export function getSavedJobIds(): string[] {
  return savedIds
}

/** The whole bookmark list, reactive. */
export function useSavedJobIds(): string[] {
  return React.useSyncExternalStore(subscribeToSavedJobs, getSavedJobIds)
}

/** Single-id check for the save/bookmark toggle on listing cards. */
export function useIsJobSaved(jobId: string): boolean {
  return React.useSyncExternalStore(subscribeToSavedJobs, () => savedIds.includes(jobId))
}

export function toggleSavedJob(jobId: string) {
  savedIds = savedIds.includes(jobId)
    ? savedIds.filter((id) => id !== jobId)
    : [...savedIds, jobId]
  emit()
}

/** Trash from the saved list — the job itself is untouched; the bookmark
 *  toggle on the listing card restores it. */
export function removeSavedJob(jobId: string) {
  savedIds = savedIds.filter((id) => id !== jobId)
  emit()
}
