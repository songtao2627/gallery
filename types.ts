export type Category = 'Work' | 'Life' | 'Learning' | 'IT';

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
}

export interface NavItem {
  label: string;
  href: string;
}
