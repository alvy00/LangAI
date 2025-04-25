/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Agent from '@/components/Agent';
import DisplayTechIcons from '@/components/DisplayTechIcons';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewById } from '@/lib/actions/general.action';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async ({ params }: RouteParams) => {
    const { id } = await params;
    const user = await getCurrentUser();
    const interview = await getInterviewById(id);

    if(!interview) redirect('/');

    return (
        <>
            <div className='flex flex-row gap-4 justify-between'>
                <div className='flex flex-row gap-4 items-center max-sm:flex-col'>
                    <div className='flex flex-row gap-4 items-center'>
                        <h3 className='capitalize'>{interview.role} Session</h3>
                    </div>
                </div>

                <p className='bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize'>{interview.type}</p>
            </div>

            <Agent userName={user?.name} type={user?.id} interviewId={id} type="interview" questions={interview.questions} />
        </>
    )
}

export default page