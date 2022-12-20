// storage
const setStorageItem = async (obj) => {
  await chrome.storage.local.set(obj);
};

const getStorageItem = async (k) => {
  const items = await chrome.storage.local.get([k]);
  return items ? items[k] : undefined;
};

const getStorageItemList = async (kList) => {
  const items = await chrome.storage.local.get(kList);
  return items ? items : undefined;
};

// message
const requestMsg = async (request) => {
  try {
    return await chrome.runtime.sendMessage(request);
  } catch (e) {}
};

const requestMsgToTab = async (msg) => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions); // getCurrentTab
  return await chrome.tabs.sendMessage(tab.id, msg);
};
