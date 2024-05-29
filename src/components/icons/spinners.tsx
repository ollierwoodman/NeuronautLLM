export const Spinner = ({className}: {className?: string}) => {
  return (
    <div 
      className={className}
      role="status"
    >
      <svg className="animate-spin" width="1em" height="1em" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <circle cx="400" cy="400" fill="none"
          r="184" strokeWidth="50" stroke="currentColor"
          strokeDasharray="700 1400"
          strokeLinecap="round" />
      </svg>
      <span className="sr-only">
        Loading
      </span>
    </div>
  );
};