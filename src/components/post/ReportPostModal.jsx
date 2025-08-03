import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ReportServices, { REPORT_TYPES } from '../../services/ReportSer';

const ReportPostModal = ({ showModal, handleClose, post }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    { value: 'Spam hoặc nội dung lừa đảo', label: 'Spam hoặc nội dung lừa đảo' },
    { value: 'Quấy rối hoặc bắt nạt', label: 'Quấy rối hoặc bắt nạt' },
    { value: 'Ngôn từ thù địch', label: 'Ngôn từ thù địch' },
    { value: 'Bạo lực hoặc tổn hại', label: 'Bạo lực hoặc tổn hại' },
    { value: 'Nội dung không phù hợp', label: 'Nội dung không phù hợp' },
    { value: 'Thông tin sai lệch', label: 'Thông tin sai lệch' },
    { value: 'Vi phạm bản quyền', label: 'Vi phạm bản quyền' },
    { value: 'OTHER', label: 'Khác (vui lòng mô tả)' }
  ];

  const handleReasonChange = (reason) => {
    setSelectedReason(reason);
    if (reason !== 'OTHER') {
      setCustomReason('');
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      toast.error('Vui lòng chọn lý do báo cáo!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (selectedReason === 'OTHER' && !customReason.trim()) {
      toast.error('Vui lòng mô tả lý do báo cáo!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        reportType: REPORT_TYPES.POST,
        targetId: post.postID,
        reason: selectedReason === 'OTHER' ? customReason.trim() : selectedReason
      };

      await ReportServices.createReport(reportData);
      
      toast.success('Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét và xử lý!', {
        position: "top-right",
        autoClose: 4000,
      });

      // Reset form
      setSelectedReason('');
      setCustomReason('');
      handleClose();

    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Không thể gửi báo cáo. Vui lòng thử lại sau!', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setSelectedReason('');
    setCustomReason('');
    handleClose();
  };

  if (!showModal) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '15px' }}>
          <div className="modal-header" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px 15px 0 0' }}>
            <h5 className="modal-title">
              <i className="bi bi-flag me-2 text-danger"></i>
              Báo cáo bài viết
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleModalClose}
              disabled={isSubmitting}
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="mb-3">
              <p className="text-muted mb-3">
                Tại sao bạn muốn báo cáo bài viết này? Báo cáo của bạn sẽ được xem xét bởi đội ngũ quản trị.
              </p>
              
              <div className="mb-3">
                <strong>Bài viết của: </strong>
                <span>{post?.user ? `${post.user.userLastName} ${post.user.userFirstName}` : 'Unknown User'}</span>
              </div>

              <div className="report-reasons">
                {reportReasons.map((reason) => (
                  <div key={reason.value} className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="reportReason"
                      id={`reason_${reason.value}`}
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={() => handleReasonChange(reason.value)}
                      disabled={isSubmitting}
                    />
                    <label className="form-check-label" htmlFor={`reason_${reason.value}`}>
                      {reason.label}
                    </label>
                  </div>
                ))}
              </div>

              {selectedReason === 'OTHER' && (
                <div className="mt-3">
                  <label className="form-label">Mô tả chi tiết:</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Vui lòng mô tả lý do báo cáo..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    disabled={isSubmitting}
                    maxLength={500}
                  />
                  <small className="text-muted">
                    {customReason.length}/500 ký tự
                  </small>
                </div>
              )}
            </div>

            <div className="alert alert-warning" role="alert">
              <small>
                <i className="bi bi-exclamation-triangle me-1"></i>
                Báo cáo sai có thể dẫn đến hạn chế tài khoản của bạn.
              </small>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleModalClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={handleSubmitReport}
              disabled={isSubmitting || !selectedReason}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang gửi...
                </>
              ) : (
                <>
                  <i className="bi bi-flag me-1"></i>
                  Gửi báo cáo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPostModal;