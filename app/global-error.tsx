'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#fcf9f8] text-[#1c1b1b] p-8 text-center font-sans">
        <h2 className="text-2xl font-serif text-[#000615] mb-2">Editorial Terminal Error</h2>
        <p className="text-sm text-[#5e5e5c] mb-4">{error?.message || 'An unexpected error occurred'}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-[#0b1f3a] text-white text-xs uppercase tracking-wider font-semibold cursor-pointer"
        >
          Reload Dispatch
        </button>
      </body>
    </html>
  );
}
