type Props = { className?: string };
export function Skeleton({ className = "" }: Props) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />;
}
