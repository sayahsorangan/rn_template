export namespace ICourse {
  export interface Course {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    duration: string;
    level: string;
    author: string;
    image: string;
    rating: number;
    createdAt: string;
  }

  export interface Comment {
    id: string;
    courseId: string;
    user: {id: string; name: string};
    message: string;
    createdAt: string;
    likesCount: number;
    likedByUser: boolean;
  }
}
