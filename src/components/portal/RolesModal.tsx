import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import useApiManager from "@/api/useApiManager";
import {
  useGetPermissions,
  extractPermissions,
} from "@/api/api_controllers/roleController";

export interface Role {
  id: string;
  name: string;
  permissions?: unknown[];
  userCount?: number;
  [key: string]: unknown;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null; // present = edit, absent = create
}

// Backend names the user resource both "user" and "users"; group them together
const RESOURCE_ALIASES: Record<string, string> = { users: "user" };

const splitPermission = (permission: string) => {
  const [rawResource, action = ""] = permission.split(":");
  return { resource: RESOURCE_ALIASES[rawResource] ?? rawResource, action };
};

const prettify = (value: string) =>
  value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// Role permissions may arrive as strings or as objects with a name/permission key
const toPermissionStrings = (items: unknown[] | undefined): string[] =>
  (items ?? [])
    .map((p: any) => (typeof p === "string" ? p : p?.name ?? p?.permission))
    .filter((p): p is string => typeof p === "string");

const sameSet = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((x) => b.has(x));

const RoleModal = ({ isOpen, onClose, role }: RoleModalProps) => {
  const isEdit = !!role;

  const [name, setName] = useState(role?.name ?? "");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(toPermissionStrings(role?.permissions))
  );
  const initialPermissions = useMemo(
    () => new Set(toPermissionStrings(role?.permissions)),
    [role]
  );

  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    isError: permissionsError,
    error: permissionsErrorObj,
  } = useGetPermissions(isOpen);

  const groups = useMemo(() => {
    const map = new Map<string, string[]>();
    extractPermissions(permissionsData).forEach((permission) => {
      const { resource } = splitPermission(permission);
      map.set(resource, [...(map.get(resource) ?? []), permission]);
    });
    return [...map.entries()];
  }, [permissionsData]);

  const allPermissions = useMemo(
    () => groups.flatMap(([, list]) => list),
    [groups]
  );

  const { callApi, isLoading } = useApiManager({
    endpoint: isEdit ? `role/${role!.id}` : "role", // match your Postman routes
    queryKey: ["get_admin_roles"],
    method: isEdit ? "PATCH" : "POST",
    isAuth: true,
    isCode: true,
    successMessage: isEdit
      ? "Role updated successfully"
      : "Role created successfully",
  });

  const toggle = (permission: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(permission) ? next.delete(permission) : next.add(permission);
      return next;
    });

  const toggleMany = (list: string[]) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const allOn = list.every((p) => next.has(p));
      list.forEach((p) => (allOn ? next.delete(p) : next.add(p)));
      return next;
    });

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await callApi({
        name: name.trim(),
        permissions: Array.from(selected),
      });
      onClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  const unchanged =
    isEdit &&
    name.trim() === role!.name &&
    sameSet(selected, initialPermissions);
  const canSubmit =
    name.trim() !== "" && selected.size > 0 && !unchanged && !isLoading;

  const allSelected =
    allPermissions.length > 0 && allPermissions.every((p) => selected.has(p));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Edit Role" : "Create Role"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="role-name"
            className="block text-sm font-medium mb-2"
            style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
          >
            Role Name
          </label>
          <input
            id="role-name"
            type="text"
            placeholder="Enter role name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
            style={{
              fontFamily: "Poppins",
              borderColor: "#e3e3e3",
              height: "48px",
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-sm font-medium"
              style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
            >
              Permissions{" "}
              <span className="text-muted-foreground font-normal">
                ({selected.size} selected)
              </span>
            </span>
            {allPermissions.length > 0 && (
              <button
                type="button"
                onClick={() => toggleMany(allPermissions)}
                className="text-sm"
                style={{ fontFamily: "Poppins", color: "#f30100" }}
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            )}
          </div>

          {permissionsLoading && (
            <p
              className="text-sm text-muted-foreground"
              style={{ fontFamily: "Poppins" }}
            >
              Loading permissions...
            </p>
          )}

          {permissionsError && (
            <p
              className="text-sm"
              style={{ fontFamily: "Poppins", color: "#f30100" }}
            >
              {(permissionsErrorObj as Error)?.message ||
                "Failed to load permissions"}
            </p>
          )}

          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
            {groups.map(([resource, list]) => {
              const selectedCount = list.filter((p) => selected.has(p)).length;
              return (
                <div
                  key={resource}
                  className="border rounded-lg p-3"
                  style={{ borderColor: "#e3e3e3" }}
                >
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCount === list.length}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate =
                            selectedCount > 0 && selectedCount < list.length;
                        }
                      }}
                      onChange={() => toggleMany(list)}
                      style={{ accentColor: "#f30100" }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ fontFamily: "Poppins", color: "#393939" }}
                    >
                      {prettify(resource)}
                    </span>
                  </label>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 pl-6">
                    {list.map((permission) => (
                      <label
                        key={permission}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                        style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(permission)}
                          onChange={() => toggle(permission)}
                          style={{ accentColor: "#f30100" }}
                        />
                        {prettify(splitPermission(permission).action)}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm border transition-colors hover:bg-muted disabled:opacity-60"
            style={{
              fontFamily: "Poppins",
              borderRadius: "8px",
              borderColor: "#e3e3e3",
              color: "#4c4c4c",
              backgroundColor: "transparent",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 text-sm text-white transition-colors disabled:opacity-60"
            style={{
              fontFamily: "Poppins",
              borderRadius: "8px",
              backgroundColor: "#f30100",
              border: "none",
            }}
          >
            {isLoading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save Changes"
              : "Create Role"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleModal;
