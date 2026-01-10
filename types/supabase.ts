export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            projects: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    category: string
                    project_path: string
                    image_path: string
                    tags: string[]
                    color: string | null
                    icon: string | null
                    created_at: string | null
                }
                Insert: {
                    id: string
                    title: string
                    description?: string | null
                    category: string
                    project_path: string
                    image_path: string
                    tags?: string[]
                    color?: string | null
                    icon?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    category?: string
                    project_path?: string
                    image_path?: string
                    tags?: string[]
                    color?: string | null
                    icon?: string | null
                    created_at?: string | null
                }
            }
        }
    }
}
