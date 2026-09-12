// ===================================================
// 우리 반 담벼락
//
// Firebase Firestore + Google 로그인 연동
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
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// Firebase 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyD2fRWQcr3aXgFkqNbz0YhxwZRzq9ub7ec",
  authDomain: "test-pizza-qeyr.firebaseapp.com",
  projectId: "test-pizza-qeyr",
  storageBucket: "test-pizza-qeyr.firebasestorage.app",
  messagingSenderId: "1024973991639",
  appId: "1:1024973991639:web:066f4e2dcf7a185f65ca92"
};

// Firebase 및 Firestore, Auth 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// --- 메모 목록 ---
// Firestore에서 실시간으로 불러온 메모들을 보관하는 배열입니다.
let memos = [];

// 현재 로그인한 사용자 (null이면 비로그인 상태)
let currentUser = null;


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
async function addMemo(text) {
  // 로그인 상태 확인
  if (!currentUser) {
    alert("로그인 후 메모를 쓸 수 있습니다.");
    return;
  }
  if (!text || text.length < 5) return;

  try {
    await addDoc(collection(db, "memos"), {
      text: text,
      createdAt: serverTimestamp()
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
// 로그인 / 로그아웃
// ===================================================

// Google 팝업으로 로그인합니다.
function login() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).catch(function (error) {
    console.error("로그인 중 오류가 발생했습니다:", error);
  });
}

// 로그아웃합니다.
function logout() {
  signOut(auth).catch(function (error) {
    console.error("로그아웃 중 오류가 발생했습니다:", error);
  });
}

// 로그인 상태가 바뀔 때마다 #userArea를 업데이트합니다.
onAuthStateChanged(auth, function (user) {
  currentUser = user;
  const userArea = document.getElementById("userArea");

  if (user) {
    // 로그인 상태: 이름과 로그아웃 버튼을 표시합니다.
    userArea.innerHTML =
      "<span>" + user.displayName + " 님</span> " +
      "<button id='logoutBtn'>로그아웃</button>";
    document.getElementById("logoutBtn").addEventListener("click", logout);
    input.disabled = false;
    input.placeholder = "메모를 쓰고 엔터";
  } else {
    // 비로그인 상태: 로그인 버튼을 표시합니다.
    userArea.innerHTML = "<button id='loginBtn'>Google로 로그인</button>";
    document.getElementById("loginBtn").addEventListener("click", login);
    input.disabled = true;
    input.placeholder = "로그인하면 메모를 쓸 수 있습니다.";
  }
});


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
  // 한글 조합 중(IME)에는 무시합니다. 조합이 끝난 뒤 엔터를 처리합니다.
  if (e.isComposing) return;

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    const text = input.value.trim();
    if (text.length < 5) {
      alert("메모를 5글자 이상 입력해 주세요.");
      return;
    }

    addMemo(text);
    input.value = "";
  }
});


// 첫 화면 그리기: Firestore 실시간 연동 시작
loadMemos();
// 비로그인 상태에서는 입력창을 비활성화합니다 (onAuthStateChanged에서 다시 활성화).
input.disabled = true;
