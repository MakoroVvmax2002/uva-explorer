import { Link } from "react-router-dom";
import { Compass, MapPin, Home } from "lucide-react";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="text-center">

        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          <MapPin size={48} />
        </div>

        {/* 404 Number */}
        <p className="mt-6 text-8xl font-extrabold tracking-tight text-teal-700 dark:text-teal-500">
          404
        </p>

        {/* Heading */}
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Destination Not Found
        </h1>

        {/* Message */}
        <p className="mt-3 max-w-md mx-auto text-sm leading-7 text-slate-500 dark:text-slate-400">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on the right trail.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            <Home size={17} />
            Back to Home
          </Link>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Compass size={17} />
            Explore Places
          </Link>
        </div>

      </div>
    </div>
  );
}

export default NotFound;
