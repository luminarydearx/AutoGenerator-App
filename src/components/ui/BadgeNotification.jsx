import { toast } from "react-hot-toast";

export const showBadgeNotification = (title, message) => {
  toast.custom(
    (t) => (
      <div
        className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white shadow-2xl rounded-2xl pointer-events-auto flex p-5 border border-white/20`}
      >
        <div className="flex items-center w-full">
          <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-base font-bold mb-1 flex items-center space-x-2">
              <span>🏆</span>
              <span>{title}</span>
            </p>
            <p className="text-sm opacity-95">{message}</p>
          </div>
        </div>
      </div>
    ),
    { duration: 6000 },
  );

  if (Notification.permission === "granted") {
    new Notification(`🏆 ${title}`, {
      body: message,
      icon: "/icon-192.png",
    });
  }
};