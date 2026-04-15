export namespace ICourse {
  export interface CourseCreator {
    id: string;
    email: string;
    fullName: string | null;
    avatar: string | null;
  }

  export interface CourseModule {
    id: string;
    courseId: string;
    title: string;
    content: string;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
  }

  export interface Course {
    id: string;
    userId: string;
    title: string;
    description: string;
    category: string;
    duration: string;
    level: string;
    author: string;
    image: string | null;
    rating: number;
    prompt: string;
    isFavorited: boolean;
    modules: CourseModule[];
    createdAt: string;
    updatedAt: string;
    createdBy: CourseCreator | null;
    _count?: {comments: number; favorites: number};
  }

  export interface CourseDetail extends Course {
    comments: Comment[];
  }

  export interface Comment {
    id: string;
    courseId: string;
    userId: string;
    message: string;
    likesCount: number;
    likedByUser: boolean;
    createdAt: string;
    updatedAt: string;
    user: CourseCreator | null;
  }

  export interface GenerateRequest {
    prompt: string;
  }

  export interface AddCommentRequest {
    message: string;
  }
}
