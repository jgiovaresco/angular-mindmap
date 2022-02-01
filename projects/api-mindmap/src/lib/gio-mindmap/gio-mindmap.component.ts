import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { hierarchy, tree } from 'd3-hierarchy';
import { linkHorizontal } from 'd3-shape';
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
    const diagonalLink = linkHorizontal()
      // don't understand the typings, but `d` seems to be HierarchyPointNode
      .source((d: any) => [d.y, d.x])
      .target((d: any) => [d.parent.y, d.parent.x]) as any;

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
      .attr('d', diagonalLink);

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

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        group.attr('transform', () => {
          // add the initial translation to every zoom translation
          const newX = event.transform.x + this.margins.left;
          const newY = event.transform.y + this.margins.top;

          return `translate(${newX},${newY}) scale(${event.transform.k})`;
        });
      });

    svg.call(zoom);
  }
}
