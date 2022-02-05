import { Story } from '@storybook/angular';
import { GioMindmapComponent, MindmapNode } from '../lib/gio-mindmap';

export default {
  title: 'Mindmap',
  component: GioMindmapComponent,
  parameters: {
    backgrounds: { default: 'white' },
  },
};

const Template: Story<GioMindmapComponent> = (args: GioMindmapComponent) => ({
  props: {
    data: args.data,
  },
});

const data: MindmapNode = {
  nodeKey: 'root',
  name: 'Root',
  children: [
    {
      nodeKey: 'b1',
      name: 'Branch 1',
      direction: 'right',
      children: [
        {
          nodeKey: 'b11',
          name: 'Leaf 3',
          direction: 'right',
          children: [],
        },
        {
          nodeKey: 'b12',
          name: 'Leaf 4',
          direction: 'right',
          children: [],
        },
      ],
    },
    {
      nodeKey: 'b2',
      name: 'Branch 2',
      direction: 'left',
      children: [],
    },
    {
      nodeKey: 'b3',
      name: 'Branch 3',
      direction: 'left',
      children: [
        {
          nodeKey: 'b31',
          name: 'Node 3',
          direction: 'left',
          children: [
            {
              nodeKey: 'b311',
              name: 'Leaf 3',
              direction: 'left',
              children: [],
            },
          ],
        },
        { nodeKey: 'b31', name: 'Leaf 4', direction: 'left', children: [] },
      ],
    },
    {
      nodeKey: 'b4',
      name: 'Branch 4',
      direction: 'right',
      children: [],
    },
  ],
};

export const Default = Template.bind({});
Default.args = { data };
