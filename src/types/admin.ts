export interface AdminDashboardStats {
  totalTests: number;
  totalQuestions: number;
  totalBlogs: number;
  typeCount: {
    FLT: number;
    UNIT: number;
    TOPIC: number;
    CSAT: number;
    PYQ: number;
    [key: string]: number;
  };
  blogCategoryCount: Record<string, number>;
}

export interface RecentUpload {
  id: string;
  type: string | null;
  title: string;
  unitId: string | null;
  topicId: string | null;
  totalQuestions: number | null;
  updatedAt: Date | null;
}

export interface RecentGuest {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  createdAt: Date | null;
}

export interface RecentBlogRow {
  id: string;
  title: string;
  category: string | null;
  contentType: string | null;
  createdAt: Date | null;
}

export interface AdminDashboardResponse {
  success: boolean;
  stats?: AdminDashboardStats;
  recentUploads?: RecentUpload[];
  recentBlogs?: RecentBlogRow[];
  recentGuests?: RecentGuest[];
  topicCoverage?: Record<string, string[]>;
  error?: string;
}
