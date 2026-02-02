export interface AdminDashboardStats {
    totalTests: number;
    totalQuestions: number;
    typeCount: {
        FLT: number;
        UNIT: number;
        TOPIC: number;
        CSAT: number;
        PYQ: number;
        [key: string]: number;
    };
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

export interface AdminDashboardResponse {
    success: boolean;
    stats?: AdminDashboardStats;
    recentUploads?: RecentUpload[];
    topicCoverage?: Record<string, string[]>;
    error?: string;
}
