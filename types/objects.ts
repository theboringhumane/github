export interface RepoInfo {
  name: string;
  description: string;
  stars: number;
  watchers: number;
  forks: number;
  defaultBranch: string;
  branches: string[];
  topics: string[];
  license: string;
  isPrivate: boolean;
  updatedAt: string;
  readme: string | null;
}

export interface PR {
  body: string;
  number: number;
  title: string;
  author: { login: string; avatar_url: string };
  createdAt: string;
  updatedAt: string;
  state: string;
  labels: string[];
  comments: Array<{
    user: { login: string; avatar_url: string };
    created_at: string;
    body: string;
  }>;
  files: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
  }>;
  reviewComments: Array<{
    user: { login: string; avatar_url: string };
    created_at: string;
    position: number;
    path: string;
    body: string;
  }>;
}
