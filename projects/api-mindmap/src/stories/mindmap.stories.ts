import { Story } from '@storybook/angular';
import { ApiMindmapComponent } from '../lib/api-mindmap.component';

export default {
  title: 'Mindmap',
  component: ApiMindmapComponent,
};

const Template: Story<ApiMindmapComponent> = (args: ApiMindmapComponent) => ({
  props: args,
});

export const Default = Template.bind({});
