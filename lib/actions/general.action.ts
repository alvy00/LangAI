/* eslint-disable @typescript-eslint/no-unused-vars */
import { db, auth } from "@/firebase/admin";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null>{
    const Interviews = await db.collection('interviews').where('userId', '==', userId).orderBy('createdAt', 'desc').get();

    return Interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null>{
    const { userId, limit=10 } = params;
    const Interviews = await db.collection('interviews').orderBy('createdAt', 'desc').where('finalized', '==', true).limit(limit).get();

    return Interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null>{
    const Interview = await db.collection('interviews').doc(id).get();

    return Interview.data() as Interview | null;
}