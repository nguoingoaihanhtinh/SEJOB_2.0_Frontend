import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Tooltip
} from "antd";
import { DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ReviewsPage() {
  const dispatch = useDispatch();
  const { adminReviews, loading } = useSelector((state) => state.reviews);

  useEffect(() => {
    dispatch(fetchAdminReviews());
  }, [dispatch]);

  const handleApprove = (id, is_approved) => {
    dispatch(approveReview({ id, is_approved }));
  };

  const handleDelete = (id) => {
    dispatch(deleteReview(id));
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
          <Tooltip title="Details">
             <Button icon={<InfoCircleOutlined />} size="small" />
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
    </div>
  );
}
