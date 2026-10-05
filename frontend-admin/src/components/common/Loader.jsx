const Loader = ({
  size = "md",
  text = "Loading...",
  fullScreen = false,
}) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const spinner = (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-slate-200 border-t-blue-600`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          {spinner}

          <p className="text-sm font-medium text-slate-500">
            {text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {spinner}

      {text && (
        <span className="text-sm text-slate-500">
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;