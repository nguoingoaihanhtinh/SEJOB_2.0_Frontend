import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { fetchAdminReviews, approveReview, deleteReview } from "../../../modules/services/reviewService";
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Popconfirm, 
  Rate, 
  Card,
  Typography,
  Switch,
  Tooltip,
  Modal,
  Descriptions,
  Divider
} from "antd";
import { DeleteOutlined, InfoCircleOutlined, PrinterOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ReviewsPage() {
  const dispatch = useDispatch();
  const { adminReviews, loading } = useSelector((state) => state.reviews);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    dispatch(fetchAdminReviews());
  }, [dispatch]);

  const handleApprove = (id, is_approved) => {
    dispatch(approveReview({ id, is_approved }));
  };

  const handleDelete = (id) => {
    dispatch(deleteReview(id));
  };

  const openDetailModal = (record) => {
    setSelectedReview(record);
    setIsModalOpen(true);
  };

  const handlePrintReview = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Review_${selectedReview?.id || ""}`,
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "COMPANY_TO_APPLICANT" ? "blue" : "green"}>
          {type === "COMPANY_TO_APPLICANT" ? "Employer -> Intern" : "Intern -> Company"}
        </Tag>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
      render: (comment) => <Text italic>"{comment || "No comment"}"</Text>,
    },
    {
      title: "Public / Approved",
      key: "is_approved",
      render: (_, record) => (
        record.type === "APPLICANT_TO_COMPANY" ? (
          <Space>
            <Switch 
              checked={record.is_approved} 
              onChange={(checked) => handleApprove(record.id, checked)}
            />
            <Text type="secondary" size="small">
              {record.is_approved ? "Public" : "Private"}
            </Text>
          </Space>
        ) : (
          <Tag color="default">Strictly Private</Tag>
        )
      ),
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
             <Button 
               icon={<InfoCircleOutlined />} 
               size="small"
               onClick={() => openDetailModal(record)}
             />
          </Tooltip>

          <Popconfirm
            title="Delete this review?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2}>Review Management</Title>
        <Text type="secondary">Total: {adminReviews.length} reviews</Text>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={adminReviews}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Review Details"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setSelectedReview(null); }}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrintReview}>
            Print PDF
          </Button>,
          <Button key="close" onClick={() => { setIsModalOpen(false); setSelectedReview(null); }}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedReview && (
          <div ref={printRef} className="p-4">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Type">
                <Tag color={selectedReview.type === "COMPANY_TO_APPLICANT" ? "blue" : "green"}>
                  {selectedReview.type === "COMPANY_TO_APPLICANT" ? "Employer -> Intern" : "Intern -> Company"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Company">
                {selectedReview.applications?.companies?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Student">
                {selectedReview.applications?.full_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Rating">
                <Rate disabled value={selectedReview.rating} />
                <span className="ml-2 text-gray-600">({selectedReview.rating} / 5)</span>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {formatDate(selectedReview.created_at)}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Comment</Divider>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Text italic>{selectedReview.comment || "No comment provided."}</Text>
            </div>

            <Divider />
            <div className="text-center text-xs text-gray-400">
              Generated by SEJobs Recruitment Platform
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
