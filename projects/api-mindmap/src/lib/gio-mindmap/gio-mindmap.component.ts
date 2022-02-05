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

type Node = {
  nodeKey: string;
  name: string;
  direction?: string;
  children: Node[];
};

@Component({
  selector: 'gio-mindmap',
  templateUrl: './gio-mindmap.component.html',
  styleUrls: ['./gio-mindmap.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GioMindmapComponent implements OnInit, AfterViewInit {
  @Input() width = 660;
  @Input() height = 500;

  data: Node;

  constructor() {
    this.data = {
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
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const svg = d3
      .select('#mindmap')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const group = displayTree(this.data, svg, {
      height: this.height,
      width: this.width,
    }).group;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0, 2])
      .on('zoom', (event) => {
        const transform = () => {
          const newX = event.transform.x + this.width / 2;
          const newY = event.transform.y;

          return `translate(${newX},${newY}) scale(${event.transform.k})`;
        };

        group?.attr('transform', transform);
      });

    svg.call(zoom);
  }
}

function dataLeft(data: Node): Node {
  return {
    ...data,
    children: data.children.filter((c) => c.direction === 'left') ?? [],
  };
}

function dataRight(data: Node): Node {
  return {
    ...data,
    children: data.children.filter((c) => c.direction === 'right') ?? [],
  };
}

function displayTree(
  data: Node,
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  { height, width }: { height: number; width: number }
): {
  group: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
} {
  const treeWidth = width;
  const treeHeight = height;

  const diagonalLink = linkHorizontal()
    // don't understand the typings, but `d` seems to be HierarchyPointNode
    .source((d: any) => [d.y, d.x])
    .target((d: any) => [d.parent.y, d.parent.x]) as any;

  const rootRight = tree<Node>().size([treeHeight, treeWidth / 2])(
    hierarchy(dataRight(data))
  );
  const rootLeft = tree<Node>().size([treeHeight, treeWidth / 2])(
    hierarchy(dataLeft(data))
  );

  const dh = rootRight.x - rootLeft.x;
  const nodesLeft = rootLeft.descendants().slice(1);
  nodesLeft.forEach((d) => {
    // align left/right nodes
    d.x += dh;
    d.y = -d.y;

    // Update left tree nodes to merge both tree
    if (d.parent?.data.nodeKey === rootLeft.data.nodeKey) {
      d.parent = rootRight;
    }
  });

  const allNodes = [...rootRight.descendants(), ...nodesLeft];

  const group = svg
    .append('g')
    .attr('id', 'tree')
    .attr('transform', `translate(${width / 2}, 0)`);
  group
    .selectAll('.link')
    .data(allNodes.slice(1))
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', diagonalLink);
  const nodes = group
    .selectAll('.node')
    .data(allNodes)
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

  return { group };
}
