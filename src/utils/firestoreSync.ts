import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { SkillItem, AuditLogEntry } from '../types/skills';

// Real-time listener for skills collection in Firestore
export function subscribeToFirestoreSkills(
  onSkillsUpdated: (skills: SkillItem[]) => void,
  onError?: (err: any) => void
) {
  const path = 'skills';
  try {
    const skillsColRef = collection(db, path);
    return onSnapshot(skillsColRef, (snapshot) => {
      const skillsList: SkillItem[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.skill) {
          skillsList.push({
            id: Number(docSnap.id) || data.id,
            domain: data.domain || 'General',
            skill: data.skill || '',
            ratings: data.ratings || {},
            owner: data.owner || '',
            backup: data.backup || '',
            sme: data.sme || '',
            evidence: data.evidence || '',
            memberEvidence: data.memberEvidence || {}
          });
        }
      });
      if (skillsList.length > 0) {
        skillsList.sort((a, b) => a.id - b.id);
        onSkillsUpdated(skillsList);
      }
    }, (error) => {
      console.warn(`[Firestore Sync] Subscription note (${path}):`, error.message || error);
      if (onError) onError(error);
    });
  } catch (error) {
    console.warn('[Firestore Sync] Subscribe Error:', error);
  }
}

// Sync single skill item to Firestore
export async function syncSkillToFirestore(skill: SkillItem) {
  const path = `skills/${skill.id}`;
  try {
    const skillDocRef = doc(db, 'skills', String(skill.id));
    await setDoc(skillDocRef, {
      id: skill.id,
      domain: skill.domain,
      skill: skill.skill,
      ratings: skill.ratings || {},
      owner: skill.owner || '',
      backup: skill.backup || '',
      sme: skill.sme || '',
      evidence: skill.evidence || '',
      memberEvidence: skill.memberEvidence || {}
    }, { merge: true });
  } catch (error) {
    console.warn(`[Firestore Sync] Write note (${path}):`, error);
  }
}

// Sync all skills in batch to Firestore
export async function syncAllSkillsToFirestore(skills: SkillItem[]) {
  try {
    for (const skill of skills) {
      await syncSkillToFirestore(skill);
    }
  } catch (err) {
    console.error('Batch sync to Firestore failed:', err);
  }
}

// Save audit log entry to Firestore
export async function addAuditLogToFirestore(log: AuditLogEntry) {
  const path = `audit_logs/${log.id}`;
  try {
    const logDocRef = doc(db, 'audit_logs', log.id);
    await setDoc(logDocRef, {
      id: log.id,
      timestamp: log.timestamp,
      memberName: log.memberName,
      skillId: log.skillId,
      skillName: log.skillName,
      domain: log.domain,
      oldValue: log.oldValue,
      newValue: log.newValue,
      changeType: log.changeType,
      performedBy: log.performedBy,
      notes: log.notes || ''
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
