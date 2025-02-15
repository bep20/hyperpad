<template>
  <div
    :class="
      'graph-view' +
      (isIframe() ? ' --iframe' : '') +
      (smallText ? ' --small-text' : '')
    "
  >
    <template v-if="!graph_data">
      <div class="graph-view__loading" v-if="loading">
        <Loader :size="100" />
        <p class="graph-view__late-warning">
          This will take a minute if you are the first person to request this
          token.<br />
          Be patient, we are collecting the data and computing the graph on the
          fly !
        </p>
      </div>
      <div
        :class="'graph-view__error' + (error == 401 ? ' --401' : '')"
        v-if="error"
      >
        <p v-if="error == 404">
          We found no results for this address. Please verify that you got a
          valid address by checking it on a explorer like
          <a
            :href="`${get_scanner_root()}token/${$route.params.token}`"
            target="_blank"
          >
            {{ get_scanner_name() }}.</a
          ><br />
          Please also keep in mind that we support
          {{ get_chain_standard_prefix() }}20 and
          {{ get_chain_standard_prefix() }}721 tokens, but not
          {{ get_chain_standard_prefix() }}1155 or more exotic standards yet.
        </p>
        <p v-else-if="error == 400">
          Your token address appears to be invalid, please verify that you got
          it right: it should be 42 characters long and beginning with 0x.
        </p>
        <p v-else-if="error == 401">
          <span class="error-precompute">Welcome to Bubblemaps!</span
          ><br /><br />
          <template v-if="!('id' in $route.query)">
            <span>
              This map has never been requested.<br />
              <a href="https://bubblemaps.io/get-premium" target="_blank">
                Get premium
              </a>
              if you want to request new maps.
            </span>
            <br /><br />
            <Button raised link="https://bubblemaps.io" target="_blank">
              Learn More
            </Button>
          </template>
          <template v-else>
            <span>
              This is an historical version of a bubble map.<br />
              <a href="https://bubblemaps.io/get-premium" target="_blank">
                Get premium
              </a>
              to access history mode.
            </span>
            <br /><br />
            <Button
              raised
              :route="`/${$route.params.chain}/token/${$route.params.token}`"
            >
              Go to Normal Mode
            </Button>
          </template>
          <br /><br />
          <router-link :to="`/${$route.params.chain}/`"
            >Go back Home</router-link
          >
        </p>
        <p v-else-if="error == 490">
          The id parameter in your url does not match a valid map for this
          token.<br />
          <router-link
            :to="`/${$route.params.chain}/token/${$route.params.token}`"
          >
            Go back to its default map.
          </router-link>
        </p>
        <p v-else>
          An unexpected error has occured, please verify your internet
          connection and try to refresh.
        </p>
        <p v-if="error != 401">
          If the problem persists, please
          <a
            :href="`mailto:help@bubblemaps.io?subject=Graph%20Error&body={chain:${$route.params.chain}, token:${$route.params.token}, uid:${$store.getters.get_user_id}}`"
            target="_blank"
          >
            contact our help desk.
          </a>
        </p>
      </div>
    </template>
    <template v-else>
      <HoldersGraph
        :graph_data="graph_data"
        :loading="loading"
        :refreshLoading="refreshLoading"
        :error="error"
        :avengerDaoScore="avengerDaoScore"
        :avengerDaoTrustLevel="avengerDaoTrustLevel"
        :addedAddresses="addedAddresses"
      />
    </template>
  </div>
</template>

<script>
// @ is an alias to /src
import HoldersGraph from '@/components/organisms/HoldersGraph/HoldersGraph.vue';
import Loader from '@/components/atoms/Loader.vue';
import chainUtils from '@/utils/chains.js';
import formatUtils from '@/utils/format.js';
import Button from '@/components/atoms/material/Button.vue';

export default {
  name: 'GraphPage',
  components: {
    HoldersGraph,
    Loader,
    Button,
  },
  mixins: [chainUtils, formatUtils],
  data: function () {
    return {
      graph_data: null,
      loading: true,
      error: null,
      refreshLoading: false,
      avengerDaoScore: null,
      avengerDaoTrustLevel: null,
      addedAddresses: [],
    };
  },
  methods: {
    async fetchData(forceRefresh = false, top500 = false) {
      console.log(this.addedAddresses);
      if (forceRefresh) {
        this.refreshLoading = true;
        // Remove id parameter if there's one
        await this.$router.push({
          path: `/${this.$route.params.chain}/token/${this.$route.params.token}`,
          query: {},
        });
      }
      this.loading = true;
      this.error = null;
      const token = this.$route.params.token.toLowerCase();
      const chain = this.$route.params.chain;
      const id = this.$route.query.id;
      const partner = this.$store.getters.get_is_partner;
      let fetchPromise;
      const base_url =
        `${process.env.VUE_APP_DATA_ENDPOINT}?token=${token}&chain=${chain}` +
        (id ? `&id=${id}` : '') +
        (partner ? `&partner=${partner}` : '');
      if (!this.$store.getters.is_logged_in) {
        fetchPromise = fetch(base_url);
      } else {
        let params = {};
        if (this.addedAddresses.length > 0) {
          params = {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ moreAddresses: this.addedAddresses }),
          };
        }
        fetchPromise = this.$store.getters.get_user
          .getIdToken()
          .then(jwt =>
            fetch(
              `${base_url}&jwt=${jwt}&forceRefresh=${forceRefresh}&top500=${top500}`,
              params,
            ),
          );
      }
      fetchPromise
        .catch(error => {
          console.error(error);
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            this.error = response.status;
            throw new Error();
          }
        })
        .then(json => {
          const total_amount = json.nodes
            .map(node => node.amount)
            .reduce((a, b) => a + b, 0);
          const is_elastic =
            json.nodes
              .map(node => node.percentage || 0)
              .reduce((a, b) => a + b, 0) > 101;
          // (101 to account from rounding approximations)
          this.graph_data = {
            is_X721: false,
            ...json,
            is_elastic: is_elastic,
            symbol:
              json.symbol == '???' && json.full_name != '???'
                ? this.getFakeSymbolFromName(json.full_name)
                : json.symbol,
            is_fake_symbol: json.symbol == '???' && json.full_name != '???',
            nodes: json.nodes.map(node => {
              const percentage =
                node.percentage && !is_elastic
                  ? node.percentage
                  : (node.amount / total_amount) * 100;
              const base = {
                added: false,
                ...node,
                percentage: percentage,
                address: node.address.toLowerCase(),
              };
              // Filter out contraction names that come from the etherscan update
              if (
                'name' in base &&
                /^(0x[a-fA-F0-9]{4,}\.\.\.[a-fA-F0-9]{4,})$/.test(base.name)
              ) {
                delete base.name;
              }
              const custom_tag = this.$store.getters.get_custom_tag(
                base.address,
              );
              if (custom_tag) {
                return {
                  ...base,
                  ...(custom_tag.tag ? { name: custom_tag.tag } : {}),
                  ...(custom_tag.delegatedTo
                    ? {
                        delegated_to: custom_tag.delegatedTo,
                        delegated_contract: custom_tag.delegatedContract,
                        delegated_link: custom_tag.delegatedLink,
                      }
                    : {}),
                  is_contract: node.is_contract || custom_tag.contract,
                  is_exchange: !node.is_contract && custom_tag.exchange,
                  is_dead: false,
                  is_hidden: node.is_contract || custom_tag.hidden,
                };
              } else if (
                node.address.includes('0000000000000000') &&
                !node.is_contract
              ) {
                return {
                  ...base,
                  name: 'Dead Address',
                  is_exchange: false,
                  is_dead: true,
                  is_hidden: true,
                };
              } else {
                return {
                  ...base,
                  is_exchange: false,
                  is_dead: false,
                  is_hidden: node.is_contract,
                };
              }
            }),
          };
          this.loading = false;
          this.refreshLoading = false;
          if (!this.isIframe()) {
            const recently_viewed = localStorage.getItem('recently_viewed')
              ? JSON.parse(localStorage.getItem('recently_viewed'))
              : [];
            const new_viewed = {
              chain: this.graph_data.chain,
              full_name: this.graph_data.full_name,
              symbol: this.graph_data.symbol,
              token_address: this.graph_data.token_address,
              untouched_address: this.graph_data.token_address,
              is_X721: this.graph_data.is_X721,
              listed: false,
            };
            localStorage.setItem(
              'recently_viewed',
              JSON.stringify(
                [new_viewed]
                  .concat(
                    recently_viewed.filter(
                      el =>
                        !(
                          el.chain == new_viewed.chain &&
                          el.token_address == new_viewed.token_address
                        ),
                    ),
                  )
                  .slice(0, 6),
              ),
            );
          }
        })
        .catch(() => {
          if (this.error == null) {
            // If the error is not a http status one
            this.error = -1;
          }
          // Change metadata
          if (this.error == 400) {
            this.updateMetaTitle('Bubblemaps | Invalid Address');
          } else if (this.error == 404) {
            this.updateMetaTitle('Bubblemaps | Invalid Token');
          } else if (this.error == 490) {
            this.updateMetaTitle('Bubblemaps | Invalid Id Parameter');
          } else if (this.error == 401) {
            this.updateMetaTitle('Bubblemaps | Map not Ready');
          } else {
            this.updateMetaTitle('Bubblemaps | Unexpected Error');
          }
          this.loading = false;
          this.refreshLoading = false;
          if (this.graph_data) {
            this.resetRoute();
          }
        });
    },
    fetchAvengerDAO() {
      this.avengerDaoScore = null;
      this.avengerDaoTrustLevel = null;
      if (this.$route.params.chain == 'bsc') {
        fetch('https://avengerdao.org/api/v1/address-security', {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          method: 'POST',
          body: JSON.stringify({
            chain_id: '56',
            address: this.$route.params.token.toLowerCase(),
          }),
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              this.avengerDaoScore = -1;
            }
          })
          .then(json => {
            this.avengerDaoScore = json['data']['trust_score'];
            this.avengerDaoTrustLevel = json['data']['trust_level'];
          })
          .catch(() => {
            this.avengerDaoScore = -1;
          });
      }
    },
    addAddress(address) {
      this.addedAddresses.push(address);
      this.fetchData();
    },
    addAddresses(addresses) {
      this.addedAddresses.push(...addresses);
      this.fetchData();
    },
    resetRoute() {
      this.$router.push({
        query: { id: this.graph_data.id, no_trigger: true },
      });
    },
  },
  mounted: function () {
    this.fetchData();
    this.fetchAvengerDAO();
  },
  watch: {
    $route: {
      handler: function (to, from) {
        if (to.name == 'Graph') {
          // Map change case
          if (
            to.params.chain != from.params.chain ||
            to.params.token != from.params.token
          ) {
            this.graph_data = null;
            this.addedAddresses = [];
            this.fetchAvengerDAO();
            this.fetchData();
          }
          // Reset route case
          else if (to.query.no_trigger) {
            let query = Object.assign({}, this.$route.query);
            delete query.no_trigger;
            this.$router.replace({ query });
            // This will go through the watcher again but match no case
          }
          // Id change case
          else if ((to.query.id || 0) != (from.query.id || 0)) {
            this.fetchData();
          }
          // Refresh case
          else if (to.query.refresh) {
            this.fetchData(true, to.query.top500 || false);
            let query = Object.assign({}, this.$route.query);
            delete query.refresh;
            delete query.top500;
            this.$router.replace({ query });
            // This will go through the watcher again but match no case
          }
        }
      },
      deep: true,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'assets/variables';
.graph-view {
  width: 100vw;
  height: 100vh;
  // fix weird firefow scroll bug
  overflow: hidden;

  a:not(button > a) {
    color: $theme-pink;
    &:hover {
      text-decoration: underline;
    }
  }

  &.--small-text {
    font-size: 0.85em;
  }
}

.graph-view__loading {
  position: relative;
  left: 16px;
  top: 50px;
  width: calc(100% - 32px);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.graph-view__error {
  height: 100%;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.graph-view__late-warning {
  margin-top: 20px;
  visibility: hidden;
  -moz-animation: cssAnimation 0s ease-in 7s forwards;
  -webkit-animation: cssAnimation 0s ease-in 7s forwards;
  -o-animation: cssAnimation 0s ease-in 7s forwards;
  animation: cssAnimation 0s ease-in 7s forwards;
  -webkit-animation-fill-mode: forwards;
  animation-fill-mode: forwards;

  .--orange {
    color: $theme-pink;
  }
}

.graph-view__loading-overlay,
.graph-view__error-overlay {
  position: absolute;
}

@keyframes cssAnimation {
  to {
    visibility: visible;
  }
}

// Top App Bar height

.graph-view:not(.--iframe) {
  height: calc(100vh - 56px);
  padding-top: 56px;

  .graph-view__loading {
    height: calc(100% - 56px);
  }
}

@media (min-width: 600px) {
  .graph-view:not(.--iframe) {
    height: calc(100vh - 64px);
    padding-top: 64px;

    .graph-view__loading {
      height: calc(100vh - 64px);
    }
  }
}

.error-precompute {
  font-size: 1.6em;
  font-weight: 800;
}

@media (max-height: 600px) {
  .graph-view__error.--401 {
    overflow: scroll;
    justify-content: flex-start;
  }
}
</style>
