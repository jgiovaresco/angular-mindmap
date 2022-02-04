import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { hierarchy, HierarchyPointNode, tree } from 'd3-hierarchy';
import { linkHorizontal } from 'd3-shape';
import * as d3 from 'd3';

type Node = { name: string; direction?: string; children?: Node[] };

type Margins = { top: number; right: number; bottom: number; left: number };

@Component({
  selector: 'gio-mindmap',
  templateUrl: './gio-mindmap.component.html',
  styleUrls: ['./gio-mindmap.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GioMindmapComponent implements OnInit, AfterViewInit {
  @Input() width = 660;
  @Input() height = 500;

  margins: Margins = { top: 0, right: 0, bottom: 0, left: 0 };

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
            {
              name: 'Node 3',
              direction: 'left',
              children: [{ name: 'Leaf 3', direction: 'left' }],
            },
            { name: 'Leaf 4', direction: 'left' },
          ],
        },
        { name: 'Branch 4', direction: 'right' },
      ],
    };
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const svg = d3
      .select('#mindmap')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    let group1: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
      group2: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    group1 = displayTree(
      dataLeft(this.data),
      svg,
      {
        height: this.height,
        width: this.width,
        margins: this.margins,
      },
      'right'
    ).group;

    group2 = displayTree(
      dataRight(this.data),
      svg,
      {
        height: this.height,
        width: this.width,
        margins: this.margins,
      },
      'left'
    ).group;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0, 2])
      .on('zoom', (event) => {
        const transform = () => {
          // add the initial translation to every zoom translation
          const newX = event.transform.x + this.margins.left;
          const newY = event.transform.y + this.margins.top;

          return `translate(${newX},${newY}) scale(${event.transform.k})`;
        };

        group1?.attr('transform', transform);
        group2?.attr('transform', transform);
      });

    svg.call(zoom);
  }
}

function dataLeft(data: Node): Node {
  return {
    ...data,
    children: data.children?.filter((c) => c.direction === 'left') ?? [],
  };
}

function dataRight(data: Node): Node {
  return {
    ...data,
    children: data.children?.filter((c) => c.direction === 'right') ?? [],
  };
}

function displayTree(
  data: Node,
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  {
    height,
    width,
    margins,
  }: { height: number; width: number; margins: Margins },
  direction: 'left' | 'right'
): {
  group: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  nodes: d3.Selection<
    SVGGElement,
    HierarchyPointNode<unknown>,
    SVGGElement,
    any
  >;
} {
  const treeWidth = width - margins.left - margins.right;
  const treeHeight = height - margins.top - margins.bottom;

  const diagonalLink = linkHorizontal()
    // don't understand the typings, but `d` seems to be HierarchyPointNode
    .source((d: any) => [d.y, d.x])
    .target((d: any) => [d.parent.y, d.parent.x]) as any;

  const inverse = direction === 'left' ? -1 : 1;

  const root = tree().size([treeHeight, (inverse * treeWidth) / 2])(
    hierarchy(data)
  );
  root.x = height / 2;

  const group = svg
    .append('g')
    .attr('id', 'left-tree')
    .attr('transform', `translate(${margins.left},${margins.top})`);
  group
    .selectAll('.link')
    .data(root.descendants().slice(1))
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', diagonalLink);
  const nodes = group
    .selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr(
      'class',
      (d) => 'node' + (d.children ? ' node--internal' : ' node--leaf')
    )
    .attr('transform', (d) => `translate(${d.y},${d.x})`);
  nodes
    .append('text')
    .attr('dy', '.35em')
    .style('text-anchor', 'middle')
    .text((d) => (d.data as Node).name);

  return { group, nodes };
}
