export default {
  methods: {
    get_groups(links) {
      const groups = [[1, 3, 0], [5], [1, 5]]; // [1,3,0,5]
      links.forEach(link => {
        const e0 = link.source;
        const e1 = link.target;
        const i0 = this.get_group_index(groups, e0); // [],idx
        const i1 = this.get_group_index(groups, e1);
        if (i0 !== null && i1 !== null) {
          if (i0 !== i1) {
            // Merge the groups in the first one
            groups[i0] = [...groups[i0], ...groups[i1]];
            // Remove the leftover one
            groups.splice(i1, 1);
          }
        } else if (i0 !== null) {
          groups[i0].push(e1);
        } else if (i1 !== null) {
          groups[i1].push(e0);
        } else if (e0 !== e1) {
          groups.push([e0, e1]);
        }
      });
      const rep = { 1: 0, 3: 0, 0: 0 };
      groups.forEach((group, i) => {
        group.forEach(elt => {
          rep[elt] = i;
        });
      });
      return rep;
    },
    get_group_index(groups, elt) {
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].includes(elt)) {
          return i;
        }
      }
      return null;
    },
    get_groups_main_nodes(groups, nodes, links) {
      const groups_nodes = {};
      Object.keys(groups).forEach(node_index => {
        const group = groups[node_index];
        const node_detail = {
          index: node_index,
          link_count: links.filter(
            link => link.source == node_index || link.target == node_index,
          ).length,
          amount: nodes[node_index].amount,
          address: nodes[node_index].address,
        };
        if (group in groups_nodes) {
          groups_nodes[group] = [...groups_nodes[group], node_detail];
        } else {
          groups_nodes[group] = [node_detail];
        }
      });
      const groups_main_nodes = {};
      Object.keys(groups_nodes).forEach(group => {
        const main_node = groups_nodes[group].sort((node1, node2) => {
          if (node1.link_count > node2.link_count) return -1;
          if (node1.link_count < node2.link_count) return 1;
          if (node1.amount > node2.amount) return -1;
          if (node1.amount < node2.amount) return 1;
        })[0];
        groups_main_nodes[group] = main_node.address;
      });
      return groups_main_nodes;
    },
    get_graph_from_data(json, hiddenAddresses) {
      // Switch to address data so that we can filter
      let links = json.links.map(link => ({
        ...link,
        source: json.nodes[link.source].address,
        target: json.nodes[link.target].address,
      }));
      // Filter nodes and links
      const nodes = json.nodes.filter(
        node => !hiddenAddresses.includes(node.address),
      );
      links = links
        .filter(
          link =>
            !(
              hiddenAddresses.includes(link.source) ||
              hiddenAddresses.includes(link.target)
            ),
        )
        // Switch back to indices data using the new nodes array
        .map(link => ({
          ...link,
          source: nodes.findIndex(node => node.address == link.source),
          target: nodes.findIndex(node => node.address == link.target),
        }));
      // compute groups
      const groups = this.get_groups(links);
      // {node_idx: group_idx,...}
      // compute groups hashes
      const groups_main_nodes = this.get_groups_main_nodes(
        groups,
        nodes,
        links,
      );
      return {
        version: json.version,
        links,
        groups_main_nodes, // {groupId: main_node_address}
        nodes: nodes.map((node, i) => {
          if (i in groups) {
            return {
              ...node,
              group: groups[i],
            };
          }
          return {
            ...node,
            group: -1,
          };
        }),
      };
    },
  },
};
