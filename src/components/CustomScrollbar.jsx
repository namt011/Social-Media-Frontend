import React from 'react';

const CustomScrollbar = () => {
  return (
    <style>
      {`
        .scrollable-container {
          display: flex;
          overflow-x: auto;
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: #4caf50 transparent; /* Màu thanh di chuyển (thumb) và nền trong suốt */
        }

        /* Tùy chỉnh cho các trình duyệt Webkit (Chrome, Safari) */
        .scrollable-container::-webkit-scrollbar {
          height: 8px; /* Chiều cao của thanh cuộn ngang */
        }

        /* Ẩn mũi tên thanh cuộn (nếu có) */
        .scrollable-container::-webkit-scrollbar-button {
          display: none; /* Ẩn mũi tên */
        }

        /* Ẩn nền của thanh cuộn */
        .scrollable-container::-webkit-scrollbar-track {
          background: transparent; /* Làm nền trong suốt */
        }

        /* Hiển thị phần thanh cuộn di chuyển (scrollbar thumb) */
        .scrollable-container::-webkit-scrollbar-thumb {
          background-color: #4caf50; /* Màu của thanh di chuyển */
          border-radius: 10px; /* Bo tròn */
        }
      `}
    </style>
  );
};

export default CustomScrollbar;
