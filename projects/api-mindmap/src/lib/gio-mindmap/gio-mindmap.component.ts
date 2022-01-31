import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { hierarchy, tree } from 'd3-hierarchy';
import * as d3 from 'd3';

type Node = { name: string; direction?: string; children?: Node[] };

@Component({
  selector: 'gio-mindmap',
  templateUrl: './gio-mindmap.component.html',
  styleUrls: ['./gio-mindmap.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GioMindmapComponent implements OnInit, AfterViewInit {
  @Input() width = 660;
  @Input() height = 500;

  margins = { top: 20, right: 90, bottom: 30, left: 90 };

  data: Node;

  constructor() {
    this.data = {
      name: 'Root',
      children: [
        {
          name: 'Branch 1',
          direction: 'right',
          children: [
            { name: 'Leaf 3', direction: 'right' },
            { name: 'Leaf 4', direction: 'right' },
          ],
        },
        { name: 'Branch 2', direction: 'left' },
        {
          name: 'Branch 3',
          direction: 'left',
          children: [
            { name: 'Leaf 3', direction: 'left' },
            { name: 'Leaf 4', direction: 'left' },
          ],
        },
        { name: 'Branch 4', direction: 'right' },
      ],
    };
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const treeWidth = this.width - this.margins.left - this.margins.right;
    const treeHeight = this.height - this.margins.top - this.margins.bottom;
    const treemap = tree().size([treeHeight, treeWidth]);

    const nodes = treemap(hierarchy(this.data));

    const svg = d3
      .select('#mindmap')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const group = svg
      .append('g')
      .attr('transform', `translate(${this.margins.left},${this.margins.top})`);

    const link = group
      .selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d) => {
        // prettier-ignore
        return "M" + d.y + "," + d.x
          // prettier-ignore
          // @ts-ignore
          + "C" + (d.y + d.parent.y) / 2 + "," + d.x
          // prettier-ignore
          // @ts-ignore
          + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
          // prettier-ignore
          // @ts-ignore
          + " " + d.parent.y + "," + d.parent.x;
      });

    const node = group
      .selectAll('.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr(
        'class',
        (d) => 'node' + (d.children ? ' node--internal' : ' node--leaf')
      )
      .attr('transform', (d) => `translate(${d.y},${d.x})`);

    node
      .append('text')
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .text((d) => (d.data as Node).name);
  }
}
