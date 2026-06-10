import PlaidLink from './PlaidLink';

/**
 * Friendly empty/error state for authenticated pages. Rendered instead of a
 * blank page when account data is unavailable or no bank is linked yet.
 */
const EmptyState = ({
  title,
  subtext,
  user,
  showConnectBank = false,
}: {
  title: string;
  subtext: string;
  user?: User;
  showConnectBank?: boolean;
}) => {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-blue-50">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0179FE"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      </div>
      <h2 className="text-20 font-semibold text-gray-900">{title}</h2>
      <p className="max-w-md text-14 font-normal text-gray-600">{subtext}</p>
      {showConnectBank && user && <PlaidLink user={user} variant="primary" />}
    </div>
  );
};

export default EmptyState;
