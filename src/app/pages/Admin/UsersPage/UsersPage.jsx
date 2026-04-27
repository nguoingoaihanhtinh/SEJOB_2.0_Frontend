import { useEffect, useState } from "react";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  Button,
  Input,
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Switch,
} from "@/components/ui";
import { Pagination } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, createUser, updateUser } from "../../../modules/services/userService";
import { Avatar } from "@mui/material";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const dispatch = useDispatch();

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

  const users = useSelector((state) => state.user.userItems);
  const pagination = useSelector((state) => state.user.pagination);
  const userStatus = useSelector((state) => state.user.status);

  useEffect(() => {
    dispatch(getUsers({ page: currentPage, limit: pageSize }));
  }, [currentPage, pageSize, dispatch]);

  const handleAddUser = async () => {
    try {
      await dispatch(createUser(addFormData)).unwrap();
      setIsAddDialogOpen(false);
      setAddFormData({ first_name: "", last_name: "", email: "", role: "", password: "" });
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await dispatch(updateUser({ userId: selectedUser.id, userData: editFormData })).unwrap();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

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
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary/90 hover:bg-primary text-white hover:scale-105 rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Company">Company</SelectItem>
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
              {users.map((user) => (
                <TableRow key={user.id}>
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
                  <TableCell className="text-gray-600 text-center">
                    {new Date(user.created_at).toLocaleDateString("en-GB")}
                  </TableCell>
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
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
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
            <h3 className="font-semibold">Add New User</h3>
            <DialogDescription>Create a new user account in the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  placeholder="John"
                  value={addFormData.first_name}
                  onChange={(e) => setAddFormData({ ...addFormData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  value={addFormData.last_name}
                  onChange={(e) => setAddFormData({ ...addFormData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@university.edu"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={addFormData.role}
                onValueChange={(value) => setAddFormData({ ...addFormData, role: value })}
              >
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
              <Input
                id="password"
                type="password"
                value={addFormData.password}
                onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="hover:scale-105 rounded-lg transition-all"
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={userStatus === "loading"}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary/90 hover:bg-primary text-white hover:scale-105 rounded-lg transition-all"
              onClick={handleAddUser}
              disabled={userStatus === "loading"}
            >
              {userStatus === "loading" ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <h3 className="font-semibold">Edit User</h3>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-first-name">First Name</Label>
                  <Input
                    id="edit-first-name"
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-last-name">Last Name</Label>
                  <Input
                    id="edit-last-name"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                >
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
                  <Label htmlFor="edit-is-active" className="text-base">Account Status</Label>
                  <p className="text-sm text-gray-500">
                    {editFormData.is_active ? "User can log in and use the system" : "User is blocked from logging in"}
                  </p>
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
              className="hover:scale-105 rounded-lg transition-all"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={userStatus === "loading"}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary/90 hover:bg-primary text-white hover:scale-105 rounded-lg transition-all"
              onClick={handleUpdateUser}
              disabled={userStatus === "loading"}
            >
              {userStatus === "loading" ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
