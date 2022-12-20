/**
 * This is a part of Chrome Extensions Box
 * Read more on GitHub - https://github.com/onikienko/chrome-extensions-box
 */
// import storage_with_default.js
const showToast = (msg) => {
  const el = document.getElementById(msg === "error" ? "error" : "success");
  if (!el) return;
  el.style.display = "inline";
  setTimeout(() => {
    el.style.display = "none";
  }, 2500);
};

const setStorageData = async (val) => {
  await setStorageItem(val);
  showToast(
    chrome.runtime.lastError ? showToast("error") : showToast("success")
  );
  document.dispatchEvent(
    new CustomEvent("optionSaved", {
      detail: {
        success: chrome.runtime.lastError ? false : true,
        val: val,
      },
    })
  );
};

window.addEventListener(
  "load",
  async () => {
    /*This event will dispatch as soon as options page will be ready*/
    let event = new CustomEvent("optionsPageReady");

    const items = await getStorageItemList(storage.default_options);
    let inputs = document.querySelectorAll("input"),
      selects = document.querySelectorAll("select"),
      textareas = document.querySelectorAll("textarea"),
      submit = document.querySelector("button#data-storage-save");

    let updateValue = {};
    submit?.addEventListener(
      "click",
      () => {
        setStorageData(updateValue);
      },
      false
    );

    [].forEach.call(inputs, (el) => {
      let storage_name = el.getAttribute("data-storage");
      if (storage_name && items.hasOwnProperty(storage_name)) {
        switch (el.type) {
          case "checkbox":
            if (parseInt(items[storage_name], 10) === 1) {
              el.checked = true;
            }
            el.addEventListener(
              "change",
              () => {
                let val = {};
                items[storage_name] = el.checked ? 1 : 0;
                val[storage_name] = items[storage_name];
                updateValue = { ...updateValue, ...val };
              },
              false
            );
            break;

          case "radio":
            if (el.value === items[storage_name].toString()) {
              el.checked = "checked";
            }
            el.addEventListener(
              "change",
              () => {
                let val = {};
                if (el.checked) {
                  items[storage_name] = el.value;
                  val[storage_name] = items[storage_name];
                  updateValue = { ...updateValue, ...val };
                }
              },
              false
            );
            break;

          case "range":
          case "color":
          case "date":
          case "time":
          case "month":
          case "week":
          case "text":
          case "password":
          case "email":
          case "tel":
          case "number":
            el.value = items[storage_name];
            el.addEventListener(
              "change",
              () => {
                let val = {};
                items[storage_name] = el.value;
                val[storage_name] = items[storage_name];
                updateValue = { ...updateValue, ...val };
              },
              false
            );
            break;
        }
      }
    });

    [].forEach.call(textareas, (el) => {
      let storage_name = el.getAttribute("data-storage");
      if (storage_name && items.hasOwnProperty(storage_name)) {
        el.value = items[storage_name];
      }
    });

    [].forEach.call(selects, (el) => {
      let storage_name = el.getAttribute("data-storage"),
        options,
        i;
      if (storage_name && items.hasOwnProperty(storage_name)) {
        if (
          (el.multiple && Array.isArray(items[storage_name])) ||
          !el.multiple
        ) {
          options = el.options;
          for (i = options.length; i--; ) {
            if (el.multiple) {
              if (items[storage_name].indexOf(options[i].value) !== -1) {
                options[i].selected = "selected";
              }
            } else {
              if (options[i].value === items[storage_name]) {
                options[i].selected = "selected";
                break;
              }
            }
          }
          el.addEventListener(
            "change",
            () => {
              let val = {},
                array_of_selected = [],
                i;
              if (el.multiple) {
                for (i = options.length; i--; ) {
                  if (options[i].selected) {
                    array_of_selected.push(options[i].value);
                  }
                }
                items[storage_name] = array_of_selected;
              } else {
                items[storage_name] = options[options.selectedIndex].value;
              }
              val[storage_name] = items[storage_name];
              updateValue = { ...updateValue, ...val };
            },
            false
          );
        }
      }
    });

    /* Options page is ready. Dispatch event */
    document.dispatchEvent(event);
  },
  false
);
