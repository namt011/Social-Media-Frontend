import React, { useRef, useState } from "react";
import CloudinaryUpload from "./Testupimage";
import { toast } from "react-toastify";

const AvatarUploader = ({
  userID,
  currentAvatar,
  onSuccess,
  UpdateUser,
  GetUserById,
  onClose
}) => {
  const uploadRef = useRef();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadAvatar = async () => {
    try {
      setIsUploading(true);

      // 🔥 Upload lên Cloudinary
      const uploadedFiles = await uploadRef.current.handleUpload();

      if (!uploadedFiles || uploadedFiles.length === 0) {
        toast.warning("Vui lòng chọn ảnh");
        return;
      }

      const avatarUrl = uploadedFiles[0].url;

      console.log("Avatar Cloudinary URL:", avatarUrl);

      // 🔥 Update DB
      await UpdateUser(
        { userImageAvatar: avatarUrl },
        userID
      );

      // 🔄 Fetch lại user
      const res = await GetUserById(userID);

      onSuccess(res.data); // trả data về component cha
      toast.success("Cập nhật ảnh đại diện thành công");

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật ảnh đại diện thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="text-center">
      <h5 className="mb-3">Cập nhật ảnh đại diện</h5>

      {/* Preview */}
      <div className="mb-4">
        <img
          src={currentAvatar}
          alt="Avatar"
          className="rounded-circle"
          style={{
            width: 180,
            height: 180,
            objectFit: "cover",
            opacity: isUploading ? 0.6 : 1
          }}
        />
      </div>

      {/* Upload */}
      <CloudinaryUpload
        ref={uploadRef}
        maxFiles={1}
        showPreview={false}
      />

      {/* Action */}
      <button
        className="btn btn-success w-100 mt-3"
        onClick={handleUploadAvatar}
        disabled={isUploading}
      >
        {isUploading ? "Đang tải lên..." : "Lưu ảnh đại diện"}
      </button>
    </div>
  );
};

export default AvatarUploader;
