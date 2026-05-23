import { useState, useEffect, useRef } from "react";
import {
    Input,
    Button,
    Label,
} from "@/components/ui";
import { Dialog, DialogContent } from "@mui/material";
import { X, Plus, Calendar, Trash2 } from "lucide-react";
import { FormControl, Select, MenuItem } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { getProvinces } from "../../modules/services/addressService";
import { mapGenderFromBackend } from "../../pages/User/UserProfile/Profile/hooks/utils";

import { CircularProgress } from "@mui/material";
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';

export default function InformationModal({ open, onOpenChange, initialData, onSave, onAutofill }) {
    const dispatch = useDispatch();
    const provincesRaw = useSelector((state) => state.address?.provinces?.data || state.address?.provinces || []);
    const provinces = Array.isArray(provincesRaw) ? provincesRaw : [];

    // Fetch provinces if not already loaded
    useEffect(() => {
        if (open && provinces.length === 0) {
            dispatch(getProvinces());
        }
    }, [open, dispatch, provinces.length]);

    // Helper function to normalize desired positions to array
    const normalizeDesiredPositions = (data) => {
        if (!data) return [""];
        // Check for camelCase (from user object)
        if (Array.isArray(data?.desiredPositions)) {
            return data.desiredPositions.length > 0 ? data.desiredPositions : [""];
        }
        // Check for snake_case (from backend/student_info)
        if (Array.isArray(data?.desired_positions)) {
            return data.desired_positions.length > 0 ? data.desired_positions : [""];
        }
        // Check for title (backward compatibility)
        if (Array.isArray(data?.title)) {
            return data.title.length > 0 ? data.title : [""];
        }
        // Check for string values
        if (data?.desiredPositions && typeof data.desiredPositions === 'string') {
            return [data.desiredPositions];
        }
        if (data?.desired_positions && typeof data.desired_positions === 'string') {
            return [data.desired_positions];
        }
        if (data?.title && typeof data.title === 'string') {
            return [data.title];
        }
        return [""];
    };

    const [formData, setFormData] = useState({
        fullName: initialData?.name || initialData?.fullName || "",
        title: normalizeDesiredPositions(initialData),
        email: initialData?.email || "",
        phone: initialData?.phone || initialData?.phone_number || "",
        dateOfBirth: initialData?.dateOfBirth || initialData?.date_of_birth || "",
        gender: mapGenderFromBackend(initialData?.gender),
        province: initialData?.province || initialData?.location || "",
    });

    const fileInputRef = useRef(null);
    const [isExtracting, setIsExtracting] = useState(false);

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                fullName: initialData?.name || initialData?.fullName || "",
                title: normalizeDesiredPositions(initialData),
                email: initialData?.email || "",
                phone: initialData?.phone || initialData?.phone_number || "",
                dateOfBirth: initialData?.dateOfBirth || initialData?.date_of_birth || "",
                gender: mapGenderFromBackend(initialData?.gender),
                province: initialData?.province || initialData?.location || "",
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleTitleChange = (index, value) => {
        setFormData((prev) => {
            const newTitles = [...prev.title];
            newTitles[index] = value;
            return { ...prev, title: newTitles };
        });
    };

    const handleAddTitle = () => {
        setFormData((prev) => ({
            ...prev,
            title: [...prev.title, ""],
        }));
    };

    const handleRemoveTitle = (index) => {
        setFormData((prev) => {
            const newTitles = prev.title.filter((_, i) => i !== index);
            return { ...prev, title: newTitles.length > 0 ? newTitles : [""] };
        });
    };

    const handleSave = () => {
        // Sanitize form fields before sending to API
        const sanitizedTitles = Array.isArray(formData.title)
            ? formData.title.map(t => t.trim()).filter(t => t !== '')
            : [(formData.title || '').trim()].filter(t => t !== '');

        // Split full name into first_name and last_name
        const fullNameTrimmed = (formData.fullName || '').trim();
        const nameParts = fullNameTrimmed.split(' ').filter(part => part.length > 0);

        // Ensure we have both first_name and last_name
        let lastName = '';
        let firstName = '';

        if (nameParts.length === 1) {
            // If only one part, use it as last_name and set first_name to it
            lastName = nameParts[0];
            firstName = nameParts[0];
        } else if (nameParts.length > 1) {
            // If multiple parts, first is last_name, rest is first_name
            lastName = nameParts[0];
            firstName = nameParts.slice(1).join(' ');
        }

        const sanitized = {
            first_name: firstName,
            last_name: lastName,
            title: sanitizedTitles.length > 0 ? sanitizedTitles : [],
            email: (formData.email || '').trim(),
            phone: (formData.phone || '').trim(),
            dateOfBirth: formData.dateOfBirth || '',
            gender: (formData.gender || '').trim(),
            province: (formData.province || '').trim(),
        };

        if (onSave) {
            onSave(sanitized);
        }
        onOpenChange(false);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    const handleAutofillClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Vui lòng chọn file PDF');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
            return;
        }

        if (onAutofill) {
            setIsExtracting(true);
            try {
                await onAutofill(file);
                // Optionally close modal if autofill succeeds, or let user see background change
                // onOpenChange(false);
            } finally {
                setIsExtracting(false);
            }
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleEditAvatar = () => {
        // Handle avatar edit logic
        // TODO: implement Edit avatar logic
    };

    const handleDeleteAvatar = () => {
        // Handle avatar delete logic
        // TODO: implement Delete avatar logic
    };

    const getInitials = (name) => {
        if (!name) return "S";
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog
            open={open}
            onClose={() => onOpenChange(false)}
            scroll="body"
            maxWidth="md"
            fullWidth={true}
        >
            <DialogContent sx={{ padding: 0 }}>
                {/* Header */}
                <div className="sticky top-0 bg-background z-10 p-6 pb-4 border-b border-neutrals-20">
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-foreground">
                            Thông tin cá nhân
                        </span>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="rounded-full bg-primary/10 p-1.5 hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            <X className="h-5 w-5 text-primary" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex gap-6">
                        {/* Left Side - Avatar Section */}
                        {/* <div className="flex flex-col items-center gap-4 shrink-0">
                            <div className="bg-primary rounded-full w-24 h-24 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">
                                    {getInitials(formData.fullName)}
                                </span>
                            </div>
                        </div> */}

                        {/* Right Side - Form Fields */}
                        <div className="flex-1 space-y-4">
                            <form className="space-y-4">
                                {/* Row 1 */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                                            Họ và Tên <span className="text-primary">*</span>
                                        </Label>
                                        <Input
                                            id="fullName"
                                            value={formData.fullName}
                                            onChange={(e) => handleChange("fullName", e.target.value)}
                                            placeholder="Nhập họ và tên"
                                            className="h-12"
                                            readOnly
                                        />
                                    </div>

                                    {/* Province/City */}
                                    <div className="space-y-2">
                                        <Label htmlFor="province" className="text-sm font-medium text-foreground">
                                            Tỉnh/Thành phố hiện tại <span className="text-primary">*</span>
                                        </Label>
                                        <FormControl fullWidth>
                                            <Select
                                                id="province"
                                                value={formData.province}
                                                onChange={(e) => handleChange("province", e.target.value)}
                                                displayEmpty
                                                sx={{
                                                    height: "48px",
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "var(--color-neutrals-40)",
                                                    },
                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "var(--color-primary)",
                                                    },
                                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "var(--color-primary)",
                                                    },
                                                    "& .MuiSelect-icon": {
                                                        color: "var(--color-neutrals-40)",
                                                    },
                                                }}
                                            >
                                                <MenuItem value="" disabled>
                                                    Chọn tỉnh/thành phố
                                                </MenuItem>
                                                {provinces.map((province) => (
                                                    <MenuItem key={province.id} value={province.name}>{province.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>

                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                            Địa chỉ email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                            placeholder="Nhập địa chỉ email"
                                            className="h-12"
                                            readOnly
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                                            Số điện thoại <span className="text-primary">*</span>
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                            placeholder="Nhập số điện thoại"
                                            className="h-12"
                                        />
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Date of Birth */}
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground">
                                            Ngày sinh <span className="text-primary">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="dateOfBirth"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                                                className="h-12 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:z-10"
                                            />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutrals-40 pointer-events-none z-0" />
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-sm font-medium text-foreground">
                                            Giới tính
                                        </Label>
                                        <FormControl fullWidth>
                                            <Select
                                                id="gender"
                                                value={formData.gender}
                                                onChange={(e) => handleChange("gender", e.target.value)}
                                                sx={{
                                                    height: "48px",
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "var(--color-neutrals-40)",
                                                    },
                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "var(--color-primary)",
                                                    },
                                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "var(--color-primary)",
                                                    },
                                                    "& .MuiSelect-icon": {
                                                        color: "var(--color-neutrals-40)",
                                                    },
                                                }}
                                            >
                                                <MenuItem value="Nam">Nam</MenuItem>
                                                <MenuItem value="Nữ">Nữ</MenuItem>
                                                <MenuItem value="Khác">Khác</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>

                                {/* Row 4 - Desired Positions */}
                                <div className="space-y-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm font-medium text-foreground">
                                            Vị trí công việc mong muốn <span className="text-primary"></span>
                                        </Label>
                                        <div className="space-y-2">
                                            {formData.title.map((title, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        id={`title-${index}`}
                                                        value={title}
                                                        onChange={(e) => handleTitleChange(index, e.target.value)}
                                                        placeholder="Nhập vị trí công việc"
                                                        className="h-12 flex-1"
                                                    />
                                                    {formData.title.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTitle(index)}
                                                            className="px-3 h-12 rounded-md border border-neutrals-40 hover:bg-neutrals-10 transition-colors flex items-center justify-center"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-neutrals-60" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={handleAddTitle}
                                                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium py-2"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Thêm vị trí công việc
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-neutrals-20">
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />
                            <Button
                                type="button"
                                onClick={handleAutofillClick}
                                disabled={isExtracting}
                                className="h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium flex items-center gap-2 shadow-sm transition-all"
                            >
                                {isExtracting ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon fontSize="small" />}
                                Tự động điền từ CV
                            </Button>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={handleCancel}
                                variant="outline"
                                className="h-12 px-6 bg-white border border-neutrals-40 text-foreground hover:bg-neutrals-10 hover:border-neutrals-40"
                            >
                                Huỷ
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSave}
                                className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-medium"
                            >
                                Lưu
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
