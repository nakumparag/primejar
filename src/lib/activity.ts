/**
 * Activity logging utility — writes to /activity collection
 * Used to power the Admin "Recent Activity" feed
 */
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type ActivityType =
  | 'user_signup'
  | 'job_posted'
  | 'application_submitted'
  | 'application_status_changed'
  | 'group_created'
  | 'user_verified'
  | 'user_deleted'
  | 'job_deleted';

interface LogActivityParams {
  type: ActivityType;
  actorId?: string;
  actorName?: string;
  targetId?: string;
  targetName?: string;
  meta?: Record<string, any>;
}

export async function logActivity({
  type,
  actorId,
  actorName,
  targetId,
  targetName,
  meta = {},
}: LogActivityParams) {
  try {
    await addDoc(collection(db, 'activity'), {
      type,
      actorId:    actorId    || null,
      actorName:  actorName  || null,
      targetId:   targetId   || null,
      targetName: targetName || null,
      meta,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Non-critical — fail silently so it never breaks the main flow
  }
}

// ── Convenience wrappers ─────────────────────────────────────────────────────

export const logUserSignup = (uid: string, name: string, role: string) =>
  logActivity({ type: 'user_signup', actorId: uid, actorName: name, meta: { role } });

export const logJobPosted = (uid: string, orgName: string, jobId: string, title: string) =>
  logActivity({ type: 'job_posted', actorId: uid, actorName: orgName, targetId: jobId, targetName: title });

export const logApplicationSubmitted = (uid: string, workerName: string, jobId: string, jobTitle: string) =>
  logActivity({ type: 'application_submitted', actorId: uid, actorName: workerName, targetId: jobId, targetName: jobTitle });

export const logApplicationStatusChanged = (jobId: string, workerName: string, newStatus: string) =>
  logActivity({ type: 'application_status_changed', targetId: jobId, targetName: workerName, meta: { status: newStatus } });

export const logGroupCreated = (uid: string, name: string, groupName: string) =>
  logActivity({ type: 'group_created', actorId: uid, actorName: name, targetName: groupName });
