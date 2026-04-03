import { db } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'

export async function getUserApplications(uid) {
  const q = query(
    collection(db, 'applications'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function saveApplication(uid, data) {
  return await addDoc(collection(db, 'applications'), {
    uid,
    ...data,
    status: 'submitted',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function getAllSchemes() {
  const snap = await getDocs(collection(db, 'schemes'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}