import { useLivestream } from "@/domains/livestreams/hooks/useLivestream";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@ICareCenter-media";
const FACEBOOK_PAGE_URL = "https://www.facebook.com/icarefellowship";

const ChannelLink = () => (
  <a
    className="text-church-orange hover:underline"
    href={YOUTUBE_CHANNEL_URL}
    rel="noopener noreferrer"
    target="_blank"
  >
    Visit our YouTube channel
  </a>
);

export function YouTubeLivestream() {
  const { data, isError, isLoading } = useLivestream();

  if (isLoading) {
    return (
      <div
        aria-live="polite"
        className="flex aspect-video items-center justify-center bg-black"
        role="status"
      >
        <span className="text-white">Checking for a live stream...</span>
      </div>
    );
  }

  if (data?.status === "live") {
    return (
      <div className="aspect-video w-full bg-black">
        <iframe
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
          referrerPolicy="strict-origin-when-cross-origin"
          src={`https://www.youtube.com/embed/${encodeURIComponent(data.video.id)}`}
          title={`Watch ${data.video.title} live on YouTube`}
        />
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className="flex aspect-video flex-col items-center justify-center gap-3 bg-black px-6 text-center"
      role="status"
    >
      <p className="text-white">
        {isError
          ? "Live stream status is temporarily unavailable."
          : "We are not live right now."}
      </p>
      <ChannelLink />
      <a
        className="text-church-orange hover:underline"
        href={FACEBOOK_PAGE_URL}
        rel="noopener noreferrer"
        target="_blank"
      >
        Visit our Facebook page
      </a>
    </div>
  );
}
