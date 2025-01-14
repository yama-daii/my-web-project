let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let username;

// カレンダーをロードして表示する関数
function loadCalendar() {
  const calendarDays = document.querySelector("#calendar-days tbody");
  const currentMonthTitle = document.getElementById("current-month");
//日付部分を初期化
  calendarDays.innerHTML = "";
  currentMonthTitle.innerText = `${currentYear}年 ${currentMonth + 1}月`;
//localstorageからイベントを取得
  const events =JSON.parse(localStorage.getItem("events")||"[]");
//月の最初の日と日数を取得
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let row = document.createElement("tr");

  // 月の最初の空のマス目を生成
  for (let i = 0; i < firstDay; i++) {
    row.innerHTML += `<td class="empty"></td>`;
  }

  // 1日から月末までの日付を生成・イベントがあるならマス目上に表示させる
  for (let i = 1; i <= daysInMonth; i++) {
    if ((firstDay + i - 1) % 7 === 0 && i !== 1) {
      calendarDays.appendChild(row);
      row = document.createElement("tr");
    }
    const eventForDay = events.filter(
      (event) => 
        event.year === currentYear && 
        event.month === currentMonth && 
        event.day == i
    );
    let eventHTML = "";
    if (eventForDay.length > 0) {
      eventForDay.forEach((event) => {
        eventHTML += `<div class="event">${event.name}</div>`;
      });
    }

    row.innerHTML += `<td class="day" onclick="openModal(${i})">${i}${eventHTML}</td>`;
  }
  calendarDays.appendChild(row);
}

// 前月に移動
function prevMonth() {
  currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  currentYear = currentMonth === 11 ? currentYear - 1 : currentYear;
  loadCalendar();
}

// 次月に移動
function nextMonth() {
  currentMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  currentYear = currentMonth === 0 ? currentYear + 1 : currentYear;
  loadCalendar();
}

//キーで決定・戻る
document.addEventListener('keydown', (event) => {
if(event.key === 'Enter' && event.target === document.getElementById('event-name')) {
    addEvent();
  }if(event.key === 'Enter' && event.target === document.getElementById('edit-event-name')) {
    saveEdit();
  }if(event.key === 'Enter' && event.target === document.getElementById('eneral-event-name')){
    generaladdEvent();
  }if(event.key === 'Escape'){
    closeModal();
    generalcloseModal();
    closeEditModal();
    closelist();
    CloseThemeMenu()
  }
});

// イベント追加画面の切り替え
function openModal(day) {
  const modal = document.querySelector('.modal');
  const modalContent = modal.querySelector('.modal-content');
  modal.style.display = 'flex';
  modal.style.opacity = '1';
  setTimeout(() => {
    modalContent.style.transform = 'scale(1)';
  }, 10);
  document.getElementById("event-name").dataset.day = day;
}

function closeModal() {
    const modal = document.querySelector('.modal');
    const modalContent = document.querySelector(".modal-content");
  
    modalContent.style.transform = 'scale(0)';
    modal.style.opacity = '0';
    
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  document.getElementById("event-name").value = "";
}


function generalopenModal() {
  const modal = document.querySelector('#general-event-modal');
  const modalContent = modal.querySelector('.modal-content'); // 特定のモーダル内のmodal-contentを指定
  modal.style.display = 'flex';
  modal.style.opacity = '1';
  setTimeout(() => {
    modalContent.style.transform = 'scale(1)';
  }, 10);
  document.getElementById("event-name").value = "";
}
function generalcloseModal() {
  const modal = document.querySelector('#general-event-modal');
    const modalContent = modal.querySelector('.modal-content');
  
    modalContent.style.transform = 'scale(0)';
    modal.style.opacity = '0';
    
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  document.getElementById("event-name").value = "";
}

// 新しいイベントを追加
function addEvent() {
  const day = document.getElementById("event-name").dataset.day;
  const eventName = document.getElementById("event-name").value;
  if (!eventName) {
    alert("イベント名を入力してください。");
    return; // 処理を中断
  }
  if(!username){
    alert('ユーザーの確認が取れませんでした。ログイン画面へ戻ります');
    window.location.href = '/logout';
    return;
  }
  
  const events = JSON.parse(localStorage.getItem("events") || "[]");
  events.push({ year: currentYear, month: currentMonth, day: parseInt(day, 10), name: eventName, user: username});
  localStorage.setItem("events", JSON.stringify(events));
  alert("新規イベントを追加しました")
  loadCalendar();
  closeModal();
  displayevents();

  document.getElementById("event-name").value="";
  document.getElementById("event-date").value="";
}
function generaladdEvent() {
  
  const inputDate = document.getElementById("general-event-date").value;
  const eventName = document.getElementById("general-event-name").value;


  // 入力された日付文字列をDateオブジェクトに変換
  const date = new Date(inputDate);

  // 年、月、日を個別に取得
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if (!eventName || !year) {
    alert("イベント名または日付けを入力してください");
    return
}
  const events = JSON.parse(localStorage.getItem("events") || "[]");
  events.push({ year, month, day, name: eventName, user:username});
  localStorage.setItem("events", JSON.stringify(events));
  alert("新規でイベントを追加しました！")
  loadCalendar();
  generalcloseModal();
  displayevents();

  document.getElementById("general-event-name").value = "";
  document.getElementById("general-event-date").value = "";
}
//追加されたイベントの編集+再読み込み

  function editEvent(index) {
  closelist();
  const modal = document.querySelector('#edit-modal');
  const modalContent = modal.querySelector('.modal-content'); // 特定のモーダル内のmodal-contentを指定
  modal.style.display = 'flex';
  modal.style.opacity = '1';
  setTimeout(() => {
    modalContent.style.transform = 'scale(1)';
  }, 10);

    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const event = events[index];
    
    // 編集モーダルにイベントの情報をセット
    document.getElementById("edit-event-name").value = event.name;
    
    const eventDayElement = document.getElementById("edit-event-day");
    
    if (eventDayElement) {
      eventDayElement.dataset.index = index;
    } else {
      console.error("edit-event-day element not found");
    }
  }
  function saveEdit() {
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const index = document.getElementById("edit-event-day").dataset.index; 
    const newEventName = document.getElementById("edit-event-name").value;
  
    if (!newEventName) {
      alert("イベント名を入力してください。");
      return;
    }
  
    events[index].name = newEventName; // イベント名を更新
    localStorage.setItem("events", JSON.stringify(events));
    alert("イベント名を更新しました")
    
    loadCalendar();
    displayevents();
    document.getElementById("edit-event-name").value = "";
    closeEditModal();
  }
  
function closeEditModal() {
  const modal = document.querySelector('#edit-modal');
  const modalContent = modal.querySelector('.modal-content');

  modalContent.style.transform = 'scale(0)';
  modal.style.opacity = '0';
  
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}
function deleteEvent(index) {
  const events = JSON.parse(localStorage.getItem("events") || "[]");
  events.splice(index, 1);
  localStorage.setItem("events", JSON.stringify(events));
  
  loadCalendar();
  displayevents();
}

// 登録されたイベント一覧の表示
function displayevents() {
  const eventlistelement = document.getElementById("showevents");
  const events = JSON.parse(localStorage.getItem("events") || "[]");
  eventlistelement.innerHTML = "";
  events.forEach((event, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `${event.year}/${event.month + 1}/${event.day} - ${event.name}.作成者:${event.user} 
      <button onclick="editEvent(${index})">編集</button>
      <button onclick="deleteEvent(${index})">削除</button>`;
    eventlistelement.appendChild(listItem);
  });
}


// サイドバーのボタンに対応する関数
//イベント一覧の切り替え
function openlist() {
  const eventlist = document.querySelector('.list');
  const eventcontent = document.querySelector('.list-content');
  eventlist.style.display = 'flex';
  eventlist.style.opacity = '1';
  setTimeout(() => {
    eventcontent.style.transform = 'scale(1)';
  }, 10);
}
function closelist() {
  const eventlist = document.querySelector('.list');
    const eventcontent = document.querySelector('.list-content');
    eventcontent.style.transform = 'scale(0)';
    eventlist.style.opacity = '0';
    setTimeout(() => {
      eventlist.style.display = 'none';
    }, 300);
}
//ヘルプの一覧を表示(実装するか未定)
function logout() {
  alert('ログアウトしました');
  window.location.href = '/logout';
}
//テーマに関する関数
function OpenThemeMenu() {
  const modal = document.querySelector('#ThmeMenu');
  const modalContent = modal.querySelector('.modal-content');
  modal.style.display = 'flex';
  modal.style.opacity = '1';
  setTimeout(() => {
    modalContent.style.transform = 'scale(1)';
  }, 10);
}
function CloseThemeMenu() {
  document.getElementById("ThemeMenu").style.display = "none";
}
function setTheme(theme) {
  document.body.className = theme + "-theme";
  localStorage.setItem("theme", theme);
}
// ページ読み込み時
document.addEventListener("DOMContentLoaded", function () {
  displayevents();
  loadCalendar();
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
});


// イベントを検索する関数
function searchEvent(searchKeyword) {
  // LocalStorage からイベントデータを取得
  const events = JSON.parse(localStorage.getItem('events')) || [];

  // 検索キーワードに一致するイベントをフィルタリング
  const filteredEvents = events.filter(event => event.name.includes(searchKeyword));

  displaySearchResults(filteredEvents);
}

// 検索結果を表示する関数
function displaySearchResults(events) {
  const resultContainer = document.getElementById('search-results');
  resultContainer.innerHTML = '';

  if (events.length === 0) {
      resultContainer.innerHTML = '<p>一致するイベントが見つかりませんでした。</p>';
      return;
  }

  // 結果を表示
  events.forEach(event => {
      const eventItem = document.createElement('div');
      eventItem.textContent = `名前: ${event.name}, 日付:${event.year}/${event.month + 1}/${event.day}`;
      resultContainer.appendChild(eventItem);
  });
}

// 検索ボタンのクリックイベント
document.getElementById('search-button').addEventListener('click', () => {
  const searchKeyword = document.getElementById('search-input').value;
  searchEvent(searchKeyword);
});

document.addEventListener('DOMContentLoaded', function () {
  // ユーザー名をサーバーから取得
  fetch('/get-username')
    .then(response => response.json())
    .then(data => {
      username = data.username;
      // サイドバーにユーザー名を表示
      const sidebar = document.getElementById('sidebar');
      const usernameElement = document.createElement('p');
      usernameElement.innerText = `こんにちは、${username}さん`;
      sidebar.appendChild(usernameElement);
    })
    .catch(error => {
      console.log('ユーザー情報の取得に失敗しました:', error);
    });
});

