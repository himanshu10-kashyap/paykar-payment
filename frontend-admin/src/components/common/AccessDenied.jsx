import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Home,
    ShieldAlert,
} from "lucide-react";

const AccessDenied = ({
    title = "Access Restricted",
    message = "You do not have permission to access this page.",
    showBackButton = true,
    showDashboardButton = true,
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6">
            <div className="w-full max-w-lg text-center">

                {/* ICON */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
                    <ShieldAlert
                        size={40}
                        className="text-blue-600"
                    />
                </div>

                {/* TITLE */}
                <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-900">
                    {title}
                </h1>

                {/* MESSAGE */}
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                    {message}
                </p>

                {/* ACTIONS */}
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">

                    {showBackButton && (
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={17} />
                            Go Back
                        </button>
                    )}

                    {showDashboardButton && (
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <Home size={17} />
                            Dashboard
                        </button>
                    )}

                </div>

            </div>
        </div>
    );
};

export default AccessDenied;