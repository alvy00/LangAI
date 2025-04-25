/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db, auth } from "@/firebase/admin";
import { CollectionReference, DocumentData, DocumentReference } from "firebase-admin/firestore";
import { documentId } from "firebase/firestore";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7 * 1000;

export async function signUp(params: SignUpParams){
    const { uid, name, email } = params;

    try {
        const userRecord  = await db.collection('users').doc(uid).get();
        if(userRecord.exists){
            return{
                success: false,
                message: 'User already exists'
            }  
        }
        
        await db.collection('users').doc(uid).set({
                name, email
            })

        return{
            success: true,
            message: 'Account created!'
        }

    } catch (error: unknown) {
        console.error("Error creating a user", error);
      
        if (error instanceof Error && 'code' in error) {
          const err = error as { code: string };
      
          if (err.code === 'auth/email-already-exists') {
            return {
              success: false,
              message: 'This email is already in use'
            };
          }
        }
        
        return{
            success: false,
            message: 'Failed to create an account'
        }
    }
}

export async function signIn(params: SignInParams){
    const { email, idToken } = params;

    try {
        
        const userRecord = await auth.getUserByEmail(email);

        if(!userRecord){
            return{
                success: false,
                message: 'User does not exist.'
            }
        }

        await setSessionCookie(idToken);

    } catch (e) {
        console.log(e);

        return{
            success: false,
            message: 'Failed login'
        }
    }
}

export async function setSessionCookie(idToken: string){
    
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK,
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax'
    })
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if(!sessionCookie) return null;

    try {
        
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();

        if(!userRecord.exists) return null;

        return{
            ...userRecord.data(),
            id: userRecord.id,
        } as User;
    } catch (e) {
        
        console.log(e);
        return null;
    }
}

export async function isAuthenticated() {
    const user = await getCurrentUser();

    return !!user;
}

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