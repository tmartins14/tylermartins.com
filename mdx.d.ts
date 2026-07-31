declare module "*.mdx" {
  export const metadata: {
    title: string;
    description: string;
    publishedDate: string;
    eyebrow?: string;
  };
}
