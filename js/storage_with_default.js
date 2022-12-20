let storage = {
  // `sync` if you want. remember about QUOTAS https://developer.chrome.com/extensions/storage.html#sync-properties
  area: chrome.storage.local,
  default_options: {
    // TO-DO : options.html에서 data-storage에서 정의한 속성값들의 기본값을 지정한다.
    mission_text: "",
    mission_start_hour: "1",
    mission_start_minute: "0",
    mission_start_second: "0",
    // 알림 설정 (From options)
    isEnabledSoundAlarm: 1,
    soundAlarmPeriodMinute: "5",
  },
};

/*
1. chrome.storage.sync를 사용할 경우
로그인한 사용자의 데이터를 최대100KB까지 저장하고, sync되어 사용할 수 있다. 
비로그인 시 local 처럼 저장해 두었다가, 로그인시 동기화 된다.

2. chrome.storage.local을 사용할 경우
확장 프로그램이 제거될 때까지, 최대 5MB까지 저장할 수 있다.
*/
