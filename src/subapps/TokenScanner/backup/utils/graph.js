export default {
  computed: {
    clusterColors() {
      return '--cluster-node-colors' in this.colorScheme
        ? this.colorScheme['--cluster-node-colors']
        : [
            '#be3caf',
            '#fd4a85',
            '#ff744a',
            '#e6b22e',
            '#b3eb53',
            '#5cf662',
            '#21e49a',
            '#1fb4d2',
          ];
    },
    isolatedColor() {
      return '--isolated-node-color' in this.colorScheme
        ? this.colorScheme['--isolated-node-color']
        : '#6536a3';
    },
    allNodes() {
      if (this.graph_data.version <= 2) {
        return this.graph.nodes.concat(this.graph_data.ignored_addresses);
      }
      return this.graph.nodes.concat(
        this.graph_data.nodes.filter(
          node => !this.graph.nodes.some(n => n.address == node.address),
        ),
      );
    },
    ranks() {
      const ranks = {};
      this.allNodes
        .sort((a, b) => {
          if (b.amount > a.amount) return 1;
          if (b.amount < a.amount) return -1;
          // If amounts are equal, we order by address to be consistent
          return b.address - a.address;
        })
        .forEach((item, i) => {
          ranks[item.address] = i + 1;
        });
      return ranks;
    },
    allAddresses() {
      return [...this.allNodes].sort(
        (a, b) =>
          this.getAddressRank(a.address) - this.getAddressRank(b.address),
      );
    },
    img_name() {
      return this.$store.getters.get_token_img(
        this.$route.params.token,
        this.$route.params.chain,
      );
    },
    nodesPercents() {
      const percent_exclude_setting = this.$store.getters.get_percent_exclude;
      let divider_value = 100;
      if (percent_exclude_setting == 'DEAD') {
        const ignored_percents = this.allNodes
          .map(el => (el.is_dead && this.isHidden(el) ? el.percentage : 0))
          .reduce((a, b) => a + b, 0);
        divider_value = 100 - ignored_percents;
      } else if (percent_exclude_setting == 'ON') {
        const ignored_percents = this.allNodes
          .map(el => (this.isHidden(el) ? el.percentage : 0))
          .reduce((a, b) => a + b, 0);
        divider_value = 100 - ignored_percents;
      }
      // divider_value should not be negative as ignored_percents is <100
      // (==100 if all wallets hidden, but then it is not a problem for hidden
      // wallets to have 'Infinity' as %). But it can be max 101 actually because
      // of the margin taken for rounding approximations.
      // So in the extremely unlikely event where it is negative while all wallets
      // not being hidden, we're safe with the following line:
      divider_value = divider_value < 0 ? 0 : divider_value;
      return this.allNodes.reduce(
        (previous, current) => ({
          ...previous,
          [current.address]: (current.percentage * 100) / divider_value,
        }),
        {},
      );
    },
  },
  methods: {
    data_age_hours() {
      if (this.graph_data) {
        return (
          (Date.now() - Date.parse(this.graph_data.dt_update)) /
          (1000 * 60 * 60)
        );
      }
      return 0;
    },
    getNodeColor(d) {
      return this.getGroupColor(d.group);
    },
    getColorFromAddress(address) {
      const custom_tag = this.$store.getters.get_custom_tag(address);
      const nb_colors = this.clusterColors.length;
      if (custom_tag && custom_tag.colorIndex) {
        // with default theme % is not needed, but important if theme has a
        // different number of colors
        return this.clusterColors[custom_tag.colorIndex % nb_colors];
      }
      const hash = parseInt(address.substring(0, 8), 16);
      return this.clusterColors[hash % nb_colors];
    },
    getGroupColor(group, opacityHex = null) {
      let color;
      if (group == -1) {
        color = this.isolatedColor;
      } else {
        color = this.getColorFromAddress(this.graph.groups_main_nodes[group]);
      }
      return opacityHex ? color + opacityHex : color;
    },
    getGroupAddresses(group) {
      return this.graph.nodes
        .filter(el => el.group == group)
        .map(el => el.address);
    },
    getPercentAddress(address) {
      return this.nodesPercents[address];
    },
    getPercentGroup(group) {
      return this.graph.nodes
        .map(el => (el.group == group ? this.getPercentAddress(el.address) : 0))
        .reduce((a, b) => a + b, 0);
    },
    getAmountAddress(address) {
      return this.allNodes.find(el => el.address == address).amount;
    },
    getAddressRank(address) {
      return this.ranks[address];
    },
    getNodeProperty(address, property_name) {
      return this.graph.nodes.find(el => el.address == address)[property_name];
    },
    getFormatedName(address) {
      const name = this.getNodeProperty(address, 'name');
      return name || this.getFormatedAddress(address);
    },
    isHidden(node) {
      if (this.graph_data.version <= 2) {
        return !!node.name;
      }
      // TO DO : sanitize state management
      // This will break if not called on HoldersGraph or its children
      return 'hiddenAddresses' in this
        ? this.hiddenAddresses.includes(node.address)
        : this.$parent.hiddenAddresses.includes(node.address);
    },
  },
};
