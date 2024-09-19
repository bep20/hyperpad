import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';

import { cloneDeep } from 'lodash';
import { useParams, useSearchParams } from 'react-router-dom';
import Result from 'antd/es/result';
import Button from 'antd/es/button';
import Spin from 'antd/es/spin';

import { SearchOutlined, SmileOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import {
  AddClusterType,
  calculateRadius,
  getNodeDefaultRadialCoord,
} from '../utils/helpers';
import { useFetchOwnerDetails, useFetchTokenGraph } from '../utils/api';
import RightFloatingPanel from '../components/RightFloatingPanel';
import { CLUSTER_TYPE, GRAPH_STATUS } from '../utils/constants';
import NodeInfoCard from '../components/NodeInfoCard';
import { roundOff, scroll } from '../../../utils/helpers';
import LeftFloatingBar from '../components/LeftFloatingBar';
import HelmetLayout from '../../../components/HelmetLayout';

const hullPoints = data => {
  let pointArr = [];
  const padding = 20;
  data.forEach(d => {
    const pad = calculateRadius(d.percentage) + padding;
    pointArr = pointArr.concat([
      [d.x - pad, d.y - pad],
      [d.x - pad, d.y + pad],
      [d.x + pad, d.y - pad],
      [d.x + pad, d.y + pad],
    ]);
  });
  return pointArr;
};

function forceCluster() {
  let nodes;
  let radii;
  let strength = 1;
  let iterations = 1;
  let clusterPadding = 0; //addition

  const clusters = {};

  const force = alpha => {
    console.log({ alpha });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const [node1, node2] = [nodes[i], nodes[j]];
        // if (node1.peripheral !== node2.peripheral) {
        //   continue;
        // }

        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          const forceX = (dx / distance) * 1 * alpha;
          const forceY = (dy / distance) * 1 * alpha;
          //   console.log('force x', forceX, forceY);

          if (
            node1.peripheral == node2.peripheral &&
            clusters[node1.peripheral].length > 1
          ) {
            if (!(Math.abs(dx) < 200)) {
              node1.vx += 3 * forceX;
            } else {
              node1.vx += 0;
            }
            if (!(Math.abs(dy) < 200)) {
              node1.vy += 3 * forceY;
            } else {
              node1.vy += 0;
            }
          } else if (
            node1.peripheral != node2.peripheral &&
            ((clusters[node1.peripheral].length > 1 &&
              clusters[node2.peripheral].length > 1) ||
              (clusters[node1.peripheral].length == 1 &&
                clusters[node2.peripheral].length > 1) ||
              (clusters[node1.peripheral].length > 1 &&
                clusters[node2.peripheral].length == 1))
          ) {
            if (Math.abs(dx) < 100) {
              node1.vx -= 1 * forceX;
            } else {
              node1.vx -= 0;
            }

            if (Math.abs(dy) < 100) {
              node1.vy -= 1 * forceY;
            } else {
              node1.vy -= 0;
            }
          }

          //   if (node1.peripheral == node2.peripheral) {
          //     node1.vx += 10 * forceX;
          //     node1.vy += 10 * forceY;
          //   } else {
          //     node1.vx -= forceX;
          //     node1.vy -= forceY;
          //   }
        }
      }
    }
  };

  force.initialize = function (_) {
    nodes = _;

    nodes.forEach(item => {
      if (!clusters[item.peripheral]) {
        clusters[item.peripheral] = [item];
      } else {
        clusters[item.peripheral].push(item);
      }
    });
    return force;
  };

  return force;
}

const Graph = ({ setSearchModalOpen }) => {
  const svgRef = useRef();
  const [hiddenAddresses, setHiddenAddresses] = useState([]);
  const [hiddenPeripherals, setHiddenPeripherals] = useState([]);
  const initialHiddenPeripherals = useRef([]);
  const queryClient = useQueryClient();

  const [collapsed, setCollapsed] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const initialGraphLoad = useRef(true);

  const selectedNode = useRef(null);
  const selectedGroup = useRef(null);
  const d3Simulation = useRef(null);
  const d3SvgElements = useRef({});
  const oldGraphNodes = useRef([]);
  const lastPositions = useRef({});

  const [queryParams] = useSearchParams();
  const mapId = queryParams.get('mapId');
  const { mint_address } = useParams();

  const {
    data: graphData,
    isFetching: loadingGraph,
    isError: graphError,
    refetch: refetchGraph,
    fetchStatus: graphFetchStatus,
    error,
  } = useFetchTokenGraph({
    mapId,
    mintAddress: mint_address,
  });

  useEffect(() => {
    if (graphFetchStatus === 'idle' && initialGraphLoad.current) {
      initialGraphLoad.current = false;
    }
  }, [graphFetchStatus]);

  const { data: { ownerDetails = {}, hiddenOwners = [] } = {} } =
    useFetchOwnerDetails();

  const status = useMemo(() => graphData?.graph_status, [graphData]);

  const initialViewBox =
    Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0,
    ) > 1000 &&
    Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0,
    ) > 1000
      ? 1000
      : 450;

  const center = useMemo(
    () => ({
      x: (initialViewBox - (collapsed ? 0 : 240)) / 2,
      y: initialViewBox / 2,
    }),
    [initialViewBox, collapsed],
  );

  const ticked = () => {
    d3SvgElements.current.hulls.attr('d', d => {
      return d3SvgElements.current.clusterLine(
        d3.polygonHull(hullPoints(d.nodes)),
      );
    });

    d3SvgElements.current.lines
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('visibility', 'visible')
      .each(function (d) {
        const class_modifiers = [];
        const is_selected = selectedGroup.current === d.source?.group;
        if (is_selected) {
          class_modifiers.push('--selected');
          if (d?.forward > 0 && d?.backward > 0) {
            class_modifiers.push('--bidirectional');
          } else if (d?.forward > 0) {
            class_modifiers.push('--forward');
          } else if (d.backward > 0) {
            class_modifiers.push('--backward');
          }

          if (d.forward > 0) {
            d3.select(this).attr('marker-end', 'url(#endarrow)');
          }
          if (d.backward > 0) {
            d3.select(this).attr('marker-start', 'url(#startarrow)');
          }
        } else {
          d3.select(this).attr('marker-end', null);
          d3.select(this).attr('marker-start', null);
        }

        d3.select(this).attr('class', class_modifiers.join(' '));
      });

    d3SvgElements.current.circles
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('class', d =>
        selectedNode.current == d.address ? 'node-selected' : '',
      );
  };

  // Define a custom collision force function
  //   const collideForce = () => {
  //     let clusters = [];
  //     let nodes = [];
  //     const force = alpha => {
  //       clusters.forEach(function (cluster) {
  //         var hull = d3.polygonHull(
  //           cluster.nodes.map(function (d) {
  //             return [d.x, d.y];
  //           }),
  //         );
  //         cluster.nodes.forEach(function (node) {
  //           var radius = pointToPolygonDistance(node.x, node.y, hull);
  //           node.radius = radius;
  //         });
  //       });

  //       //   var nodes = clusters.reduce(
  //       //     (acc, cluster) => acc.concat(cluster.nodes),
  //       //     [],
  //       //   );

  //       var quadtree = d3
  //         .quadtree()
  //         .x(function (d) {
  //           return d.x;
  //         })
  //         .y(function (d) {
  //           return d.y;
  //         })
  //         .addAll(nodes);

  //       nodes.forEach(function (d) {
  //         var r = d.radius + 10,
  //           nx1 = d.x - r,
  //           nx2 = d.x + r,
  //           ny1 = d.y - r,
  //           ny2 = d.y + r;
  //         quadtree.visit(function (quad, x1, y1, x2, y2) {
  //           if (quad.data && quad.data !== d) {
  //             var x = d.x - quad.data.x,
  //               y = d.y - quad.data.y,
  //               l = Math.sqrt(x * x + y * y),
  //               r = d.radius + quad.data.radius;
  //             if (l < r) {
  //               l = ((l - r) / l) * alpha * 1000;
  //               d.x -= x *= l;
  //               d.y -= y *= l;
  //               quad.data.x += x - 100;
  //               quad.data.y += y;
  //             }
  //           }
  //           return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  //         });
  //       });
  //     };

  //     force.initialize = function (_) {
  //       nodes = _;

  //       clusters = [...new Set(nodes.map(node => node.peripheral))]
  //         .map(peripheral => {
  //           return {
  //             peripheral,
  //             nodes: nodes.filter(d => d.peripheral === peripheral),
  //           };
  //         })
  //         .filter(item => {
  //           return item?.nodes?.length > 1;
  //         });
  //       return force;
  //     };

  //     return force;
  //   };

  // Calculate the distance from a point to a convex hull
  //   const pointToPolygonDistance = (x, y, polygon) => {
  //     var inside = d3.polygonContains(polygon, [x, y]);
  //     if (inside) return 0;
  //     var distance = Infinity;
  //     for (var i = 0, n = polygon.length; i < n; ++i) {
  //       var p0 = polygon[i],
  //         p1 = polygon[i === n - 1 ? 0 : i + 1],
  //         p = closestPoint(x, y, p0[0], p0[1], p1[0], p1[1]);
  //       distance = Math.min(
  //         distance,
  //         Math.sqrt((p[0] - x) ** 2 + (p[1] - y) ** 2),
  //       );
  //     }
  //     return distance;
  //   };

  // Calculate the closest point on a line segment to a given point
  //   const closestPoint = (x, y, x0, y0, x1, y1) => {
  //     var dx = x1 - x0,
  //       dy = y1 - y0,
  //       t;
  //     if (dx === 0 && dy === 0) return [x0, y0];
  //     else {
  //       t = ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy);
  //       t = Math.max(0, Math.min(1, t));
  //       return [x0 + t * dx, y0 + t * dy];
  //     }
  //   };

  const initD3 = (links, nodes) => {
    const zoom = d3.zoom().on('zoom', event => {
      g.attr('transform', event.transform);
    });

    const svg = d3
      .select('#svg')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('viewBox', `0 0 ${initialViewBox} ${initialViewBox}`)
      .call(zoom);

    const g = svg.append('g');
    g.append('g').attr('id', 'hulls');
    g.append('g').attr('id', 'circles');
    g.append('g').attr('id', 'lines');

    const clusters_data = [...new Set(nodes.map(node => node.peripheral))]
      .map(peripheral => {
        return {
          peripheral,
          nodes: nodes.filter(d => d.peripheral === peripheral),
        };
      })
      .filter(item => {
        return item?.nodes?.length > 1;
      });

    d3Simulation.current = d3
      .forceSimulation(nodes)
      .alpha(1)
      .alphaTarget(0)
      .alphaDecay(0.008)
      .velocityDecay(0.2)
      .force('charge', d3.forceManyBody().strength(-50).distanceMax(200))
      .force('center', d3.forceCenter(center.x, center.y))
      .force(
        'radial',
        d3
          .forceRadial(d => getNodeDefaultRadialCoord(d), center.x, center.y)
          .strength(0.005),
      )
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.address)
          .distance(50)
          .strength(0.5),
      )
      //   .force('collideforce', collideForce(clusters_data))
      //   .force('collide', d3.forceCollide().radius(10).strength(0.2))
      .force('clusterRepulsion', forceCluster())

      //   cluster1Nodes.forEach(node1 => {
      //     cluster2Nodes.forEach(node2 => {
      //       const dx = node2.x - node1.x;
      //       const dy = node2.y - node1.y;
      //       const distance = Math.sqrt(dx * dx + dy * dy);
      //       if (distance > 0) {
      //         const forceX = (dx / distance) * strength * alpha;
      //         const forceY = (dy / distance) * strength * alpha;
      //         node1.vx -= forceX;
      //         node1.vy -= forceY;
      //       }
      //     });
      //   });
      // }
      //   )
      //   .force(
      //     'collide',
      //     d3.forceCollide(d => calculateRadius(d.percentage) + 10),
      //   )
      //   .force('x', d3.forceX(250))
      //   .force('y', d3.forceY(250))

      .on('tick', ticked);
  };
  const updateD3SvgElements = (links, nodes) => {
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const dragstarted = (event, d) => {
      if (!event.active)
        d3Simulation.current.alpha(0).alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (event, d) => {
      if (!event.active) d3Simulation.current.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    const peripheralDragged = (event, peripheral) => {
      d3SvgElements.current.circles
        .filter(d => {
          return d.peripheral === peripheral;
        })
        .each(d => {
          d.x += event.dx;
          d.y += event.dy;
        });
    };

    const g = d3.select('#svg').select('g');

    d3SvgElements.current.lines = g
      .select('#lines')
      .selectAll('line')
      .data(links, d => d.source.address + d.target.address)
      .join('line');

    d3SvgElements.current.circles = g
      .select('#circles')
      .selectAll('circle')
      .data(nodes, d => d.address)
      .join(
        enter =>
          enter.append('circle').attr('r', d => calculateRadius(d.percentage)),
        update =>
          update
            .transition()
            .duration(400)
            .attr('r', d => calculateRadius(d.percentage)),
        exit => exit.remove(),
      )
      .attr('fill', d => color(d.peripheral))
      .attr('stroke', d => color(d.peripheral))
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedRow(d);
        scroll(d?.address);
      })
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended),
      );

    d3SvgElements.current.circles
      .append('title')
      .text(d => ownerDetails[d.owner]?.name || d.address);

    d3SvgElements.current.clusterLine = d3
      .line()
      .curve(d3.curveCatmullRomClosed);

    const clusters_data = [...new Set(nodes.map(node => node.peripheral))]
      .map(peripheral => {
        return {
          peripheral,
          nodes: nodes.filter(d => d.peripheral === peripheral),
        };
      })
      .filter(item => {
        return item?.nodes?.length > 1;
      });

    // g.select('#hulls').selectAll('path').remove();

    // console.log('huuuuuuuu', g.select('#hulls').selectAll('hull'));
    d3SvgElements.current.hulls = g
      .select('#hulls')
      .selectAll('path')
      .data(clusters_data, d => {
        return d.peripheral;
      })
      //   .join(
      //     enter => enter.append('path'),
      //     update => update.transition().duration(400),
      //     exit => exit.remove(),
      //   )
      .attr('d', d => {
        const ress = d3SvgElements.current.clusterLine(
          d3.polygonHull(hullPoints(d.nodes)),
        );
        // console.log(
        //   'resss',
        //   ress,
        //   JSON.stringify(d3.polygonHull(hullPoints(d.nodes))),
        // );
        return ress;
      })
      .join(
        'path',
        update => {
          return update;
        },
        exit => {
          exit.remove();
        },
      )
      .attr('fill', d => {
        return color(d.peripheral);
      })
      .attr('stroke', d => color(d.peripheral))
      .call(
        d3
          .drag()
          .on('start', function (event) {
            if (!event.active)
              d3Simulation.current
                .alpha(0)
                .alphaTarget(0.3)
                .alphaDecay(0.03)
                .restart();
            d3.select(this).style('stroke-width', 4);
          })
          .on('drag', (event, d) => {
            peripheralDragged(event, d.peripheral);
          })
          .on('end', function (event) {
            if (!event.active) d3Simulation.current.alphaTarget(0);
            d3.select(this).style('stroke-width', 1.5);
          }),
      );
  };
  /**
   * filtering out links and nodes from graphData
   * adding percentage to nodes
   */
  const [orgLinks, orgNodes] = useMemo(() => {
    const { nodes = [], edges = [] } = graphData || {};
    const filteredLinks = edges?.filter(
      link => !(link.source === 'NULL' || link.target === 'NULL'),
    );
    const filteredNodes = nodes;
    //  nodes?.filter(node => node.txnCount != 0);
    const totalAmt = filteredNodes.reduce(
      (ac, el) => ac + BigInt(el.amount || 0n),
      0n,
    );

    filteredNodes.forEach(node => {
      node.percentage =
        totalAmt === 0n
          ? 0
          : Number((BigInt(node.amount || 0n) * 1000000n) / totalAmt) / 10000;
    });

    return [filteredLinks, filteredNodes];
  }, [graphData]);

  /**
   * adding peripheral ids to nodes
   */
  const [linksWithPeripherals, nodesWithPeripherals] = useMemo(() => {
    const { updatedNodes: newNodes, updatedLinks: newLinks } = AddClusterType(
      CLUSTER_TYPE.PERIPHERAL,
      orgNodes,
      orgLinks,
      hiddenPeripherals,
    );
    return [newLinks, newNodes];
  }, [orgLinks, orgNodes, hiddenPeripherals]);

  //   trimming nodes to 300
  const [trimmedLinks, trimmedNodes] = useMemo(() => {
    const slicedNodes = nodesWithPeripherals
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .filter(item => item.percentage > 0.001)
      .slice(0, 300);

    slicedNodes.forEach((node, i) => {
      node.rank = i + 1;
    });
    const slicedNodesAddresses = slicedNodes.map(node => node.address);
    const slicedLinks = linksWithPeripherals.filter(
      link =>
        slicedNodesAddresses.includes(link.source) &&
        slicedNodesAddresses.includes(link.target),
    );

    return [slicedLinks, slicedNodes];
  }, [linksWithPeripherals, nodesWithPeripherals]);

  /**
   * adding group to trimmed nodes
   * and making groups and links ready for d3graph
   */
  const [graphLinks, graphNodes] = useMemo(() => {
    const { updatedNodes, updatedLinks } = AddClusterType(
      CLUSTER_TYPE.GROUP,
      trimmedNodes,
      trimmedLinks,
      hiddenAddresses,
    );

    return [updatedLinks, updatedNodes];
  }, [trimmedLinks, trimmedNodes, hiddenAddresses]);

  const linkedNodesPer = useMemo(() => {
    if (selectedRow) {
      const linkedNodes = graphNodes.filter(
        node => node.group === selectedRow.group,
      );

      if (linkedNodes.length > 1) {
        return roundOff(linkedNodes.reduce((ac, el) => ac + el.percentage, 0));
      }
    }
    return null;
  }, [selectedRow, graphNodes]);

  const clusterNodesPer = useMemo(() => {
    if (selectedRow) {
      const clusterNodes = nodesWithPeripherals?.filter(
        node => node.peripheral === selectedRow.peripheral,
      );

      if (clusterNodes.length > 1) {
        return roundOff(clusterNodes.reduce((ac, el) => ac + el.percentage, 0));
      }
    }
    return null;
  }, [selectedRow, nodesWithPeripherals]);

  useEffect(() => {
    if (status === GRAPH_STATUS.COMPLETED) {
      setCollapsed(false);
      queryClient.setQueryDefaults([mapId], { staleTime: Infinity });
    }
  }, [status]);

  useEffect(() => {
    if (orgNodes) {
      const set = new Set();
      orgNodes.forEach(node => {
        if (hiddenOwners.includes(node?.owner)) {
          node.isPeripheral = true;
          set.add(node.address);
        }
      });
      initialHiddenPeripherals.current = [...set];
      setHiddenAddresses([...set]);
      setHiddenPeripherals([...set]);
    }
  }, [hiddenOwners, orgNodes]);

  /**
   * this useeffect will initialize the graph
   * and rerender only if orgLinks and nodes changes
   */
  useEffect(() => {
    const clonedNodes = cloneDeep(orgNodes);
    const clonedLinks = cloneDeep(orgLinks);

    const slicedNodes = clonedNodes
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .filter(item => item.percentage > 0.01)
      .slice(0, 300);

    const slicedNodesAddresses = slicedNodes.map(node => node.address);

    const slicedLinks = clonedLinks.filter(
      link =>
        slicedNodesAddresses.includes(link.source) &&
        slicedNodesAddresses.includes(link.target),
    );

    oldGraphNodes.current = slicedNodes;

    initD3(slicedLinks, slicedNodes);
    updateD3SvgElements(slicedLinks, slicedNodes);

    return () => {
      d3Simulation?.current?.stop?.();
      d3.select('#svg').selectAll('g').remove();
    };
  }, [orgLinks, orgNodes]);

  useEffect(() => {
    d3Simulation.current
      .force('center', d3.forceCenter(center.x, center.y).strength(0.03))
      .force(
        'radial',
        d3
          .forceRadial(d => getNodeDefaultRadialCoord(d), center.x, center.y)
          .strength(0.005),
      )
      .restart()
      .alpha(0.3);
  }, [center]);

  useEffect(() => {
    oldGraphNodes.current.forEach(node => {
      lastPositions.current[node.address] = { x: node.x, y: node.y };
    });
    const newNodes = graphNodes.filter(node => !node?.hidden);
    const newLinks = graphLinks.filter(link => !link?.hidden);

    const newGraphNodes = newNodes.map(node => {
      const oldGraphNode = oldGraphNodes.current.find(
        el => el.address === node.address,
      );
      if (oldGraphNode) {
        return { ...oldGraphNode, ...node };
      }
      let defaultPosition;
      if (lastPositions.current[node.address]) {
        defaultPosition = lastPositions.current[node.address];
      } else {
        const r = getNodeDefaultRadialCoord(node);
        const theta = Math.random() * Math.PI * 2;
        defaultPosition = {
          x: center.x + r * Math.cos(theta),
          y: center.y + r * Math.sin(theta),
        };
      }
      return {
        ...defaultPosition,
        ...node,
      };
    });

    d3Simulation.current
      .nodes(newGraphNodes)
      .force(
        'link',
        d3
          .forceLink(newLinks)
          .id(d => d.address)
          .distance(50)
          .strength(0.5),
      )
      .restart()
      .alpha(0.3);
    updateD3SvgElements(newLinks, newGraphNodes);
    oldGraphNodes.current = newGraphNodes;
  }, [graphLinks, graphNodes]);

  useEffect(() => {
    selectedNode.current = selectedRow?.address || null;
    selectedGroup.current = selectedRow?.group || null;
    if (d3Simulation.current) d3Simulation.current.restart();
  }, [selectedRow]);

  return (
    <>
      <HelmetLayout
        title='Token Scanner: Analyze Token Transfers with bubble graph'
        description='Explore token transactions and analyze transfer patterns with our Token Scanner tool. Generate bubble graphs to visualize token movement and identify linked holder clusters for deeper insights. Enhance your token analysis capabilities today.'
        keywords='Token scanner, token transfer analysis, bubble graph generator, holder cluster identification, token movement visualization, Solana blockchain tools, token analysis utilities'
      />

      <div className='graphView'>
        {loadingGraph && initialGraphLoad?.current ? (
          <Spin size='large' className={!collapsed ? 'mr-[300px]' : ''} />
        ) : (
          <>
            {loadingGraph ? (
              <Spin size='large' className={!collapsed ? 'mr-[300px]' : ''} />
            ) : status === GRAPH_STATUS.COMPLETED ? (
              <>
                <svg
                  ref={svgRef}
                  id='svg'
                  pointerEvents='all'
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedRow(null);
                  }}>
                  <defs>
                    <marker
                      id='startarrow'
                      markerWidth='8'
                      markerHeight='6'
                      refX='1'
                      refY='3'
                      orient='auto'
                      markerUnits='userSpaceOnUse'>
                      <polygon points='8 6, 0 3, 8 0' fill='white' />
                    </marker>
                    <marker
                      id='endarrow'
                      markerWidth='8'
                      markerHeight='6'
                      refX='7'
                      refY='3'
                      orient='auto'
                      markerUnits='userSpaceOnUse'>
                      <polygon points='0 0, 8 3, 0 6' fill='white' />
                    </marker>
                  </defs>
                </svg>
                <LeftFloatingBar
                  tokenDetails={{
                    ...(graphData?.token_details || {}),
                    createdAt: graphData?.updatedAt,
                  }}
                />
                {selectedRow && (
                  <NodeInfoCard
                    selectedRow={selectedRow}
                    setSelectedRow={setSelectedRow}
                    ownerDetails={ownerDetails}
                    clusterPercentage={clusterNodesPer}
                    linkedPercentage={linkedNodesPer}
                  />
                )}
              </>
            ) : (
              <Result
                status={
                  error?.response?.status ||
                  (graphError
                    ? 500
                    : status === GRAPH_STATUS.FAILED
                      ? 'error'
                      : 'info')
                }
                icon={
                  [GRAPH_STATUS.PROCESSING, GRAPH_STATUS.SUBMITTED].includes(
                    status,
                  ) ? (
                    <SmileOutlined />
                  ) : undefined
                }
                title={
                  graphError
                    ? error?.response?.data ||
                      error?.message ||
                      'Sorry, something went wrong.'
                    : status === GRAPH_STATUS.FAILED
                      ? 'Processing Failed'
                      : status === GRAPH_STATUS.PROCESSING
                        ? "Great, we're processing your token!"
                        : 'Thank you for submitting your token. It will be processed shortly.'
                }
                extra={
                  <Button
                    type='primary'
                    size='large'
                    onClick={() => {
                      if (graphError) {
                        refetchGraph();
                      } else {
                        setCollapsed(false);
                      }
                    }}>
                    {graphError ? 'Retry' : 'View Graph history'}
                  </Button>
                }
              />
            )}

            <RightFloatingPanel
              hiddenAddresses={hiddenAddresses}
              setHiddenAddresses={setHiddenAddresses}
              initialHiddenPeripherals={initialHiddenPeripherals.current || []}
              hiddenPeripherals={hiddenPeripherals}
              setHiddenPeripherals={setHiddenPeripherals}
              nodes={graphNodes}
              ownerDetails={ownerDetails}
              graphError={graphError}
              graphStatus={status}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
              currentSelected={mapId}
            />
            {!loadingGraph && (
              <div
                onClick={() => {
                  setSearchModalOpen(true);
                }}
                className={`border shadow-[-4px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center justify-between min-w-[270px] gap-x-8 h-[40px] px-4 cursor-pointer rounded-[4px] transition-all duration-[400ms] absolute top-[7px] ${collapsed ? 'right-[133px]' : 'right-[313px]'} bg-white z-[1]`}>
                <span className='text-slate-500'>Search</span>
                <SearchOutlined />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Graph;
