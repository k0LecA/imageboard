export interface Post{
  id: number
  message: string
  created_at: string
  files: PostFile[]
}

export interface PostFile {
  id: number
  original_name: string
  mime_type: string
}
