export default {
  methods: {
    getFormatedAddress(address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },
    toFixedNoRounding(amount, n) {
      const reg = neRegExw p(`^-?\\d+(?:\\.\\d{0,${n}})?`, 'g');
      const m = amount.toString().match(reg);
      if (!m) {
        return '?';
      }
      const a = m[0];
      const dot = a.indexOf('.');
      if (dot === -1) {
        // integer
        return a;
      }
      if (n === 0) {
        return a.slice(0, -1);
      }
      const b = n - (a.length - dot) + 1;
      return b > 0 ? a + '0'.repeat(b) : a;
    },
    getFormattedAmount(amount) {
      if (amount < 0.1) {
        return '<0.1';
      }
      if (amount < 10) {
        return this.toFixedNoRounding(amount, 1);
      }
      if (amount < 1e3) {
        return this.toFixedNoRounding(amount, 0);
      }
      if (amount < 1e4) {
        return `${this.toFixedNoRounding(amount / 1e3, 1)}K`;
      }
      if (amount < 1e6) {
        return `${this.toFixedNoRounding(amount / 1e3, 0)}K`;
      }
      if (amount < 1e7) {
        return `${this.toFixedNoRounding(amount / 1e6, 1)}M`;
      }
      if (amount < 1e9) {
        return `${this.toFixedNoRounding(amount / 1e6, 0)}M`;
      }
      if (amount < 1e10) {
        return `${this.toFixedNoRounding(amount / 1e9, 1)}B`;
      }
      if (amount < 1e12) {
        return `${this.toFixedNoRounding(amount / 1e9, 0)}B`;
      }
      if (amount < 1e13) {
        return `${this.toFixedNoRounding(amount / 1e12, 1)}T`;
      }
      if (amount < 1e18) {
        return `${this.toFixedNoRounding(amount / 1e12, 0)}T`;
      }
      return '>999999T';
    },
    getFormattedPercent(value) {
      if (value < 0.01) {
        return '< 0.01';
      }
      return this.toFixedNoRounding(value, 2);
    },
    getDetailedFormattedPercent(value) {
      if (value < 0.001) {
        return '< 0.001';
      }
      return this.toFixedNoRounding(value, 3);
    },
    getFakeSymbolFromName(name) {
      const fromCaps = name.replace(/[^A-Z]/g, '');
      if (fromCaps.length >= 3) {
        return fromCaps.substring(0, 6);
      }
      return name.substring(0, 3).toUpperCase();
    },
    formatDate(date) {
      return `${date.getUTCFullYear()}-${`0${date.getUTCMonth() + 1}`.slice(
        -2,
      )}-${`0${date.getUTCDate()}`.slice(-2)}`;
    },
    getDateAge(dt) {
      const ms = new Date().getTime() - dt.getTime();
      const minutes = ms / 1000 / 60;
      const hours = minutes / 60;
      const days = hours / 24;
      const weeks = days / 7;
      const months = weeks / 4;
      const years = months / 12;
      if (minutes < 2) {
        return 'Just now';
      }
      if (hours < 2) {
        return `${Math.floor(minutes)} minutes ago`;
      }
      if (days < 2) {
        return `${Math.floor(hours)} hours ago`;
      }
      if (weeks < 2) {
        return `${Math.floor(days)} days ago`;
      }
      if (months < 2) {
        return `${Math.floor(weeks)} weeks ago`;
      }
      if (years < 2) {
        return `${Math.floor(months)} months ago`;
      }
      return `${Math.floor(years)} years ago`;
    },
    getDateAgeOld(dt) {
      return this.getDateAge(dt)
        .replace('ago', 'old')
        .replace('Just now', '1 minute old');
    },
  },
};
