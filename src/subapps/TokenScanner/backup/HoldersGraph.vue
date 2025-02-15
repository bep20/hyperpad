<template>
  <!-- ############### -->
  <!-- ### DIALOGS ### -->
  <!-- ############### -->

  <!-- Details Dialog -->
  <GraphDetails
    ref="graphDetails"
    :graph="graph"
    :graph_data="graph_data"
    :avengerDaoScore="avengerDaoScore"
    :avengerDaoTrustLevel="avengerDaoTrustLevel"
    :selected_group="selected_group"
  />
  <!-- Help Dialog -->
  <GraphHelp ref="graphHelp" />
  <!-- Settings Dialog -->
  <GraphSettings ref="graphSettings" />
  <!-- Old Map Dialog -->
  <Dialog ref="oldMapDialog">
    <div class="mdc-dialog__content">
      <h2>Refresh the Map to access V2 features</h2>
      <p>
        This is an old bubble map. The data for token transfers views is not
        available, and wallets visibility toggles are disabled.
      </p>
      <p>
        Please use the history panel to show a more recent map and see
        up-to-date data and functionnalities.
      </p>
    </div>
    <div class="mdc-dialog__actions">
      <Button data-mdc-dialog-action="discard" data-mdc-dialog-initial-focus>
        Close
      </Button>
    </div>
  </Dialog>
  <!-- Not Listed Dialog -->
  <Dialog ref="notListedDialog">
    <div class="mdc-dialog__content">
      <h2>Unknown Project</h2>
      <p>
        Bubblemaps is able to scan almost any smart contract.
        <b>We do not endorse</b> any project accessible on our platform.
      </p>
      <p>
        For all we know, <b>this could be anything</b>: a token with malicious
        properties, a copycat of a legit token, a project with dubious team
        members, or even a technical contract not intended for public use.
      </p>
      <p>Do your own research and proceed with caution.</p>
    </div>
    <Button
      class="dialog__central-button mdc-button--raised"
      link="https://docs.google.com/forms/d/e/1FAIpQLSdj9s9DhslOWlgv1xaJRlOAAv-3lYOzR7W9IWpnv0v0b2EFog/viewform"
      target="_blank"
    >
      Apply to remove this warning
    </Button>
    <div class="mdc-dialog__actions">
      <Button data-mdc-dialog-action="discard" data-mdc-dialog-initial-focus>
        Close
      </Button>
    </div>
  </Dialog>
  <!-- Youtube Dialog -->
  <Dialog
    ref="youtubeDialog"
    :defaultWidth="800"
    @opened="$refs.youtubeVideo.play()"
    @closing="$refs.youtubeVideo.pause()"
    v-if="youtube_link"
  >
    <div class="mdc-dialog__content">
      <YoutubeVideo :src="youtube_link" ref="youtubeVideo" />
    </div>
    <div class="mdc-dialog__actions">
      <Button data-mdc-dialog-action="discard">Close</Button>
    </div>
  </Dialog>

  <!-- ###################### -->
  <!-- ### WALLET DETAILS ### -->
  <!-- ###################### -->

  <!-- This is before everything else bc should be below the view selector -->
  <WalletDetails
    v-if="selected_node"
    :selected_node="selected_node"
    :selected_group="selected_group"
    :graph="graph"
    :graph_data="graph_data"
    :tokenIndex="tokenIndex"
    :class="
      'wallet-details' +
      (isIframe() ? ' --iframe' : '') +
      (smallText ? ' --small-text' : '')
    "
  />

  <!-- ################### -->
  <!-- ### TOP BUTTONS ### -->
  <!-- ################### -->

  <div
    v-if="graph"
    :class="
      'buttons-row' +
      (isIframe() ? ' --iframe' : '') +
      (tableIsOpen ? ' --table-open' : '') +
      (smallText ? ' --small-text' : '')
    "
  >
    <div class="buttons-row__left-side">
      <!-- Details Button -->
      <div
        class="buttons-row__button buttons-row__button--title"
        @click="$refs.graphDetails.open()"
      >
        <img
          alt=""
          :src="`https://storage.googleapis.com/public-bubblemaps/app/tokens-images/${img_name}`"
          v-if="img_name"
          class="buttons-row__button_image"
        />
        <LogoPlaceholder
          v-else
          :letters="graph_data.symbol.substring(0, 2)"
          class="buttons-row__button_image"
          :size="smallText ? 22 : 24"
        />
        <span
          v-if="!hide_context"
          class="buttons-row__button__text buttons-row__button__text--to-hide"
          >{{ graph_data.full_name }}</span
        >
        <span class="material-icons">more_horiz</span>
        <template v-if="graph_data.top_500">
          <span
            class="material-icons buttons-row__button__top500"
            aria-describedby="holdersgraph_top500_tooltip"
          >
            keyboard_double_arrow_up
          </span>
          <Tooltip
            text="This map shows up to 500 holders"
            id="holdersgraph_top500_tooltip"
          />
        </template>
      </div>
      <!-- Scanner Button -->
      <a
        class="buttons-row__button --scanner"
        v-if="!hide_context"
        :href="`${get_scanner_root()}token/${$route.params.token}#balances`"
        target="_blank"
      >
        <SvgScannerLogo class="scanner-icon" />
      </a>
      <!-- Help Button -->
      <div class="buttons-row__button" @click="$refs.graphHelp.open()">
        <span class="material-icons" aria-label="Help" alt="Help">help</span>
      </div>
      <!-- Youtube Button -->
      <div
        class="buttons-row__button"
        @click="$refs.youtubeDialog.open()"
        v-if="youtube_link"
      >
        <SvgYoutubeLogo color class="youtube-icon" />
      </div>
      <!-- Settings Button -->
      <div
        class="buttons-row__button"
        v-if="!isIframe()"
        @click="$refs.graphSettings.open()"
      >
        <span class="material-icons" aria-label="Settings" alt="Settings"
          >settings</span
        >
        <div class="buttons-row__button__new">New</div>
      </div>
      <!-- View Selector -->
      <ViewSelector
        :tokenIndex="tokenIndex"
        :token_links="graph_data.token_links"
        class="buttons-row__view-selector"
      />
    </div>
    <div class="buttons-row__right-side">
      <!-- History Button -->
      <div
        class="buttons-row__button"
        @click="openHistoryTable()"
        v-if="!historyTableIsOpen && !isIframe()"
      >
        <span class="material-icons" aria-label="Event" alt="Event">event</span>
        <span
          class="buttons-row__button__text buttons-row__button__text--to-hide"
        >
          {{ getDateAge(new Date(graph_data.dt_update)) }}
        </span>
      </div>
      <!-- WalletsTable Button -->
      <div
        class="buttons-row__button"
        @click="openWalletsTable()"
        v-if="!walletsTableIsOpen"
      >
        <span class="material-icons" aria-label="Table" alt="Table">toc</span>
        <span
          class="buttons-row__button__text buttons-row__button__text--to-hide"
        >
          Wallets List
        </span>
      </div>
    </div>
  </div>

  <!-- ################## -->
  <!-- ### MAIN PARTS ### -->
  <!-- ################## -->

  <!-- Zoom Buttons -->
  <div
    :class="
      'buttons-row --bottom' +
      (tableIsOpen ? ' --table-open' : '') +
      (smallText ? ' --small-text' : '')
    "
  >
    <div id="zoom_in" class="buttons-row__button">
      <span class="material-icons">add_circle_outline</span>
    </div>
    <div id="zoom_out" class="buttons-row__button">
      <span class="material-icons">remove_circle_outline</span>
    </div>
  </div>
  <!-- Elastic warning -->
  <div v-if="graph_data.is_elastic" class="elastic-warning">
    This token has elastic supply properties.
    <br />
    Percentages are scaled for better readability.
  </div>
  <!-- Not listed warning -->
  <div
    v-if="!isIframe() && !img_name"
    :class="'not-listed-warning' + (tableIsOpen ? ' --with-table' : '')"
  >
    <span
      class="not-listed-warning__content"
      @click="$refs.notListedDialog.open()"
    >
      <SvgWarningIcon class="not-listed-warning__icon" />
      <span class="not-listed-warning__text" v-if="expandedWarning">
        This project is unknown to Bubblemaps, proceed with caution. Click to
        read more.
      </span>
    </span>
    <span
      class="material-icons not-listed-warning__close-button"
      aria-label="Close"
      alt="Close"
      @click="expandedWarning = false"
      v-if="expandedWarning"
    >
      close
    </span>
  </div>
  <!-- Dynamic loading and errors -->
  <div :class="'loading-state' + (tableIsOpen ? ' --table-open' : '')">
    <div class="loading-state__loading" v-if="loading">
      <Loader :size="50" />
    </div>
    <div class="loading-state__message" v-if="refreshLoading">
      <RotatingText
        :variations="[
          'Refresh in progress, this will take a minute.',
          'Bubbles are loading, are you ready?',
          'Fetching new transfers, please hold',
          'Searching for new clusters to investigate...',
          'Found something special? Ask about it on our Telegram',
          'Take up the habit, just Bubble it.',
          'Arno needs more cheese',
          'Bubblemaps is powered by baguettes and wine',
          'The circumference of a bubble is somewhat related to pi',
          'Did you know? Bubblemaps idea came from long jacuzzi sessions',
        ]"
      />
    </div>
    <div class="loading-state__message --error" v-if="error">
      An unexpected error has occured, please verify your internet connection.
      <span
        class="material-icons"
        aria-label="Close"
        alt="Close"
        @click="$parent.error = null"
      >
        close
      </span>
    </div>
  </div>
  <a
    class="nqOS1i94jjegY51z"
    target="_blank"
    v-if="
      'nqOS1i94jjegY51z' in graph_data &&
      tokenIndex == graph_data.token_links.length - 1
    "
    :href="graph_data.nqOS1i94jjegY51z"
  >
    <img
      src="https://storage.googleapis.com/public-bubblemaps/graphics/nqOS1i94jjegY51z.png"
    />
  </a>
  <!-- Wallets Table -->
  <WalletsTable
    v-if="graph && walletsTableIsOpen"
    :selected_node="selected_node"
    :selected_group="selected_group"
    :graph="graph"
    :graph_data="graph_data"
    :class="
      'side-table' +
      (isIframe() ? ' --iframe' : '') +
      (smallText ? ' --small-text' : '')
    "
  />
  <!-- History Table -->
  <HistoryTable
    v-if="graph && historyTableIsOpen"
    class="side-table"
    :graph_data="graph_data"
    :refreshLoading="refreshLoading"
    :historicalMaps="historicalMaps"
  />
  <!-- Wallet Details -->
  <WalletTransactions
    v-if="selected_node"
    ref="walletTransactions"
    :selected_node="selected_node"
    :graph="graph"
    :graph_data="graph_data"
    :tokenIndex="tokenIndex"
  />

  <!-- iframe Watermark -->
  <a
    v-if="isIframe()"
    :href="
      `https://app.bubblemaps.io/${$route.params.chain}/token/${$route.params.token}` +
      ($route.query.id ? `?id=${$route.query.id}` : '')
    "
    target="_blank"
    class="iframe-watermark"
  >
    <SvgBubblemapsLogo :colored="false" />
    <span class="iframe-watermark__powered">Powered by </span>
    <span class="iframe-watermark__name">Bubblemaps</span>
  </a>
  <!-- Graph -->
  <div
    v-if="graph && graph['nodes'].length == 0"
    :class="'no-wallets-shown' + (tableIsOpen ? ' --table-open' : '')"
  >
    <div class="no-wallets-shown__title">No wallet to show</div>
    <div>Use the wallets list tab to show hidden&nbsp;wallets.</div>
    <Button outlined @click="openWalletsTable" v-if="!walletsTableIsOpen"
      >Open wallets list tab</Button
    >
    <Button raised @click="revealAll">Show All Wallets</Button>
  </div>
  <svg id="svg" pointer-events="all">
    <defs>
      <marker
        id="startarrow"
        markerWidth="8"
        markerHeight="6"
        refX="1"
        refY="3"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon points="8 6, 0 3, 8 0" fill="white" />
      </marker>
      <marker
        id="endarrow"
        markerWidth="8"
        markerHeight="6"
        refX="7"
        refY="3"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon points="0 0, 8 3, 0 6" fill="white" />
      </marker>
    </defs>
  </svg>
</template>

<script>
import * as d3 from 'd3';
import BezierEasing from 'bezier-easing';
import Loader from '@/components/atoms/Loader.vue';
import Dialog from '@/components/atoms/material/Dialog.vue';
import Button from '@/components/atoms/material/Button.vue';
import Tooltip from '@/components/atoms/material/Tooltip.vue';
import LogoPlaceholder from '@/components/atoms/LogoPlaceholder.vue';
import RotatingText from '@/components/atoms/RotatingText.vue';
import YoutubeVideo from '@/components/molecules/YoutubeVideo.vue';
import GraphDetails from '@/components/organisms/HoldersGraph/parts/GraphDetails.vue';
import GraphHelp from '@/components/organisms/HoldersGraph/parts/GraphHelp.vue';
import GraphSettings from '@/components/organisms/HoldersGraph/parts/GraphSettings.vue';
import HistoryTable from '@/components/organisms/HoldersGraph/parts/HistoryTable.vue';
import WalletDetails from '@/components/organisms/HoldersGraph/parts/WalletDetails.vue';
import WalletsTable from '@/components/organisms/HoldersGraph/parts/WalletsTable.vue';
import ViewSelector from '@/components/organisms/HoldersGraph/parts/ViewSelector.vue';
import WalletTransactions from '@/components/organisms/HoldersGraph/parts/WalletTransactions.vue';
import chainUtils from '@/utils/chains.js';
import graphUtils from '@/utils/graph.js';
import formatUtils from '@/utils/format.js';
import clustersUtils from '@/utils/clusters.js';

export default {
  name: 'HoldersGraph',
  props: {
    graph_data: Object,
    loading: Boolean,
    refreshLoading: Boolean,
    error: Number,
    avengerDaoScore: Number,
    avengerDaoTrustLevel: String,
    addedAddresses: Array,
  },
  components: {
    Loader,
    Dialog,
    Button,
    Tooltip,
    YoutubeVideo,
    GraphDetails,
    GraphHelp,
    GraphSettings,
    HistoryTable,
    WalletDetails,
    WalletsTable,
    ViewSelector,
    LogoPlaceholder,
    WalletTransactions,
    RotatingText,
  },
  mixins: [chainUtils, graphUtils, formatUtils, clustersUtils],
  data: function () {
    return {
      d3ForceSimulation: null,
      d3ForceSimulationFirstTick: true,
      d3SvgElements: null,
      selected_node: null,
      selected_group: null,
      walletsTableIsOpen: false,
      historyTableIsOpen: false,
      expandedWarning: true,
      graph: null,
      interval: null,
      lastPositions: {},
      historicalMaps: [],
      hiddenAddresses: this.graph_data['nodes']
        .filter(node => node.is_hidden)
        .map(node => node.address),
      tokenIndex: -1,
      initialViewBox:
        Math.max(
          document.documentElement.clientWidth || 0,
          window.innerWidth || 0,
        ) > 1000 &&
        Math.max(
          document.documentElement.clientHeight || 0,
          window.innerHeight || 0,
        ) > 1000
          ? 1000
          : 650,
    };
  },
  computed: {
    youtube_link() {
      return this.$store.getters.get_token_youtube(
        this.$route.params.token,
        this.$route.params.chain,
      );
    },
    contract_addresses() {
      return this.graph_data['nodes']
        .filter(node => node.is_contract)
        .map(node => node.address);
    },
    exchange_addresses() {
      return this.graph_data['nodes']
        .filter(node => node.is_exchange)
        .map(node => node.address);
    },
    hide_context() {
      return (
        this.isIframe() && typeof this.$route.query.hide_context != 'undefined'
      );
    },
    is_all_shown() {
      return this.hiddenAddresses.length == 0;
    },
    is_contracts_shown() {
      return this.contract_addresses.every(
        address => !this.hiddenAddresses.includes(address),
      );
    },
    is_contracts_hidden() {
      return this.contract_addresses.every(address =>
        this.hiddenAddresses.includes(address),
      );
    },
    is_exchanges_shown() {
      return this.exchange_addresses.every(
        address => !this.hiddenAddresses.includes(address),
      );
    },
    is_exchanges_hidden() {
      return this.exchange_addresses.every(address =>
        this.hiddenAddresses.includes(address),
      );
    },
    tableIsOpen() {
      return this.walletsTableIsOpen || this.historyTableIsOpen;
    },
    center_coords() {
      return {
        x: this.initialViewBox / 2 - (this.tableIsOpen ? 100 : 0),
        y: this.initialViewBox / 2,
      };
    },
  },
  mounted: function () {
    if (this.window.innerWidth >= 1340) {
      if ('id' in this.$route.query) {
        this.historyTableIsOpen = true;
      } else {
        this.walletsTableIsOpen = true;
      }
    }
    // Safeguard mode number
    const requestedIndex = this.$route.query.mode || null;
    if (requestedIndex) {
      if (this.graph_data.version < 3) {
        let query = Object.assign({}, this.$route.query);
        delete query.mode;
        this.$router.replace({ query });
      } else if (
        requestedIndex < 1 ||
        requestedIndex >= this.graph_data['token_links'].length
      ) {
        let query = Object.assign({}, this.$route.query);
        delete query.mode;
        this.$router.replace({ query });
      } else {
        this.tokenIndex = requestedIndex;
      }
    }
    // This is to update the 'date old' button
    this.interval = setInterval(() => {
      this.$forceUpdate();
    }, 20000);
    this.graph = this.get_fresh_graph_from_data();
    this.initD3();
    this.updateD3SvgElements();
    // Update Metadata
    this.updateMetaTitle(
      `${this.graph_data.symbol} Bubblemaps | Uncover Hidden Links Between Holders`,
    );
    const number_of_clusters = Object.keys(this.graph.groups_main_nodes).length;
    let description;
    if (number_of_clusters > 0) {
      let max_percent = 0;
      for (let i = 0; i < number_of_clusters; i++) {
        let percent = this.graph.nodes
          .map(el => (el.group == i ? el.percentage : 0))
          .reduce((a, b) => a + b, 0);
        if (percent > max_percent) max_percent = percent;
      }
      let s = number_of_clusters > 1 ? 's' : '';
      let it = number_of_clusters > 1 ? 'The largest cluster' : 'It';
      description = `The ${
        this.graph_data.full_name
      } bubble map includes ${number_of_clusters} cluster${s} of connected holders on the ${this.get_chain_full_name()} network. ${it} holds ${this.getFormattedPercent(
        max_percent,
      )}% of the supply.`;
    } else {
      description = `The ${this.graph_data.full_name} bubble map does not include any cluster. Wow!`;
    }
    this.updateMetaDescription(description);
  },
  unmounted() {
    clearInterval(this.interval);
  },
  methods: {
    initD3() {
      d3.select('#svg').selectAll('g').remove();
      // Init SVG
      let zoom = d3.zoom().on('zoom', zoomed);
      var svg = d3
        .select('#svg')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('viewBox', `0 0 ${this.initialViewBox} ${this.initialViewBox}`)
        .call(zoom);

      if (
        this.isIframe() &&
        typeof this.$route.query.prevent_scroll_zoom != 'undefined'
      ) {
        svg.on('wheel.zoom', null);
      }

      let g = svg.append('g');
      g.append('g').attr('id', 'circles');
      g.append('g').attr('id', 'lines');

      d3.select('#zoom_in').on('click', function () {
        zoom.scaleBy(svg.transition().duration(200), 1.4);
      });
      d3.select('#zoom_out').on('click', function () {
        zoom.scaleBy(svg.transition().duration(200), 0.7);
      });

      function zoomed(event) {
        g.attr('transform', event.transform);
      }

      // Init Simulation
      let that = this;
      that.d3ForceSimulation = d3
        .forceSimulation(that.graph.nodes)
        .force('charge', d3.forceManyBody().strength(-50).distanceMax(250))
        // On first tick force_center is with strength=1 for invisible transition
        .force('center', that.get_force_center().strength(1))
        .force('radial', that.get_force_radial())
        .force('link', that.get_force_links())
        .on('tick', function ticked() {
          that.d3SvgElements.lines
            .attr('x1', function (d) {
              return d.source.x;
            })
            .attr('y1', function (d) {
              return d.source.y;
            })
            .attr('x2', function (d) {
              return d.target.x;
            })
            .attr('y2', function (d) {
              return d.target.y;
            })
            .attr('visibility', 'visible')
            .each(function (d) {
              let class_modifiers = [];
              let is_selected = that.selected_group == d.source.group;
              if (is_selected) {
                class_modifiers.push('--selected');
              }
              // Transfer Directions
              let transfer_direction_setting =
                that.$store.getters.get_transfer_direction;
              let show_direction =
                transfer_direction_setting == 'ON' ||
                (transfer_direction_setting == 'SELECTED' && is_selected);
              if (show_direction) {
                if (d.forward > 0 && d.backward > 0) {
                  class_modifiers.push('--bidirectional');
                } else if (d.forward > 0) {
                  class_modifiers.push('--forward');
                } else if (d.backward > 0) {
                  class_modifiers.push('--backward');
                }
              }
              d3.select(this).attr('class', class_modifiers.join(' '));
              if (show_direction) {
                if (d.forward > 0) {
                  d3.select(this).attr('marker-end', 'url(#endarrow)');
                } else {
                  d3.select(this).attr('marker-end', null);
                }
                if (d.backward > 0) {
                  d3.select(this).attr('marker-start', 'url(#startarrow)');
                } else {
                  d3.select(this).attr('marker-start', null);
                }
              } else {
                d3.select(this)
                  .attr('marker-end', null)
                  .attr('marker-start', null);
              }
            });

          that.d3SvgElements.circles
            .attr('cx', function (d) {
              return d.x;
            })
            .attr('cy', function (d) {
              return d.y;
            })
            .attr('class', function (d) {
              return that.selected_node == d.address ? 'nodes--selected' : '';
            });

          // Only on first tick - this condition is just for performance
          if (that.d3ForceSimulationFirstTick) {
            // Get back force center to normal strength
            that.d3ForceSimulation.force('center', that.get_force_center());
            that.d3ForceSimulationFirstTick = false;
          }
        });
    },
    updateD3SvgElements() {
      // Since D3 modifies the DOM directly, it is not linked to Vue reactivity,
      // so we need to call this manually when the `graph` changes.
      // We do not use a watcher that'd trigger continuously and call this
      // directly in apply_data_settings
      var that = this;
      if (that.graph) {
        var g = d3.select('#svg').select('g');

        var lines = g
          .select('#lines')
          .selectAll('line')
          .data(that.graph.links, function (d) {
            return d.source.address + d.target.address;
          })
          .join('line');

        var circles = g
          .select('#circles')
          .selectAll('circle')
          .data(that.graph.nodes, function (d) {
            return d.address;
          })
          .join(
            enter =>
              enter.append('circle').attr('r', function (d) {
                return d.added
                  ? 10
                  : Math.max(
                      Math.sqrt(that.getPercentAddress(d.address)) * 25,
                      1,
                    );
              }),
            update =>
              update
                .transition()
                .duration(400)
                .attr('r', function (d) {
                  return d.added
                    ? 10
                    : Math.max(
                        Math.sqrt(that.getPercentAddress(d.address)) * 25,
                        1,
                      );
                }),
            exit => exit.remove(),
          )
          .attr('fill', function (d) {
            return that.getNodeColor(d);
          })
          .attr('stroke', function (d) {
            return that.getNodeColor(d);
          })
          .attr('stroke-dasharray', function (d) {
            return d.added ? '2 3' : 'none';
          })
          .call(
            d3
              .drag()
              .on('start', function dragstarted(event, d) {
                if (!event.active)
                  that.d3ForceSimulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
              })
              .on('drag', function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
              })
              .on('end', function dragended(event, d) {
                if (!event.active) that.d3ForceSimulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
              }),
          )
          .on('click', function (event, d) {
            that.selected_node = d.address;
            that.selected_group = d.group;
          });
        this.d3SvgElements = { circles: circles, lines: lines };
      }
    },
    get_fresh_graph_from_data() {
      if (this.graph_data.version < 3) {
        this.tokenIndex = -1;
        this.hiddenAddresses = [];
      } else if (this.graph && this.graph.version < 3) {
        // If target (graph_data) version is new but previous (graph) version
        // is old, then we reset the hiddenAddresses to default
        this.hiddenAddresses = this.graph_data['nodes']
          .filter(node => node.is_hidden)
          .map(node => node.address);
      }
      return this.get_graph_from_data(
        {
          ...this.graph_data,
          ...(this.tokenIndex != -1
            ? {
                links: this.graph_data['token_links'][this.tokenIndex]['links'],
              }
            : {}),
        },
        this.hiddenAddresses,
      );
    },
    apply_data_settings() {
      // Save nodes positions
      this.graph.nodes.forEach(node => {
        this.lastPositions[node.address] = { x: node.x, y: node.y };
      });
      var new_graph_data = this.get_fresh_graph_from_data();
      this.graph.links = new_graph_data.links;
      this.graph.groups_main_nodes = new_graph_data.groups_main_nodes;
      this.graph.version = new_graph_data.version;
      // We spread the new nodes over the old nodes data to keep its current
      // state data like position and velocity.
      this.graph.nodes = new_graph_data.nodes.map(node => {
        const old_node = this.graph.nodes.find(
          el => el.address == node.address,
        );
        let defaultPosition;
        if (typeof old_node == 'undefined') {
          // For new nodes, use last position if available, else if no group
          // place randomly according to size, else center.
          if (node.address in this.lastPositions) {
            defaultPosition = this.lastPositions[node.address];
          } else if (node.group == -1) {
            const r = this.get_node_default_r_coord(node);
            const theta = Math.random() * Math.PI * 2;
            defaultPosition = {
              x: this.center_coords.x + r * Math.cos(theta),
              y: this.center_coords.y + r * Math.sin(theta),
            };
          } else {
            // Randomize slightly the center positions to avoid infinite forces
            // when adding multiple nodes at the same time
            defaultPosition = {
              x: this.center_coords.x + 500 * (Math.random() * 0.1 - 0.05),
              y: this.center_coords.y + 500 * (Math.random() * 0.1 - 0.05),
            };
          }
        }
        return {
          ...defaultPosition,
          ...old_node,
          ...node,
        };
      });
      // Simulation update: apply the new links forces and restart
      this.d3ForceSimulation
        .nodes(this.graph.nodes)
        .force('link', this.get_force_links())
        .restart()
        .alpha(0.3);
      // Selected state update
      if (this.selected_node) {
        const new_selected = this.graph.nodes.find(
          el => el.address == this.selected_node,
        );
        if (new_selected) {
          this.selected_group = new_selected.group;
        } else {
          this.deselect();
        }
      }
      // SVG Update
      this.updateD3SvgElements();
    },
    change_links(token_index) {
      this.tokenIndex = token_index;
      this.apply_data_settings();
    },
    checkForOldMap() {
      if (this.graph_data.version < 3) {
        this.$refs.oldMapDialog.open();
        throw 'Old map data : Unsupported Operation.';
      }
    },
    revealAll() {
      this.checkForOldMap();
      this.hiddenAddresses = [];
      this.apply_data_settings();
    },
    revealContracts() {
      this.checkForOldMap();
      this.hiddenAddresses = this.hiddenAddresses.filter(
        address => !this.contract_addresses.includes(address),
      );
      this.apply_data_settings();
    },
    hideContracts() {
      this.checkForOldMap();
      this.hiddenAddresses = [
        ...new Set([...this.hiddenAddresses, ...this.contract_addresses]),
      ];
      if (this.contract_addresses.includes(this.selected_node)) {
        this.deselect();
      }
      this.apply_data_settings();
    },
    revealExchanges() {
      this.checkForOldMap();
      this.hiddenAddresses = this.hiddenAddresses.filter(
        address => !this.exchange_addresses.includes(address),
      );
      this.apply_data_settings();
    },
    hideExchanges() {
      this.checkForOldMap();
      this.hiddenAddresses = [
        ...new Set([...this.hiddenAddresses, ...this.exchange_addresses]),
      ];
      if (this.exchange_addresses.includes(this.selected_node)) {
        this.deselect();
      }
      this.apply_data_settings();
    },
    hideWallet(address) {
      this.checkForOldMap();
      this.hiddenAddresses = [...this.hiddenAddresses, address];
      if (address == this.selected_node) {
        this.deselect();
      }
      this.apply_data_settings();
    },
    revealWallet(address) {
      this.checkForOldMap();
      this.hiddenAddresses = this.hiddenAddresses.filter(
        hidden => hidden != address,
      );
      this.apply_data_settings();
    },
    get_force_center() {
      return d3
        .forceCenter(this.center_coords.x, this.center_coords.y)
        .strength(0.03);
    },
    get_force_radial() {
      let that = this;
      return d3
        .forceRadial(
          function radius(d) {
            return that.get_node_default_r_coord(d);
          },
          this.center_coords.x,
          this.center_coords.y,
        )
        .strength(0.005);
    },
    get_force_links() {
      return d3.forceLink(this.graph.links).distance(50).strength(0.5);
    },
    get_node_default_r_coord(node) {
      return (1 - BezierEasing(0, 1, 0, 1)(node.percentage / 100)) * 400;
    },
    update_graph_center() {
      this.d3ForceSimulation
        .force('center', this.get_force_center())
        .force('radial', this.get_force_radial())
        .restart()
        .alpha(0.3);
    },
    deselect() {
      this.selected_node = null;
      this.selected_group = null;
      this.updateD3ConditionalStyles();
    },
    closeTable() {
      this.walletsTableIsOpen = false;
      this.historyTableIsOpen = false;
      this.update_graph_center();
    },
    openWalletsTable() {
      this.walletsTableIsOpen = true;
      if (!this.historyTableIsOpen) {
        this.update_graph_center();
      } else {
        this.historyTableIsOpen = false;
      }
    },
    openHistoryTable() {
      this.historyTableIsOpen = true;
      if (!this.walletsTableIsOpen) {
        this.update_graph_center();
      } else {
        this.walletsTableIsOpen = false;
      }
    },
    updateD3ConditionalStyles() {
      if (this.d3ForceSimulation) {
        this.d3ForceSimulation.restart();
      }
    },
    // The following are called by children
    openOldMapDialog() {
      this.$refs.oldMapDialog.open();
    },
    selectNode(address) {
      this.selected_node = address;
      this.updateD3ConditionalStyles();
    },
    selectGroup(group) {
      this.selected_group = group;
      this.updateD3ConditionalStyles();
    },
    addAddress(address) {
      this.$parent.addAddress(address);
    },
    addAddresses(addresses) {
      this.$parent.addAddresses(addresses);
    },
  },
  watch: {
    graph_data: {
      handler: function () {
        this.apply_data_settings();
        // Add to historicalMaps array the new data if it is missing
        if (!this.historicalMaps.some(map => map.id == this.graph_data.id)) {
          // This happens on refresh, so we add the new item in first place
          this.historicalMaps = [
            {
              id: this.graph_data.id,
              dt_update: new Date(this.graph_data.dt_update),
              top_500: this.graph_data.top_500 || false,
            },
          ].concat(this.historicalMaps);
        }
      },
    },
  },
};
</script>

<style scoped lang="scss">
@import 'assets/variables';

// Parts positionning

.wallet-details {
  position: absolute;
  left: 8px;
  top: 58px;

  &.--small-text {
    top: 51px;
  }
}

.side-table {
  position: absolute;
  z-index: 3;
  right: 0;
  width: 300px;
  max-width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $theme-dark-grey;
  background-color: var(--surface-color, $theme-dark-grey);
  box-shadow: rgba(black, 0.8) -5px 5px 10px 0px;
  box-shadow: var(--shadow-color, rgba(black, 0.8)) -5px 5px 10px 0px;

  &.--small-text {
    width: 270px;
  }
}

// Buttons Row

.buttons-row {
  position: absolute;
  left: 8px;
  right: 8px;
  top: 8px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;

  .buttons-row__left-side {
    display: flex;
    min-width: 0;
    flex-shrink: 1;
  }

  .buttons-row__right-side {
    display: flex;
    flex-shrink: 0;
  }

  .scanner-icon {
    height: 20px;
    margin: 2px;
    fill: white;
    fill: var(--text-color, white);
  }

  .youtube-icon {
    height: 16px;
    margin: 4px 1px;
  }
}

.buttons-row__button {
  background: rgba($theme-dark-grey, 0.8);
  background: var(--blending-button-color, rgba($theme-dark-grey, 0.8));
  margin: 4px;
  padding: 0.5em;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  height: 40px;
  box-sizing: border-box;
  pointer-events: auto;
  position: relative;
  // Text not selectable
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */

  &:hover {
    background: rgba($theme-dark-pink, 0.8);
    background: var(--highlight-color, rgba($theme-dark-pink, 0.8));
  }
  .buttons-row__button__text {
    margin-left: 4px;
  }
  .buttons-row__button__text--to-hide {
    display: none;
  }
  @media (min-width: 800px) {
    .buttons-row__button__text--to-hide {
      display: initial;
    }
  }

  .buttons-row__button__new {
    position: absolute;
    top: -8px;
    right: -4px;
    background-color: $theme-pink;
    background-color: var(--warning-color, $theme-pink);
    padding: 1px 5px;
    border-radius: 100px;
    border: 2px solid black;
    border-color: var(--bg-color, black);
    font-size: 0.6em;
    font-weight: 700;
  }

  .buttons-row__button__top500 {
    position: absolute;
    top: -5px;
    right: -4px;
    background-color: $theme-blue;
    background-color: var(--warning-color, $theme-blue);
    padding: 2px 2px;
    border-radius: 100px;
    font-size: 0.7em;
  }
}

.buttons-row__button--title {
  font-size: 1.3em;
  font-weight: bold;

  .buttons-row__button_image {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 4px;
  }

  .buttons-row__button__text {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-right: 4px;
  }
}

@media (max-width: 550px) {
  .buttons-row__button.--scanner {
    display: none;
  }
}

@media (min-width: 920px) {
  .buttons-row {
    &.--table-open {
      right: 308px;
      &.--small-text {
        right: 278px;
      }
    }
  }
}

@media (min-width: 800px) {
  .buttons-row__button--title {
    min-width: 0;
    flex-shrink: 1;
  }
}

.buttons-row__view-selector {
  min-width: 0;
  flex-shrink: 1;
}

@media (min-width: 800px) {
  .buttons-row__view-selector {
    min-width: 140px;
    flex-shrink: 0;
  }
}

// Top App Bar height

.buttons-row:not(.--iframe) {
  top: 64px;
}
.wallet-details:not(.--iframe) {
  top: 114px;
}
.side-table:not(.--iframe) {
  height: calc(100vh - 56px);
}

@media (min-width: 600px) {
  .buttons-row:not(.--iframe) {
    top: 72px;
  }
  .wallet-details:not(.--iframe) {
    top: 122px;
  }
  .side-table:not(.--iframe) {
    height: calc(100vh - 64px);
  }
}

.buttons-row.--small-text {
  .buttons-row__button {
    height: 35px;

    .material-icons {
      font-size: 20px;
    }
    .scanner-icon {
      height: 16px;
    }
    .youtube-icon {
      height: 12px;
      margin: 4px 3px;
    }
    .buttons-row__button__alert {
      width: 10px;
      height: 10px;
    }
  }

  .buttons-row__button--title {
    .buttons-row__button_image {
      width: 22px;
      height: 22px;
    }
  }
}

.buttons-row.--bottom {
  bottom: 8px;
  top: auto;
  left: auto;
}

// Dialogs

.dialog__central-button {
  margin: auto;
}

// Iframe
.iframe-watermark {
  position: absolute;
  bottom: 8px;
  left: 8px;
  color: $theme-pink;
  color: var(--primary-color, $theme-pink);
  opacity: 0.6;
  // Text not selectable
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */

  &:hover {
    opacity: 1;
  }

  .iframe-watermark__name {
    font-weight: bolder;
    letter-spacing: 0.5px;
  }

  .iframe-watermark__powered {
    opacity: 0.9;
  }

  svg {
    width: 24px;
    margin-right: 5px;
    fill: $theme-pink !important;
    fill: var(--primary-color, $theme-pink) !important;
  }
}

// Elastic warning

.elastic-warning {
  position: absolute;
  bottom: 80px;
  width: 100%;
  text-align: center;
  color: rgba(orange, 0.5);
  pointer-events: none;
  padding: 0 15px;
  box-sizing: border-box;
  font-size: 0.9em;
}

// Not listed warning

.not-listed-warning {
  position: absolute;
  left: 12px;
  bottom: 12px;
  background-color: rgba(#ce0404, 0.3);
  padding: 6px 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.not-listed-warning__content,
.not-listed-warning__close-button {
  color: #ff9696;
  fill: #ff9696;
  cursor: pointer;

  &:hover {
    color: #ffd3d3;
    fill: #ffd3d3;
  }
}

.not-listed-warning__content {
  display: flex;
  align-items: center;

  .not-listed-warning__text {
    margin-left: 8px;
  }

  .not-listed-warning__icon {
    height: 23px;
    min-width: 23px;
    margin: -6px -10px;
    padding: 7px;
  }
}

.not-listed-warning__close-button {
  padding: 6px;
  margin: -6px -10px -6px -2px;
}

.not-listed-warning__text,
.not-listed-warning__close-button {
  display: none;
}

@media (min-width: 600px) {
  .not-listed-warning__text,
  .not-listed-warning__close-button {
    display: initial;
  }
  .not-listed-warning {
    max-width: calc(100% - 145px);
    &.--with-table {
      max-width: calc(100% - 345px);
    }
  }
}

@media (min-width: 860px) {
  .not-listed-warning {
    &.--with-table {
      max-width: calc(100% - 442px);
    }
  }
}

// Loading state

.loading-state {
  position: absolute;
  bottom: 65px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  pointer-events: none;
  padding: 0 12px;
  box-sizing: border-box;

  .loading-state__loading {
    background-color: rgba(white, 0.1);
    border-radius: 100px;
    padding: 8px;
  }

  .loading-state__message {
    pointer-events: auto;
    display: flex;
    align-items: center;
    background-color: rgba(white, 0.1);
    border-radius: 100px;
    padding: 3px 8px;
    text-align: center;
    font-size: 0.9em;
    margin-top: 10px;

    .material-icons {
      cursor: pointer;
      margin-left: 2px;
    }

    &.--error {
      background-color: rgba($mdc-theme-error, 0.6);
    }
  }
}

@media (min-width: 860px) {
  .loading-state {
    &.--table-open {
      width: calc(100% - 300px);
    }
  }
}

.no-wallets-shown {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex-direction: column;
  text-align: center;
  padding: 10px;

  button {
    margin-top: 12px;
  }
}

.no-wallets-shown__title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 10px;
}

@media (min-width: 860px) {
  .no-wallets-shown {
    &.--table-open {
      padding-right: 318px;
    }
  }
}

.nqOS1i94jjegY51z {
  position: absolute;
  top: calc(50% - 50px);
  left: calc(50% - 50px);
  padding: 10px;
  background-color: rgba(white, 0.1);
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background-color: rgba(white, 0.2);
  }

  img {
    width: 80px;
  }
}
</style>

<!-- Graph Styling -->
<style lang="scss">
@import 'assets/variables';

#svg {
  height: 100%;
  width: 100%;
  cursor: move;

  line {
    stroke: white;
    stroke: var(--link-color, white);
    stroke-opacity: 0.6;
    pointer-events: none;

    &.--selected {
      stroke-opacity: 1;
      stroke-width: 1.5px;
    }

    &.--forward,
    &.--backward {
      stroke-dasharray: 4;
      animation: dash 15s linear infinite;

      &.--forward {
        animation-direction: reverse;
      }
    }
  }

  marker {
    polygon {
      fill: white;
      fill: var(--link-color, white);
    }
  }

  circle {
    fill-opacity: 0.2;
    stroke-width: 1.5px;
    cursor: pointer;

    &:hover {
      fill-opacity: 0.8;
      stroke: white;
      stroke: var(--active-node-color, white);
    }

    &.nodes--selected {
      stroke-width: 4px;
      fill-opacity: 0.8;
      stroke: white;
      stroke: var(--active-node-color, white);
    }
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: 200;
  }
}
</style>
