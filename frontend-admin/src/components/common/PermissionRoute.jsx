import { usePermission } from "../../hooks/usePermission";

const PermissionRoute = ({
  permission,
  children,
}) => {
  const {
    hasPermission,
  } = usePermission();

  if (!permission) {
    return children;
  }

  if (
    !hasPermission(permission)
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="px-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl font-black text-red-600">
            403
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Access Denied
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            You do not have permission
            to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default PermissionRoute;