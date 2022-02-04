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

    let group: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    group = displayTree(this.data, svg, {
      height: this.height,
      width: this.width,
    }).group;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0, 2])
      .on('zoom', (event) => {
        const transform = () => {
          const newX = event.transform.x;
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

  const rootLeft = tree().size([treeHeight, (-1 * treeWidth) / 2])(
    hierarchy(dataLeft(data))
  );
  rootLeft.x = height / 2;
  const nodesLeft = rootLeft.descendants().slice(1);

  const rootRight = tree().size([treeHeight, treeWidth / 2])(
    hierarchy(dataRight(data))
  );
  rootRight.x = height / 2;

  const allNodes = [...rootRight.descendants(), ...nodesLeft];

  const group = svg.append('g').attr('id', 'tree');
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
