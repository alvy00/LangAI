/* eslint-disable @typescript-eslint/no-unused-vars */
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getFeedbackByInterviewId, getInterviewById } from '@/lib/actions/general.action';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import dayjs from 'dayjs';

const page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);

  if (!interview) redirect('/');

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <section className="section-feedback space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-semibold">
          Feedback on This Session
        </h1>
        <p className="text-muted-foreground mt-2">Insights to help you speak more confidently</p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 text-base">
        {/* Overall Score */}
        <div className="flex items-center gap-2">
          <Image src="/star.svg" width={22} height={22} alt="star" />
          <p>
            Score: <span className="text-primary-200 font-bold">{feedback?.totalScore}</span>/100
          </p>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2">
          <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
          <p>
            {feedback?.createdAt
              ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
              : "N/A"}
          </p>
        </div>
      </div>

      <hr />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Coach's Summary</h2>
        <p>{feedback?.finalAssessment}</p>
      </div>

      {/* Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Breakdown of the Session</h2>
        <p className="text-muted-foreground">How you did in different areas:</p>
        {feedback?.categoryScores?.map((category, index) => (
          <div key={index} className="space-y-1">
            <p className="font-bold">
              {index + 1}. {category.name} ({category.score}/100)
            </p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      {/* Strengths */}
      {feedback?.strengths?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">🌟 Strengths</h3>
          <ul className="list-disc list-inside space-y-1">
            {feedback.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {feedback?.areasForImprovement?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">🛠️ Areas for Improvement</h3>
          <ul className="list-disc list-inside space-y-1">
            {feedback.areasForImprovement.map((area, index) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="w-full text-center">
            <p className="text-sm font-semibold text-primary-200">Back to Dashboard</p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link href={`/interview/${id}`} className="w-full text-center">
            <p className="text-sm font-semibold text-black">Retake Session</p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default page;
