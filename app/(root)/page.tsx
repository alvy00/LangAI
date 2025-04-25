/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { dummyInterviews } from '@/constants'
import InterviewCard from '@/components/InterviewCard'

const page = () => {
  return (
    <>
      <section className='card-cta'>
        <div className='flex flex-col gap-6 max-w-lg'>
          <h2>Sharpen Your Speaking Skills with AI-Guided Practice & Feedback</h2>
          <p className='text-lg'>Sound fluent and self-assured in every interaction.</p>
          <Button asChild className='btn-primary max-sm:w-full'>
            <Link href='/interview'>Start a Practice Session</Link>
          </Button>
        </div>

        {/* <Image src='/robot.png' alt='robot' width={400} height={400} className='max-sm:hidden' /> */}
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Your Sessions</h2>
        <div className='interviews-section'>
          {dummyInterviews? 
          (dummyInterviews.map((interview, index) => <InterviewCard key={index} {...interview}/>)) :
          (<p>You haven’t taken your first session yet—ready to begin?</p>)}
        </div>
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Begin a session</h2>

        <div className='interviews-section'>
        <p>There are no sessions available</p>
        </div>
      </section>

    </>
  )
}

export default page