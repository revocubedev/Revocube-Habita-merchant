import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import DeleteModal from "@/components/ui/DeleteModal";
import {
  useGetAdminRoles,
  extractRoles,
} from "@/api/api_controllers/adminController";
import RoleModal, { type Role } from "@/components/portal/RolesModal";


const Roles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const { data, isLoading, isError, error } = useGetAdminRoles({
    page: 1,
    perPage: 100,
    enabled: true,
  });

  const roles: Role[] = extractRoles(data);

  const filteredRoles = roles.filter((role) =>
    (role.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".action-menu-container")) {
        setActionMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const permissionCount = (role: Role) =>
    Array.isArray(role.permissions) ? role.permissions.length : 0;

  const userCount = (role: Role) =>
    role.userCount ?? (role as any)._count?.users ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search roles..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
          className="text-sm text-white transition-colors"
          style={{
            fontFamily: "Poppins",
            borderRadius: "8px",
            backgroundColor: "#f30100",
            border: "none",
          }}
        >
          Create Role
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Assigned Permissions</TableHead>
                <TableHead>Assigned Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    Loading roles...
                  </TableCell>
                </TableRow>
              )}

              {isError && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm py-8"
                    style={{ color: "#f30100" }}
                  >
                    {(error as Error)?.message || "Failed to load roles"}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && filteredRoles.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    {searchQuery
                      ? "No roles match your search."
                      : "No roles yet."}
                  </TableCell>
                </TableRow>
              )}

              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {permissionCount(role)} permissions
                    </span>
                  </TableCell>
                  <TableCell>{userCount(role)}</TableCell>
                  <TableCell className="text-right">
                    <div className="relative action-menu-container">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setActionMenuId(
                            actionMenuId === role.id ? null : role.id
                          )
                        }
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      {actionMenuId === role.id && (
                        <div
                          className="absolute right-0 top-full mt-1 w-32 bg-white border border-border rounded-lg shadow-lg z-10"
                          style={{
                            fontFamily: "Poppins",
                            borderColor: "#e3e3e3",
                          }}
                        >
                          <button
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                            style={{ fontFamily: "Poppins" }}
                            onClick={() => {
                              setActionMenuId(null);
                              setEditingRole(role);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-danger"
                            style={{ fontFamily: "Poppins", color: "#f30100" }}
                            onClick={() => {
                              setActionMenuId(null);
                              setDeletingRole(role);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isCreateOpen && (
        <RoleModal isOpen onClose={() => setIsCreateOpen(false)} />
      )}

      {editingRole && (
        <RoleModal
          key={editingRole.id}
          isOpen
          onClose={() => setEditingRole(null)}
          role={editingRole}
        />
      )}

      {deletingRole && (
        <DeleteModal
          key={deletingRole.id}
          isOpen
          onClose={() => setDeletingRole(null)}
          endpoint={`roles/${deletingRole.id}`}
          queryKey={["get_admin_roles"]}
          entity="Role"
          itemName={deletingRole.name}
        />
      )}
    </div>
  );
};

export default Roles;
