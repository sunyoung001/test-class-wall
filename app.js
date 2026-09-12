// ===================================================
// 우리 반 담벼락
//
// Firebase Firestore를 연동하여 메모를 실시간으로 저장하고 불러옵니다.
// ===================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Firebase 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyD2fRWQcr3aXgFkqNbz0YhxwZRzq9ub7ec",
  authDomain: "test-pizza-qeyr.firebaseapp.com",
  projectId: "test-pizza-qeyr",
  storageBucket: "test-pizza-qeyr.firebasestorage.app",
  messagingSenderId: "1024973991639",
  appId: "1:1024973991639:web:066f4e2dcf7a185f65ca92"
};

// Firebase 및 Firestore 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// --- 메모 목록 ---
// Firestore에서 실시간으로 불러온 메모들을 보관하는 배열입니다.
let memos = [];


// ===================================================
// 데이터를 다루는 함수 세 개
// Firestore 연동
// ===================================================

// 메모를 읽어 옵니다.
// Firestore의 onSnapshot을 사용해 변경 사항을 실시간으로 감지합니다.
// 순서는 orderBy("createdAt") 으로 맞춥니다.
function loadMemos() {
  const q = query(collection(db, "memos"), orderBy("createdAt"));
  onSnapshot(q, function (snapshot) {
    memos = [];
    snapshot.forEach(function (docSnap) {
      memos.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    render();
  });
}

// 메모를 새로 씁니다.
// 백엔드 2: 여기에 "누가 썼는지"(uid)를 함께 저장하게 됩니다.
async function addMemo(text) {
  try {
    await addDoc(collection(db, "memos"), {
      text: text,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error("메모 저장 중 오류가 발생했습니다:", error);
  }
}

// 메모를 지웁니다.
// 백엔드 2: 지금은 누구든 남의 메모를 지울 수 있습니다. 이걸 막는 것이 과제입니다.
async function deleteMemo(id) {
  try {
    await deleteDoc(doc(db, "memos", id));
  } catch (error) {
    console.error("메모 삭제 중 오류가 발생했습니다:", error);
  }
}


// ===================================================
// 화면 그리기
// ===================================================

function render() {
  const wall = document.getElementById("wall");
  wall.innerHTML = "";

  memos.forEach(function (memo) {
    wall.appendChild(makeMemo(memo));
  });
}

// 메모 한 장 만들기
function makeMemo(memo) {
  const div = document.createElement("div");
  div.className = "memo";

  const del = document.createElement("button");
  del.textContent = "×";
  del.addEventListener("click", function () {
    deleteMemo(memo.id);
  });
  div.appendChild(del);

  const span = document.createElement("span");
  span.textContent = memo.text;
  div.appendChild(span);

  return div;
}


// ===================================================
// 메모 쓰는 칸
// 엔터를 누르면 담벼락에 붙습니다 (줄바꿈은 Shift + 엔터)
// ===================================================

const input = document.getElementById("input");

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    const text = input.value.trim();
    if (text === "") return;

    addMemo(text);
    input.value = "";
  }
});


// 첫 화면 그리기: Firestore 실시간 연동 시작
loadMemos();
input.focus();
