import { useEffect, useState } from "react";
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, Briefcase, DollarSign, MapPin, Building2, Zap, Flame, Diamond } from "lucide-react";
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
} from "@/components/ui";
import { Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import UpdateJobStatusModal from "../JobDescription/partials/UpdateJobStatusModal";
import { jobApi, categoryApi, levelApi, parseErrorMessage } from "../../../../api";
import SearchInput from "@/components/common/InputV2";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { CustomAlert } from "@/components";
import SkeletonPulse from "@/components/common/SkeletonPulse";

export default function JobsPage() {
  const nav = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [levelFilter, setLevelFilter] = useState("all");
  // const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { alertConfig, hideAlert, showSuccess, showError, showWarning } = useCustomAlert();

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    handleFetchJobs();
  }, [currentPage, pageSize, searchQuery, categoryFilter, levelFilter]);

  const handleFetchJobs = async () => {
    try {
      setIsLoading(true);
      const res = await jobApi.findAllJob({ page: currentPage, limit: pageSize, keyword: searchQuery, category_ids: categoryFilter, level_ids: levelFilter });
      setJobs(res.data);
      setPagination(res.pagination);
    } catch (error) {
      const errorMessage = parseErrorMessage(error.response.data);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      setCategories(res.data);
    } catch (error) {
      const errorMessage = parseErrorMessage(error.response.data);
      showError(errorMessage);
    }
  };

  const handleFetchLevels = async () => {
    try {
      const res = await levelApi.getLevels();
      setLevels(res.data);
    } catch (error) {
      const errorMessage = parseErrorMessage(error.response.data);
      showError(errorMessage);
    }
  };

  useEffect(() => {
    handleFetchCategories();
    handleFetchLevels();
  }, []);

  const onUpdateJob = async () => {
    await handleFetchJobs();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 mb-1 font-semibold">Job Management</h3>
          <p className="text-gray-600">Manage job listings, categories, and applications</p>
        </div>
        {/* <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary/90 hover:bg-primary text-white hover:scale-105 rounded-lg transition-all">
          <Plus className="w-4 h-4" />
          Post New Job
        </Button> */}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <SearchInput placeholder="Search jobs..." onChange={(val) => setSearchQuery(val)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-56">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Categories</SelectItem>
                {categories &&
                  categories.length &&
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels &&
                  levels.length &&
                  levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-center">Category</TableHead>
                <TableHead className="text-center">Level</TableHead>
                <TableHead>Salary Range</TableHead>
                <TableHead className="text-center">Tags</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right sticky right-0 bg-white z-10 shadow-2xl">Actions</TableHead>
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
                : jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{job.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{job.company?.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {job.categories?.slice(0, 3).map((cat, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                          {job.levels?.map((lvl) => lvl.name).join(", ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {job.salary?.from} - {job.salary?.to} {job.salary?.currency}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          {job.isDiamond && <Diamond className="w-4 h-4 text-cyan-600" fill="currentColor" />}
                          {job.isHot && <Flame className="w-4 h-4 text-orange-600" fill="currentColor" />}
                          {job.isJobFlashActive && <Zap className="w-4 h-4 text-yellow-600" fill="currentColor" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${job.status === "Approved" ? "bg-green-400 text-white border-2 border-accent-green/50" : "bg-gray-100"} px-4 py-1`}>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center sticky right-0 bg-gray-100 z-10 shadow-2xl">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white" align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                nav(`/job/${job.id}`);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedJob(job);
                                setIsStatusModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Update Status
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

      {selectedJob && <UpdateJobStatusModal onUpdate={onUpdateJob} job={selectedJob} open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen} />}

      {/* Add Job Dialog */}
      {/* <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
            <DialogDescription>
              Create a new job listing for the recruitment system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" placeholder="e.g. Senior Software Engineer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Google</SelectItem>
                    <SelectItem value="2">Microsoft</SelectItem>
                    <SelectItem value="3">Amazon</SelectItem>
                    <SelectItem value="4">Apple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Job Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment">Employment Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Work Location</Label>
              <Input id="location" placeholder="e.g. San Francisco, CA or Remote" />
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryFrom">Salary From</Label>
                <Input id="salaryFrom" type="number" placeholder="80000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryTo">Salary To</Label>
                <Input id="salaryTo" type="number" placeholder="120000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="VND">VND</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Job description..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Textarea id="responsibilities" placeholder="Key responsibilities..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" placeholder="Job requirements..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea id="benefits" placeholder="Employee benefits..." rows={2} />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Job Tags</Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox id="isDiamond" />
                  <label htmlFor="isDiamond" className="text-sm flex items-center gap-1 cursor-pointer">
                    <Diamond className="w-4 h-4 text-cyan-600" />
                    Diamond Job
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="isHot" />
                  <label htmlFor="isHot" className="text-sm flex items-center gap-1 cursor-pointer">
                    <Flame className="w-4 h-4 text-orange-600" />
                    Hot Job
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="isFlash" />
                  <label htmlFor="isFlash" className="text-sm flex items-center gap-1 cursor-pointer">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    Flash Active
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="hover:scale-105 rounded-lg transition-all" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-primary/90 hover:bg-primary text-white hover:scale-105 rounded-lg transition-all">
              Post Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* View Job Dialog */}
      {/* <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4" />
                {selectedJob?.company?.name}
              </div>
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {selectedJob.categories?.map((cat, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Level</p>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 mt-1">
                    {selectedJob.levels[0]?.name}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employment Type</p>
                  <Badge variant="secondary" className="mt-1">
                    {selectedJob.employment_types[0]?.name}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-gray-900 mt-1">{selectedJob.workLocation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Salary Range</p>
                  <p className="text-gray-900 mt-1">
                    {selectedJob.salary?.from} - {selectedJob.salary?.to} {selectedJob.salary?.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applications</p>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 mt-1">
                    {selectedJob.applications} applications
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Job Tags</p>
                <div className="flex gap-2">
                  {selectedJob.isDiamond && (
                    <Badge variant="secondary" className="bg-cyan-50 text-cyan-700">
                      <Diamond className="w-3 h-3 mr-1" />
                      Diamond
                    </Badge>
                  )}
                  {selectedJob.isHot && (
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                      <Flame className="w-3 h-3 mr-1" />
                      Hot Job
                    </Badge>
                  )}
                  {selectedJob.isJobFlashActive && (
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
                      <Zap className="w-3 h-3 mr-1" />
                      Flash Active
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <Badge variant={selectedJob.status === 'Approved' ? 'default' : 'secondary'}>
                  {selectedJob.status}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600">Posted Date</p>
                <p className="text-gray-900 mt-1">{new Date(selectedJob.createdAt).toLocaleDateString("en-GB")}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="hover:scale-105 rounded-lg transition-all" variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button className="bg-primary/90 hover:bg-primary text-white hover:scale-105 rounded-lg transition-all">
              <Edit className="w-4 h-4 mr-2" />
              Edit Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      <CustomAlert {...alertConfig} onClose={hideAlert} />
    </div>
  );
}
