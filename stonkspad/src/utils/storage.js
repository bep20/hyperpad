class Storage {
  store = {};

  set = (key, value) => {
    if (this.canAccessLocalStorage())
      return localStorage.setItem(key, JSON.stringify(value));
    return (this.store[key] = value);
  };

  get = key => {
    if (this.canAccessLocalStorage()) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (err) {
        return localStorage.getItem(key);
      }
    } else return this.store[key];
  };

  canAccessLocalStorage = function () {
    const access = 'access';
    try {
      localStorage.setItem(access, access);
      localStorage.removeItem(access);
      return true;
    } catch (e) {
      return false;
    }
  };

  remove = key => {
    if (this.canAccessLocalStorage()) return localStorage.removeItem(key);
    return delete this.store[key];
  };
}

export default new Storage();
