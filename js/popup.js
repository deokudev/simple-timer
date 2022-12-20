const makeTable = (id) => {
  return new Tabulator(`#${id}`, {
    layout: "fitColumns",
    height: "150px",
    initialSort: [{ column: "workStartDateTime", dir: "asc" }],
    columns: [
      { title: "시작 시각", field: "workStartDateTime" },
      { title: "소요 시간 ", field: "workTime" },
      { title: "미션 제목", field: "missionText" },
    ],
  });
};

const setFormDisabled = (isDisabled = true) => {
  document.getElementById("mission_start_hour").disabled = isDisabled;
  document.getElementById("mission_start_minute").disabled = isDisabled;
  document.getElementById("mission_start_second").disabled = isDisabled;
  document.getElementById("mission_text").disabled = isDisabled;
};

const updateCountDownElement = (Countdown, hours, minutes, seconds) => {
  const countDownElement = {
    hours: $(".countdown").find(".bloc-time.hours .figure"),
    minutes: $(".countdown").find(".bloc-time.min .figure"),
    seconds: $(".countdown").find(".bloc-time.sec .figure"),
  };

  let $hour_1 = countDownElement.hours.eq(0),
    $hour_2 = countDownElement.hours.eq(1),
    $min_1 = countDownElement.minutes.eq(0),
    $min_2 = countDownElement.minutes.eq(1),
    $sec_1 = countDownElement.seconds.eq(0),
    $sec_2 = countDownElement.seconds.eq(1);

  Countdown.updateTimeElement(hours, $hour_1, $hour_2);
  Countdown.updateTimeElement(minutes, $min_1, $min_2);
  Countdown.updateTimeElement(seconds, $sec_1, $sec_2);
};

window.addEventListener(
  "load",
  async () => {
    let tableElement;
    let Countdown = {
      // Backbone-like structure
      $el: $(".countdown"),

      // 숫자 애니메이션 수행
      animateTimeElement: function ($el, value) {
        let $top = $el.find(".top"),
          $bottom = $el.find(".bottom"),
          $back_top = $el.find(".top-back"),
          $back_bottom = $el.find(".bottom-back");

        // Before we begin, change the back value
        $back_top.find("span").html(value);

        // Also change the back bottom value
        $back_bottom.find("span").html(value);

        // Then animate
        TweenMax.to($top, 0.8, {
          rotationX: "-180deg",
          transformPerspective: 300,
          ease: Quart.easeOut,
          onComplete: function () {
            $top.html(value);

            $bottom.html(value);

            TweenMax.set($top, { rotationX: 0 });
          },
        });

        TweenMax.to($back_top, 0.8, {
          rotationX: 0,
          transformPerspective: 300,
          ease: Quart.easeOut,
          clearProps: "all",
        });
      },

      // 숫자 DOM 업데이트
      updateTimeElement: function (value, $el_1, $el_2) {
        let val_1 = value.toString().charAt(0),
          val_2 = value.toString().charAt(1),
          fig_1_value = $el_1.find(".top").html(),
          fig_2_value = $el_2.find(".top").html();

        if (value >= 10) {
          // Animate only if the figure has changed
          if (fig_1_value !== val_1) this.animateTimeElement($el_1, val_1);
          if (fig_2_value !== val_2) this.animateTimeElement($el_2, val_2);
        } else {
          // If we are under 10, replace first figure with 0
          if (fig_1_value !== "0") this.animateTimeElement($el_1, 0);
          if (fig_2_value !== val_1) this.animateTimeElement($el_2, val_1);
        }
      },
    };

    chrome.runtime.connect({ name: "popup" });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      processRequest(request, sendResponse);
      return true;
    });

    const processRequest = async (request, sendResponse) => {
      if (request?.actionType) {
        switch (request.actionType) {
          case "ui_update":
            updateCountDownElement(
              Countdown,
              request.hours,
              request.minutes,
              request.seconds
            );
            break;
          case "table_update":
            tableElement.setData(request.history);
            break;
        }
      }
    };

    requestMsg({
      actionType: "init",
    });

    tableElement = makeTable("history-table");
    tableElement?.on("rowClick", function (e, row) {
      if (confirm("삭제하시겠습니까?")) {
        requestMsg({
          actionType: "delete_record",
          workStartDateTime: row.getData().workStartDateTime,
        });
      }
    });

    document.getElementById("mission-start").addEventListener(
      "click",
      async () => {
        setFormDisabled(true);
        document.getElementById("data-storage-save")?.click();
        requestMsg({
          actionType: "start",
        });
      },
      false
    );

    document.getElementById("mission-pause").addEventListener(
      "click",
      async () => {
        requestMsg({
          actionType: "pause",
        });
      },
      false
    );

    document.getElementById("mission-complete").addEventListener(
      "click",
      async () => {
        if (confirm("완료 처리하시겠습니까?")) {
          setFormDisabled(false);
          requestMsg({
            actionType: "record",
          });
          requestMsg({
            actionType: "stop",
          });
        }
      },
      false
    );

    document.getElementById("mission-cancel").addEventListener(
      "click",
      async () => {
        if (confirm("취소하시겠습니까?")) {
          setFormDisabled(false);
          requestMsg({
            actionType: "stop",
          });
        }
      },
      false
    );

    document.getElementById("mission-clear-history").addEventListener(
      "click",
      async () => {
        if (confirm("기록을 모두 삭제하시겠습니까?")) {
          requestMsg({
            actionType: "clear_record",
          });
        }
      },
      false
    );
  },
  false
);
