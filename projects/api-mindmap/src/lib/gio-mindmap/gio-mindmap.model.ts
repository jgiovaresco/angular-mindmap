export type MindmapNode = {
  nodeKey: string;
  name: string;
  direction?: string;
  children: MindmapNode[];
};
