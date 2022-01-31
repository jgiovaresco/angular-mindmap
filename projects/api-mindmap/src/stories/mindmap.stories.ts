import { Story } from '@storybook/angular';
import { GioMindmapComponent } from '../lib/gio-mindmap';

export default {
  title: 'Mindmap',
  component: GioMindmapComponent,
  parameters: {
    backgrounds: { default: 'white' },
  },
};

const Template: Story<GioMindmapComponent> = (args: GioMindmapComponent) => ({
  props: args,
});

export const Default = Template.bind({});
