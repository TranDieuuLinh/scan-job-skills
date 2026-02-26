import { Job } from "./types";

export const JobCard = ({ job }: { job: Job }) => (
  <a
    href={job.job_url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3 hover:border-amber-800 hover:shadow-md transition-all group"
  >
    <div className="flex flex-col">
      <h3 className="font-bold text-gray-900 transition-colors line-clamp-1">
        {job.job_title}
      </h3>
      <p className="text-sm font-semibold text-gray-600">{job.job_company}</p>
    </div>
    <div className="flex justify-between mt-1">
      <span className="text-[11px] text-gray-500">{job.job_location}</span>
      <span className="text-[11px] text-gray-500 font-medium">
        <span className="pe-1">🗓️</span>
        {new Date(job.job_published_date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  </a>
);