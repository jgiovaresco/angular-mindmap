import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { hierarchy, tree } from 'd3-hierarchy';
import { linkHorizontal } from 'd3-shape';
import * as d3 from 'd3';
import { MindmapNode } from './gio-mindmap.model';
import { isEqual } from 'lodash';

const EMPTY: MindmapNode = {
  nodeKey: 'empty',
  name: 'empty',
  children: [],
};

@Component({
  selector: 'gio-mindmap',
  templateUrl: './gio-mindmap.component.html',
  styleUrls: ['./gio-mindmap.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GioMindmapComponent implements AfterViewInit, OnInit, OnChanges {
  @Input() width = 660;
  @Input() height = 500;
  @Input() data: MindmapNode = EMPTY;

  @ViewChild('mindmapContainer', { static: true })
  private mindmapContainer?: ElementRef;

  private initialXTranslate = this.width / 2;
  private initialYTranslate = 0;

  private svg?: d3.Selection<SVGSVGElement, unknown, null, any>;
  private mindmapGroup?: d3.Selection<SVGGElement, unknown, null, any>;

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    let dataChanges = changes['data'];

    if (!isEqual(dataChanges.previousValue, dataChanges.currentValue)) {
      if (this.svg) this.displayMindmap();
    }
  }

  ngAfterViewInit(): void {
    const container = this.mindmapContainer?.nativeElement as HTMLElement;
    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.mindmapGroup = this.svg
      .append('g')
      .attr('id', 'tree')
      .attr(
        'transform',
        `translate(${this.initialXTranslate}, ${this.initialYTranslate})`
      );

    this.displayMindmap();

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0, 2])
      .on('zoom', (event) => {
        const transform = () => {
          const newX = event.transform.x + this.initialXTranslate;
          const newY = event.transform.y + this.initialYTranslate;

          return `translate(${newX},${newY}) scale(${event.transform.k})`;
        };

        this.mindmapGroup?.attr('transform', transform);
      });

    this.svg.call(zoom);
  }

  displayMindmap() {
    const treeWidth = this.width;
    const treeHeight = this.height;

    const diagonalLink = linkHorizontal()
      // don't understand the typings, but `d` seems to be HierarchyPointNode
      .source((d: any) => [d.y, d.x])
      .target((d: any) => [d.parent.y, d.parent.x]) as any;

    const rootRight = tree<MindmapNode>().size([treeHeight, treeWidth / 2])(
      hierarchy(dataRight(this.data))
    );
    const rootLeft = tree<MindmapNode>().size([treeHeight, treeWidth / 2])(
      hierarchy(dataLeft(this.data))
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

    const group = d3.select('g#tree');

    group
      .selectAll('.link')
      .data(allNodes.slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', diagonalLink);

    const nodes = group
      .selectAll('.node')
      .data(allNodes, (d: any) => d.data.nodeKey);

    // Handle nodes creation

    const nodesEnter = nodes
      .enter()
      .append('g')
      .attr(
        'class',
        (d) => 'node' + (d.children ? ' node--internal' : ' node--leaf')
      )
      .attr('transform', (d) => `translate(${d.y},${d.x})`);

    nodesEnter
      .append('text')
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .text((d) => d.data.name);

    // Handle nodes update
    const nodeUpdate = nodes.transition();

    nodeUpdate.select('text').text((d) => d.data.name);
  }
}

function dataLeft(data: MindmapNode): MindmapNode {
  return {
    ...data,
    children: data.children.filter((c) => c.direction === 'left') ?? [],
  };
}

function dataRight(data: MindmapNode): MindmapNode {
  return {
    ...data,
    children: data.children.filter((c) => c.direction === 'right') ?? [],
  };
}
