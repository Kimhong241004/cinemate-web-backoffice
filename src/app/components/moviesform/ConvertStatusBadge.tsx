import { useEffect, useState } from 'react';
import { getVideoStatusDisplay } from '../../utils/videoStatus';

// How long the Completed badge stays visible after conversion finishes.
const COMPLETED_VISIBLE_MS = 2000;

// Large convert (transcoding) status pill shown once an upload hits 100%. Completed is
// shown briefly and then hidden; a video that was already Completed when this mounted
// (e.g. an existing episode on Edit) is never shown at all.
const ConvertStatusBadge = ({ status }: { status?: string }) => {
  const display = getVideoStatusDisplay(status);
  const isCompleted = display?.label === 'Completed';
  const [hidden, setHidden] = useState(isCompleted);

  useEffect(() => {
    if (!isCompleted) {
      setHidden(false);
      return;
    }
    const timer = setTimeout(() => setHidden(true), COMPLETED_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [isCompleted]);

  if (!display || hidden) return null;
  return (
    <div className="mt-3">
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${display.badgeCls}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${display.dot} ${display.terminal ? '' : 'animate-pulse'}`} />
        {display.label}
      </span>
    </div>
  );
};

export default ConvertStatusBadge;
