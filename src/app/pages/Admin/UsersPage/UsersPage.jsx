import { useEffect, useState, memo, useCallback } from "react";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent, DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  Label,
  Switch,
} from "@/components/ui";
import { Pagination } from "antd";
import { createUser, updateUser } from "../../../modules/services/userService";
import { Avatar } from "@mui/material";
import { userApi, parseErrorMessage } from "../../../../api";
import SearchInput from "@/components/common/InputV2";
import SkeletonPulse from "@/components/common/SkeletonPulse";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { CustomAlert } from "@/components";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActiveDialogOpen, setIsActiveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const { alertConfig, hideAlert, showSuccess, showError, showWarning } = useCustomAlert();

  // Form states
  const [addFormData, setAddFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    password: "",
  });

  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    is_active: true,
  });

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [userStatus, setUserStatus] = useState("");

  const getUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userApi.getUsers({ page: currentPage, limit: pageSize, email: searchQuery, roles: roleFilter });
      setUsers(res.data);
      setPagination(res.pagination);
      setUserStatus(res.status);
    } catch (error) {
      const errorMessage = parseErrorMessage(error.response.data);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, [currentPage, pageSize, searchQuery, roleFilter]);

  const handleAddUser = async () => {
    try {
      setIsLoadingCreate(true);
      await userApi.createUser(addFormData);
      await getUsers();
      showSuccess("User added successfully");
      setIsAddDialogOpen(false);
      setAddFormData({ first_name: "", last_name: "", email: "", role: "", password: "" });
    } catch (error) {
      const errorMessage = parseErrorMessage(error.response.data);
      showError(errorMessage);
    }
    finally{
      setIsLoadingCreate(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      setIsLoadingUpdate(true);
      await userApi.updateUser(selectedUser.user_id, editFormData);
      await getUsers();
      showSuccess("User updated successfully");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      const errorMessage = parseErrorMessage(error.response.data);
      showError(errorMessage);
    }
    finally{
      setIsLoadingUpdate(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setIsLoadingUpdate(true);
      await userApi.deleteUser(selectedUser.user_id);
      await getUsers();
      showSuccess("User deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      const errorMessage = parseErrorMessage(error.response.data);
      showError(errorMessage);
    }
    finally{
      setIsLoadingUpdate(false);
    }
  }

  const handleActiveUser = async () => {
    try {
      setIsLoadingUpdate(true);
      await userApi.activeUser(selectedUser.user_id);
      await getUsers();
      showSuccess("User activated successfully");
      setIsActiveDialogOpen(false);
    } catch (error) {
      const errorMessage = parseErrorMessage(error.response.data);
      showError(errorMessage);
    }
    finally{
      setIsLoadingUpdate(false);
    }
  }

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setEditFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      role: user.role || "",
      is_active: user.is_active !== undefined ? user.is_active : true,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openActiveDialog = (user) => {
    setSelectedUser(user);
    setIsActiveDialogOpen(true);
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      Student: "bg-blue-100 text-blue-700 hover:bg-blue-700 hover:text-white",
      Employer: "bg-purple-100 text-purple-700 hover:bg-purple-700 hover:text-white",
      Company: "bg-purple-100 text-purple-700 hover:bg-purple-700 hover:text-white",
      Manager: "bg-green-100 text-green-700 hover:bg-green-700 hover:text-white",
      Admin: "bg-orange-100 text-orange-700 hover:bg-orange-700 hover:text-white",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 mb-1 font-semibold">User Management</h3>
          <p className="text-gray-600">Manage all system users and their roles</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer bg-primary/90 hover:bg-primary text-white hover:scale-105 rounded-lg transition-all">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <SearchInput
                placeholder="Search on email"
                onChange={(value) => {
                  setSearchQuery(value);
                }}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Roles</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Employer">Company</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <SkeletonPulse className="w-8 h-8 rounded-full" />
                          <SkeletonPulse className="h-4 w-32" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <SkeletonPulse className="h-4 w-48" />
                      </TableCell>
                      <TableCell className="text-center">
                        <SkeletonPulse className="h-6 w-16 rounded-full mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <SkeletonPulse className="h-6 w-16 rounded-full mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <SkeletonPulse className="h-4 w-24 mx-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <SkeletonPulse className="h-8 w-8 rounded-md ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar
                            alt={`${user.first_name} ${user.last_name}`}
                            sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
                            src={user.avatar}
                            className="bg-linear-to-br from-blue-500 to-purple-500"
                          >
                            {user.first_name[0]}
                            {user.last_name[0]}
                          </Avatar>
                          <span>
                            {user.first_name} {user.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className={getRoleBadgeColor(user.role) + " px-4 py-1"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`${user.is_active ? "bg-green-500 text-white border-2 border-accent-green/50 hover:bg-green-500" : "bg-gray-100"} px-4 py-1`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 text-center">{new Date(user.created_at).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white" align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {user.is_active && <DropdownMenuItem onClick={() => openDeleteDialog(user)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>}

                            {!user.is_active && <DropdownMenuItem onClick={() => openActiveDialog(user)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Active
                            </DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Pagination
        align="end"
        current={currentPage}
        total={pagination?.total ?? 0}
        pageSize={pageSize}
        onChange={(newPage, newPageSize) => {
          setCurrentPage(newPage);
          setPageSize(newPageSize);
        }}
      />

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account in the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <SearchInput
                  id="first-name"
                  placeholder="John"
                  value={addFormData.first_name}
                  onChange={(val) => setAddFormData({ ...addFormData, first_name: val })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <SearchInput
                  id="last-name"
                  placeholder="Doe"
                  value={addFormData.last_name}
                  onChange={(val) => setAddFormData({ ...addFormData, last_name: val })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <SearchInput
                id="email"
                type="email"
                placeholder="john.doe@university.edu"
                value={addFormData.email}
                onChange={(val) => setAddFormData({ ...addFormData, email: val })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={addFormData.role} onValueChange={(value) => setAddFormData({ ...addFormData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <SearchInput
                id="password"
                type="password"
                value={addFormData.password}
                onChange={(val) => setAddFormData({ ...addFormData, password: val })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="cursor-pointer hover:scale-105 rounded-lg transition-all"
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isLoadingCreate}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer bg-primary/90 hover:bg-primary text-white hover:scale-105 rounded-lg transition-all"
              onClick={handleAddUser}
              disabled={isLoadingCreate}
            >
              {isLoadingCreate ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-first-name">First Name</Label>
                  <SearchInput
                    id="edit-first-name"
                    value={editFormData.first_name}
                    onChange={(val) => setEditFormData({ ...editFormData, first_name: val })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-last-name">Last Name</Label>
                  <SearchInput
                    id="edit-last-name"
                    value={editFormData.last_name}
                    onChange={(value) => setEditFormData({ ...editFormData, last_name: value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <SearchInput
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(val) => setEditFormData({ ...editFormData, email: val })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editFormData.role} onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Company">Company</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-is-active" className="text-base">
                    Account Status
                  </Label>
                  <p className="text-sm text-gray-500">{editFormData.is_active ? "User can log in and use the system" : "User is blocked from logging in"}</p>
                </div>
                <Switch
                  id="edit-is-active"
                  checked={editFormData.is_active}
                  onCheckedChange={(checked) => setEditFormData({ ...editFormData, is_active: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              className="hover:scale-105 cursor-pointer rounded-lg transition-all"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoadingUpdate}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary/90 cursor-pointer hover:bg-primary text-white hover:scale-105 rounded-lg transition-all"
              onClick={handleUpdateUser}
              disabled={isLoadingUpdate}
            >
              {isLoadingUpdate ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>Are you sure you want to delete this user?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="hover:scale-105 cursor-pointer rounded-lg transition-all"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoadingUpdate}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary/90 cursor-pointer hover:bg-primary text-white hover:scale-105 rounded-lg transition-all"
              onClick={handleDeleteUser}
              disabled={isLoadingUpdate}
            >
              {isLoadingUpdate ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active User Dialog */}
      <Dialog open={isActiveDialogOpen} onOpenChange={setIsActiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Active User</DialogTitle>
            <DialogDescription>Are you sure you want to active this user?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="hover:scale-105 cursor-pointer rounded-lg transition-all"
              variant="outline"
              onClick={() => setIsActiveDialogOpen(false)}
              disabled={isLoadingUpdate}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary/90 cursor-pointer hover:bg-primary text-white hover:scale-105 rounded-lg transition-all"
              onClick={handleActiveUser}
              disabled={isLoadingUpdate}
            >
              {isLoadingUpdate ? "Activating..." : "Active"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomAlert
        {...alertConfig}
        onClose={hideAlert}
      />
    </div>
  );
}