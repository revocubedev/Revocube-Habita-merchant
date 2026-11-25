import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { estatePath } from '@/lib/estateRoutes';

const labels: Record<string, string> = {
  'real-estate': 'Real Estate',
  'notice-board': 'Notice Board',
  'estate-rules': 'Estate Rules',
  'email-notification': 'Email Notification',
  'join-requests': 'Join Requests',
  'logged-history': 'Logged History',
  'guest-verification': 'Guest Verification',
  'staff-verification': 'Staff Verification',
  expense: 'Expenses',
  users: 'Admin',
};

export default function Breadcrumbs() {
  const { estateCode = '' } = useParams();
  const { pathname } = useLocation();
  const segments = pathname
    .slice(estatePath(estateCode).length)
    .split('/')
    .filter(Boolean);

  const indexPages: Record<string, string> = {
    finance: 'invoices',
    visitors: 'guest-verification',
    management: 'users',
    'real-estate': 'properties',
  };

  if (segments.length === 1 && indexPages[segments[0]])
    segments.push(indexPages[segments[0]]);

  const label = (segment: string) =>
    labels[segment] ??
    segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        <li>
          <Link
            className="text-muted-foreground hover:text-foreground"
            to={estatePath(estateCode)}
          >
            Home
          </Link>
        </li>
        {(segments.length ? segments : ['dashboard']).map((segment, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRight
              aria-hidden="true"
              className="h-4 w-4 text-muted-foreground"
            />
            {index === Math.max(0, segments.length - 1) ? (
              <span aria-current="page" className="font-medium text-brand-text">
                {label(segment)}
              </span>
            ) : (
              <Link
                className="text-muted-foreground hover:text-foreground"
                to={estatePath(
                  estateCode,
                  '/' + segments.slice(0, index + 1).join('/')
                )}
              >
                {label(segment)}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
