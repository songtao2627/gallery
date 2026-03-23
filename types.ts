export type Category = 'Work' | 'Life' | 'Learning' | 'IT';
export type ProjectType = 'website' | 'software' | 'drawio';

export interface SoftwareMetadata {
  latestVersion?: string;
  repoUrl?: string;
  platforms?: ('windows' | 'macos' | 'linux')[];
}

export interface DrawioMetadata {
  fileUrl?: string;
  allowDownload?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: Category;
  projectPath: string; // Used to generate the link /projectname/
  imagePath: string;   // Used to generate image src /projectname/screen.png
  tags: string[];
  color: string; // Tailwind color class for accents
  icon: string; // Material symbol name
  project_type?: ProjectType;
  metadata?: SoftwareMetadata | DrawioMetadata | Record<string, any> | null;
}

export interface SoftwareRelease {
  id: string;
  project_id: string;
  version: string;
  changelog?: string;
  download_urls?: Record<string, string>;
  released_at?: string;
  created_at?: string;
}

export interface NavItem {
  label: string;
  href: string;
}
