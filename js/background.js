try {
  importScripts(
    "/js/helpers/chrome_extension_utils.js",
    "/js/helpers/notification_utils.js",
    "/js/storage_with_default.js",
    "/js/background_init.js"
  );
} catch (e) {
  console.log(e);
}

(() => {
  // Global Variables
  let countdown_interval = null;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let total_seconds = 0;
  let isPaused = false;
  let work_total_seconds = 0;
  let work_start_datetime = "";
  let isPopupOpened = false;

  chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === "popup") {
      isPopupOpened = true;
      port.onDisconnect.addListener(function () {
        isPopupOpened = false;
      });
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // background에서 response를 무조건 true로 받을 수 있게 하여야 한다.
    // 다른 파일에서 sendMessage를 날렸는데, 어떤 Listener에서도 sendResponse 함수 호출이나 true를 반환하지 않으면 오류가 나기 때문이다.
    processRequest(request, sendResponse);
    return true;
  });

  const processRequest = async (request, sendResponse) => {
    if (request?.actionType) {
      switch (request.actionType) {
        case "init":
          init();
          break;
        case "start":
          start();
          break;
        case "pause":
          pause();
          break;
        case "stop":
          stop();
          break;
        case "record":
          record();
          break;
        case "clear_record":
          clear_record();
          break;
        case "delete_record":
          delete_record(request?.workStartDateTime);
          break;
        case "notice":
          playSound(request?.soundMsg);
          break;
      }
    }
  };

  const init = async () => {
    isPopupOpened &&
      requestMsg({
        actionType: "ui_update",
        hours,
        minutes,
        seconds,
      });

    let history = (await getStorageItem("history")) || [];
    isPopupOpened &&
      requestMsg({
        actionType: "table_update",
        history,
      });
  };

  const start = async () => {
    if (isPaused) {
      isPaused = false;
    } else {
      hours = parseInt(await getStorageItem("mission_start_hour"));
      minutes = parseInt(await getStorageItem("mission_start_minute"));
      seconds = parseInt(await getStorageItem("mission_start_second"));
      total_seconds = hours * 60 * 60 + minutes * 60 + seconds;
      work_total_seconds = 0;
      work_start_datetime = new Date().toLocaleString();
    }

    if (countdown_interval) {
      clearInterval(countdown_interval);
    }

    countdown_interval = setInterval(async () => {
      if (total_seconds > 0) {
        hours = Math.floor(total_seconds / 3600);
        minutes = Math.floor(total_seconds / 60) % 60;
        seconds = total_seconds % 60;

        isPopupOpened &&
          requestMsg({
            actionType: "ui_update",
            hours,
            minutes,
            seconds,
          });

        let isEnabledSoundAlarm = await getStorageItem("isEnabledSoundAlarm");
        if (isEnabledSoundAlarm === 1) {
          const alarm_period_minute = parseInt(
            await getStorageItem("soundAlarmPeriodMinute")
          );
          const work_minute = Math.floor(work_total_seconds / 60) % 60;
          const work_second = work_total_seconds % 60;
          if (work_minute % alarm_period_minute === 0 && work_second === 0) {
            playSound(`${work_minute}분이 경과되었습니다.`);
          }
        }

        ++work_total_seconds;
        --total_seconds;
      } else {
        stop();
      }
    }, 1000);
  };

  const pause = async () => {
    isPaused = true;
    if (countdown_interval) {
      clearInterval(countdown_interval);
    }
  };

  const stop = async () => {
    isPaused = false;
    if (countdown_interval) {
      clearInterval(countdown_interval);
    }
    hours = 0;
    minutes = 0;
    seconds = 0;
    total_seconds = 0;
    setTimeout(() => {
      isPopupOpened &&
        requestMsg({
          actionType: "ui_update",
          hours,
          minutes,
          seconds,
        });
    }, 1000);
  };

  const record = async () => {
    const mission_text = await getStorageItem("mission_text");
    const new_history = {
      workStartDateTime: work_start_datetime,
      workTotalSeconds: work_total_seconds,
      workTime: new Date(work_total_seconds * 1000).toISOString().slice(11, 19),
      missionText: mission_text,
    };
    let history = (await getStorageItem("history")) || [];
    history.push(new_history);
    await setStorageItem({ history: history });
    isPopupOpened &&
      requestMsg({
        actionType: "table_update",
        history,
      });
  };

  const clear_record = async () => {
    await setStorageItem({ history: [] });
    isPopupOpened &&
      requestMsg({
        actionType: "table_update",
        history: [],
      });
  };

  const delete_record = async (deletedDateTime) => {
    let history = (await getStorageItem("history")) || [];
    console.log(deletedDateTime);
    let new_history = history.filter(
      ({ workStartDateTime }) => workStartDateTime != deletedDateTime
    );
    await setStorageItem({
      history: new_history,
    });
    isPopupOpened &&
      requestMsg({
        actionType: "table_update",
        history: new_history,
      });
  };
})();
