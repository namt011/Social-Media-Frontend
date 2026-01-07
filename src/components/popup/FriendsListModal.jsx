// Add this component before the Profile component
import Modal from "./Modal";
import { useParams, useNavigate } from "react-router-dom";

const FriendsListModal = ({ isOpen, onClose, friends, loadingFriends }) => {
  const { userID } = useParams();
  const navigate = useNavigate();

  const defaultImg = "https://res.cloudinary.com/dc0b0ffa8/image/upload/v1743004500/social_uploads/social_post_1743004498854_0.jpg";

  const goToProfile = (id) => {
    onClose();
    navigate(`/profile/${id}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="m-0">Danh sách bạn bè</h4>
        </div>

        {loadingFriends ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="friends-list">
            {friends.length === 0 ? (
              <p className="text-center text-muted">Chưa có bạn bè</p>
            ) : (
              friends.map((friend) => {
                const friendData =
                  friend.sender.userId === parseInt(userID)
                    ? friend.receiver
                    : friend.sender;

                return (
                  <div
                    key={friend.id}
                    className="d-flex align-items-center p-2 border-bottom"
                    style={{ cursor: "pointer" }}
                    onClick={() => goToProfile(friendData.userId)}
                  >
                    <img
                      src={friendData.avatar || defaultImg}
                      alt={`${friendData.lastName} ${friendData.firstName}`}
                      className="rounded-circle me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <h6 className="mb-0">
                        {friendData.lastName} {friendData.firstName}
                      </h6>
                      <small className="text-muted">
                        {new Date(friend.createdAt).toLocaleDateString("vi-VN")}
                      </small>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FriendsListModal;
